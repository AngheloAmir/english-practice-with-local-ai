import { create } from 'zustand';
import { createSelectors } from '../lib/_zustand';
import { MODULESCOREMOCKDATA, type ModuleScore } from './_types';

interface AppState {
    //Navigation Related===============================================
    currentModule: string;
    setCurrentModule: (module: string) => void;
    isDrawerOpen: boolean;
    setIsDrawerOpen: (open: boolean) => void;
    toggleDrawer: () => void;

    //dashboardstats===================================================
    modulescores: Array<ModuleScore>;
    loadmodulescores: () => void;
    updatemodulescores: (modules: ModuleScore[]) => void;

    //grammar==========================================================
    grammardiffculty:  'Easy' | 'Medium';
    grammarsubject:    'partsofspeech' | 'preposition' | 'subjectverb' | 'rewritting';
    grammarquestions:   string;
    grammarstarted:     boolean;
   
    setGrammarQuestions: (questions: string) => void;
    setGrammarSubject: (subject: 'partsofspeech' | 'preposition' | 'subjectverb' | 'rewritting') => void;
    setGrammarDifficulty: (difficulty: 'Easy' | 'Medium') => void;
    setGrammarIsStarted: (started: boolean) => void;
    
    airesponseGrammar:         string;
    setAIResponseGrammar:      (response: string) => void;
    generateQuestionGrammar:   () => Promise<void>;
    generateAIResponseGrammar: (userAnswer?: string) => Promise<void>;
    
} 

const appContext = create<AppState>()((set, get) => ({
    currentModule: "dashboard",
    setCurrentModule: (module) => set({ currentModule: module }),
    isDrawerOpen: false,
    setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),
    toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

    //dashboardstats===================================================
    modulescores: MODULESCOREMOCKDATA,
    loadmodulescores: () => set({ modulescores: MODULESCOREMOCKDATA }),
    updatemodulescores: (module: ModuleScore[]) => set({ modulescores: module }),

    //grammar==========================================================
    grammardiffculty: 'Easy',
    grammarsubject:   'partsofspeech',
    grammarquestions: '',
    grammarstarted:   false,
    airesponseGrammar: '',
    setGrammarDifficulty: (difficulty: 'Easy' | 'Medium') => set({ grammardiffculty: difficulty }),
    setGrammarSubject: (subject: 'partsofspeech' | 'preposition' | 'subjectverb' | 'rewritting') => set({ grammarsubject: subject }),
    setGrammarQuestions: (questions: string) => set({ grammarquestions: questions }),
    setGrammarIsStarted: (started: boolean) => set({ grammarstarted: started }),
    setAIResponseGrammar: (response: string) => set({ airesponseGrammar: response }),
    
    generateQuestionGrammar: async () => {
        const subject = get().grammarsubject;
        const difficulty = get().grammardiffculty;

        // Static question pool for open-ended text input practice (no multiple choice)
        const openQuestionPool: Record<string, Record<'Easy' | 'Medium', Array<{
            id: string;
            prompt: string;
            category: string;
            difficulty: 'Easy' | 'Medium';
            expectedAnswers: string[];
            displayAnswer: string;
            explanation: string;
        }>>> = {
            partsofspeech: {
                Easy: [
                    {
                        id: 'pos-open-e1',
                        prompt: "Identify the part of speech of the capitalized word:\n\"The enthusiastic student completed the assignment QUICKLY.\"",
                        category: "Parts of Speech",
                        difficulty: "Easy",
                        expectedAnswers: ["adverb", "an adverb"],
                        displayAnswer: "Adverb",
                        explanation: "'Quickly' modifies the verb 'completed' by describing how the action was performed."
                    },
                    {
                        id: 'pos-open-e2',
                        prompt: "Identify the part of speech of the capitalized word:\n\"The BRILLIANT architect designed the award-winning library.\"",
                        category: "Parts of Speech",
                        difficulty: "Easy",
                        expectedAnswers: ["adjective", "an adjective"],
                        displayAnswer: "Adjective",
                        explanation: "'Brilliant' modifies and describes the noun 'architect'."
                    }
                ],
                Medium: [
                    {
                        id: 'pos-open-m1',
                        prompt: "What grammatical form is the capitalized word functioning as?\n\"SWIMMING every morning significantly improved her health.\"",
                        category: "Parts of Speech",
                        difficulty: "Medium",
                        expectedAnswers: ["gerund", "noun", "gerund noun"],
                        displayAnswer: "Gerund",
                        explanation: "'Swimming' functions as the subject noun of the sentence, making it a gerund."
                    }
                ]
            },
            preposition: {
                Easy: [
                    {
                        id: 'prep-open-e1',
                        prompt: "Type the missing preposition to complete the sentence:\n\"Dr. Martinez will arrive _____ London at 8:00 AM on Monday.\"",
                        category: "Prepositions",
                        difficulty: "Easy",
                        expectedAnswers: ["in"],
                        displayAnswer: "in",
                        explanation: "We use 'arrive in' for cities, countries, and large geographic locations ('arrive in London')."
                    },
                    {
                        id: 'prep-open-e2',
                        prompt: "Type the missing preposition of time:\n\"The company was founded _____ 2018 by two software engineers.\"",
                        category: "Prepositions",
                        difficulty: "Easy",
                        expectedAnswers: ["in"],
                        displayAnswer: "in",
                        explanation: "We use the preposition 'in' when referring to specific years, decades, and months ('in 2018')."
                    }
                ],
                Medium: [
                    {
                        id: 'prep-open-m1',
                        prompt: "Type the preposition that correctly collocate with the verb:\n\"All newly recruited personnel must comply _____ standard safety protocols.\"",
                        category: "Prepositions",
                        difficulty: "Medium",
                        expectedAnswers: ["with"],
                        displayAnswer: "with",
                        explanation: "The verb 'comply' takes the preposition 'with' to form the collocation 'comply with'."
                    }
                ]
            },
            subjectverb: {
                Easy: [
                    {
                        id: 'sv-open-e1',
                        prompt: "Fill in the blank with the correct verb (was / were):\n\"Each of the participants _____ given a certificate of completion.\"",
                        category: "Subject-Verb Agreement",
                        difficulty: "Easy",
                        expectedAnswers: ["was"],
                        displayAnswer: "was",
                        explanation: "'Each' is an indefinite singular pronoun that requires the singular verb 'was'."
                    }
                ],
                Medium: [
                    {
                        id: 'sv-open-m1',
                        prompt: "Type the correct form of the verb 'have' (has / have):\n\"The committee, along with its advisors, _____ approved the final proposal.\"",
                        category: "Subject-Verb Agreement",
                        difficulty: "Medium",
                        expectedAnswers: ["has"],
                        displayAnswer: "has",
                        explanation: "Parenthetical phrases like 'along with its advisors' do not change the number of the singular subject 'committee', so 'has' is correct."
                    }
                ]
            },
            rewritting: {
                Easy: [
                    {
                        id: 'rw-open-e1',
                        prompt: "Rewrite this active sentence into passive voice:\n\"The chef prepared a delectable four-course meal.\"",
                        category: "Sentence Rewriting",
                        difficulty: "Easy",
                        expectedAnswers: [
                            "a delectable four-course meal was prepared by the chef",
                            "a delectable four-course meal was prepared by the chef."
                        ],
                        displayAnswer: "A delectable four-course meal was prepared by the chef.",
                        explanation: "The simple past active 'prepared' converts to 'was prepared', with the direct object becoming the passive subject."
                    }
                ],
                Medium: [
                    {
                        id: 'rw-open-m1',
                        prompt: "Rewrite into indirect reported speech (start with 'She announced that...'):\n\"'I will present the findings tomorrow,' announced Sarah.\"",
                        category: "Sentence Rewriting",
                        difficulty: "Medium",
                        expectedAnswers: [
                            "she announced that she would present the findings the next day",
                            "she announced that she would present the findings the next day.",
                            "she announced that she would present the findings the following day",
                            "she announced that she would present the findings the following day."
                        ],
                        displayAnswer: "She announced that she would present the findings the next day.",
                        explanation: "In reported speech with past reporting verb 'announced', 'will' shifts to 'would' and 'tomorrow' shifts to 'the next day'."
                    }
                ]
            }
        };

        const subjectPool = openQuestionPool[subject] || openQuestionPool.partsofspeech;
        const questionsList = subjectPool[difficulty] || subjectPool.Easy;
        const randomQuestion = questionsList[Math.floor(Math.random() * questionsList.length)];

        // Reset previous AI feedback and set the new static question
        set({
            airesponseGrammar: '',
            grammarquestions: JSON.stringify(randomQuestion)
        });
    },

    generateAIResponseGrammar: async (userAnswer?: string) => {
        // TODO: In production, replace this static check with an API call to the local LLM / AI conversational coach.
        const currentQuestionJson = get().grammarquestions;
        if (!currentQuestionJson) return;

        interface QuestionPayload {
            expectedAnswers: string[];
            displayAnswer: string;
            explanation: string;
        }

        let question: QuestionPayload;
        try {
            question = JSON.parse(currentQuestionJson) as QuestionPayload;
        } catch {
            return;
        }

        const cleanedInput = (userAnswer || "").trim().toLowerCase().replace(/[.,!?;:]+$/, "");
        const isCorrect = question.expectedAnswers.some(
            (ans) => ans.trim().toLowerCase().replace(/[.,!?;:]+$/, "") === cleanedInput
        );

        const responsePayload = {
            correct: isCorrect,
            reason: isCorrect
                ? `Great job! Your answer "${userAnswer}" is correct. ${question.explanation}`
                : `Not quite. Expected: "${question.displayAnswer}". ${question.explanation}`
        };

        set({ airesponseGrammar: JSON.stringify(responsePayload) });
    },

}));

export const useApp = createSelectors(appContext);
