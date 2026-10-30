import { useApp } from "../../state/app";
import { NavigationModules } from "../../state/_navs";

export default function DrawerNavigation() {
  const isDrawerOpen = useApp.use.isDrawerOpen();
  const setIsDrawerOpen = useApp.use.setIsDrawerOpen();
  const currentModule = useApp.use.currentModule();
  const setCurrentModule = useApp.use.setCurrentModule();

  if (!isDrawerOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer Container */}
      <aside className="relative w-64 max-w-[80vw] bg-[#283e46] text-white flex flex-col h-full shadow-2xl p-5 z-10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <img src="/brand/icon512.png" alt="Logo" width={26} height={26} />
            <span className="font-bold text-base tracking-tight">Navigation</span>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-2 overflow-y-auto">
          {NavigationModules.map((item) => {
            const isActive = currentModule === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setCurrentModule(item.name);
                  setIsDrawerOpen(false);
                }}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
                  isActive
                    ? "bg-white text-[#334e57] font-bold shadow-md"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className={`shrink-0 ${isActive ? "text-[#334e57]" : "text-white/70"}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}

