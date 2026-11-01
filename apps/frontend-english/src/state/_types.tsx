export interface DailyScore {
    date: string;
    score: number;
    duration: number; // Duration in minutes
}

export interface ModuleScore {
    label: string;
    name: string;
    dailyscores: DailyScore[];
}

export const MODULESCOREMOCKDATA: ModuleScore[] = [
    {
        label: "Grammar",
        name: "grammar",
        dailyscores: [
            { date: "2026-10-01", score: 74, duration: 25 },
            { date: "2026-10-02", score: 78, duration: 30 },
            { date: "2026-10-03", score: 75, duration: 20 },
            { date: "2026-10-04", score: 80, duration: 35 },
            { date: "2026-10-05", score: 82, duration: 40 },
            { date: "2026-10-06", score: 79, duration: 20 },
            { date: "2026-10-07", score: 85, duration: 30 },
            { date: "2026-10-08", score: 81, duration: 25 },
            { date: "2026-10-09", score: 84, duration: 35 },
            { date: "2026-10-10", score: 83, duration: 30 },
            { date: "2026-10-11", score: 86, duration: 45 },
            { date: "2026-10-12", score: 88, duration: 25 },
            { date: "2026-10-13", score: 85, duration: 30 },
            { date: "2026-10-14", score: 87, duration: 40 },
            { date: "2026-10-15", score: 89, duration: 35 },
            { date: "2026-10-16", score: 86, duration: 20 },
            { date: "2026-10-17", score: 90, duration: 40 },
            { date: "2026-10-18", score: 88, duration: 30 },
            { date: "2026-10-19", score: 91, duration: 35 },
            { date: "2026-10-20", score: 89, duration: 25 },
            { date: "2026-10-21", score: 92, duration: 45 },
            { date: "2026-10-22", score: 90, duration: 30 },
            { date: "2026-10-23", score: 93, duration: 35 },
            { date: "2026-10-24", score: 91, duration: 40 },
            { date: "2026-10-25", score: 89, duration: 25 },
            { date: "2026-10-26", score: 94, duration: 50 },
            { date: "2026-10-27", score: 92, duration: 35 },
            { date: "2026-10-28", score: 95, duration: 45 },
            { date: "2026-10-29", score: 93, duration: 40 },
            { date: "2026-10-30", score: 96, duration: 45 },
        ]
    },
    {
        label: "Shadowing",
        name: "speechshadowing",
        dailyscores: [
            { date: "2026-10-01", score: 70, duration: 20 },
            { date: "2026-10-02", score: 72, duration: 25 },
            { date: "2026-10-03", score: 68, duration: 15 },
            { date: "2026-10-04", score: 75, duration: 30 },
            { date: "2026-10-05", score: 77, duration: 35 },
            { date: "2026-10-06", score: 74, duration: 20 },
            { date: "2026-10-07", score: 80, duration: 30 },
            { date: "2026-10-08", score: 78, duration: 25 },
            { date: "2026-10-09", score: 82, duration: 40 },
            { date: "2026-10-10", score: 79, duration: 30 },
            { date: "2026-10-11", score: 83, duration: 35 },
            { date: "2026-10-12", score: 85, duration: 30 },
            { date: "2026-10-13", score: 81, duration: 20 },
            { date: "2026-10-14", score: 86, duration: 45 },
            { date: "2026-10-15", score: 84, duration: 35 },
            { date: "2026-10-16", score: 87, duration: 40 },
            { date: "2026-10-17", score: 85, duration: 30 },
            { date: "2026-10-18", score: 88, duration: 35 },
            { date: "2026-10-19", score: 86, duration: 25 },
            { date: "2026-10-20", score: 89, duration: 45 },
            { date: "2026-10-21", score: 87, duration: 35 },
            { date: "2026-10-22", score: 91, duration: 50 },
            { date: "2026-10-23", score: 88, duration: 30 },
            { date: "2026-10-24", score: 90, duration: 40 },
            { date: "2026-10-25", score: 88, duration: 30 },
            { date: "2026-10-26", score: 92, duration: 55 },
            { date: "2026-10-27", score: 90, duration: 40 },
            { date: "2026-10-28", score: 93, duration: 45 },
            { date: "2026-10-29", score: 91, duration: 35 },
            { date: "2026-10-30", score: 94, duration: 50 },
        ]
    }
];

// ==========================================
// Speech & TTS Microservice Configurations
// ==========================================

export type TTSSpeed = 'slow' | 'normal' | 'fast';
export type TTSVoiceGender = 'female' | 'male';

export const TTS_SPEED_CONFIG: Record<TTSSpeed, number> = {
    slow:   0.7,
    normal: 0.8,
    fast:   1.0,
};

export const TTS_VOICE_CONFIG: Record<TTSVoiceGender, string> = {
    male: 'am_adam',
    female: 'af_heart',
};

export const PLAYDELAY = 1.0;
export const SHADOWING = 0.7;

