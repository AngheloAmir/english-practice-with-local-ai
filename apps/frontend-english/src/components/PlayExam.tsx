import { useEffect, useRef, useCallback } from "react";

export interface AIResponseData {
  correct: boolean;
  reason: string;
}

export interface PlayExamProps {
  title?: string;
  prompt: string;
  category?: string;
  difficulty?: string;
  userAnswer: string;
  onChangeAnswer: (value: string) => void;
  onSubmitAnswer: () => void;
  isSubmitting?: boolean;
  aiResponse?: AIResponseData | null;
  onNextQuestion?: (currentAnswer?: string, aiResponse?: AIResponseData | null) => void;
  onNext?: () => void;
  onExit: () => void;
}

export default function PlayExam({
  title = "Grammar Practice",
  prompt,
  category,
  difficulty,
  userAnswer,
  onChangeAnswer,
  onSubmitAnswer,
  isSubmitting = false,
  aiResponse,
  onNextQuestion,
  onNext,
  onExit,
}: PlayExamProps) {
  const hasAiResponse = Boolean(aiResponse);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerNextQuestion = useCallback(() => {
    if (onNextQuestion) {
      onNextQuestion(userAnswer, aiResponse);
    } else if (onNext) {
      onNext();
    }
  }, [onNextQuestion, onNext, userAnswer, aiResponse]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // If answer is already evaluated, pressing Enter advances to the next question
    if (hasAiResponse) {
      triggerNextQuestion();
      return;
    }

    if (!userAnswer.trim() || isSubmitting) return;
    onSubmitAnswer();
  };

  // Global Enter key listener when AI response is visible, so pressing Enter anywhere advances
  useEffect(() => {
    if (!hasAiResponse) {
      inputRef.current?.focus();
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        triggerNextQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasAiResponse, triggerNextQuestion]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 bg-[#16171d] border border-[#292c37] hover:bg-[#252834] hover:text-white transition-colors cursor-pointer"
            title="Back to topics"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Topics</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                {title}
              </h1>
              {category && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {category}
                </span>
              )}
              {difficulty && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                    difficulty === "Easy"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {difficulty}
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Main Split Layout: [ Question + Input ] on Left, [ Response AI.. ] on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Question Prompt & Text Input Area (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          {/* Question Prompt Card */}
          <div className="bg-[#1e2027] rounded-3xl p-6 sm:p-7 border border-[#292c37] shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Question Prompt
            </span>
            <div className="text-base sm:text-xl font-bold text-white whitespace-pre-line leading-relaxed">
              {prompt}
            </div>
          </div>

          {/* User Answer Text Box & Submit Action */}
          <form
            onSubmit={handleSubmit}
            className="bg-[#1e2027] rounded-3xl p-6 border border-[#292c37] shadow-sm flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor="grammar-user-answer"
                className="text-xs font-bold text-slate-400 uppercase tracking-wider"
              >
                Your Answer:
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Freeform text input
              </span>
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                id="grammar-user-answer"
                type="text"
                value={userAnswer}
                onChange={(e) => onChangeAnswer(e.target.value)}
                placeholder={hasAiResponse ? "Press Enter for next question..." : "Type your answer here..."}
                disabled={isSubmitting}
                className="w-full bg-[#16171d] border border-[#292c37] focus:border-blue-500 focus:bg-[#1a1b24] text-white rounded-2xl px-4 py-3.5 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">
                {hasAiResponse
                  ? "✓ Evaluated! Press Enter ↵ or click Next Question to continue."
                  : "Press Enter ↵ or click Submit to have AI evaluate."}
              </span>

              {hasAiResponse ? (
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer bg-blue-600 hover:bg-blue-500 text-white hover:translate-x-0.5 shadow-blue-900/30"
                >
                  <span>Next Question</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">
                    ↵ Enter
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!userAnswer.trim() || isSubmitting}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer ${
                    !userAnswer.trim() || isSubmitting
                      ? "bg-[#282b36] text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-blue-600 hover:bg-blue-500 text-white hover:translate-x-0.5 shadow-blue-900/30"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </section>

        {/* RIGHT COLUMN: [ Response AI.. ] Feedback Card (5 cols) */}
        <section className="lg:col-span-5 flex flex-col h-full">
          <div className="bg-[#1e2027] rounded-3xl p-6 border border-[#292c37] shadow-md flex flex-col justify-between gap-5 min-h-[340px]">

            {/* AI Response Body */}
            {hasAiResponse && aiResponse ? (
              <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
                {/* Result Indicator Badge */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-center gap-2.5 ${
                    aiResponse.correct
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                      : "bg-rose-950/40 border-rose-500/40 text-rose-200"
                  }`}
                >
                  <span className="text-xl">
                    {aiResponse.correct ? "🎯" : "💡"}
                  </span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block">
                      {aiResponse.correct ? "Correct Answer!" : "Needs Revision"}
                    </span>
                    <span className="text-xs font-medium opacity-90">
                      {aiResponse.correct
                        ? "Your response matches the grammar standard."
                        : "Review the coach explanation below."}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-[#16171d] rounded-2xl p-4 border border-[#292c37] shadow-sm flex flex-col gap-1.5 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Explanation
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                    {aiResponse.reason}
                  </p>
                </div>
              </div>
            ) : (
              /* Idle / Waiting State before user submits */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#16171d]/60 rounded-2xl border border-dashed border-[#292c37]">
                <div className="w-12 h-12 rounded-full bg-[#1e2027] border border-[#292c37] flex items-center justify-center text-2xl shadow-sm mb-3">
                  💬
                </div>
                <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wide">
                  Waiting for your answer
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Enter your answer on the left and click <strong>Submit</strong>. Elena will immediately check your response and provide a pedagogical explanation.
                </p>
              </div>
            )}

          </div>
        </section>
      </div>

    </div>
  );
}
