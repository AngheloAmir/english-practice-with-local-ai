import { useState, useRef } from "react";
import { useSpeechModule } from "../../state/speech";

const DIFFICULTY_LEVELS = ["Practice", "Intermediate", "Advanced"] as const;

export default function SpeechRecordingPlayer() {
  const isRecording = useSpeechModule.use.isRecording();
  const startRecordingTest = useSpeechModule.use.startRecordingTest();
  const stopRecordingTest = useSpeechModule.use.stopRecordingTest();
  const userDetectedWords = useSpeechModule.use.userDetectedWords();
  const sentence = useSpeechModule.use.sentence();
  const sttAccuracyScore = useSpeechModule.use.sttAccuracyScore();
  const difficulty = useSpeechModule.use.difficulty();
  const setDifficulty = useSpeechModule.use.setDifficulty();
  const useraudio = useSpeechModule.use.useraudio();
  const setUseraudio = useSpeechModule.use.setUseraudio();

  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecordingTest();
    } else {
      startRecordingTest();
    }
  };

  const handleSimulatePlayback = () => {
    if (isPlayingRecorded) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlayingRecorded(false);
      setPlaybackProgress(0);
      return;
    }

    setIsPlayingRecorded(true);
    setPlaybackProgress(0);

    const startTime = Date.now();
    const durationMs = 3000;

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setPlaybackProgress(progress);

      if (elapsed >= durationMs) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsPlayingRecorded(false);
        setPlaybackProgress(0);
      }
    }, 100);
  };

  return (
    <section className="bg-[#1e2027] border border-[#292c37] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between lg:h-[390px] gap-3.5 transition-all">
      {/* Header: Title on Left, Auto-Replay Toggle on Right */}
      <div className="flex items-center justify-between pb-2 border-b border-[#292c37]">
        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <span>Record and Listen to Yourself</span>
        </h3>
        <button
          type="button"
          onClick={() => setUseraudio(useraudio === "autoplay" ? "" : "autoplay")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            useraudio === "autoplay"
              ? "bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-2xs"
              : "bg-[#16171d] border-[#292c37] text-slate-400 hover:text-white hover:bg-[#252834]"
          }`}
          title="Autoplay audio after recording"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              useraudio === "autoplay" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
            }`}
          />
          <span>{useraudio === "autoplay" ? "ON" : "OFF"}</span>
        </button>
      </div>

      {/* Row: Record Your Voice (Green) + Difficulty Pill Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Record Button */}
        <button
          type="button"
          onClick={toggleRecording}
          className={`py-2 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer ${
            isRecording
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-950/20 animate-pulse"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/20"
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span>{isRecording ? "Stop Recording" : "Record Your Voice"}</span>
        </button>

        {/* Difficulty Selector */}
        <div className="flex items-center bg-[#16171d] border border-[#292c37] p-1 rounded-2xl self-start sm:self-auto">
          {DIFFICULTY_LEVELS.map((level) => {
            const isActive = difficulty === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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

      {/* Audio Playback Bar */}
      <div className="bg-[#16171d] border border-[#292c37] rounded-2xl p-2.5 sm:p-3 flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handleSimulatePlayback}
          className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer"
          title={isPlayingRecorded ? "Pause recorded replay" : "Play back recorded audio"}
        >
          {isPlayingRecorded ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Progress Bar / Scrubber */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-1.5 w-full bg-[#282b36] rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${playbackProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>{isPlayingRecorded ? `0:0${Math.floor(playbackProgress / 33)}` : "0:00"}</span>
            <span>0:03</span>
          </div>
        </div>

        {/* Speaker Icon */}
        <div className="text-slate-400 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M12 6.253v11.494m0 0l-3.5-3.5H5a1 1 0 01-1-1v-3.5a1 1 0 011-1h3.5l3.5-3.5z" />
          </svg>
        </div>
      </div>

      {/* STT Feedback Display */}
      <div className="bg-[#16171d]/90 border border-[#292c37] rounded-2xl p-3 sm:p-3.5 flex flex-col gap-1.5 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 font-mono">
            WHISPER STT TRANSCRIPTION:
          </span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            Match: {sttAccuracyScore ?? 94}%
          </span>
        </div>
        <p className="text-xs sm:text-[13px] font-medium text-slate-200 italic line-clamp-3 leading-relaxed">
          "{userDetectedWords || sentence}"
        </p>
        <span className="text-xs text-emerald-400 font-semibold">
          Excellent! Your pronunciation closely matched the target sentence.
        </span>
      </div>
    </section>
  );
}
