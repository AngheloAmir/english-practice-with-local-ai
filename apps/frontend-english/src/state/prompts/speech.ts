/**
 * Speech Prompts & Randomization Utilities for Ollama Qwen 2.5
 */

export const RANDOM_EASY_TOPICS = [
    "morning routine and making coffee",
    "a playful cat resting on a sunny table",
    "biking through a friendly neighborhood park",
    "baking homemade bread in the kitchen",
    "reading a mystery novel before bedtime",
    "watering fresh green plants by the window",
    "a peaceful weekend walk near the lake",
    "shopping for colorful fruits at the market",
    "listening to cheerful acoustic music",
    "feeding birds in the garden every morning",
    "cooking dinner with fresh vegetables and pasta",
    "watching raindrops splash against the glass",
];

export const RANDOM_INTERMEDIATE_TOPICS = [
    "walking across a blooming summer meadow",
    "the subtle rhythm of gentle ocean waves",
    "a curious squirrel gathering acorns in autumn",
    "navigating a quiet mountain trail at dawn",
    "the soothing resonance of a choir in harmony",
    "a cozy campfire crackling beneath midnight stars",
    "exploring an ancient stone library labyrinth",
    "the unique aroma of old books and autumn leaves",
    "a sudden breeze whispering through pine trees",
    "admiring thorough craftsmanship in wooden furniture",
    "the delicate balance of nature in a forest canopy",
    "discovering a hidden waterfall deep in the canyon",
];

export const RANDOM_HARD_TOPICS = [
    "cross-cultural communication in global corporate teams",
    "articulating complex architectural ideas with clarity",
    "strategic agility and organizational transformation",
    "cultivating emotional intelligence in leadership",
    "navigating ambiguous business challenges with composure",
    "fostering authentic collaboration across diverse disciplines",
    "optimizing operational workflows through thoughtful automation",
    "sustainable economic innovation and long-term value creation",
    "delivering persuasive executive presentations to stakeholders",
    "empowering cross-functional teams to achieve breakthrough solutions",
];

export type DifficultyLevel = "Practice" | "Intermediate" | "Advanced";
export type SentenceLength = "simple" | "long";

/**
 * Returns a random topic from the given list
 */
function getRandomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

/**
 * Builds the Ollama prompt to generate a new randomized sentence
 *
 * Rules:
 * 1. Must NOT be less than 8 words.
 * 2. Words with "-ed" endings are strictly avoided (use present, base, or "-ing" forms)
 *    because acoustic STT models frequently drop "-ed" suffixes.
 * 3. Simple = 1 sentence (8 - 14 words).
 * 4. Long = 2-3 short sentences (18 - 26 words total) to comfortably fit in the fixed card.
 */
export function buildSentencePrompt(
    difficulty: DifficultyLevel,
    length: SentenceLength = "simple"
): { prompt: string; topic: string } {
    let topic: string;
    let difficultyGuidelines: string;

    if (difficulty === "Practice") {
        topic = getRandomItem(RANDOM_EASY_TOPICS);
        difficultyGuidelines =
            "Use simple everyday conversational words. Avoid rare, obscure, or overly long vocabulary. Make it easy and natural to read aloud.";
    } else if (difficulty === "Intermediate") {
        topic = getRandomItem(RANDOM_INTERMEDIATE_TOPICS);
        difficultyGuidelines =
            "Include phonetically rich or expressive words (like meadow, subtle, rhythm, thorough, squirrel, acoustic, breeze) that provide enjoyable pronunciation practice without being overly academic.";
    } else {
        topic = getRandomItem(RANDOM_HARD_TOPICS);
        difficultyGuidelines =
            "Use formal, articulate, executive English vocabulary suitable for professional corporate communication, thought leadership, or diplomatic discussions.";
    }

    const lengthInstruction =
        length === "simple"
            ? "Write exactly ONE concise sentence (between 9 and 14 words)."
            : "Write TWO or THREE short sentences (total between 18 and 25 words).";

    const prompt = `You are an expert English pronunciation tutor generating sentence material for speech practice.

Topic: ${topic}
Target Style: ${difficultyGuidelines}
Length Constraint: ${lengthInstruction}

CRITICAL RULES:
1. WORD COUNT: The generated text MUST have AT LEAST 8 words. Never produce less than 8 words.
2. NO "-ED" ENDINGS: Do NOT use any past-tense verbs or words ending in "-ed" (e.g. do NOT use walked, milked, watched, worked, enjoyed). Use present tense, base forms, or "-ing" continuous verbs instead (e.g. walk, walks, walking, drink, drinks, enjoy, enjoys, practice). This is essential for speech recognition accuracy.
3. Every sentence must end with appropriate punctuation (. or !).
4. OUTPUT FORMAT: Output ONLY the raw English sentences. Do NOT include quotes, numbering, bullet points, markdown bolding, or introductory explanations.`;

    return { prompt, topic };
}

/**
 * Normalizes words by stripping non-alphanumeric characters and lowercasing
 */
export function cleanTokens(str: string): string[] {
    if (!str) return [];
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(Boolean);
}

/**
 * Normalizes common grammatical endings (-ed, -ing, -es, -s, -ly, -d)
 * so that STT acoustic drops (e.g. "milk" vs "milked") match correctly.
 */
export function stemWord(w: string): string {
    return w.toLowerCase().replace(/(ed|ing|es|s|ly|d)$/g, "");
}

/**
 * Calculates mathematical acoustic word-match percentage between target passage and spoken transcription.
 */
export function calculateAcousticWordSimilarity(target: string, spoken: string): {
    score: number;
    matchedWords: number;
    totalTargetWords: number;
    unmatchedWords: string[];
} {
    const targetWords = cleanTokens(target);
    const spokenWords = cleanTokens(spoken);

    if (targetWords.length === 0) {
        return { score: 0, matchedWords: 0, totalTargetWords: 0, unmatchedWords: [] };
    }
    if (spokenWords.length === 0) {
        return { score: 0, matchedWords: 0, totalTargetWords: targetWords.length, unmatchedWords: targetWords };
    }

    let matched = 0;
    const spokenPool = [...spokenWords];
    const unmatchedWords: string[] = [];

    for (const tw of targetWords) {
        const twStem = stemWord(tw);
        const foundIndex = spokenPool.findIndex((sw) => {
            if (sw === tw) return true;
            if (twStem.length >= 3 && stemWord(sw) === twStem) return true;
            if (tw.length >= 5 && sw.length >= 5 && (tw.startsWith(sw) || sw.startsWith(tw))) return true;
            return false;
        });

        if (foundIndex !== -1) {
            matched++;
            spokenPool.splice(foundIndex, 1);
        } else {
            unmatchedWords.push(tw);
        }
    }

    const rawScore = Math.min(100, Math.round((matched / targetWords.length) * 100));
    return {
        score: rawScore,
        matchedWords: matched,
        totalTargetWords: targetWords.length,
        unmatchedWords,
    };
}

/**
 * Builds the Ollama prompt for pronunciation comparison and scoring
 */
export function buildSttEvaluationPrompt(
    targetSentence: string,
    transcribedSpeech: string,
    acousticScore: number,
    unmatchedWords: string[]
): string {
    return `You are an honest, accurate English pronunciation practice evaluator.

Target Passage:
"${targetSentence}"

User's Spoken Speech (Transcribed by Faster-Whisper Speech-to-Text):
"${transcribedSpeech}"

Mathematical Word Match: ${acousticScore}%
Unmatched / Missing Target Words: ${unmatchedWords.length > 0 ? unmatchedWords.join(", ") : "None"}

Evaluation Rules:
1. If the Spoken Speech contains only numbers, noise, silence, or completely unrelated words, score MUST be 0 and isMatch MUST be false.
2. If the user spoke the target sentence with only minor acoustic differences (such as dropped "-ed" like "milk" vs "milked", or a missing article like "the"), score 85-100 and isMatch is true.
3. If the user spoke only a portion of the sentence, score between 20-70 proportionally and isMatch is false.
4. Provide one concise feedback sentence: acknowledge good pronunciation or mention specifically what was missed.

Respond with ONLY valid JSON with no markdown code fences:
{"score": <integer from 0 to 100>, "isMatch": <boolean>, "feedback": "<one short feedback sentence>"}`;
}

/**
 * Cleans and sanitizes raw LLM output into a clean practice sentence
 */
export function sanitizeSentence(rawText: string): string {
    if (!rawText) return "";

    let cleaned = rawText
        .trim()
        .replace(/^```[a-z]*\s*/i, "")
        .replace(/\s*```$/i, "")
        .replace(/^\d+[.)]\s*/gm, "") // Remove "1. " or "2) "
        .replace(/^["'`]+|["'`]+$/g, "") // Remove surrounding quotes
        .replace(/\s*\n+\s*/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return cleaned;
}
