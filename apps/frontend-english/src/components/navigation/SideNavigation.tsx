import { useApp } from "../../state/app";
import { NavigationModules } from "../../state/_navs";

export default function SideNavigation() {
  const currentModule    = useApp.use.currentModule();
  const setCurrentModule = useApp.use.setCurrentModule();

  return (
    <aside className="hidden md:flex flex-col items-center py-4 px-2 ml-4 w-14 sm:w-16 shrink-0 gap-6">
      {NavigationModules.map((item) => {
        const isActive = currentModule === item.name;
        return (
          <button
            key={item.name}
            onClick={() => setCurrentModule(item.name)}
            title={item.label}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all shadow-md ${
                isActive
                  ? "bg-white text-[#334e57] shadow-white/20 scale-105"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {item.icon}
            </div>
            <span
              className={`text-[9px] font-extrabold tracking-wider uppercase text-center ${
                isActive ? "text-white" : "text-white/60 group-hover:text-white"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
}

