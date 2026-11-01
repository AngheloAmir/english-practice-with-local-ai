import { useSpeechModule, warmUpHotEngines } from "../../state/speech";

export default function SpeechActionGrid() {
  const isPlaying = useSpeechModule.use.isPlaying();
  const playmode = useSpeechModule.use.playmode();
  const countdown = useSpeechModule.use.countdown();
  const countdownMode = useSpeechModule.use.countdownMode();
  const playFullSentence = useSpeechModule.use.playFullSentence();
  const playSpeechShadowing = useSpeechModule.use.playSpeechShadowing();

  const isSentenceCountingDown = countdown !== null && countdownMode === "sentence";
  const isSentencePlaying = isPlaying && playmode === "sentence";

  const isShadowingCountingDown = countdown !== null && countdownMode === "perword";
  const isShadowingPlaying = isPlaying && playmode === "perword";

  const handlePlayFullSentence = () => {
    warmUpHotEngines();
    playFullSentence();
  };

  const handlePlaySpeechShadowing = () => {
    warmUpHotEngines();
    playSpeechShadowing();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Button 1: Listen (Full TTS sentence with 1.5s countdown delay) */}
      <button
        type="button"
        onClick={handlePlayFullSentence}
        className={`h-[52px] py-3.5 px-5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-md active:scale-[0.98] cursor-pointer ${
          isSentenceCountingDown
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/40 ring-2 ring-blue-300 animate-pulse"
            : isSentencePlaying
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/30 ring-2 ring-blue-300"
            : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30"
        }`}
        title="Listen to the full native sentence (1.5s countdown before playing)"
      >
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isSentencePlaying ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          ) : isSentenceCountingDown ? (
            <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="32" strokeDashoffset="16" className="animate-spin" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          )}
        </svg>
        <span>
          {isSentenceCountingDown
            ? `Starting in ${countdown.toFixed(1)}s...`
            : isSentencePlaying
            ? "Pause Listening"
            : "Listen (Full Sentence)"}
        </span>
      </button>

      {/* Button 2: Speech Shadowing (Word by word pacing with 1.5s countdown delay) */}
      <button
        type="button"
        onClick={handlePlaySpeechShadowing}
        className={`h-[52px] py-3.5 px-5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-md active:scale-[0.98] cursor-pointer ${
          isShadowingCountingDown
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/40 ring-2 ring-blue-300 animate-pulse"
            : isShadowingPlaying
            ? "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-900/40 ring-2 ring-blue-300 animate-pulse"
            : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30"
        }`}
        title="Practice shadowing: speaks each word with delay to repeat along (1.5s countdown before playing)"
      >
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isShadowingCountingDown ? (
            <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="32" strokeDashoffset="16" className="animate-spin" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          )}
        </svg>
        <span>
          {isShadowingCountingDown
            ? `Starting in ${countdown.toFixed(1)}s...`
            : isShadowingPlaying
            ? "Pause Shadowing"
            : "Speech Shadowing"}
        </span>
      </button>
    </div>
  );
}
