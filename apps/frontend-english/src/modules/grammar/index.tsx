import { useApp } from "../../state/app";
import SubjectChooser from "./SubjectChooser";
import GrammarExamView from "./GrammarExamView";

export default function Grammar() {
  const grammarstarted = useApp.use.grammarstarted();

  return (
    <main className="flex-1 bg-[#fcfdfe] rounded-[28px] sm:rounded-[34px] p-4 sm:p-6 lg:p-7 shadow-2xl flex flex-col gap-6 overflow-y-auto min-h-full">
      {grammarstarted ? <GrammarExamView /> : <SubjectChooser />}
    </main>
  );
}

