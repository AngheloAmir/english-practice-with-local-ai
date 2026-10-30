import { useState, useRef } from "react";
import { useSpeechModule } from "../../state/speech";

export default function SpeechRecordingPlayer() {
  const isRecording = useSpeechModule.use.isRecording();
  const startRecordingTest = useSpeechModule.use.startRecordingTest();
  const stopRecordingTest = useSpeechModule.use.stopRecordingTest();
  const userDetectedWords = useSpeechModule.use.userDetectedWords();
  const sttAccuracyScore = useSpeechModule.use.sttAccuracyScore();

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
    <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
          <span>Record and Listen to Yourself</span>
        </h3>
        <span className="text-[11px] font-mono font-medium text-slate-500">
          Audio Practice & STT Feedback
        </span>
      </div>

      {/* Recording Actions (Record & Record with AI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Record button */}
        <button
          type="button"
          onClick={toggleRecording}
          className={`py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.98] ${
            isRecording
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-950/20 animate-pulse"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-950/20"
          }`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span>{isRecording ? "Stop Recording" : "Record Your Voice"}</span>
        </button>

        {/* Record With AI button */}
        <button
          type="button"
          onClick={startRecordingTest}
          disabled={isRecording}
          className="py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm shadow-amber-950/10 transition-all active:scale-[0.98] disabled:opacity-50"
          title="Interactive shadowing with AI prompt & live STT"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>Record With AI Coach</span>
        </button>
      </div>

      {/* Audio Playback Bar */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handleSimulatePlayback}
          className="w-10 h-10 rounded-full bg-[#147a82] hover:bg-[#0e565c] text-white flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95"
          title={isPlayingRecorded ? "Pause recorded replay" : "Play back recorded audio"}
        >
          {isPlayingRecorded ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Progress Bar / Scrubber */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#147a82] transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${playbackProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>{isPlayingRecorded ? `0:0${Math.floor(playbackProgress / 33)}` : "0:00"}</span>
            <span>0:03</span>
          </div>
        </div>

        {/* Speaker Icon */}
        <div className="text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M12 6.253v11.494m0 0l-3.5-3.5H5a1 1 0 01-1-1v-3.5a1 1 0 011-1h3.5l3.5-3.5z" />
          </svg>
        </div>
      </div>

      {/* STT Feedback Display (if detected words exist) */}
      {userDetectedWords && (
        <div className="bg-teal-50/60 border border-teal-200/90 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 font-mono">
              Whisper STT Transcription:
            </span>
            {sttAccuracyScore !== null && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Match: {sttAccuracyScore}%
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base font-medium text-teal-950 italic">
            "{userDetectedWords}"
          </p>
          {sttAccuracyScore !== null && sttAccuracyScore >= 80 && (
            <span className="text-xs text-emerald-700 font-semibold">
              Excellent! Your pronunciation closely matched the target sentence.
            </span>
          )}
        </div>
      )}
    </section>
  );
}
