import { useSpeechModule } from "../../state/speech";
import type { DifficultyLevel, SentenceLength } from "../../state/prompts/speech";

const DIFFICULTY_LEVELS: { id: DifficultyLevel; label: string }[] = [
  { id: "Practice", label: "Practice" },
  { id: "Intermediate", label: "Intermediate" },
  { id: "Advanced", label: "Advanced" },
];

const VOICES: { id: "female" | "male"; label: string }[] = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
];

const SPEEDS: { id: "slow" | "normal" | "fast"; label: string }[] = [
  { id: "slow", label: "Slow" },
  { id: "normal", label: "Normal" },
  { id: "fast", label: "Fast" },
];

const LENGTHS: { id: SentenceLength; label: string; hint: string }[] = [
  { id: "simple", label: "Simple", hint: "1 sentence (8-14 words)" },
  { id: "long", label: "Long", hint: "2-3 sentences (18-26 words)" },
];

export default function SpeechHeaderControls() {
  const difficulty = useSpeechModule.use.difficulty();
  const setDifficulty = useSpeechModule.use.setDifficulty();

  const voiceGender = useSpeechModule.use.voiceGender();
  const setVoiceGender = useSpeechModule.use.setVoiceGender();

  const speechSpeed = useSpeechModule.use.speechSpeed();
  const setSpeechSpeed = useSpeechModule.use.setSpeechSpeed();

  const sentenceLength = useSpeechModule.use.sentenceLength();
  const setSentenceLength = useSpeechModule.use.setSentenceLength();

  const isGeneratingSentence = useSpeechModule.use.isGeneratingSentence();
  const isSynthesizingTts = useSpeechModule.use.isSynthesizingTts();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
      {/* Button Controls Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Group 1: Difficulty Levels */}
        <div className="flex items-center bg-[#16171d] border border-[#292c37] p-1 rounded-2xl shadow-sm">
          {DIFFICULTY_LEVELS.map(({ id, label }) => {
            const isActive = difficulty === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setDifficulty(id)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title={`Level: ${label}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Group 2: TTS Voice (Male / Female) */}
        <div className="flex items-center bg-[#16171d] border border-[#292c37] p-1 rounded-2xl shadow-sm">
          {VOICES.map(({ id, label }) => {
            const isActive = voiceGender === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setVoiceGender(id)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title={`Kokoro TTS Voice: ${label}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Group 3: TTS Speed (Slow, Normal, Fast) */}
        <div className="flex items-center bg-[#16171d] border border-[#292c37] p-1 rounded-2xl shadow-sm">
          {SPEEDS.map(({ id, label }) => {
            const isActive = speechSpeed === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSpeechSpeed(id)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title={`Speech playback speed: ${label}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Group 4: Sentence Length (Simple 1 sentence | Long 2-3 sentences) */}
        <div className="flex items-center bg-[#16171d] border border-[#292c37] p-1 rounded-2xl shadow-sm">
          {LENGTHS.map(({ id, label, hint }) => {
            const isActive = sentenceLength === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSentenceLength(id)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title={hint}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Engine Status Badge */}
      <div className="flex items-center gap-2">
        {isGeneratingSentence ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-mono font-medium animate-pulse">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="32" strokeDashoffset="16" />
            </svg>
            <span>Ollama Qwen generating...</span>
          </span>
        ) : isSynthesizingTts ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-medium animate-pulse">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="32" strokeDashoffset="16" />
            </svg>
            <span>Kokoro TTS synthesizing...</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
