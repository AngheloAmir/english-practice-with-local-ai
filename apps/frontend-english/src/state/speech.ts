import { create } from 'zustand';
import { createSelectors } from '../lib/_zustand';

const PRACTICE_SENTENCES = [
    'I enjoy practicing English by reading books and watching movies in English',
    "In today's fast-paced professional environment, articulating complex ideas with clarity and empathy is essential. When communicating across diverse cultures, we must listen actively and adapt our linguistic nuances to foster authentic collaboration.",
    'Consistency is the key to mastering natural pronunciation and building confident communication skills every single day.',
];

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
    sttAccuracyScore: number | null; // e.g. 88%

    // Playback and UI states
    playmode: 'sentence' | 'perword';
    useraudio: 'autoplay' | '';
    difficulty: 'Practice' | 'Beginner' | 'Intermediate' | 'Advanced';
    activeWordIndex: number | null; // Exactly ONE word highlighted/blocked while playing spokenWords
    isPlaying: boolean;
    isRecording: boolean;

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

    // Actions
    playFullSentence: () => Promise<void>;
    playSpeechShadowing: () => Promise<void>;
    playWordAtIndex: (index: number) => Promise<void>;
    startRecordingTest: () => Promise<void>;
    stopRecordingTest: () => void;
    generateNewSentence: () => void;
}

const defaultSentence = PRACTICE_SENTENCES[0];

const speechmodule = create<SpeechModule>()((set, get) => ({
    sentence: defaultSentence,
    words: defaultSentence.split(/\s+/).filter(Boolean),

    spokenSentence: null,
    spokenWords: [],

    userDetectedWords: '',
    userRecording: null,
    sttAccuracyScore: null,

    playmode: 'sentence',
    useraudio: '',
    difficulty: 'Practice',
    activeWordIndex: null,
    isPlaying: false,
    isRecording: false,

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
    setDifficulty: (difficulty: 'Practice' | 'Beginner' | 'Intermediate' | 'Advanced') => set({ difficulty }),
    setActiveWordIndex: (activeWordIndex: number | null) => set({ activeWordIndex }),
    setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
    setIsRecording: (isRecording: boolean) => set({ isRecording }),

    /**
     * Listen: Plays the complete sentence audio.
     * 
     * TODO (Future AI Engine Integration):
     * 1. Query Kokoro TTS server (e.g. POST http://localhost:8880/v1/audio/speech)
     *    with { input: sentence, voice: 'af_heart', speed: 1.0 }
     * 2. Store received Audio Blob into `spokenSentence` and play via Audio element.
     * 3. For immediate interactive frontend feedback, we use browser SpeechSynthesis as fallback.
     */
    playFullSentence: async () => {
        const { sentence, isPlaying } = get();
        if (isPlaying) {
            window.speechSynthesis?.cancel();
            set({ isPlaying: false, activeWordIndex: null });
            return;
        }

        set({ isPlaying: true, playmode: 'sentence' });

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(sentence);
            utterance.rate = 0.9;
            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    // Match boundary word to token index
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
                set({ isPlaying: false, activeWordIndex: null });
            };
            utterance.onerror = () => {
                set({ isPlaying: false, activeWordIndex: null });
            };
            window.speechSynthesis.speak(utterance);
        } else {
            const words = get().words;
            for (let i = 0; i < words.length; i++) {
                if (!get().isPlaying) break;
                set({ activeWordIndex: i });
                await new Promise((r) => setTimeout(r, 400));
            }
            set({ isPlaying: false, activeWordIndex: null });
        }
    },

    /**
     * Speech Shadowing: Plays word-by-word with natural delay so user can shadow/repeat.
     * 
     * TODO (Future AI Engine Integration):
     * 1. Request word-level audio array `spokenWords` from Kokoro TTS or pre-segmented audio.
     * 2. Loop through `spokenWords[i]`, play each audio clip, wait for audio.onended,
     *    then insert deliberate shadowing pause (e.g. 500ms - 800ms) before the next word.
     * 3. Highlight each word in `activeWordIndex` in sync (one block at a time).
     */
    playSpeechShadowing: async () => {
        const { words, isPlaying } = get();
        if (isPlaying) {
            window.speechSynthesis?.cancel();
            set({ isPlaying: false, activeWordIndex: null });
            return;
        }

        set({ isPlaying: true, playmode: 'perword' });

        for (let i = 0; i < words.length; i++) {
            if (!get().isPlaying) break;
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

            // Shadowing interval pause between words so user can repeat
            await new Promise((r) => setTimeout(r, 400));
        }

        set({ isPlaying: false, activeWordIndex: null });
    },

    /**
     * Play Single Word: Triggered when user clicks an individual word token.
     * 
     * TODO (Future AI Engine Integration):
     * Play `spokenWords[index]` from Kokoro TTS or cached word audio buffer.
     */
    playWordAtIndex: async (index: number) => {
        const { words } = get();
        if (index < 0 || index >= words.length) return;

        set({ activeWordIndex: index });

        const rawWord = words[index];
        const cleanWord = rawWord.replace(/[.,!?;:"]+/g, '');

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(cleanWord);
            utterance.rate = 0.85;
            utterance.onend = () => {
                set({ activeWordIndex: null });
            };
            utterance.onerror = () => {
                set({ activeWordIndex: null });
            };
            window.speechSynthesis.speak(utterance);
        } else {
            setTimeout(() => {
                set({ activeWordIndex: null });
            }, 500);
        }
    },

    /**
     * Do Test / Recording:
     * Listens to user microphone audio, then sends to STT to get transcribed words.
     * 
     * TODO (Future AI Engine Integration):
     * 1. Access microphone via `navigator.mediaDevices.getUserMedia({ audio: true })`.
     * 2. Capture user voice with `MediaRecorder` into audio blob `userRecording`.
     * 3. Send audio blob to Faster-Whisper server:
     *    POST http://localhost:8000/v1/audio/transcriptions (form-data: file=@audio.wav, language='en')
     * 4. Update `userDetectedWords` with Whisper transcription.
     * 5. Calculate pronunciation accuracy score against target `sentence`.
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
     * 
     * TODO (Future AI Engine Integration):
     * 1. Query local Ollama LLM (POST http://localhost:11434/api/generate)
     * 2. Automatically request Kokoro TTS synthesis for the new sentence and words.
     */
    generateNewSentence: () => {
        const currentSentence = get().sentence;
        const remaining = PRACTICE_SENTENCES.filter((s) => s !== currentSentence);
        const next = remaining.length > 0 ? remaining[Math.floor(Math.random() * remaining.length)] : PRACTICE_SENTENCES[0];

        set({
            sentence: next,
            words: next.trim().split(/\s+/).filter(Boolean),
            activeWordIndex: null,
            userDetectedWords: '',
            sttAccuracyScore: null,
        });
    },
}));

export const useSpeechModule = createSelectors(speechmodule);
