import { useSpeechModule } from "../../state/speech";

export default function SpeechPassageCard() {
  const words = useSpeechModule.use.words();
  const activeWordIndex = useSpeechModule.use.activeWordIndex();
  const playWordAtIndex = useSpeechModule.use.playWordAtIndex();

  return (
    <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 lg:p-9 shadow-sm flex flex-col justify-center transition-all">
      <div className="min-h-[80px] flex flex-wrap items-center gap-x-2.5 gap-y-3.5 leading-relaxed text-lg sm:text-xl md:text-2xl font-serif text-slate-800">
        {words.map((word, idx) => {
          // Exactly one word gets the block highlight when it is played from spokenWords
          const isCurrentlyPlaying = activeWordIndex === idx;

          return (
            <button
              key={`${word}-${idx}`}
              type="button"
              onClick={() => playWordAtIndex(idx)}
              className={`relative inline-block cursor-pointer px-2.5 py-1 rounded-xl transition-all select-none ${
                isCurrentlyPlaying
                  ? "bg-amber-100/90 text-amber-900 border border-amber-300 font-medium shadow-xs scale-105 ring-1 ring-amber-300/50"
                  : "text-slate-800 border border-transparent hover:text-[#147a82] hover:bg-slate-50"
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
