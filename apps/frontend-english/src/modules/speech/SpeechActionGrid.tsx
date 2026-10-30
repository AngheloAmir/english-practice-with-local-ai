import { useSpeechModule } from "../../state/speech";

export default function SpeechActionGrid() {
  const isPlaying = useSpeechModule.use.isPlaying();
  const playmode = useSpeechModule.use.playmode();
  const isRecording = useSpeechModule.use.isRecording();
  const playFullSentence = useSpeechModule.use.playFullSentence();
  const playSpeechShadowing = useSpeechModule.use.playSpeechShadowing();
  const startRecordingTest = useSpeechModule.use.startRecordingTest();
  const generateNewSentence = useSpeechModule.use.generateNewSentence();

  const isSentencePlaying = isPlaying && playmode === "sentence";
  const isShadowingPlaying = isPlaying && playmode === "perword";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {/* Button 1: Listen (Full TTS sentence) */}
      <button
        type="button"
        onClick={playFullSentence}
        className={`py-3.5 px-5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-md active:scale-[0.98] ${
          isSentencePlaying
            ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-950/20 ring-2 ring-amber-400"
            : "bg-[#147a82] hover:bg-[#0e5c63] text-white shadow-[#147a82]/20"
        }`}
        title="Listen to the full native sentence"
      >
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isSentencePlaying ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          )}
        </svg>
        <span>{isSentencePlaying ? "Pause Listening" : "Listen (Full Sentence)"}</span>
      </button>

      {/* Button 2: Speech Shadowing (Word by word pacing) */}
      <button
        type="button"
        onClick={playSpeechShadowing}
        className={`py-3.5 px-5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-md active:scale-[0.98] ${
          isShadowingPlaying
            ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-950/20 ring-2 ring-amber-400 animate-pulse"
            : "bg-[#147a82] hover:bg-[#0e5c63] text-white shadow-[#147a82]/20"
        }`}
        title="Practice shadowing: speaks each word with delay to repeat along"
      >
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <span>{isShadowingPlaying ? "Shadowing Playing..." : "Speech Shadowing"}</span>
      </button>

      {/* Button 3: Do Test (Mic capture + STT evaluation) */}
      <button
        type="button"
        onClick={startRecordingTest}
        disabled={isRecording}
        className={`py-3.5 px-5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-md active:scale-[0.98] ${
          isRecording
            ? "bg-rose-600 text-white shadow-rose-950/20 animate-pulse"
            : "bg-[#147a82] hover:bg-[#0e5c63] text-white shadow-[#147a82]/20"
        }`}
        title="Speak into the microphone to test your pronunciation match with STT"
      >
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{isRecording ? "Listening & Testing..." : "Do Test (STT Check)"}</span>
      </button>

      {/* Button 4: New Sentences */}
      <button
        type="button"
        onClick={generateNewSentence}
        className="py-3.5 px-5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 bg-[#147a82] hover:bg-[#0e5c63] text-white shadow-md shadow-[#147a82]/20 transition-all duration-200 active:scale-[0.98]"
        title="Generate or load a new practice sentence"
      >
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>New Sentences</span>
      </button>
    </div>
  );
}

