import { useApp } from "../../state/app";

interface SubjectItem {
  id: "partsofspeech" | "preposition" | "subjectverb" | "rewritting";
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  tags: string[];
}

const GRAMMAR_SUBJECTS: SubjectItem[] = [
  {
    id: "partsofspeech",
    title: "Parts of Speech",
    subtitle: "Nouns, Verbs, Adjectives & Adverbs",
    icon: "🏷️",
    description: "Identify word classes and their syntactic roles in diverse sentences.",
    tags: ["Core Grammar", "Identification"],
  },
  {
    id: "preposition",
    title: "Prepositions",
    subtitle: "Time, Place, Direction & Collocations",
    icon: "📍",
    description: "Master prepositions and natural verb-preposition combinations.",
    tags: ["Collocations", "Accuracy"],
  },
  {
    id: "subjectverb",
    title: "Subject-Verb Agreement",
    subtitle: "Concord & Compound Subjects",
    icon: "⚖️",
    description: "Ensure grammatical harmony across singular, plural, and collective subjects.",
    tags: ["Syntax", "Concord"],
  },
  {
    id: "rewritting",
    title: "Sentence Rewriting",
    subtitle: "Active/Passive & Reported Speech",
    icon: "🔄",
    description: "Transform sentences while preserving nuance, voice, and accurate tense.",
    tags: ["Structure", "Style"],
  },
];

export default function SubjectChooser() {
  const grammarsubject = useApp.use.grammarsubject();
  const setGrammarSubject = useApp.use.setGrammarSubject();
  const grammardiffculty = useApp.use.grammardiffculty();
  const setGrammarDifficulty = useApp.use.setGrammarDifficulty();
  const setGrammarIsStarted = useApp.use.setGrammarIsStarted();
  const generateQuestionGrammar = useApp.use.generateQuestionGrammar();

  const handleSelectAndStart = async (subjectId: "partsofspeech" | "preposition" | "subjectverb" | "rewritting") => {
    setGrammarSubject(subjectId);
    await generateQuestionGrammar();
    setGrammarIsStarted(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#177c86] via-[#208a95] to-[#f4d4c5] p-5 sm:p-7 text-white shadow-md">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
            Interactive Grammar Trainer
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
            Choose a Topic to Practice
          </h1>
          <p className="text-xs sm:text-sm text-white/90 mt-2 leading-relaxed">
            Select a target grammar category and difficulty level to begin your personalized practice exam.
          </p>

          {/* Difficulty Switcher */}
          <div className="mt-5 flex items-center gap-3">
            <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
              Difficulty:
            </span>
            <div className="flex items-center bg-black/15 backdrop-blur-md p-1 rounded-2xl border border-white/20">
              <button
                type="button"
                onClick={() => setGrammarDifficulty("Easy")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  grammardiffculty === "Easy"
                    ? "bg-white text-[#177a83] shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                🌱 Easy
              </button>
              <button
                type="button"
                onClick={() => setGrammarDifficulty("Medium")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  grammardiffculty === "Medium"
                    ? "bg-white text-[#177a83] shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                ⚡ Medium
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            Available Grammar Topics
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Active: <strong className="text-slate-700">{grammarsubject}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GRAMMAR_SUBJECTS.map((subject) => {
            const isSelected = grammarsubject === subject.id;

            return (
              <div
                key={subject.id}
                className={`rounded-[24px] p-5 sm:p-6 border transition-all duration-200 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md ${
                  isSelected
                    ? "bg-gradient-to-br from-white to-teal-50/40 border-[#177a83] ring-2 ring-[#177a83]/20"
                    : "bg-white border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#177a83]/10 flex items-center justify-center text-xl shrink-0">
                        {subject.icon}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                          {subject.title}
                        </h3>
                        <p className="text-xs text-[#177a83] font-medium">
                          {subject.subtitle}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#177a83] text-white shadow-sm shrink-0">
                        Selected
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {subject.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {subject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setGrammarSubject(subject.id)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Select Topic
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAndStart(subject.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#177a83] hover:bg-[#11626d] text-white text-xs font-extrabold tracking-wide uppercase transition-all shadow-sm hover:translate-x-0.5 cursor-pointer"
                  >
                    <span>Start Practice</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

