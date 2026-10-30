import { useSpeechModule } from "../../state/speech";

export default function SpeechHeaderControls() {
  const difficulty = useSpeechModule.use.difficulty();
  const setDifficulty = useSpeechModule.use.setDifficulty();
  const useraudio = useSpeechModule.use.useraudio();
  const setUseraudio = useSpeechModule.use.setUseraudio();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-3 sm:px-4 shadow-sm">
      {/* Left: Difficulty selector */}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
        <label htmlFor="difficulty-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Difficulty:
        </label>
        <select
          id="difficulty-select"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as any)}
          className="text-xs sm:text-sm font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
        >
          <option value="Practice">Practice</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* Right: Autoplay toggle */}
      <div className="flex items-center justify-end gap-2 text-xs">
        <button
          type="button"
          onClick={() => setUseraudio(useraudio === "autoplay" ? "" : "autoplay")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all ${
            useraudio === "autoplay"
              ? "bg-teal-50 border-teal-300 text-teal-800 shadow-2xs"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
          }`}
          title="Autoplay audio after recording or test"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              useraudio === "autoplay" ? "bg-teal-600 animate-pulse" : "bg-slate-400"
            }`}
          />
          <span>Auto-Replay: {useraudio === "autoplay" ? "ON" : "OFF"}</span>
        </button>
      </div>
    </div>
  );
}
