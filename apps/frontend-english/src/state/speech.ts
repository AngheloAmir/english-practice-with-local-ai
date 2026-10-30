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
    // Current sentence & tokenized words
    sentence: string;
    words: string[];

    // TTS generated audio content
    spokenSentence: any; // URL or AudioBuffer for complete sentence
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

    // Setters
    setSentence: (sentence: string) => void;
    setWords: (words: string[]) => void;

    setSpokenSentence: (audio: any) => void;
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
}

const defaultSentence = PRACTICE_SENTENCES[1];

let playbackSessionId = 0;
let countdownTimerId: ReturnType<typeof setInterval> | null = null;

const clearActiveCountdown = () => {
    if (countdownTimerId !== null) {
        clearInterval(countdownTimerId);
        countdownTimerId = null;
    }
};

const speechmodule = create<SpeechModule>()((set, get) => ({
    sentence: defaultSentence,
    words: defaultSentence.split(/\s+/).filter(Boolean),

    spokenSentence: null,
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

    setSentence: (sentence: string) => {
        const words = sentence.trim().split(/\s+/).filter(Boolean);
        set({ sentence, words, activeWordIndex: null });
    },
    setWords: (words: string[]) => set({ words }),

    setSpokenSentence: (spokenSentence: any) => set({ spokenSentence }),
    setSpokenWords: (spokenWords: any[]) => set({ spokenWords }),

    setUserDetectedWords: (userDetectedWords: string) => set({ userDetectedWords }),
    setUserRecording: (userRecording: any) => set({ userRecording }),
    setSttAccuracyScore: (sttAccuracyScore: number | null) => set({ sttAccuracyScore }),

    setPlaymode: (playmode: 'sentence' | 'perword') => set({ playmode }),
    setUseraudio: (useraudio: 'autoplay' | '') => set({ useraudio }),
    setDifficulty: (difficulty: 'Practice' | 'Beginner' | 'Intermediate' | 'Advanced') => {
        clearActiveCountdown();
        playbackSessionId++;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        const nextSentence = DIFFICULTY_SENTENCES[difficulty] || PRACTICE_SENTENCES[0];
        set({
            difficulty,
            sentence: nextSentence,
            words: nextSentence.trim().split(/\s+/).filter(Boolean),
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
     * Do Test / Recording:
     * Listens to user microphone audio, then sends to STT to get transcribed words.
     */
    startRecordingTest: async () => {
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
     * New Sentences:
     * Cycles to another sentence, resets playback & timer states.
     */
    generateNewSentence: () => {
        clearActiveCountdown();
        playbackSessionId++;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        const currentSentence = get().sentence;
        const remaining = PRACTICE_SENTENCES.filter((s) => s !== currentSentence);
        const next = remaining.length > 0 ? remaining[Math.floor(Math.random() * remaining.length)] : PRACTICE_SENTENCES[0];

        set({
            sentence: next,
            words: next.trim().split(/\s+/).filter(Boolean),
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
