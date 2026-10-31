import { create } from 'zustand';
import { createSelectors } from '../lib/_zustand';

const PRACTICE_SENTENCES = [
    'I enjoy practicing English by reading books and watching movies in English',
    "In today's fast-paced professional environment, articulating complex ideas with clarity and empathy is essential. When communicating across diverse cultures, we must listen actively and adapt our linguistic nuances to foster authentic collaboration.",
    'Consistency is the key to mastering natural pronunciation and building confident communication skills every single day.',
];

const DIFFICULTY_SENTENCES: Record<string, string> = {
    Practice: PRACTICE_SENTENCES[1],
    Beginner: PRACTICE_SENTENCES[0],
    Intermediate: PRACTICE_SENTENCES[2],
    Advanced: PRACTICE_SENTENCES[1],
};

export interface SpeechModule {
    // Current sentence & tokenized words (restricted max length to avoid card overflow)
    sentence: string;
    words: string[];

    // TTS generated audio content
    spokenSentence: any; // URL or AudioBuffer for complete sentence (speech.ts:L23)
    spokenSentenceDuration: number; // Duration of TTS sentence output in seconds
    spokenWords: any[];  // Array of Audio URLs / Buffers matching words array (played one word at a time)

    // STT & User recording
    userDetectedWords: string; // Transcribed text from Whisper STT
    userRecording: any;        // Recorded user audio (Blob or URL)
    sttAccuracyScore: number | null; // e.g. 94%

    // Playback and UI states
    playmode: 'sentence' | 'perword';
    useraudio: 'autoplay' | '';
    difficulty: 'Practice' | 'Beginner' | 'Intermediate' | 'Advanced';
    activeWordIndex: number | null; // Exactly ONE word highlighted/blocked while playing spokenWords
    isPlaying: boolean;
    isRecording: boolean;

    // Countdown state (1.5s down to 0.1s before playback starts)
    countdown: number | null;
    countdownMode: 'sentence' | 'perword' | null;

    // Timed Auto-play loop states
    // 1. Checks TTS sentence output time then adds 3s
    // 2. Starts recording, auto-stops after (TTS time + 3s)
    // 3. Asynchronously sends to STT engine while playing back recorded audio
    // 4. Shows STT output & accuracy match, then repeats until stopped
    isTimedAutoplayRunning: boolean;
    timedAutoplayPhase: 'idle' | 'recording' | 'playback_stt';
    timedRecordRemaining: number;
    timedPlaybackProgress: number;

    // Setters
    setSentence: (sentence: string) => void;
    setWords: (words: string[]) => void;

    setSpokenSentence: (audio: any) => void;
    setSpokenSentenceDuration: (duration: number) => void;
    setSpokenWords: (spokenWords: any[]) => void;

    setUserDetectedWords: (detected: string) => void;
    setUserRecording: (recording: any) => void;
    setSttAccuracyScore: (score: number | null) => void;

    setPlaymode: (mode: 'sentence' | 'perword') => void;
    setUseraudio: (mode: 'autoplay' | '') => void;
    setDifficulty: (difficulty: 'Practice' | 'Beginner' | 'Intermediate' | 'Advanced') => void;
    setActiveWordIndex: (index: number | null) => void;
    setIsPlaying: (playing: boolean) => void;
    setIsRecording: (recording: boolean) => void;
    setCountdown: (countdown: number | null) => void;
    setCountdownMode: (mode: 'sentence' | 'perword' | null) => void;

    // Actions
    playFullSentence: () => Promise<void>;
    playSpeechShadowing: () => Promise<void>;
    executeSentencePlayback: (session: number) => Promise<void>;
    executeShadowingPlayback: (session: number) => Promise<void>;
    cancelCountdown: () => void;
    playWordAtIndex: (index: number) => Promise<void>;
    startRecordingTest: () => Promise<void>;
    stopRecordingTest: () => void;
    generateNewSentence: () => void;

    // Timed Auto Play Loop Actions
    startTimedAutoplay: () => Promise<void>;
    stopTimedAutoplay: () => void;
    runTimedAutoplayCycle: (session: number) => Promise<void>;
}

const defaultSentence = PRACTICE_SENTENCES[1];

let playbackSessionId = 0;
let countdownTimerId: ReturnType<typeof setInterval> | null = null;

let timedAutoplaySessionId = 0;
let timedRecordIntervalId: ReturnType<typeof setInterval> | null = null;
let timedPlaybackIntervalId: ReturnType<typeof setInterval> | null = null;
let timedBreatherTimeoutId: ReturnType<typeof setTimeout> | null = null;

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

const speechmodule = create<SpeechModule>()((set, get) => ({
    sentence: defaultSentence,
    // Restrict words to 35 max to avoid text overflow in the fixed-height card
    words: defaultSentence.split(/\s+/).filter(Boolean).slice(0, 35),

    spokenSentence: null,
    spokenSentenceDuration: 4, // Default 4 seconds for single TTS sentence
    spokenWords: [],

    userDetectedWords: defaultSentence,
    userRecording: null,
    sttAccuracyScore: 94,

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
        // Restrict maximum words so passage does not scroll or overflow fixed-height card
        const words = sentence.trim().split(/\s+/).filter(Boolean).slice(0, 35);
        const cappedSentence = words.join(' ');
        set({ sentence: cappedSentence, words, activeWordIndex: null });
    },
    setWords: (words: string[]) => set({ words: words.slice(0, 35) }),

    setSpokenSentence: (spokenSentence: any) => set({ spokenSentence }),
    setSpokenSentenceDuration: (spokenSentenceDuration: number) => set({ spokenSentenceDuration }),
    setSpokenWords: (spokenWords: any[]) => set({ spokenWords }),

    setUserDetectedWords: (userDetectedWords: string) => set({ userDetectedWords }),
    setUserRecording: (userRecording: any) => set({ userRecording }),
    setSttAccuracyScore: (sttAccuracyScore: number | null) => set({ sttAccuracyScore }),

    setPlaymode: (playmode: 'sentence' | 'perword') => set({ playmode }),
    setUseraudio: (useraudio: 'autoplay' | '') => set({ useraudio }),
    setDifficulty: (difficulty: 'Practice' | 'Beginner' | 'Intermediate' | 'Advanced') => {
        clearActiveCountdown();
        get().stopTimedAutoplay();
        playbackSessionId++;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        const nextSentence = DIFFICULTY_SENTENCES[difficulty] || PRACTICE_SENTENCES[0];
        const nextWords = nextSentence.trim().split(/\s+/).filter(Boolean).slice(0, 35);
        set({
            difficulty,
            sentence: nextWords.join(' '),
            words: nextWords,
            activeWordIndex: null,
            isPlaying: false,
            countdown: null,
            countdownMode: null,
            userDetectedWords: nextSentence,
            sttAccuracyScore: 94,
        });
    },
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
     * Listen: Initiates a 1.5s countdown before playing the complete sentence.
     */
    playFullSentence: async () => {
        const { isPlaying, countdown, countdownMode, playmode } = get();

        // Stop any active timed auto-play loop
        get().stopTimedAutoplay();

        // If currently playing or counting down for sentence, clicking pauses/cancels it
        if ((isPlaying && playmode === 'sentence') || (countdown !== null && countdownMode === 'sentence')) {
            clearActiveCountdown();
            playbackSessionId++;
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            set({ isPlaying: false, activeWordIndex: null, countdown: null, countdownMode: null });
            return;
        }

        // Cancel any active playback or countdown
        clearActiveCountdown();
        playbackSessionId++;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        const currentSession = ++playbackSessionId;
        let remaining = 1.5;
        set({
            countdown: 1.5,
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

    /**
     * Executes sentence TTS playback after 1.5s countdown finishes.
     */
    executeSentencePlayback: async (currentSession: number) => {
        const { sentence } = get();
        set({ isPlaying: true, playmode: 'sentence' });

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(sentence);
            utterance.rate = 0.9;
            utterance.onboundary = (event) => {
                if (currentSession !== playbackSessionId) return;
                if (event.name === 'word') {
                    const wordList = get().words;
                    const charIndex = event.charIndex;
                    let accum = 0;
                    for (let i = 0; i < wordList.length; i++) {
                        if (accum >= charIndex) {
                            set({ activeWordIndex: i });
                            break;
                        }
                        accum += wordList[i].length + 1;
                    }
                }
            };
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
            const words = get().words;
            for (let i = 0; i < words.length; i++) {
                if (!get().isPlaying || currentSession !== playbackSessionId) break;
                set({ activeWordIndex: i });
                await new Promise((r) => setTimeout(r, 400));
            }
            if (currentSession === playbackSessionId) {
                set({ isPlaying: false, activeWordIndex: null });
            }
        }
    },

    /**
     * Speech Shadowing: Initiates 1.5s countdown, then speaks word-by-word with shadowing delay.
     */
    playSpeechShadowing: async () => {
        const { isPlaying, countdown, countdownMode, playmode } = get();

        // Stop any active timed auto-play loop
        get().stopTimedAutoplay();

        // If currently playing or counting down for perword, clicking pauses/cancels it
        if ((isPlaying && playmode === 'perword') || (countdown !== null && countdownMode === 'perword')) {
            clearActiveCountdown();
            playbackSessionId++;
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            set({ isPlaying: false, activeWordIndex: null, countdown: null, countdownMode: null });
            return;
        }

        // Cancel any other active playback or countdown
        clearActiveCountdown();
        playbackSessionId++;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        const currentSession = ++playbackSessionId;
        let remaining = 1.5;
        set({
            countdown: 1.5,
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
        }, 100);
    },

    /**
     * Executes word-by-word shadowing playback after 1.5s countdown finishes.
     */
    executeShadowingPlayback: async (currentSession: number) => {
        const { words } = get();
        set({ isPlaying: true, playmode: 'perword' });

        for (let i = 0; i < words.length; i++) {
            if (!get().isPlaying || currentSession !== playbackSessionId) break;
            set({ activeWordIndex: i });

            if ('speechSynthesis' in window) {
                await new Promise<void>((resolve) => {
                    window.speechSynthesis.cancel();
                    const cleanWord = words[i].replace(/[.,!?;:"]+/g, '');
                    const utterance = new SpeechSynthesisUtterance(cleanWord);
                    utterance.rate = 0.85;
                    utterance.onend = () => resolve();
                    utterance.onerror = () => resolve();
                    window.speechSynthesis.speak(utterance);
                });
            } else {
                await new Promise((r) => setTimeout(r, 450));
            }

            if (currentSession !== playbackSessionId) break;
            // Shadowing interval pause between words so user can repeat
            await new Promise((r) => setTimeout(r, 400));
        }

        if (currentSession === playbackSessionId) {
            set({ isPlaying: false, activeWordIndex: null });
        }
    },

    /**
     * Play Single Word: Triggered when user clicks an individual word token.
     */
    playWordAtIndex: async (index: number) => {
        const { words, isPlaying, countdown } = get();
        if (index < 0 || index >= words.length) return;

        // Stop any active timed auto-play loop
        get().stopTimedAutoplay();

        // Invalidate active playback/countdown session
        clearActiveCountdown();
        playbackSessionId++;

        if (countdown !== null) {
            set({ countdown: null, countdownMode: null });
        }

        // When a text is clicked and if isPlaying (speech.ts:L29) is true, stop playing any audio
        if (isPlaying) {
            // Note: Stop any ongoing full-sentence or shadowing audio playback
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            set({ isPlaying: false });
        }

        // Set the active clicked word highlight immediately in the UI
        set({ activeWordIndex: index });

        // Play the related spokenWords (speech.ts:L17-L18) audio for that word
        // Note: Ready to play spokenWords[index] audio clip once full audio engine integration is connected.
        const rawWord = words[index];
        const cleanWord = rawWord.replace(/[.,!?;:"]+/g, '');

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(cleanWord);
            utterance.rate = 0.85;
            utterance.onerror = () => {
                // Safeguard: do not inadvertently clear activeWordIndex on cancellation
            };
            window.speechSynthesis.speak(utterance);
        }
    },

    /**
     * Manual Do Test / Recording:
     */
    startRecordingTest: async () => {
        get().stopTimedAutoplay();
        set({ isRecording: true, userDetectedWords: 'Listening to your speech...', sttAccuracyScore: null });

        setTimeout(() => {
            const currentSentence = get().sentence;
            set({
                isRecording: false,
                userDetectedWords: currentSentence,
                sttAccuracyScore: 94,
            });
        }, 3200);
    },

    stopRecordingTest: () => {
        set({ isRecording: false });
    },

    /**
     * Record Timed Auto play Loop:
     * 1. Checks TTS sentence output time (the single spokenSentence: speech.ts:L23) then adds 3 seconds.
     * 2. Starts recording; auto-stops when time is reached.
     * 3. Sends to STT engine (in async) while playing back recorded audio.
     * 4. Shows STT output and checks match with passage (pronunciation checking).
     * 5. Repeats until the "Stop" button is clicked.
     */
    startTimedAutoplay: async () => {
        if (get().isTimedAutoplayRunning) {
            get().stopTimedAutoplay();
            return;
        }

        // Cancel any manual playback, countdown, or recording
        clearActiveCountdown();
        playbackSessionId++;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

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

        // STEP 1: Check TTS sentence output time (spokenSentence: speech.ts:L23) then add 3 seconds
        const { words, spokenSentence, spokenSentenceDuration } = get();
        const baseTtsDuration = (spokenSentence && typeof spokenSentence.duration === 'number' && spokenSentence.duration > 0)
            ? Math.round(spokenSentence.duration)
            : (spokenSentenceDuration || Math.max(3, Math.round(words.length * 0.45 + 1)));

        // Target record duration: TTS sentence duration + 3 seconds
        const recordDurationSeconds = baseTtsDuration + 3;

        // STEP 2: Start recording; the recording auto stops based on step 1
        // Note: Ready for navigator.mediaDevices.getUserMedia and MediaRecorder.start()
        set({
            timedAutoplayPhase: 'recording',
            isRecording: true,
            timedRecordRemaining: recordDurationSeconds,
            userDetectedWords: 'Recording your voice for timed loop...',
            sttAccuracyScore: null,
            timedPlaybackProgress: 0,
        });

        let countdownSec = recordDurationSeconds;

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
        // Note: Ready for MediaRecorder.stop() to generate recorded audio Blob
        set({
            isRecording: false,
            timedAutoplayPhase: 'playback_stt',
            timedRecordRemaining: 0,
        });

        // STEP 3: Send to STT engine (in async) while playing back recorded audio
        // Note: Ready for async fetch POST to Whisper STT server with recorded audio Blob
        // e.g. const sttPromise = fetch('/v1/audio/transcriptions', { method: 'POST', body: formData })...
        const asyncSttPromise = new Promise<{ text: string; score: number }>((resolve) => {
            // Simulated asynchronous Whisper STT evaluation
            setTimeout(() => {
                const targetText = get().sentence;
                resolve({
                    text: targetText,
                    score: 94,
                });
            }, 1800);
        });

        // Handle async STT result without blocking playback
        asyncSttPromise.then((result) => {
            if (session !== timedAutoplaySessionId || !get().isTimedAutoplayRunning) return;
            // STEP 4: Show output of STT and check match with passage (pronunciation checking)
            set({
                userDetectedWords: result.text,
                sttAccuracyScore: result.score,
            });
        });

        // Simultaneously play back the recorded audio (simulated 3.5s playback)
        // Note: Ready for recordedAudioElement.play() with timeupdate listener
        const playbackDurationMs = 3500;
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

        // Brief 1.5s pause to inspect pronunciation score before next cycle
        await new Promise<void>((resolve) => {
            timedBreatherTimeoutId = setTimeout(() => {
                resolve();
            }, 1500);
        });

        // STEP 5: Repeat until the "Stop" button is clicked
        if (session === timedAutoplaySessionId && get().isTimedAutoplayRunning) {
            get().runTimedAutoplayCycle(session);
        }
    },

    /**
     * New Sentences: Cycles sentence and resets timer/loop states.
     */
    generateNewSentence: () => {
        clearActiveCountdown();
        get().stopTimedAutoplay();
        playbackSessionId++;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        const currentSentence = get().sentence;
        const remaining = PRACTICE_SENTENCES.filter((s) => s !== currentSentence);
        const next = remaining.length > 0 ? remaining[Math.floor(Math.random() * remaining.length)] : PRACTICE_SENTENCES[0];
        const nextWords = next.trim().split(/\s+/).filter(Boolean).slice(0, 35);

        set({
            sentence: nextWords.join(' '),
            words: nextWords,
            activeWordIndex: null,
            isPlaying: false,
            countdown: null,
            countdownMode: null,
            userDetectedWords: next,
            sttAccuracyScore: 94,
        });
    },
}));

export const useSpeechModule = createSelectors(speechmodule);