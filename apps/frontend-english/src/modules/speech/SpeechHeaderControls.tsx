import { useSpeechModule } from "../../state/speech";

const DIFFICULTY_LEVELS = ["Practice", "Intermediate", "Advanced"] as const;

export default function SpeechHeaderControls() {
  const difficulty = useSpeechModule.use.difficulty();
  const setDifficulty = useSpeechModule.use.setDifficulty();
  const useraudio = useSpeechModule.use.useraudio();
  const setUseraudio = useSpeechModule.use.setUseraudio();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1e2027] border border-[#292c37] rounded-2xl p-3 sm:px-4 shadow-sm">
      {/* Left: Difficulty pill toggle */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[#16171d] border border-[#292c37] p-1 rounded-2xl overflow-x-auto">
          {DIFFICULTY_LEVELS.map((level) => {
            const isActive = difficulty === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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

      {/* Right: Autoplay toggle */}
      <div className="flex items-center justify-end gap-2 text-xs">
        <button
          type="button"
          onClick={() => setUseraudio(useraudio === "autoplay" ? "" : "autoplay")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
            useraudio === "autoplay"
              ? "bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-2xs"
              : "bg-[#16171d] border-[#292c37] text-slate-400 hover:text-white hover:bg-[#252834]"
          }`}
          title="Autoplay audio after recording or test"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              useraudio === "autoplay" ? "bg-blue-400 animate-pulse" : "bg-slate-500"
            }`}
          />
          <span>{useraudio === "autoplay" ? "ON" : "OFF"}</span>
        </button>
      </div>
    </div>
  );
}
