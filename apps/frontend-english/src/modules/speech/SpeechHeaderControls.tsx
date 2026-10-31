import { useSpeechModule } from "../../state/speech";

const DIFFICULTY_LEVELS = ["Practice", "Intermediate", "Advanced"] as const;

export default function SpeechHeaderControls() {
  const difficulty = useSpeechModule.use.difficulty();
  const setDifficulty = useSpeechModule.use.setDifficulty();

  return (
    <div className="flex items-center justify-between w-full">
      {/* Difficulty pill toggle placed at the header (matching design) */}
      <div className="flex items-center bg-[#16171d] border border-[#292c37] p-1 rounded-2xl shadow-sm">
        {DIFFICULTY_LEVELS.map((level) => {
          const isActive = difficulty === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {level}
            </button>
          );
        })}
      </div>
    </div>
  );
}
