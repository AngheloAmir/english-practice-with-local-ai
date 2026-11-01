import { useEffect } from "react";
import SpeechHeaderControls from "./SpeechHeaderControls";
import SpeechPassageCard from "./SpeechPassageCard";
import SpeechActionGrid from "./SpeechActionGrid";
import SpeechRecordingPlayer from "./SpeechRecordingPlayer";
import { useSpeechModule, warmUpHotEngines } from "../../state/speech";

export default function Speech() {
  const generateNewSentence = useSpeechModule.use.generateNewSentence();
  const isGeneratingSentence = useSpeechModule.use.isGeneratingSentence();

  useEffect(() => {
    // Keep sound module and microphone continuously hot on first interaction or mount
    const handleGestureWarmup = () => {
      warmUpHotEngines();
    };

    window.addEventListener("pointerdown", handleGestureWarmup, { once: true });
    window.addEventListener("keydown", handleGestureWarmup, { once: true });

    // Initial warm-up attempt on component mount
    warmUpHotEngines();

    return () => {
      window.removeEventListener("pointerdown", handleGestureWarmup);
      window.removeEventListener("keydown", handleGestureWarmup);
    };
  }, []);

  return (
    <main className="flex-1 bg-[#16171d] border border-[#292c37] rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 lg:p-7 shadow-2xl flex flex-col gap-6 overflow-y-auto min-h-full">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
        {/* Top Header: Difficulty, Voice, Speed, and Length Controls */}
        <SpeechHeaderControls />

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Fixed Height Passage Card (No Scroll) + Action Grid (Listen & Shadowing) */}
          <div className="flex flex-col gap-6">
            <SpeechPassageCard />
            <SpeechActionGrid />
          </div>

          {/* Right Column: Fixed Height Recording Player (With Record Timed Auto play) + Full-width New Sentence Button */}
          <div className="flex flex-col gap-6">
            <SpeechRecordingPlayer />
            <button
              type="button"
              onClick={() => {
                warmUpHotEngines();
                generateNewSentence();
              }}
              disabled={isGeneratingSentence}
              className={`w-full h-[52px] py-3.5 px-5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/20 transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                isGeneratingSentence ? "opacity-75 cursor-wait" : ""
              }`}
              title="Generate a randomized practice sentence using Ollama and Kokoro TTS"
            >
              <svg
                className={`w-5 h-5 shrink-0 ${isGeneratingSentence ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isGeneratingSentence ? (
                  <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="32" strokeDashoffset="16" />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                )}
              </svg>
              <span>{isGeneratingSentence ? "Generating with Ollama..." : "New Sentence"}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
