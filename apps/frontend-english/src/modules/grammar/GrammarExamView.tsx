import { useState, useMemo } from "react";
import { useApp } from "../../state/app";
import PlayExam, { type AIResponseData } from "../../components/PlayExam";

interface ParsedGrammarQuestion {
  id?: string;
  prompt: string;
  category?: string;
  difficulty?: string;
  displayAnswer?: string;
  explanation?: string;
}

const FALLBACK_QUESTION: ParsedGrammarQuestion = {
  id: "pos-fallback",
  prompt: "Identify the part of speech of the highlighted word:\n\"The enthusiastic student completed the assignment QUICKLY.\"",
  category: "Parts of Speech",
  difficulty: "Easy",
  displayAnswer: "Adverb",
  explanation: "'Quickly' modifies the verb 'completed' by describing how the action was performed.",
};

export default function GrammarExamView() {
  const grammarquestions = useApp.use.grammarquestions();
  const airesponseGrammar = useApp.use.airesponseGrammar();
  const grammarsubject = useApp.use.grammarsubject();
  const grammardiffculty = useApp.use.grammardiffculty();
  const setGrammarIsStarted = useApp.use.setGrammarIsStarted();
  const generateQuestionGrammar = useApp.use.generateQuestionGrammar();
  const generateAIResponseGrammar = useApp.use.generateAIResponseGrammar();

  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedQuestion: ParsedGrammarQuestion = useMemo(() => {
    if (!grammarquestions) return FALLBACK_QUESTION;
    try {
      return JSON.parse(grammarquestions) as ParsedGrammarQuestion;
    } catch {
      return FALLBACK_QUESTION;
    }
  }, [grammarquestions]);

  const parsedAiResponse: AIResponseData | null = useMemo(() => {
    if (!airesponseGrammar) return null;
    try {
      return JSON.parse(airesponseGrammar) as AIResponseData;
    } catch {
      return null;
    }
  }, [airesponseGrammar]);

  const handleSubmit = async () => {
    if (!userAnswer.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await generateAIResponseGrammar(userAnswer);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async (_answer?: string, _response?: AIResponseData | null) => {
    setUserAnswer("");
    await generateQuestionGrammar();
  };

  const handleExit = () => {
    setUserAnswer("");
    setGrammarIsStarted(false);
  };

  return (
    <PlayExam
      title="Grammar Practice"
      prompt={parsedQuestion.prompt}
      category={parsedQuestion.category || grammarsubject}
      difficulty={parsedQuestion.difficulty || grammardiffculty}
      userAnswer={userAnswer}
      onChangeAnswer={setUserAnswer}
      onSubmitAnswer={handleSubmit}
      isSubmitting={isSubmitting}
      aiResponse={parsedAiResponse}
      onNextQuestion={handleNext}
      onNext={handleNext}
      onExit={handleExit}
    />
  );
}
