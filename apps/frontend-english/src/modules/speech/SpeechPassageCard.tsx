import { useSpeechModule } from "../../state/speech";

export default function SpeechPassageCard() {
  const words = useSpeechModule.use.words();
  const activeWordIndex = useSpeechModule.use.activeWordIndex();
  const playWordAtIndex = useSpeechModule.use.playWordAtIndex();
  const countdown = useSpeechModule.use.countdown();

  return (
    <section className="relative bg-[#1e2027] border border-[#292c37] rounded-3xl p-6 sm:p-7 shadow-sm lg:h-[440px] overflow-hidden transition-all">
      {/* Top Bar: Countdown Timer Badge in Top-Right */}
      <div className="flex items-center justify-end w-full pb-2">
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all select-none ${
            countdown !== null
              ? "bg-blue-600/25 border border-blue-500/50 text-blue-300 shadow-sm shadow-blue-500/20 ring-1 ring-blue-400/40 animate-pulse"
              : "bg-[#16171d] border border-[#292c37] text-slate-400"
          }`}
          title={
            countdown !== null
              ? `Audio playback starting in ${countdown.toFixed(1)}s`
              : "1.5s countdown timer before playback starts"
          }
        >
          <svg
            className={`w-3.5 h-3.5 ${countdown !== null ? "text-blue-400 animate-spin" : "text-slate-500"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              strokeWidth="2"
              strokeDasharray="32"
              strokeDashoffset={countdown !== null ? "16" : "0"}
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l3 3" />
          </svg>
          <span>{countdown !== null ? `${countdown.toFixed(1)}s` : "1.5s"}</span>
        </div>
      </div>

      {/* Passage Text: Top-down flow, left-aligned (not vertically centered) */}
      <div className="mt-4 flex flex-wrap items-baseline justify-start text-left gap-x-2.5 sm:gap-x-3 gap-y-2 sm:gap-y-3 leading-relaxed sm:leading-loose text-base sm:text-lg md:text-xl font-serif text-slate-100 select-none">
        {words.map((word, idx) => {
          // Exactly one word gets the block highlight when it is played from spokenWords or clicked
          const isCurrentlyPlaying = activeWordIndex === idx;

          return (
            <button
              key={`${word}-${idx}`}
              type="button"
              onClick={() => playWordAtIndex(idx)}
              className={`relative inline-block cursor-pointer px-2 py-0.5 rounded-xl transition-all select-none text-left ${
                isCurrentlyPlaying
                  ? "bg-[#242838] text-blue-400 border border-blue-500/30 font-medium shadow-sm scale-[1.02]"
                  : "text-slate-100 border border-transparent hover:text-blue-400 hover:bg-[#242838]/60"
              }`}
              title="Click to hear this word"
            >
              {word}
            </button>
          );
        })}
      </div>
    </section>
  );
}
