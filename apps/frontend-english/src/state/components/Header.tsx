import { useApp } from "../app";

export default function Header() {
    const currentModuleID = useApp.use.currentModuleID();
    const setCurrentModuleID = useApp.use.setCurrentModuleID();
    const activeTab = currentModuleID === "1" ? "reading" : "chat";

    return (
        <header className="flex flex-wrap items-center justify-between gap-4 px-2 sm:px-4 py-2">
            {/* Left: App Logo & Back Button */}
            <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2.5">
                    <img src="/brand/icon512.png" width={32} height={32} />

                    <span className="text-xl font-bold tracking-tight text-white">
                        Circle<span className="text-[#5ce4d3] text-sm font-medium ml-1">AI</span>
                    </span>
                </div>

                <button
                    onClick={() => setCurrentModuleID("0")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold tracking-wide transition-all duration-200 border border-white/10"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
            </div>

            {/* Center Navigation Tabs */}
            <nav className="flex items-center gap-6 sm:gap-10 text-xs sm:text-sm font-bold tracking-wider uppercase text-white/70">
                <button
                    onClick={() => setCurrentModuleID("0")}
                    className={`transition-colors pb-1 relative ${activeTab === "chat"
                            ? "text-white font-extrabold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-[#5ce4d3] after:rounded-full"
                            : "hover:text-white"
                        }`}
                >
                    DASHBOARD
                </button>
                <button
                    onClick={() => setCurrentModuleID("1")}
                    className={`transition-colors pb-1 relative ${activeTab === "reading"
                            ? "text-white font-extrabold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-[#5ce4d3] after:rounded-full"
                            : "hover:text-white"
                        }`}
                >
                    READING LAB
                </button>
                <button
                    //onClick={() => setActiveTab("chat")}
                    className="hidden md:inline-block transition-colors hover:text-white"
                >
                    INSIGHTS
                </button>
                <button
                    //onClick={() => setActiveTab("chat")}
                    className="hidden lg:inline-block transition-colors hover:text-white"
                >
                    CHANNELS
                </button>
            </nav>


        </header>
    )
}