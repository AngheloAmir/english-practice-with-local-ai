import { create } from 'zustand';
import { createSelectors } from '../lib/_zustand';
import {
    PLAYDELAY,
    TTS_SPEED_CONFIG,
    TTS_VOICE_CONFIG,
    type TTSSpeed,
    type TTSVoiceGender,
} from './_types';
import {
    buildSentencePrompt,
    buildSttEvaluationPrompt,
    calculateAcousticWordSimilarity,
    sanitizeSentence,
    type DifficultyLevel,
    type SentenceLength,
} from './prompts/speech';

const PRACTICE_FALLBACKS: Record<DifficultyLevel, string[]> = {
    Practice: [
        'I enjoy reading books and watching movies in English every evening.',
        'Wake up early for a hot drink of fresh coffee in the morning.',
        'A cheerful cat rests peacefully on the warm wooden table by the window.',
        'Walking through the neighborhood park brings peaceful thoughts every day.',
    ],
    Intermediate: [
        'Walking across a blooming summer meadow brings gentle rhythm to the morning breeze.',
        'A curious squirrel gathers acorns quietly among the autumn leaves in the forest.',
        'The subtle resonance of the acoustic guitar fills the room with calm harmony.',
        'Consistency is the key to mastering natural pronunciation and building confident communication skills.',
    ],
    Advanced: [
        'In fast-paced professional environments, articulating complex ideas with clarity and empathy is essential.',
        'Strategic agility and cross-cultural diplomacy empower global teams to achieve breakthrough innovation.',
        'Fostering authentic collaboration across diverse disciplines drives organizational transformation and sustainable growth.',
    ],
};

export interface SpeechModule {
    // Current sentence & tokenized words (restricted max length to avoid card overflow)
    sentence: string;
    words: string[];
    currentTopic: string;

    // TTS configurations & generated audio
    voiceGender: TTSVoiceGender;
    speechSpeed: TTSSpeed;
    sentenceLength: SentenceLength;

    spokenSentenceUrl: string | null; // URL for complete synthesized sentence audio
    spokenSentenceBlob: Blob | null;  // Raw audio Blob
    spokenSentenceDuration: number;  // Exact duration in seconds
    spokenWords: any[];

    // STT & User recording
    userDetectedWords: string;
    userRecordingUrl: string | null;
    userRecordingBlob: Blob | null;
    sttAccuracyScore: number | null;
    sttFeedback: string;

    // Loading / Async Indicators
    isGeneratingSentence: boolean;
    isSynthesizingTts: boolean;
    isTranscribingStt: boolean;
    isEvaluatingStt: boolean;

    // Playback and UI states
    playmode: 'sentence' | 'perword';
    useraudio: 'autoplay' | '';
    difficulty: DifficultyLevel;
    activeWordIndex: number | null;
    isPlaying: boolean;
    isRecording: boolean;

    // Countdown state (1.5s down to 0.1s before playback starts)
    countdown: number | null;
    countdownMode: 'sentence' | 'perword' | null;

    // Timed Auto-play loop states
    isTimedAutoplayRunning: boolean;
    timedAutoplayPhase: 'idle' | 'recording' | 'playback_stt';
    timedRecordRemaining: number;
    timedPlaybackProgress: number;

    // Setters
    setSentence: (sentence: string) => void;
    setWords: (words: string[]) => void;
    setVoiceGender: (gender: TTSVoiceGender) => void;
    setSpeechSpeed: (speed: TTSSpeed) => void;
    setSentenceLength: (length: SentenceLength) => void;
    setDifficulty: (difficulty: DifficultyLevel) => void;
    setUseraudio: (mode: 'autoplay' | '') => void;
    setActiveWordIndex: (index: number | null) => void;
    setIsPlaying: (playing: boolean) => void;
    setIsRecording: (recording: boolean) => void;
    setCountdown: (countdown: number | null) => void;
    setCountdownMode: (mode: 'sentence' | 'perword' | null) => void;

    // Actions
    generateNewSentence: () => Promise<void>;
    synthesizeKokoroTts: (text: string) => Promise<string | null>;
    playFullSentence: () => Promise<void>;
    playSpeechShadowing: () => Promise<void>;
    executeSentencePlayback: (session: number) => Promise<void>;
    executeShadowingPlayback: (session: number) => Promise<void>;
    cancelCountdown: () => void;
    playWordAtIndex: (index: number) => Promise<void>;

    // Real Mic Recording & Whisper STT + Ollama Scoring
    startRecordingTest: () => Promise<void>;
    stopRecordingTest: () => Promise<void>;
    evaluateSpeechWithOllama: (target: string, spoken: string) => Promise<{ score: number; feedback: string }>;

    // Timed Auto Play Loop
    startTimedAutoplay: () => Promise<void>;
    stopTimedAutoplay: () => void;
    runTimedAutoplayCycle: (session: number) => Promise<void>;
}

const defaultSentence = PRACTICE_FALLBACKS.Advanced[0];

let playbackSessionId = 0;
let countdownTimerId: ReturnType<typeof setInterval> | null = null;

let timedAutoplaySessionId = 0;
let timedRecordIntervalId: ReturnType<typeof setInterval> | null = null;
let timedPlaybackIntervalId: ReturnType<typeof setInterval> | null = null;
let timedBreatherTimeoutId: ReturnType<typeof setTimeout> | null = null;

// ==========================================
// Always-Hot Web Audio & Microphone Engine
// ==========================================
let sharedAudioContext: AudioContext | null = null;
let activeBufferSource: AudioBufferSourceNode | null = null;
let cachedSentenceAudioBuffer: AudioBuffer | null = null;

// Persistent hot mic & keep-alive references
let activeAudioStream: MediaStream | null = null;
let micSourceNode: MediaStreamAudioSourceNode | null = null;
let silentMicGainNode: GainNode | null = null;
let silentKeepAliveGainNode: GainNode | null = null;
let keepAliveOscNode: OscillatorNode | null = null;

// Audio element fallback & user recording references
let activeAudioElement: HTMLAudioElement | null = null;
let mediaRecorderInstance: MediaRecorder | null = null;
let recordedAudioChunks: Blob[] = [];

/**
 * Singleton AudioContext with auto-resume
 */
export function getSharedAudioContext(): AudioContext {
    if (!sharedAudioContext) {
        const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        sharedAudioContext = new AudioCtx();
    }
    if (sharedAudioContext.state === 'suspended') {
        sharedAudioContext.resume().catch(() => {});
    }
    return sharedAudioContext;
}

/**
 * Keeps the OS hardware audio sink (PulseAudio/PipeWire/ALSA) continuously active
 * by feeding a sub-audible tone (0.00001 gain), preventing power-saving sleep and DAC startup delays.
 */
function ensureOutputKeepAlive(ctx: AudioContext) {
    if (!silentKeepAliveGainNode) {
        try {
            silentKeepAliveGainNode = ctx.createGain();
            // -100 dB (imperceptible to human ear, but keeps hardware DAC stream unmuted)
            silentKeepAliveGainNode.gain.value = 0.00001;

            keepAliveOscNode = ctx.createOscillator();
            keepAliveOscNode.frequency.value = 80;
            keepAliveOscNode.connect(silentKeepAliveGainNode);
            silentKeepAliveGainNode.connect(ctx.destination);
            keepAliveOscNode.start();
        } catch (e) {
            console.warn('Keep-alive oscillator initialization failed:', e);
        }
    }
}

/**
 * Persistent hot microphone stream. Connects mic to AudioContext via near-silent gain node (0.00001),
 * keeping the hardware mic track continuously live for zero-latency recording.
 */
export async function ensureHotMic(): Promise<MediaStream | null> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        return null;
    }

    if (
        activeAudioStream &&
        activeAudioStream.active &&
        activeAudioStream.getAudioTracks().some((t) => t.readyState === 'live')
    ) {
        return activeAudioStream;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: false,
                autoGainControl: true,
            },
        });

        activeAudioStream = stream;
        const ctx = getSharedAudioContext();
        if (ctx.state === 'suspended') {
            await ctx.resume().catch(() => {});
        }
        ensureOutputKeepAlive(ctx);

        if (micSourceNode) {
            try { micSourceNode.disconnect(); } catch {}
        }
        if (silentMicGainNode) {
            try { silentMicGainNode.disconnect(); } catch {}
        }

        micSourceNode = ctx.createMediaStreamSource(stream);
        silentMicGainNode = ctx.createGain();
        silentMicGainNode.gain.value = 0.00001;
        micSourceNode.connect(silentMicGainNode);
        silentMicGainNode.connect(ctx.destination);

        return stream;
    } catch (err) {
        console.warn('Microphone access denied or unavailable:', err);
        return null;
    }
}

/**
 * Initializes and warms up both audio playback pipeline and hot mic on startup or user gesture.
 */
export async function warmUpHotEngines(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
        const ctx = getSharedAudioContext();
        if (ctx.state === 'suspended') {
            await ctx.resume().catch(() => {});
        }
        ensureOutputKeepAlive(ctx);

        // Pre-warm mic in the background
        ensureHotMic().catch(() => {});
    } catch (e) {
        console.warn('warmUpHotEngines error:', e);
    }
}

const clearActiveCountdown = () => {
    if (countdownTimerId !== null) {
        clearInterval(countdownTimerId);
        countdownTimerId = null;
    }
};

const clearTimedAutoplayTimers = () => {
    if (timedRecordIntervalId !== null) {
        clearInterval(timedRecordIntervalId);
        timedRecordIntervalId = null;
    }
    if (timedPlaybackIntervalId !== null) {
        clearInterval(timedPlaybackIntervalId);
        timedPlaybackIntervalId = null;
    }
    if (timedBreatherTimeoutId !== null) {
        clearTimeout(timedBreatherTimeoutId);
        timedBreatherTimeoutId = null;
    }
};

const stopActiveAudioPlayback = () => {
    // 1. Stop active AudioBufferSourceNode
    if (activeBufferSource) {
        try {
            activeBufferSource.stop();
            activeBufferSource.disconnect();
        } catch {}
        activeBufferSource = null;
    }

    // 2. Stop HTMLAudioElement (if playing user recorded clip)
    if (activeAudioElement) {
        activeAudioElement.pause();
        activeAudioElement.currentTime = 0;
        activeAudioElement = null;
    }

    // 3. Cancel browser speech synthesis if active
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};

/**
 * Plays a pre-decoded AudioBuffer with 0ms startup latency (eliminates dropped first words)
 */
function playAudioBuffer(buffer: AudioBuffer, onEnded?: () => void): Promise<void> {
    return new Promise((resolve) => {
        const ctx = getSharedAudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
        ensureOutputKeepAlive(ctx);

        if (activeBufferSource) {
            try {
                activeBufferSource.stop();
                activeBufferSource.disconnect();
            } catch {}
            activeBufferSource = null;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        activeBufferSource = source;

        let isDone = false;
        const finish = () => {
            if (!isDone) {
                isDone = true;
                if (activeBufferSource === source) {
                    activeBufferSource = null;
                }
                if (onEnded) onEnded();
                resolve();
            }
        };

        source.onended = finish;
        try {
            source.start(0);
        } catch (err) {
            console.warn('AudioBufferSource.start failed:', err);
            finish();
        }
    });
}

// In-memory cache for word-level Kokoro TTS decoded AudioBuffers
const wordAudioBufferCache: Map<string, AudioBuffer> = new Map();

async function getOrSynthesizeWordAudioBuffer(
    word: string,
    voice: string,
    speed: number
): Promise<AudioBuffer | null> {
    const cleanWord = word.replace(/[.,!?;:"]+/g, '').trim();
    if (!cleanWord) return null;

    const cacheKey = `${voice}_${speed}_${cleanWord.toLowerCase()}`;
    if (wordAudioBufferCache.has(cacheKey)) {
        return wordAudioBufferCache.get(cacheKey)!;
    }

    try {
        const res = await fetch('/proxy/tts/v1/audio/speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'kokoro',
                input: cleanWord,
                voice,
                speed,
                response_format: 'mp3',
            }),
        });
        if (!res.ok) return null;

        const arrayBuf = await res.arrayBuffer();
        const ctx = getSharedAudioContext();
        const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));

        wordAudioBufferCache.set(cacheKey, decoded);
        return decoded;
    } catch (err) {
        console.warn(`Failed to synthesize word "${cleanWord}" with Kokoro:`, err);
        return null;
    }
}

const speechmodule = create<SpeechModule>()((set, get) => ({
    sentence: defaultSentence,
    words: defaultSentence.split(/\s+/).filter(Boolean).slice(0, 35),
    currentTopic: '',

    voiceGender: 'male',
    speechSpeed: 'normal',
    sentenceLength: 'simple',

    spokenSentenceUrl: null,
    spokenSentenceBlob: null,
    spokenSentenceDuration: 4.5,
    spokenWords: [],

    userDetectedWords: '',
    userRecordingUrl: null,
    userRecordingBlob: null,
    sttAccuracyScore: null,
    sttFeedback: '',

    isGeneratingSentence: false,
    isSynthesizingTts: false,
    isTranscribingStt: false,
    isEvaluatingStt: false,

    playmode: 'sentence',
    useraudio: '',
    difficulty: 'Practice',
    activeWordIndex: null,
    isPlaying: false,
    isRecording: false,

    countdown: null,
    countdownMode: null,

    isTimedAutoplayRunning: false,
    timedAutoplayPhase: 'idle',
    timedRecordRemaining: 0,
    timedPlaybackProgress: 0,

    setSentence: (sentence: string) => {
        const words = sentence.trim().split(/\s+/).filter(Boolean).slice(0, 35);
        const cappedSentence = words.join(' ');
        cachedSentenceAudioBuffer = null;
        set({
            sentence: cappedSentence,
            words,
            activeWordIndex: null,
            userDetectedWords: '',
            userRecordingUrl: null,
            userRecordingBlob: null,
            sttAccuracyScore: null,
            sttFeedback: '',
        });
    },
    setWords: (words: string[]) => set({ words: words.slice(0, 35) }),

    setVoiceGender: (voiceGender: TTSVoiceGender) => {
        set({ voiceGender });
        cachedSentenceAudioBuffer = null;
        // Re-synthesize existing sentence with new voice in the background
        const currentSentence = get().sentence;
        if (currentSentence) {
            get().synthesizeKokoroTts(currentSentence);
        }
    },

    setSpeechSpeed: (speechSpeed: TTSSpeed) => {
        set({ speechSpeed });
        cachedSentenceAudioBuffer = null;
        // Re-synthesize existing sentence with new speed in the background
        const currentSentence = get().sentence;
        if (currentSentence) {
            get().synthesizeKokoroTts(currentSentence);
        }
    },

    setSentenceLength: (sentenceLength: SentenceLength) => {
        set({ sentenceLength });
        // Generate a new sentence matching new length
        get().generateNewSentence();
    },

    setDifficulty: (difficulty: DifficultyLevel) => {
        clearActiveCountdown();
        get().stopTimedAutoplay();
        stopActiveAudioPlayback();

        set({ difficulty });
        // Trigger live Ollama sentence generation for new difficulty
        get().generateNewSentence();
    },

    setUseraudio: (useraudio: 'autoplay' | '') => set({ useraudio }),
    setActiveWordIndex: (activeWordIndex: number | null) => set({ activeWordIndex }),
    setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
    setIsRecording: (isRecording: boolean) => set({ isRecording }),
    setCountdown: (countdown: number | null) => set({ countdown }),
    setCountdownMode: (countdownMode: 'sentence' | 'perword' | null) => set({ countdownMode }),

    cancelCountdown: () => {
        clearActiveCountdown();
        set({ countdown: null, countdownMode: null });
    },

    /**
     * 1. Generate sentence from Ollama (Qwen 2.5:3b)
     * 2. Automatically request Kokoro TTS synthesis
     */
    generateNewSentence: async () => {
        clearActiveCountdown();
        get().stopTimedAutoplay();
        playbackSessionId++;
        stopActiveAudioPlayback();
        cachedSentenceAudioBuffer = null;

        const { difficulty, sentenceLength } = get();
        const { prompt, topic } = buildSentencePrompt(difficulty, sentenceLength);

        set({
            isGeneratingSentence: true,
            activeWordIndex: null,
            isPlaying: false,
            countdown: null,
            countdownMode: null,
            currentTopic: topic,
        });

        let newSentence = '';

        try {
            // Call local Ollama Qwen 2.5:3b via Vite proxy
            const res = await fetch('/proxy/ollama/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'qwen2.5:3b',
                    messages: [{ role: 'user', content: prompt }],
                    stream: false,
                    options: { temperature: 0.85 },
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const rawOutput = data.message?.content || '';
                newSentence = sanitizeSentence(rawOutput);
            }
        } catch (err) {
            console.warn('Ollama generation failed or offline, using fallback:', err);
        }

        // Validate output has at least 8 words; fallback if invalid or offline
        const tokenized = newSentence.split(/\s+/).filter(Boolean);
        if (!newSentence || tokenized.length < 8) {
            const list = PRACTICE_FALLBACKS[difficulty];
            const remaining = list.filter((s) => s !== get().sentence);
            newSentence = remaining.length > 0 ? remaining[Math.floor(Math.random() * remaining.length)] : list[0];
        }

        const cappedWords = newSentence.trim().split(/\s+/).filter(Boolean).slice(0, 35);
        const finalSentence = cappedWords.join(' ');

        set({
            sentence: finalSentence,
            words: cappedWords,
            isGeneratingSentence: false,
            userDetectedWords: '',
            userRecordingUrl: null,
            userRecordingBlob: null,
            sttAccuracyScore: null,
            sttFeedback: '',
        });

        // Immediately synthesize Kokoro TTS audio for instant playback
        get().synthesizeKokoroTts(finalSentence);
    },

    /**
     * Synthesizes audio using local Kokoro TTS engine (/proxy/tts/v1/audio/speech)
     * and immediately decodes it into an AudioBuffer for 0ms latency playback.
     */
    synthesizeKokoroTts: async (text: string): Promise<string | null> => {
        if (!text) return null;

        const { voiceGender, speechSpeed } = get();
        const selectedVoice = TTS_VOICE_CONFIG[voiceGender];
        const selectedSpeed = TTS_SPEED_CONFIG[speechSpeed];

        set({ isSynthesizingTts: true });

        try {
            const res = await fetch('/proxy/tts/v1/audio/speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'kokoro',
                    input: text,
                    voice: selectedVoice,
                    speed: selectedSpeed,
                    response_format: 'mp3',
                }),
            });

            if (!res.ok) throw new Error(`Kokoro TTS failed with status: ${res.status}`);

            const arrayBuf = await res.arrayBuffer();
            const ctx = getSharedAudioContext();
            ensureOutputKeepAlive(ctx);

            // Pre-decode into AudioBuffer directly for zero-latency playback
            const decodedBuffer = await ctx.decodeAudioData(arrayBuf.slice(0));
            cachedSentenceAudioBuffer = decodedBuffer;

            const audioBlob = new Blob([arrayBuf], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const durationSeconds = Math.round(decodedBuffer.duration * 10) / 10;

            set({
                spokenSentenceUrl: audioUrl,
                spokenSentenceBlob: audioBlob,
                spokenSentenceDuration: durationSeconds,
                isSynthesizingTts: false,
            });

            // Pre-fetch and pre-decode Kokoro TTS AudioBuffers for EACH word in background
            const uniqueWords = Array.from(
                new Set(text.split(/\s+/).map((w) => w.replace(/[.,!?;:"]+/g, '').trim()))
            ).filter(Boolean);

            for (const word of uniqueWords) {
                getOrSynthesizeWordAudioBuffer(word, selectedVoice, selectedSpeed).catch(() => {});
            }

            return audioUrl;
        } catch (err) {
            console.warn('Kokoro TTS synthesis error:', err);
            set({ isSynthesizingTts: false });
            return null;
        }
    },

    /**
     * Listen: Initiates countdown, then plays native audio (Kokoro TTS via AudioBuffer).
     */
    playFullSentence: async () => {
        const { isPlaying, countdown, countdownMode, playmode } = get();

        // Warm up hot engines immediately on user click
        warmUpHotEngines().catch(() => {});

        get().stopTimedAutoplay();

        if ((isPlaying && playmode === 'sentence') || (countdown !== null && countdownMode === 'sentence')) {
            clearActiveCountdown();
            playbackSessionId++;
            stopActiveAudioPlayback();
            set({ isPlaying: false, activeWordIndex: null, countdown: null, countdownMode: null });
            return;
        }

        clearActiveCountdown();
        playbackSessionId++;
        stopActiveAudioPlayback();

        const currentSession = ++playbackSessionId;
        let remaining = PLAYDELAY;
        set({
            countdown: remaining,
            countdownMode: 'sentence',
            isPlaying: false,
            playmode: 'sentence',
            activeWordIndex: null,
        });

        countdownTimerId = setInterval(() => {
            remaining = Math.round((remaining - 0.1) * 10) / 10;
            if (currentSession !== playbackSessionId) {
                clearActiveCountdown();
                return;
            }

            if (remaining <= 0.05) {
                clearActiveCountdown();
                set({ countdown: null, countdownMode: null });
                get().executeSentencePlayback(currentSession);
            } else {
                set({ countdown: remaining });
            }
        }, 100);
    },

    executeSentencePlayback: async (currentSession: number) => {
        const { spokenSentenceUrl, sentence } = get();
        // Full sentence playback does not show individual word highlighting boxes
        set({ isPlaying: true, playmode: 'sentence', activeWordIndex: null });

        const ctx = getSharedAudioContext();
        ensureOutputKeepAlive(ctx);

        // Primary: Zero-latency playback of pre-decoded AudioBuffer (never skips first word!)
        if (cachedSentenceAudioBuffer) {
            await playAudioBuffer(cachedSentenceAudioBuffer, () => {
                if (currentSession === playbackSessionId) {
                    set({ isPlaying: false, activeWordIndex: null });
                }
            });
            return;
        }

        // If buffer was not ready yet, decode the blob or play via audio element
        if (spokenSentenceUrl) {
            try {
                const audio = new Audio(spokenSentenceUrl);
                activeAudioElement = audio;

                audio.onended = () => {
                    if (currentSession === playbackSessionId) {
                        set({ isPlaying: false, activeWordIndex: null });
                    }
                };

                audio.onerror = () => {
                    if (currentSession === playbackSessionId) {
                        set({ isPlaying: false, activeWordIndex: null });
                    }
                };

                await audio.play();
                return;
            } catch (err) {
                console.warn('Audio element play failed, falling back to speech synthesis:', err);
            }
        }

        // Fallback: Browser speech synthesis
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(sentence);
            utterance.rate = 0.9;
            utterance.onend = () => {
                if (currentSession === playbackSessionId) {
                    set({ isPlaying: false, activeWordIndex: null });
                }
            };
            utterance.onerror = () => {
                if (currentSession === playbackSessionId) {
                    set({ isPlaying: false, activeWordIndex: null });
                }
            };
            window.speechSynthesis.speak(utterance);
        } else {
            await new Promise((r) => setTimeout(r, 2000));
            if (currentSession === playbackSessionId) {
                set({ isPlaying: false, activeWordIndex: null });
            }
        }
    },

    /**
     * Speech Shadowing: Word-by-word with natural delay to repeat.
     */
    playSpeechShadowing: async () => {
        const { isPlaying, countdown, countdownMode, playmode } = get();

        // Warm up hot engines immediately on user click
        warmUpHotEngines().catch(() => {});

        get().stopTimedAutoplay();

        if ((isPlaying && playmode === 'perword') || (countdown !== null && countdownMode === 'perword')) {
            clearActiveCountdown();
            playbackSessionId++;
            stopActiveAudioPlayback();
            set({ isPlaying: false, activeWordIndex: null, countdown: null, countdownMode: null });
            return;
        }

        clearActiveCountdown();
        playbackSessionId++;
        stopActiveAudioPlayback();

        const currentSession = ++playbackSessionId;
        let remaining = PLAYDELAY;
        set({
            countdown: remaining,
            countdownMode: 'perword',
            isPlaying: false,
            playmode: 'perword',
            activeWordIndex: null,
        });

        countdownTimerId = setInterval(() => {
            remaining = Math.round((remaining - 0.1) * 10) / 10;
            if (currentSession !== playbackSessionId) {
                clearActiveCountdown();
                return;
            }

            if (remaining <= 0.05) {
                clearActiveCountdown();
                set({ countdown: null, countdownMode: null });
                get().executeShadowingPlayback(currentSession);
            } else {
                set({ countdown: remaining });
            }
        }, 50);
    },

    executeShadowingPlayback: async (currentSession: number) => {
        const { words, voiceGender, speechSpeed } = get();
        const selectedVoice = TTS_VOICE_CONFIG[voiceGender];
        const selectedSpeed = TTS_SPEED_CONFIG[speechSpeed];

        const ctx = getSharedAudioContext();
        ensureOutputKeepAlive(ctx);

        set({ isPlaying: true, playmode: 'perword' });

        for (let i = 0; i < words.length; i++) {
            if (!get().isPlaying || currentSession !== playbackSessionId) break;
            set({ activeWordIndex: i });

            const rawWord = words[i];
            const wordBuffer = await getOrSynthesizeWordAudioBuffer(rawWord, selectedVoice, selectedSpeed);

            if (currentSession !== playbackSessionId || !get().isPlaying) break;

            if (wordBuffer) {
                stopActiveAudioPlayback();
                await playAudioBuffer(wordBuffer);
            } else {
                await new Promise((r) => setTimeout(r, 450));
            }

            if (currentSession !== playbackSessionId || !get().isPlaying) break;
            // Deliberate shadowing pause between words so user can repeat the word
            await new Promise((r) => setTimeout(r, 650));
        }

        if (currentSession === playbackSessionId) {
            set({ isPlaying: false, activeWordIndex: null });
        }
    },

    /**
     * Play Single Word: Triggered when user clicks an individual word token (Kokoro TTS).
     */
    playWordAtIndex: async (index: number) => {
        const { words, isPlaying, countdown, voiceGender, speechSpeed } = get();
        if (index < 0 || index >= words.length) return;

        warmUpHotEngines().catch(() => {});

        get().stopTimedAutoplay();
        clearActiveCountdown();
        playbackSessionId++;

        if (countdown !== null) {
            set({ countdown: null, countdownMode: null });
        }

        // When a text is clicked and if isPlaying is true, stop playing any audio
        if (isPlaying) {
            stopActiveAudioPlayback();
            set({ isPlaying: false });
        }

        // Set the active clicked word highlight immediately in the UI
        set({ activeWordIndex: index });

        // Play the Kokoro TTS audio for that word using zero-latency AudioBuffer
        const rawWord = words[index];
        const selectedVoice = TTS_VOICE_CONFIG[voiceGender];
        const selectedSpeed = TTS_SPEED_CONFIG[speechSpeed];

        const wordBuffer = await getOrSynthesizeWordAudioBuffer(rawWord, selectedVoice, selectedSpeed);
        if (wordBuffer) {
            stopActiveAudioPlayback();
            await playAudioBuffer(wordBuffer);
        }
    },

    /**
     * Real Microphone Recording: Start
     */
    startRecordingTest: async () => {
        get().stopTimedAutoplay();
        stopActiveAudioPlayback();

        try {
            const stream = await ensureHotMic();
            if (!stream) {
                throw new Error('Microphone stream not available');
            }

            recordedAudioChunks = [];
            mediaRecorderInstance = new MediaRecorder(stream);

            mediaRecorderInstance.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedAudioChunks.push(event.data);
                }
            };

            mediaRecorderInstance.start();
            set({
                isRecording: true,
                userDetectedWords: 'Listening to your speech...',
                sttAccuracyScore: null,
                sttFeedback: 'Speak the target passage clearly into your microphone...',
            });
        } catch (err) {
            console.warn('Microphone access denied or unavailable, using simulation:', err);
            set({ isRecording: true, userDetectedWords: 'Listening (Mic emulation)...', sttAccuracyScore: null });
            setTimeout(() => {
                get().stopRecordingTest();
            }, 3200);
        }
    },

    /**
     * Real Microphone Recording: Stop -> Send to Faster-Whisper -> Score with Ollama
     */
    stopRecordingTest: async () => {
        set({ isRecording: false, isTranscribingStt: true });

        let audioBlob: Blob | null = null;

        if (mediaRecorderInstance && mediaRecorderInstance.state !== 'inactive') {
            await new Promise<void>((resolve) => {
                if (!mediaRecorderInstance) return resolve();
                mediaRecorderInstance.onstop = () => {
                    audioBlob = new Blob(recordedAudioChunks, { type: 'audio/webm' });
                    resolve();
                };
                mediaRecorderInstance.stop();
            });
        }

        if (audioBlob) {
            const recordingUrl = URL.createObjectURL(audioBlob);
            set({ userRecordingBlob: audioBlob, userRecordingUrl: recordingUrl });

            // If user turned on autoplay toggle (useraudio === 'autoplay'), auto-replay their voice
            if (get().useraudio === 'autoplay') {
                try {
                    const playAudio = new Audio(recordingUrl);
                    activeAudioElement = playAudio;
                    playAudio.play().catch(() => {});
                } catch {}
            }
        }

        // 1. Transcribe with Faster-Whisper
        let transcribedText = '';
        if (audioBlob) {
            try {
                const formData = new FormData();
                formData.append('file', audioBlob, 'recording.webm');
                formData.append('model', 'Systran/faster-whisper-base');
                formData.append('language', 'en');
                formData.append('temperature', '0.0');
                formData.append('response_format', 'verbose_json');

                const whisperRes = await fetch('/proxy/whisper/v1/audio/transcriptions', {
                    method: 'POST',
                    body: formData,
                });

                if (whisperRes.ok) {
                    const data = await whisperRes.json();
                    if (data.text) {
                        transcribedText = data.text.trim();
                    }
                }
            } catch (err) {
                console.warn('Faster-Whisper transcription error, falling back:', err);
            }
        }

        set({
            userDetectedWords: transcribedText || '(No speech detected)',
            isTranscribingStt: false,
            isEvaluatingStt: true,
        });

        // 2. Evaluate with Ollama LLM comparison
        const evaluation = await get().evaluateSpeechWithOllama(get().sentence, transcribedText);

        set({
            sttAccuracyScore: evaluation.score,
            sttFeedback: evaluation.feedback,
            isEvaluatingStt: false,
        });
    },

    /**
     * Prompts Ollama Qwen 2.5:3b to compare Target vs Spoken transcription
     * Combined with mathematical acoustic word match to prevent hallucinations
     */
    evaluateSpeechWithOllama: async (
        target: string,
        spoken: string
    ): Promise<{ score: number; feedback: string }> => {
        const acoustic = calculateAcousticWordSimilarity(target, spoken);

        // 1. If user spoke nothing or empty/silence
        if (!spoken || !spoken.trim()) {
            return {
                score: 0,
                feedback: 'No speech detected. Please speak the target sentence clearly.',
            };
        }

        // 2. If 0 words matched (e.g. user counted numbers "1,2,3,4...", made noise, or spoke completely unrelated words)
        if (acoustic.score === 0) {
            return {
                score: 0,
                feedback: 'No matching words detected. Please speak the words from the passage.',
            };
        }

        // 3. Query Ollama for intelligent phonetic & contextual analysis
        try {
            const prompt = buildSttEvaluationPrompt(
                target,
                spoken,
                acoustic.score,
                acoustic.unmatchedWords
            );
            const res = await fetch('/proxy/ollama/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'qwen2.5:3b',
                    messages: [{ role: 'user', content: prompt }],
                    stream: false,
                    options: { temperature: 0.1 },
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const content = data.message?.content || '';
                const jsonMatch = content.match(/\{[\s\S]*?\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    const rawLlmScore = typeof parsed.score === 'number' ? parsed.score : acoustic.score;
                    const isMatch = Boolean(parsed.isMatch);

                    // Reconcile LLM score with mathematical acoustic score:
                    let reconciledScore = rawLlmScore;
                    if (acoustic.score < 50) {
                        // User missed more than half the sentence: score cannot hallucinate high
                        reconciledScore = Math.min(rawLlmScore, acoustic.score + 10);
                    } else if (acoustic.score >= 80 && isMatch) {
                        // Spoke the vast majority cleanly: grant full credit (85-100)
                        reconciledScore = Math.max(acoustic.score, Math.min(100, rawLlmScore));
                    } else {
                        // Moderate match
                        reconciledScore = Math.round(acoustic.score * 0.7 + rawLlmScore * 0.3);
                    }

                    return {
                        score: Math.max(0, Math.min(100, reconciledScore)),
                        feedback:
                            parsed.feedback ||
                            (reconciledScore >= 80
                                ? 'Great pronunciation! Your words were articulate and natural.'
                                : 'Keep practicing! Focus on pronouncing every word clearly.'),
                    };
                }
            }
        } catch (err) {
            console.warn('Ollama speech evaluation error:', err);
        }

        // 4. Fallback using pure acoustic word similarity
        const fallbackScore = acoustic.score;
        return {
            score: fallbackScore,
            feedback:
                fallbackScore >= 80
                    ? 'Great pronunciation! Your words were clear and accurate.'
                    : fallbackScore >= 50
                    ? `Good attempt! Missed words: ${acoustic.unmatchedWords.slice(0, 3).join(', ')}.`
                    : 'Low match with target passage. Please speak each word carefully.',
        };
    },

    /**
     * Record Timed Auto play Loop:
     * 1. Checks TTS sentence duration + adds 3s
     * 2. Starts recording; auto-stops when time is reached
     * 3. Sends to STT engine while playing back recorded audio
     * 4. Shows STT output & accuracy match
     * 5. Repeats until Stop is clicked
     */
    startTimedAutoplay: async () => {
        if (get().isTimedAutoplayRunning) {
            get().stopTimedAutoplay();
            return;
        }

        clearActiveCountdown();
        stopActiveAudioPlayback();
        playbackSessionId++;

        const session = ++timedAutoplaySessionId;
        set({
            isTimedAutoplayRunning: true,
            isPlaying: false,
            activeWordIndex: null,
            countdown: null,
            countdownMode: null,
        });

        get().runTimedAutoplayCycle(session);
    },

    stopTimedAutoplay: () => {
        timedAutoplaySessionId++;
        clearTimedAutoplayTimers();
        if (mediaRecorderInstance && mediaRecorderInstance.state !== 'inactive') {
            try {
                mediaRecorderInstance.stop();
            } catch {}
        }
        stopActiveAudioPlayback();

        set({
            isTimedAutoplayRunning: false,
            timedAutoplayPhase: 'idle',
            isRecording: false,
            timedRecordRemaining: 0,
            timedPlaybackProgress: 0,
        });
    },

    runTimedAutoplayCycle: async (session: number) => {
        if (session !== timedAutoplaySessionId || !get().isTimedAutoplayRunning) {
            return;
        }

        // STEP 1: TTS sentence output time + 3s
        const ttsDuration = get().spokenSentenceDuration || 4;
        const totalRecordSeconds = Math.max(5, Math.round(ttsDuration + 3));

        // STEP 2: Start recording with hot mic
        try {
            const stream = await ensureHotMic();
            if (stream) {
                recordedAudioChunks = [];
                mediaRecorderInstance = new MediaRecorder(stream);
                mediaRecorderInstance.ondataavailable = (event) => {
                    if (event.data && event.data.size > 0) {
                        recordedAudioChunks.push(event.data);
                    }
                };
                mediaRecorderInstance.start();
            }
        } catch {
            // Emulated mic if hardware mic is unavailable
        }

        set({
            timedAutoplayPhase: 'recording',
            isRecording: true,
            timedRecordRemaining: totalRecordSeconds,
            userDetectedWords: 'Recording your voice for timed loop...',
            sttAccuracyScore: null,
            timedPlaybackProgress: 0,
        });

        let countdownSec = totalRecordSeconds;

        await new Promise<void>((resolve) => {
            timedRecordIntervalId = setInterval(() => {
                if (session !== timedAutoplaySessionId || !get().isTimedAutoplayRunning) {
                    clearTimedAutoplayTimers();
                    resolve();
                    return;
                }

                countdownSec -= 1;
                set({ timedRecordRemaining: Math.max(0, countdownSec) });

                if (countdownSec <= 0) {
                    if (timedRecordIntervalId !== null) {
                        clearInterval(timedRecordIntervalId);
                        timedRecordIntervalId = null;
                    }
                    resolve();
                }
            }, 1000);
        });

        if (session !== timedAutoplaySessionId || !get().isTimedAutoplayRunning) {
            return;
        }

        // Auto-stop recording
        let userRecordedBlob: Blob | null = null;
        if (mediaRecorderInstance && mediaRecorderInstance.state !== 'inactive') {
            await new Promise<void>((resolve) => {
                if (!mediaRecorderInstance) return resolve();
                mediaRecorderInstance.onstop = () => {
                    userRecordedBlob = new Blob(recordedAudioChunks, { type: 'audio/webm' });
                    resolve();
                };
                mediaRecorderInstance.stop();
            });
        }

        set({
            isRecording: false,
            timedAutoplayPhase: 'playback_stt',
            timedRecordRemaining: 0,
        });

        // STEP 3: Send to STT engine (in async) while playing back recorded audio
        const targetSentence = get().sentence;
        const asyncEvaluationPromise = (async () => {
            let transcribed = '';
            if (userRecordedBlob) {
                try {
                    const formData = new FormData();
                    formData.append('file', userRecordedBlob, 'recording.webm');
                    formData.append('model', 'Systran/faster-whisper-base');
                    formData.append('language', 'en');
                    const wRes = await fetch('/proxy/whisper/v1/audio/transcriptions', {
                        method: 'POST',
                        body: formData,
                    });
                    if (wRes.ok) {
                        const data = await wRes.json();
                        if (data.text) transcribed = data.text.trim();
                    }
                } catch {}
            }
            const evalResult = await get().evaluateSpeechWithOllama(targetSentence, transcribed);
            return { transcribed, ...evalResult };
        })();

        asyncEvaluationPromise.then((res) => {
            if (session !== timedAutoplaySessionId || !get().isTimedAutoplayRunning) return;
            // STEP 4: Show output of STT and match score
            set({
                userDetectedWords: res.transcribed || '(No speech detected)',
                sttAccuracyScore: res.score,
                sttFeedback: res.feedback,
            });
        });

        // Simultaneously play back user's recorded audio (or preview)
        let playbackDurationMs = 3500;
        if (userRecordedBlob) {
            try {
                const playUrl = URL.createObjectURL(userRecordedBlob);
                const playAudio = new Audio(playUrl);
                activeAudioElement = playAudio;
                await playAudio.play();
                playbackDurationMs = Math.max(2500, Math.round((playAudio.duration || 3.5) * 1000));
            } catch {}
        }

        const startTime = Date.now();
        set({ timedPlaybackProgress: 0 });

        await new Promise<void>((resolve) => {
            timedPlaybackIntervalId = setInterval(() => {
                if (session !== timedAutoplaySessionId || !get().isTimedAutoplayRunning) {
                    clearTimedAutoplayTimers();
                    resolve();
                    return;
                }

                const elapsed = Date.now() - startTime;
                const progress = Math.min(100, Math.round((elapsed / playbackDurationMs) * 100));
                set({ timedPlaybackProgress: progress });

                if (elapsed >= playbackDurationMs) {
                    if (timedPlaybackIntervalId !== null) {
                        clearInterval(timedPlaybackIntervalId);
                        timedPlaybackIntervalId = null;
                    }
                    set({ timedPlaybackProgress: 100 });
                    resolve();
                }
            }, 100);
        });

        if (session !== timedAutoplaySessionId || !get().isTimedAutoplayRunning) {
            return;
        }

        // 1.5s breather before next repeat
        await new Promise<void>((resolve) => {
            timedBreatherTimeoutId = setTimeout(() => {
                resolve();
            }, 1500);
        });

        // STEP 5: Repeat until Stop clicked
        if (session === timedAutoplaySessionId && get().isTimedAutoplayRunning) {
            get().runTimedAutoplayCycle(session);
        }
    },
}));

export const useSpeechModule = createSelectors(speechmodule);

// Synthesize initial sentence & pre-fetch word audio with Kokoro TTS on startup
if (typeof window !== 'undefined') {
    speechmodule.getState().synthesizeKokoroTts(defaultSentence);
    warmUpHotEngines().catch(() => {});
}
