

import { useState, useEffect } from "react";
import { useApp } from "../state/app";
import { SOFTWARE_MODULES } from "../lib/_config";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
  score?: number;
  feedback?: string;
  phonetics?: string;
}

interface ReadingWord {
  text: string;
  status: "correct" | "needs-work" | "untested";
  ipa?: string;
  tip?: string;
}

export default function Sample() {
  const currentModule = useApp.use.currentModule();
  const setCurrentModule = useApp.use.setCurrentModule();

  // Active view: synced with currentModule ("reading" is reading, "dashboard" is dashboard/chat)
  const [internalTab, setInternalTab] = useState<"chat" | "reading">(
    currentModule === "reading" ? "reading" : "chat"
  );

  const activeTab: "chat" | "reading" =
    currentModule === "reading" ? "reading" : currentModule === "dashboard" ? "chat" : internalTab;

  const setActiveTab = (tab: "chat" | "reading") => {
    setInternalTab(tab);
    setCurrentModule(tab === "reading" ? "reading" : "dashboard");
  };

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello Alex! Welcome to today's speaking session. We'll be practicing natural conversational English and workplace discussions. How did your presentation go yesterday?",
      time: "10:14 AM",
      feedback: "Natural open-ended question to practice past tense narration.",
    },
    {
      id: "2",
      sender: "user",
      text: "It went quite well! I explained our quarterly roadmap clearly, although I struggled a bit when colleagues asked sudden questions.",
      time: "10:15 AM",
      score: 94,
      feedback: "Great sentence variety! Accurate use of 'although' and past simple.",
    },
    {
      id: "3",
      sender: "ai",
      text: "That's completely normal! Handling spontaneous questions takes practice. To sound more confident, you can say: 'That's a thoughtful question, let me break it down.' How would you respond if someone asked about project delays?",
      time: "10:16 AM",
      feedback: "Try using hedging phrases like 'From my perspective' or 'Based on current data'.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  // Reading Practice Test State
  const [isReadingTestActive, setIsReadingTestActive] = useState(false);
  const [readingTimer, setReadingTimer] = useState(38);
  const [readingPassageCompleted, setReadingPassageCompleted] = useState(false);
  const [selectedWord, setSelectedWord] = useState<ReadingWord | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isReadingTestActive) {
      interval = setInterval(() => {
        setReadingTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReadingTestActive]);

  const readingWords: ReadingWord[] = [
    { text: "In", status: "correct" },
    { text: "today's", status: "correct" },
    { text: "fast-paced", status: "correct" },
    { text: "professional", status: "correct", ipa: "/prəˈfeʃ.ən.əl/" },
    { text: "environment,", status: "correct", ipa: "/ɪnˈvaɪ.rən.mənt/" },
    { text: "articulating", status: "correct", ipa: "/ɑːˈtɪk.jʊ.leɪ.tɪŋ/", tip: "Crisp stress on the second syllable: ar-TIC-u-lating." },
    { text: "complex", status: "correct" },
    { text: "ideas", status: "correct" },
    { text: "with", status: "correct" },
    { text: "clarity", status: "correct", ipa: "/ˈklær.ə.ti/" },
    { text: "and", status: "correct" },
    { text: "empathy", status: "correct", ipa: "/ˈem.pə.θi/", tip: "Clear /θ/ voiceless sound at the end." },
    { text: "is", status: "correct" },
    { text: "essential.", status: "correct" },
    { text: "When", status: "correct" },
    { text: "communicating", status: "needs-work", ipa: "/kəˈmjuː.nɪ.keɪ.tɪŋ/", tip: "Slight hesitation noted. Keep rhythm smooth." },
    { text: "across", status: "correct" },
    { text: "diverse", status: "correct", ipa: "/daɪˈvɜːs/" },
    { text: "cultures,", status: "correct" },
    { text: "we", status: "correct" },
    { text: "must", status: "correct" },
    { text: "listen", status: "correct", ipa: "/ˈlɪs.ən/", tip: "Remember the 't' is silent." },
    { text: "actively", status: "correct" },
    { text: "and", status: "correct" },
    { text: "adapt", status: "correct" },
    { text: "our", status: "correct" },
    { text: "linguistic", status: "needs-work", ipa: "/lɪŋˈɡwɪs.tɪk/", tip: "Pronounce the 'gw' glide clearly: ling-GWIS-tic." },
    { text: "nuances", status: "correct", ipa: "/ˈnjuː.ɑːn.sɪz/" },
    { text: "to", status: "correct" },
    { text: "foster", status: "correct" },
    { text: "authentic", status: "correct", ipa: "/ɔːˈθen.tɪk/" },
    { text: "collaboration.", status: "correct", ipa: "/kəˌlæb.əˈreɪ.ʃən/" },
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputMessage,
      time: "Just now",
      score: 92,
      feedback: "Fluent delivery! Good vocabulary usage and coherence.",
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Excellent phrasing! That conveys both readiness and professionalism. Let's delve into another common scenario: How would you politely disagree with a senior stakeholder's proposal?",
        time: "Just now",
        feedback: "Try diplomatic lead-ins: 'I see where you are coming from, however...'",
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 1200);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setInputMessage("I would emphasize that our team is currently prioritizing user safety and speed.");
      }, 3000);
    }
  };

  const handleModuleClick = (id: string) => {
    const modName = id === "1" ? "reading" : "dashboard";
    setCurrentModule(modName);
    if (id === "1") {
      setActiveTab("reading");
    } else {
      setActiveTab("chat");
    }
  };

  return <>
       <main className="flex-1 bg-[#16171d] border border-[#23252e] rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 lg:p-7 shadow-2xl flex flex-col xl:flex-row gap-6 overflow-hidden min-h-[720px] text-slate-100">
            
            {/* MIDDLE CONTENT: CONVERSATION AREA & CHAT BOT / READING PRACTICE */}
            <section className="flex-1 flex flex-col justify-between gap-5 min-w-0">
              
              {/* Top Mode Header / Module Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#292c37]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
                    {activeTab === "chat" ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                        {activeTab === "chat" ? "AI Conversational Coach" : "Reading Aloud Fluency Test"}
                      </h1>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Live AI Tutor
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      {activeTab === "chat"
                        ? "Interactive speech partner • General American Accent • Level B2/C1"
                        : "Passage pronunciation check • Speech pacing & intonation analysis"}
                    </p>
                  </div>
                </div>

                {/* Mode Selector Pill Buttons */}
                <div className="flex items-center bg-[#1e2027] p-1 rounded-2xl border border-[#292c37]">
                  <button
                    onClick={() => {
                      setActiveTab("chat");
                      setCurrentModule("dashboard");
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "chat"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    💬 Conversation
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("reading");
                      setCurrentModule("reading");
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "reading"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    📖 Reading Practice
                  </button>
                </div>
              </div>

              {/* VIEW 1: CONVERSATION AREA (MAIN CHAT BOT) */}
              {activeTab === "chat" && (
                <div className="flex-1 flex flex-col justify-between gap-4">
                  {/* Hero Practice Card */}
                  <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#181a22] via-[#1e2230] to-[#1c2c4a] border border-[#2b3042] p-5 sm:p-6 text-white shadow-md">
                    <div className="relative z-10 max-w-[70%]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                        Speaking Session Today
                      </span>
                      <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
                        824 <span className="text-base font-normal text-slate-300">words spoken</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-slate-200 border border-white/10">
                          <svg className="w-3.5 h-3.5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Fluency 93%
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-slate-200 border border-white/10">
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          General rate 4.7/5
                        </div>
                      </div>
                    </div>

                    {/* Illustration element on the right */}
                    <div className="absolute right-3 -bottom-2 hidden sm:flex items-end">
                      <div className="relative w-40 h-36 flex items-center justify-center">
                        <div className="w-28 h-28 rounded-full bg-blue-500/10 blur-xl absolute"></div>
                        <div className="text-6xl select-none transform hover:scale-110 transition-transform cursor-pointer">
                          🧑‍💼
                        </div>
                        <div className="absolute top-2 right-6 px-2 py-0.5 rounded-full bg-[#1e2027] text-blue-400 border border-[#292c37] text-[10px] font-bold shadow-md">
                          Elena AI
                        </div>
                      </div>
                    </div>

                    {/* Pill Action Button */}
                    <div className="mt-5 flex items-center justify-between">
                      <button
                        onClick={() => setActiveTab("reading")}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold tracking-wide uppercase transition-all shadow-lg hover:translate-x-1 cursor-pointer shadow-blue-900/40"
                      >
                        <span>PRACTICE READING ALOUD</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Conversation Chat Stream */}
                  <div className="flex-1 overflow-y-auto max-h-[360px] pr-2 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 items-start ${
                          msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {/* Avatar */}
                        {msg.sender === "ai" ? (
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm shadow-blue-900/30">
                            🤖
                          </div>
                        ) : (
                          <img
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face"
                            alt="User"
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#292c37]"
                          />
                        )}

                        {/* Bubble */}
                        <div
                          className={`max-w-[82%] rounded-2xl p-4 shadow-sm transition-all ${
                            msg.sender === "user"
                              ? "bg-blue-600 text-white rounded-tr-none shadow-blue-900/30"
                              : "bg-[#1e2027] text-slate-100 border border-[#292c37] rounded-tl-none"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                msg.sender === "user" ? "text-white/80" : "text-blue-400"
                              }`}
                            >
                              {msg.sender === "user" ? "You (Learner)" : "Elena Vance (AI Coach)"}
                            </span>
                            <span
                              className={`text-[10px] ${
                                msg.sender === "user" ? "text-white/60" : "text-slate-400"
                              }`}
                            >
                              {msg.time}
                            </span>
                          </div>

                          <p className="text-sm leading-relaxed font-normal">{msg.text}</p>

                          {/* Audio Speech Button & Feedback tags */}
                          <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                            {msg.sender === "ai" ? (
                              <button
                                onClick={() => {
                                  setIsPlayingAudio(isPlayingAudio === msg.id ? null : msg.id);
                                }}
                                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
                              >
                                {isPlayingAudio === msg.id ? (
                                  <>
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                    <span>Playing Audio... (1.0x)</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                    </svg>
                                    <span>Listen Pronunciation</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              msg.score && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white">
                                  🎯 Pronunciation: {msg.score}%
                                </span>
                              )
                            )}

                            {msg.feedback && (
                              <span
                                className={`text-[11px] font-medium italic ${
                                  msg.sender === "user" ? "text-white/90" : "text-slate-400"
                                }`}
                              >
                                💡 {msg.feedback}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Prompt Suggestions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-400">Suggestions:</span>
                    {[
                      "How should I structure my answer?",
                      "Can you evaluate my pronunciation?",
                      "Let's practice a mock job interview",
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputMessage(chip)}
                        className="text-xs bg-[#1e2027] hover:bg-[#282a35] text-slate-300 px-3 py-1 rounded-full transition-colors border border-[#292c37] cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input Bar with Voice & Send */}
                  <div className="relative flex items-center gap-2 bg-[#1e2027] rounded-2xl p-2 border border-[#292c37] shadow-sm">
                    {/* Voice Record Button */}
                    <button
                      onClick={toggleRecording}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isRecording
                          ? "bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30"
                          : "bg-[#16171d] text-slate-300 hover:text-white hover:bg-[#252834] border border-[#292c37]"
                      }`}
                      title="Speak your answer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>

                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder={
                        isRecording
                          ? "Listening to your voice... Speak clearly"
                          : "Type your answer or click mic to practice speaking..."
                      }
                      className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                    />

                    {/* Send Button */}
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        inputMessage.trim()
                          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30"
                          : "bg-[#282b36] text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      <span>Send</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 2: READING PRACTICE TEST (A test is shown where user reads a test) */}
              {activeTab === "reading" && (
                <div className="flex-1 flex flex-col justify-between gap-4">
                  {/* Reading Passage Test Header Card */}
                  <div className="bg-gradient-to-r from-[#181a22] via-[#1e2230] to-[#1c2c4a] border border-[#2b3042] rounded-[24px] p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] font-extrabold uppercase tracking-wide text-blue-300">
                          Test Module #08
                        </span>
                        <span className="text-slate-300 text-xs">Pacing Goal: 130 WPM</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">
                        Professional Communication & Empathy
                      </h2>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Read the passage aloud clearly into your microphone. Tap any word for phonetics & pronunciation hints.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 text-center border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-slate-300 block">Time</span>
                        <span className="text-lg font-black text-white">{readingTimer}s</span>
                      </div>
                      <button
                        onClick={() => {
                          setIsReadingTestActive(!isReadingTestActive);
                          if (!isReadingTestActive) {
                            setTimeout(() => {
                              setReadingPassageCompleted(true);
                              setIsReadingTestActive(false);
                            }, 5000);
                          }
                        }}
                        className={`px-5 py-2.5 rounded-full font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg cursor-pointer ${
                          isReadingTestActive
                            ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30"
                        }`}
                      >
                        {isReadingTestActive ? "⏹ STOP TEST" : "🎙 START READING TEST"}
                      </button>
                    </div>
                  </div>

                  {/* Reading Passage Interactive Area */}
                  <div className="bg-[#1e2027] border border-[#292c37] rounded-[24px] p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#292c37]">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Passage Text (32 words)
                      </span>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Accurate
                        </span>
                        <span className="flex items-center gap-1.5 text-blue-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Stress Focus
                        </span>
                      </div>
                    </div>

                    {/* Word-by-word interactive passage */}
                    <div className="text-base sm:text-lg leading-loose text-slate-100 font-medium">
                      {readingWords.map((word, index) => {
                        const isAttention = word.status === "needs-work";
                        return (
                          <span
                            key={index}
                            onClick={() => setSelectedWord(word)}
                            className={`inline-block mx-1 px-1.5 py-0.5 rounded-md cursor-pointer transition-all ${
                              isAttention
                                ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 underline decoration-blue-400"
                                : "hover:bg-[#282a35] text-slate-100"
                            } ${
                              selectedWord?.text === word.text
                                ? "ring-2 ring-blue-500 bg-blue-600 text-white"
                                : ""
                            }`}
                          >
                            {word.text}
                          </span>
                        );
                      })}
                    </div>

                    {/* Selected Word Helper Card */}
                    {selectedWord && (
                      <div className="mt-4 p-3.5 bg-[#16171d] border border-blue-500/30 rounded-xl flex items-center justify-between gap-4 text-xs shadow-sm">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-sm">{selectedWord.text}</span>
                            {selectedWord.ipa && (
                              <span className="px-2 py-0.5 bg-[#1e2027] border border-[#292c37] rounded text-slate-300 font-mono font-bold">
                                {selectedWord.ipa}
                              </span>
                            )}
                          </div>
                          {selectedWord.tip && (
                            <p className="text-slate-300 mt-1">💡 Coach Tip: {selectedWord.tip}</p>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedWord(null)}
                          className="text-slate-400 hover:text-white font-bold px-2 py-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Test Feedback & Score Evaluation */}
                  <div className="bg-[#1e2027] border border-[#292c37] rounded-[24px] p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">
                        Test Result & Audio Diagnostics
                      </h3>
                      <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        {readingPassageCompleted ? "Score: 94% (Passed)" : "Ready to evaluate"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-[#16171d] rounded-2xl border border-[#292c37]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Pronunciation</span>
                        <div className="text-xl font-black text-blue-400 mt-1">94%</div>
                      </div>
                      <div className="p-3 bg-[#16171d] rounded-2xl border border-[#292c37]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Fluency / Pace</span>
                        <div className="text-xl font-black text-blue-400 mt-1">128 WPM</div>
                      </div>
                      <div className="p-3 bg-[#16171d] rounded-2xl border border-[#292c37]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Intonation</span>
                        <div className="text-xl font-black text-blue-400 mt-1">91%</div>
                      </div>
                      <div className="p-3 bg-[#16171d] rounded-2xl border border-[#292c37]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</span>
                        <div className="text-xl font-black text-emerald-400 mt-1">97%</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#292c37]">
                      <span>Coach note: Strong cadence and clear vowel lengths. Focus on multi-syllabic stress.</span>
                      <button
                        onClick={() => {
                          setReadingPassageCompleted(true);
                        }}
                        className="text-blue-400 font-bold hover:underline cursor-pointer"
                      >
                        Next Test Passage →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Quick Module Selector from config */}
              <div className="pt-2 border-t border-[#292c37] flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Available Learning Modules:
                </span>
                <div className="flex items-center gap-2">
                  {SOFTWARE_MODULES.map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => handleModuleClick(mod.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        (currentModule === "reading" && mod.id === "1") ||
                        (currentModule === "dashboard" && mod.id === "0")
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-[#1e2027] hover:bg-[#282a35] text-slate-300 border border-[#292c37]"
                      }`}
                    >
                      {mod.icon} {mod.name}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* RIGHT SIDE PANEL: SCORES, PERFORMANCE & ANALYTICS */}
            <aside className="w-full xl:w-[380px] shrink-0 flex flex-col gap-5">
              
              {/* Card 1: Fluency Rate Card */}
              <div className="rounded-[24px] bg-[#1e2027] p-5 border border-[#292c37] shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-slate-400 tracking-wide uppercase">
                      Fluency Rate
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-black text-white tracking-tight">87°</span>
                      <span className="text-xs font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded-full shadow-sm">
                        +4 today
                      </span>
                    </div>
                  </div>

                  {/* Gauge Arc Graphic */}
                  <div className="relative w-20 h-16 flex items-center justify-center">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#282b36]"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-blue-500"
                        strokeDasharray="87, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-[11px] font-black text-blue-400">
                      87%
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Your speech clarity and intonation increased because of your recent reading session.{" "}
                  <strong className="text-white font-extrabold">Keep practicing</strong> to reach the C1 level!
                </p>

                {/* Bottom Call to Action inside Card */}
                <div className="mt-4 bg-[#16171d] rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-sm border border-[#292c37]">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <span className="text-[11px] font-bold text-slate-200 leading-tight">
                      Master 10 new advanced collocations
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab("reading")}
                    className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md transition-colors shrink-0 cursor-pointer"
                    title="Start Exercise"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4.5 3.5a1 1 0 011.5-.866l10 5.5a1 1 0 010 1.732l-10 5.5A1 1 0 014.5 14.5v-11z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Card 2: Speaking Performance Bar Chart (Fabric Consumption style in screenshot) */}
              <div className="rounded-[24px] bg-[#1e2027] border border-[#292c37] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wide">
                    Speaking Performance
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-[#16171d] flex items-center justify-center text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                    🎧
                  </div>
                  <span className="text-2xl font-black text-white">12 841</span>
                  <span className="text-xs text-slate-400 font-medium">Monthly vocal words</span>
                </div>

                {/* Vertical Bar Chart matching the blue bars in reference image */}
                <div className="flex items-end justify-between gap-2 h-24 pt-2 px-1">
                  {[
                    { month: "DEC", val: 55 },
                    { month: "JAN", val: 78 },
                    { month: "FEB", val: 42 },
                    { month: "MAR", val: 92 },
                    { month: "APR", val: 68 },
                    { month: "MAY", val: 96 },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-full bg-[#16171d] rounded-full h-full flex items-end">
                        <div
                          style={{ height: `${bar.val}%` }}
                          className="w-full rounded-full bg-blue-500 hover:bg-blue-400 transition-all cursor-pointer"
                          title={`${bar.month}: ${bar.val}% score`}
                        ></div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Top Performers / Peer Leaderboard */}
              <div className="rounded-[24px] bg-[#1e2027] border border-[#292c37] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wide">
                    Top Performers
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Weekly CEFR</span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      name: "Bessie Cooper",
                      status: "Online",
                      score: "4.8",
                      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face",
                    },
                    {
                      name: "Albert Flores",
                      status: "Online",
                      score: "4.7",
                      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
                    },
                    {
                      name: "Guy Hawkins",
                      status: "2 minutes ago",
                      score: "4.4",
                      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face",
                    },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#292c37]"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{user.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            {user.status === "Online" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            )}
                            {user.status}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-blue-400">{user.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 4: Accent & Region Targeting */}
              <div className="rounded-[24px] bg-[#1e2027] border border-[#292c37] p-4 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#16171d] border border-[#292c37] flex items-center justify-center text-xl">
                    🇺🇸
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Accent</span>
                    <span className="text-xs font-extrabold text-white">General American</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                    93% Match
                  </span>
                </div>
              </div>

            </aside>
          </main>
    </>
}