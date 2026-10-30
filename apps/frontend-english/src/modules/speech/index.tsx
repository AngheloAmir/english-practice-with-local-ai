import SpeechPassageCard from "./SpeechPassageCard";
import SpeechActionGrid from "./SpeechActionGrid";
import SpeechRecordingPlayer from "./SpeechRecordingPlayer";
import { useSpeechModule } from "../../state/speech";

export default function Speech() {
  const generateNewSentence = useSpeechModule.use.generateNewSentence();

  return (
    <main className="flex-1 bg-[#16171d] border border-[#292c37] rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 lg:p-7 shadow-2xl flex flex-col gap-6 overflow-y-auto min-h-full">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Fixed Height Passage Card + Action Grid (Listen & Shadowing) */}
        <div className="flex flex-col gap-6">
          <SpeechPassageCard />
          <SpeechActionGrid />
        </div>

        {/* Right Column: Fixed Height Recording Player + Full-width New Sentence Button */}
        <div className="flex flex-col gap-6">
          <SpeechRecordingPlayer />
          <button
            type="button"
            onClick={generateNewSentence}
            className="w-full h-[52px] py-3.5 px-5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/20 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            title="Generate or load a new practice sentence"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>New Sentence</span>
          </button>
        </div>
      </div>
    </main>
  );
}
