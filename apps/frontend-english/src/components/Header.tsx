
import { useApp } from "../state/app";

export default function Header() {
    const toggleDrawer = useApp.use.toggleDrawer();

    return (
        <header className="flex flex-wrap items-center justify-between gap-4 px-2 sm:px-4 py-2 md:py-4">

            <div className="flex items-center gap-2 sm:gap-6">
                <button
                    onClick={toggleDrawer}
                    className="md:hidden p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    title="Open Menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="flex items-center gap-2.5">
                    <img src="/brand/icon512.png" width={32} height={32} />
                    <span className="text-xl font-bold tracking-tight text-white">
                        Communication Practice
                    </span>
                </div>
            </div>


            <nav className="flex items-center gap-6 sm:gap-10 text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-400">
                <button
                    //onClick={() => setActiveTab("chat")}
                    className="hidden lg:inline-block transition-colors hover:text-blue-400 cursor-pointer"
                >
                    ABOUT
                </button>
            </nav>


        </header>
    )
}