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
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#181a22] via-[#1e2230] to-[#1c2c4a] border border-[#2b3042] py-2 px-4 text-white shadow-md">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl font-extrabold tracking-tight mt-1 text-white">
            Choose a Topic to Practice
          </h1>

          {/* Difficulty Switcher */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center bg-[#12131a]/80 backdrop-blur-md p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setGrammarDifficulty("Easy")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  grammardiffculty === "Easy"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Easy
              </button>
              <button
                type="button"
                onClick={() => setGrammarDifficulty("Medium")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  grammardiffculty === "Medium"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Medium
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Available Grammar Topics
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Active: <strong className="text-blue-400">{grammarsubject}</strong>
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
                    ? "bg-[#222530] border-blue-500 ring-2 ring-blue-500/30"
                    : "bg-[#1e2027] border-[#292c37] hover:border-slate-600"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center text-xl shrink-0">
                        {subject.icon}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {subject.title}
                        </h3>
                        <p className="text-xs text-blue-400 font-medium">
                          {subject.subtitle}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-sm shrink-0">
                        Selected
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {subject.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {subject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#16171d] text-slate-400 border border-[#292c37]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#292c37] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setGrammarSubject(subject.id)}
                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Select Topic
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAndStart(subject.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold tracking-wide uppercase transition-all shadow-sm hover:translate-x-0.5 cursor-pointer shadow-blue-900/30"
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

