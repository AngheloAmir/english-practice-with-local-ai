import { useState, useRef } from "react";
import { useSpeechModule, warmUpHotEngines } from "../../state/speech";

export default function SpeechRecordingPlayer() {
  const isRecording = useSpeechModule.use.isRecording();
  const startRecordingTest = useSpeechModule.use.startRecordingTest();
  const stopRecordingTest = useSpeechModule.use.stopRecordingTest();
  const userDetectedWords = useSpeechModule.use.userDetectedWords();
  const userRecordingUrl = useSpeechModule.use.userRecordingUrl();
  const sttAccuracyScore = useSpeechModule.use.sttAccuracyScore();
  const sttFeedback = useSpeechModule.use.sttFeedback();
  const isTranscribingStt = useSpeechModule.use.isTranscribingStt();
  const isEvaluatingStt = useSpeechModule.use.isEvaluatingStt();
  const useraudio = useSpeechModule.use.useraudio();
  const setUseraudio = useSpeechModule.use.setUseraudio();

  // Timed auto-play loop state
  const isTimedAutoplayRunning = useSpeechModule.use.isTimedAutoplayRunning();
  const timedAutoplayPhase = useSpeechModule.use.timedAutoplayPhase();
  const timedRecordRemaining = useSpeechModule.use.timedRecordRemaining();
  const timedPlaybackProgress = useSpeechModule.use.timedPlaybackProgress();
  const startTimedAutoplay = useSpeechModule.use.startTimedAutoplay();
  const stopTimedAutoplay = useSpeechModule.use.stopTimedAutoplay();

  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const toggleRecording = () => {
    warmUpHotEngines();
    if (isTimedAutoplayRunning) {
      stopTimedAutoplay();
    }
    if (isRecording) {
      stopRecordingTest();
    } else {
      startRecordingTest();
    }
  };

  const handleToggleTimedAutoplay = () => {
    warmUpHotEngines();
    if (isTimedAutoplayRunning) {
      stopTimedAutoplay();
    } else {
      startTimedAutoplay();
    }
  };

  const handleSimulatePlayback = () => {
    if (isTimedAutoplayRunning) {
      stopTimedAutoplay();
    }

    if (isPlayingRecorded) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      }
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlayingRecorded(false);
      setPlaybackProgress(0);
      return;
    }

    // If user has a real recorded audio blob, play it
    if (userRecordingUrl) {
      try {
        const audio = new Audio(userRecordingUrl);
        activeAudioRef.current = audio;
        setIsPlayingRecorded(true);
        setPlaybackProgress(0);

        audio.ontimeupdate = () => {
          if (audio.duration && isFinite(audio.duration)) {
            const p = Math.min(100, Math.round((audio.currentTime / audio.duration) * 100));
            setPlaybackProgress(p);
          }
        };

        audio.onended = () => {
          setIsPlayingRecorded(false);
          setPlaybackProgress(0);
        };

        audio.onerror = () => {
          setIsPlayingRecorded(false);
          setPlaybackProgress(0);
        };

        audio.play();
        return;
      } catch {
        // Fallback to simulated scrubber
      }
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

  // Determine current active progress for the scrubber bar
  const activeProgress = isTimedAutoplayRunning
    ? (timedAutoplayPhase === "playback_stt" ? timedPlaybackProgress : 0)
    : playbackProgress;

  const isAudioActive = isPlayingRecorded || (isTimedAutoplayRunning && timedAutoplayPhase === "playback_stt");

  return (
    <section className="bg-[#1e2027] rounded-3xl p-6 sm:p-7 shadow-sm lg:h-[440px] overflow-hidden transition-all">
      {/* Header: Title on Left, Auto-Replay Toggle on Right (Fixed Top) */}
      <div className="flex items-center justify-between pb-3">
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

      {/* Row: Record Buttons - Fixed Top Position (Never Shifts Vertically) */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Record Your Voice Button */}
        <button
          type="button"
          onClick={toggleRecording}
          disabled={isTimedAutoplayRunning}
          className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer ${
            isTimedAutoplayRunning
              ? "opacity-40 cursor-not-allowed bg-emerald-900/40 text-slate-400"
              : isRecording && !isTimedAutoplayRunning
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-950/20 animate-pulse"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/20"
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span>{isRecording && !isTimedAutoplayRunning ? "Stop Recording" : "Record Your Voice"}</span>
        </button>

        {/* Record Timed Auto play Button */}
        <button
          type="button"
          onClick={handleToggleTimedAutoplay}
          className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer ${
            isTimedAutoplayRunning
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-950/30 ring-2 ring-rose-400/50 animate-pulse"
              : "bg-[#16171d] hover:bg-[#222530] text-blue-400 border border-blue-500/40 hover:border-blue-400 shadow-sm"
          }`}
          title={
            isTimedAutoplayRunning
              ? "Click to stop the timed auto-record & replay loop"
              : "Starts a timed recording (TTS duration + 3s), auto-plays back, and checks STT in a repeating loop"
          }
        >
          {isTimedAutoplayRunning ? (
            <>
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <rect x="5" y="5" width="14" height="14" rx="2" />
              </svg>
              <span>
                {timedAutoplayPhase === "recording"
                  ? `Stop (${timedRecordRemaining}s)`
                  : timedAutoplayPhase === "playback_stt"
                  ? "Stop (Playing)"
                  : "Stop Loop"}
              </span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="whitespace-nowrap">Record Timed Auto play</span>
            </>
          )}
        </button>
      </div>

      {/* Audio Playback Bar - Fixed Top Position (Never Shifts Vertically) */}
      <div className="mt-4 bg-[#16171d] border border-[#292c37] rounded-2xl p-3 flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handleSimulatePlayback}
          className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer"
          title={isAudioActive ? "Pause recorded replay" : "Play back recorded audio"}
        >
          {isAudioActive ? (
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
              style={{ width: `${activeProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>{isAudioActive ? `0:0${Math.floor(activeProgress / 33)}` : "0:00"}</span>
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

      {/* STT Feedback Display - Fixed Top Position (Grows Downward into Empty Space) */}
      <div className="mt-4 bg-[#16171d]/90 border border-[#292c37] rounded-2xl p-3.5 sm:p-4 flex flex-col gap-1.5 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 font-mono flex items-center gap-2">
            <span>WHISPER STT TRANSCRIPTION:</span>
            {isTranscribingStt ? (
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 animate-pulse">
                Transcribing audio...
              </span>
            ) : isEvaluatingStt ? (
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 animate-pulse">
                Evaluating pronunciation with Ollama...
              </span>
            ) : isTimedAutoplayRunning ? (
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 animate-pulse">
                {timedAutoplayPhase === "recording"
                  ? `Recording (${timedRecordRemaining}s)`
                  : "Playing back & STT"}
              </span>
            ) : null}
          </span>
          {sttAccuracyScore !== null && (
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                sttAccuracyScore >= 80
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                  : sttAccuracyScore >= 50
                  ? "bg-amber-500/20 text-amber-300 border-amber-400/30"
                  : "bg-rose-500/20 text-rose-300 border-rose-400/30"
              }`}
            >
              Match: {sttAccuracyScore}%
            </span>
          )}
        </div>

        {userDetectedWords ? (
          <>
            <p className="text-xs sm:text-[13px] font-medium text-slate-200 italic line-clamp-3 leading-relaxed">
              "{userDetectedWords}"
            </p>
            {sttFeedback && (
              <span
                className={`text-xs font-semibold ${
                  sttAccuracyScore !== null && sttAccuracyScore >= 80
                    ? "text-emerald-400"
                    : sttAccuracyScore !== null && sttAccuracyScore >= 50
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
              >
                {sttFeedback}
              </span>
            )}
          </>
        ) : (
          <p className="text-xs text-slate-500 italic py-2">
            No recording transcribed yet. Record your voice to test pronunciation.
          </p>
        )}
      </div>
    </section>
  );
}
