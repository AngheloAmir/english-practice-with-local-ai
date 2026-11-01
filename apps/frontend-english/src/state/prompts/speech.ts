/**
 * Speech Prompts & Randomization Utilities for Ollama Qwen 2.5
 */

export const RANDOM_EASY_TOPICS = [
    // Playful everyday & home life
    "making fresh coffee on a sleepy morning",
    "a mischievous cat stealing a warm spot on the sofa",
    "riding a bicycle through a breezy neighborhood park",
    "baking warm chocolate chip cookies in the kitchen",
    "reading a suspenseful mystery novel under a cozy blanket",
    "watering indoor houseplants by a sunny window",
    "taking a relaxing weekend stroll around a quiet lake",
    "picking out sweet strawberries at a busy farmers market",
    "strumming a cheerful acoustic guitar on the porch",
    "feeding hungry sparrows in the backyard garden",
    "tossing fresh pasta with garlic and herbs for dinner",
    "watching heavy raindrops race down the windowpane",
    // +30 new playful & varied Practice topics
    "a playful golden puppy chasing soap bubbles on the lawn",
    "searching everywhere for a missing pair of sunglasses",
    "flipping golden pancakes for a lazy Sunday breakfast",
    "trying to carry too many grocery bags in one trip",
    "a friendly dog waiting patiently beside the dinner table",
    "choosing a funny board game for family game night",
    "building a giant pillow fort in the living room",
    "catching fireflies in a glass jar on a warm evening",
    "ordering iced matcha lattes at a busy corner cafe",
    "packing a picnic basket with sandwiches and cold lemonade",
    "teaching a talking parrot to say hello to guests",
    "decorating a birthday cake with colorful rainbow sprinkles",
    "skipping smooth flat stones across a calm river",
    "finding an old childhood photo album in the attic",
    "a sleepy hamster running on a squeaky wheel at midnight",
    "hiding from a sudden summer rainstorm under a tiny umbrella",
    "making homemade pizza and arguing over extra cheese",
    "flying a bright red kite on a windy afternoon at the beach",
    "singing along to classic road trip songs in the car",
    "a curious kitten investigating a cardboard delivery box",
    "bartering for vintage comic books at a weekend flea market",
    "roasting sweet marshmallows over a backyard fire pit",
    "setting up a colorful tent before the sun goes down",
    "trying to take a group selfie with impatient friends",
    "slicing cold watermelon on a hot July afternoon",
    "a clever crow trading shiny pebbles for bread crumbs",
    "rearranging bedroom furniture in the middle of the night",
    "waiting for the ice cream truck on a sunny street",
    "juggling fresh oranges in the middle of the grocery aisle",
    "watching fluffy white clouds turn into funny animal shapes",
    "wrapping a surprise gift with way too much tape",
    "racing paper boats down a fast sidewalk puddle stream",
];

export const RANDOM_INTERMEDIATE_TOPICS = [
    // Expressive & phonetically rich scenarios
    "a lively meadow bursting with wildflowers in summer",
    "the subtle rhythm of ocean waves against coastal cliffs",
    "a clever squirrel hiding acorns before the autumn frost",
    "hiking a misty mountain trail just as dawn breaks",
    "a choir rehearsing rich vocal harmonies in an old hall",
    "trading ghost stories around a crackling midnight campfire",
    "getting lost inside an ancient stone library labyrinth",
    "the nostalgic scent of vintage books and crisp autumn air",
    "a cool pine breeze whistling through a quiet canyon",
    "a master carpenter carving intricate wooden furniture by hand",
    "sunlight filtering through a dense tropical forest canopy",
    "stumbling upon a hidden turquoise waterfall in the jungle",
    // +30 new playful, vivid & varied Intermediate topics
    "a street magician performing sleight of hand for a crowd",
    "navigating a bustling night market filled with sizzling street food",
    "an eccentric inventor testing a clockwork gadget in a workshop",
    "two friends debating conspiracy theories over midnight ramen",
    "a jazz saxophonist improvising a soulful melody in the rain",
    "an octopus camouflaging itself effortlessly among coral reefs",
    "riding a vintage cable car up a steep coastal hillside",
    "a barista crafting intricate swan art in steaming espresso foam",
    "watching the northern lights dance across an arctic sky",
    "an amateur astronomer spotting Saturn through a backyard telescope",
    "a mischievous raccoon unlocking a campsite cooler at night",
    "restoring a rusty classic motorcycle in a cluttered garage",
    "a chef flambeing a dessert pan with dramatic flair",
    "kayaking through glowing bioluminescent waters after midnight",
    "a detective noticing a subtle clue at a mysterious masquerade",
    "haggling over antique brass compasses in a Moroccan bazaar",
    "a botanist tending rare carnivorous orchids in a humid greenhouse",
    "sketching caricatures of commuters on a crowded subway train",
    "a lighthouse keeper watching giant storm swells crash offshore",
    "brewing aromatic spiced chai during a monsoon downpour",
    "a chameleon slowly shifting colors on a mossy tree branch",
    "tuning a grand piano before a sold-out symphony performance",
    "drifting over painted desert canyons in a hot air balloon",
    "a potter shaping wet clay on a spinning wheel with precision",
    "decoding cryptic riddles written inside a leather travel journal",
    "a pelican diving gracefully into sparkling emerald waves",
    "exploring subterranean limestone caverns with a flickering lantern",
    "a violinist busking inside an echoing marble train station",
    "harvesting fragrant lavender fields beneath a golden sunset",
    "a clockmaker aligning tiny brass gears through a magnifying glass",
    "chasing a runaway hat across a windswept cobblestone plaza",
    "a glassblower shaping molten crystal into a delicate vase",
];

export const RANDOM_HARD_TOPICS = [
    // Articulate professional, intellectual & thought-leadership themes
    "cross-cultural negotiation in global remote teams",
    "translating complex technical architecture for non-technical clients",
    "maintaining strategic agility during sudden market disruptions",
    "leading high-pressure teams with empathy and emotional intelligence",
    "making decisive executive calls under ambiguous conditions",
    "sparking genuine creative collaboration between engineering and design",
    "streamlining chaotic workflows with intelligent automation",
    "balancing rapid startup growth with long-term sustainability",
    "pitching a bold turnaround strategy to skeptical board members",
    "breaking down organizational silos to accelerate product innovation",
    // +30 new articulate, sharp & varied Advanced topics
    "moderating a heated panel debate on artificial intelligence ethics",
    "redesigning urban public transit for carbon-neutral cities",
    "negotiating intellectual property rights in international mergers",
    "cultivating psychological safety in high-performing research labs",
    "diagnosing systemic bottlenecks in global supply chain networks",
    "delivering a keynote address on quantum computing breakthroughs",
    "navigating diplomatic protocol during a high-stakes summit",
    "evaluating behavioral economics in modern consumer decision-making",
    "architecting resilient cybersecurity defenses against zero-day threats",
    "transforming legacy bureaucratic institutions into agile digital pioneers",
    "debating neuroplasticity and cognitive longevity at a symposium",
    "managing crisis communications during a sudden corporate restructuring",
    "pioneering biodegradable materials to replace industrial plastics",
    "aligning venture capital incentives with ethical technology governance",
    "deconstructing algorithmic bias in automated financial markets",
    "orchestrating a seamless multinational product launch across time zones",
    "preserving indigenous linguistic heritage through digital archives",
    "Synthesizing contradictory macroeconomic data into actionable policy",
    "fostering intellectual humility when challenging established scientific paradigms",
    "designing human-centric autonomous interfaces for aviation safety",
    "mediating deadlocked contract disputes with composure and tact",
    "scaling decentralized renewable microgrids in developing regions",
    "analyzing geopolitical ripple effects on semiconductor manufacturing",
    "mentoring emerging executives to communicate with authentic gravitas",
    "revitalizing stagnant brand identity through bold creative storytelling",
    "auditing algorithmic transparency in modern healthcare diagnostics",
    "balancing radical candor with diplomatic nuance in leadership reviews",
    "engineering closed-loop circular economies for consumer electronics",
    "forecasting demographic shifts and future workforce transformations",
    "championing evidence-based policy reform in public education",
    "navigating ethical dilemmas in biotechnology and gene editing",
    "building institutional trust through transparent stakeholder dialogue",
];

export type DifficultyLevel = "Practice" | "Intermediate" | "Advanced";
export type SentenceLength = "simple" | "long";

const RANDOM_SENTENCE_ANGLES = [
    "Playful & humorous: include a lighthearted, witty, or charming twist.",
    "Vivid action scene: capture a dynamic moment happening right now.",
    "First-person conversational: write naturally using 'I', 'we', or 'my' as if telling a friend.",
    "Curious observation: notice an interesting, lively, or unexpected detail.",
    "Sensory & expressive: bring the scene to life with sound, color, motion, or texture.",
    "Energetic & upbeat: make the sentence fun, rhythmic, and enjoyable to say out loud.",
];

const lastPickedTopicByDifficulty: Partial<Record<DifficultyLevel, string>> = {};

/**
 * Returns a random item from the given list, avoiding immediate repeats when possible
 */
function getRandomItem<T>(items: T[], avoidItem?: T): T {
    if (items.length <= 1) return items[0];
    const pool = avoidItem !== undefined ? items.filter((i) => i !== avoidItem) : items;
    const source = pool.length > 0 ? pool : items;
    return source[Math.floor(Math.random() * source.length)];
}

/**
 * Builds the Ollama prompt to generate a new randomized sentence
 *
 * Rules:
 * 1. Must NOT be less than 8 words.
 * 2. Words with "-ed" endings are strictly avoided (use present, base, or auxiliary + "-ing" forms)
 *    because acoustic STT models frequently drop "-ed" suffixes.
 * 3. Simple = 1 sentence (9 - 14 words).
 * 4. Long = 2-3 short sentences (18 - 25 words total) to comfortably fit in the fixed card.
 */
export function buildSentencePrompt(
    difficulty: DifficultyLevel,
    length: SentenceLength = "simple"
): { prompt: string; topic: string } {
    let topic: string;
    let difficultyGuidelines: string;
    let styleExamples: string;

    if (difficulty === "Practice") {
        topic = getRandomItem(RANDOM_EASY_TOPICS, lastPickedTopicByDifficulty.Practice);
        lastPickedTopicByDifficulty.Practice = topic;
        difficultyGuidelines =
            "Use natural, playful, everyday conversational English. Keep vocabulary clear and familiar, with an upbeat rhythm that feels fun to speak aloud.";
        styleExamples = `- "My sleepy cat always steals the warmest spot on the sofa before breakfast."
- "We are flipping golden pancakes in the kitchen while the morning coffee brews."`;
    } else if (difficulty === "Intermediate") {
        topic = getRandomItem(RANDOM_INTERMEDIATE_TOPICS, lastPickedTopicByDifficulty.Intermediate);
        lastPickedTopicByDifficulty.Intermediate = topic;
        difficultyGuidelines =
            "Use expressive, vivid, and phonetically rich words (like subtle, rhythm, breeze, turquoise, melody, aroma, whisper) in a lively, imaginative way without sounding stiff or robotic.";
        styleExamples = `- "A clever street magician dazzles the curious crowd with effortless sleight of hand."
- "Cool mountain breezes carry the nostalgic aroma of pine trees across the trail."`;
    } else {
        topic = getRandomItem(RANDOM_HARD_TOPICS, lastPickedTopicByDifficulty.Advanced);
        lastPickedTopicByDifficulty.Advanced = topic;
        difficultyGuidelines =
            "Use sharp, articulate, executive-level English suitable for compelling keynotes, strategic leadership, or insightful debate.";
        styleExamples = `- "Empathetic leaders cultivate psychological safety so cross-functional teams can challenge conventional assumptions."
- "Translating complex technical architecture into clear strategic value requires both precision and composure."`;
    }

    const creativeAngle = getRandomItem(RANDOM_SENTENCE_ANGLES);

    const lengthInstruction =
        length === "simple"
            ? "Write exactly ONE complete sentence (between 9 and 14 words)."
            : "Write TWO or THREE short, connected sentences (total between 18 and 25 words).";

    const prompt = `You are a creative, witty English pronunciation coach writing fresh sentence material for speaking practice.

Inspiration Theme: "${topic}"
Creative Vibe: ${creativeAngle}
Target Level & Style: ${difficultyGuidelines}
Length Constraint: ${lengthInstruction}

Style Examples (match this natural sentence flow, DO NOT copy these examples):
${styleExamples}

CRITICAL RULES:
1. DO NOT COPY THE THEME VERBATIM: Treat the Inspiration Theme only as a loose scenario seed. Invent an original, playful, complete sentence rather than repeating the theme phrase word-for-word.
2. COMPLETE GRAMMATICAL SENTENCES: Every sentence MUST have a clear subject and an active present-tense verb (e.g. "chases", "brews", "is exploring", "can hear"). NEVER output an incomplete noun phrase like "The cat walking across a meadow."
3. WORD COUNT: The output MUST have AT LEAST 8 words.
4. NO "-ED" ENDINGS: Do NOT use any past-tense verbs or adjectives ending in "-ed" (e.g. NEVER use walked, baked, watched, worked, excited, tired). Use active present tense (walks, bakes, watches), modal verbs (can, will, should), or "is/are + -ing" instead.
5. OUTPUT FORMAT: Output ONLY the raw English sentence(s) ending with a period or exclamation mark. No quotes, no numbering, and no explanations.`;

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
2. If the user spoke the target sentence with only minor acoustic differences (such as dropped "-ed" like "milk" vs "milked", a missing article like "the", or repeated words caused by speech shadowing alongside the tutor voice), score 90-100 and isMatch is true.
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
