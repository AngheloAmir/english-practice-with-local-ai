import { useApp } from "../state/app";

export default function Navigation() {
    const currentModuleID = useApp.use.currentModuleID();
    const setCurrentModuleID = useApp.use.setCurrentModuleID();
    const activeTab = currentModuleID === "1" ? "reading" : "chat";

    return (
        <aside className="flex flex-col items-center justify-between py-4 px-1.5 w-14 sm:w-16 shrink-0">
            <div className="flex flex-col items-center gap-7">
              {/* Rate / Score Nav */}
              <button
                onClick={() => setCurrentModuleID("0")}
                title="Fluency Rate"
                className="group flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold tracking-wider uppercase">RATE</span>
              </button>

              {/* Overview / Conversation Icon (Selected with white circular badge as in screenshot) */}
              <button
                onClick={() => setCurrentModuleID("0")}
                title="AI Conversation"
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md ${
                    activeTab === "chat"
                      ? "bg-white text-[#334e57] shadow-white/20 scale-105"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <span className={`text-[9px] font-extrabold tracking-wider uppercase ${activeTab === "chat" ? "text-white" : "text-white/60"}`}>
                  OVERVIEW
                </span>
              </button>

              {/* Reading Practice Module Icon */}
              <button
                onClick={() => setCurrentModuleID("1")}
                title="Reading Practice"
                className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors group"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    activeTab === "reading"
                      ? "bg-white text-[#334e57] shadow-lg scale-105"
                      : "hover:bg-white/10"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className={`text-[9px] font-bold tracking-wider uppercase ${activeTab === "reading" ? "text-white font-extrabold" : "text-white/60"}`}>
                  READING
                </span>
              </button>

              {/* Reports / Feedback */}
              <button
                onClick={() => setCurrentModuleID("0")}
                title="Reports & Feedback"
                className="group flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold tracking-wider uppercase">REPORTS</span>
              </button>

              {/* Settings */}
              <button
                title="Settings"
                className="group flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold tracking-wider uppercase">SETTINGS</span>
              </button>
            </div>

            {/* Bottom Profile Avatar */}
            <div className="relative group cursor-pointer pt-4">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face"
                alt="Guy Hawkins"
                className="w-9 h-9 rounded-xl border-2 border-white/20 object-cover shadow-md group-hover:border-white transition-all"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#3a5661] rounded-full"></span>
            </div>
          </aside>
    )
}
