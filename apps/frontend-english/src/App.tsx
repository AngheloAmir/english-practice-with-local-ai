import SideNavigation from "./components/navigation/SideNavigation";
import DrawerNavigation from "./components/navigation/DrawerNavigation";
import Header from "./components/Header";
import Sample from "./modules/Sample";
import Dashboard from "./modules/dashboard";
import Grammar from "./modules/grammar";
import Speech from "./modules/speech";
import { useApp } from "./state/app";

export default function App() {
  const currentmodule = useApp.use.currentModule();

  function renderModule() {
    switch ( currentmodule ) {
      case "dashboard":  return <Dashboard />;
      case "grammar":    return <Grammar />;
      case "speechshadowing": return <Speech />
      default:           return <Sample />;
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#121316] font-sans antialiased text-slate-100 selection:bg-blue-600 selection:text-white flex flex-col">
       <Header />
       <DrawerNavigation />

       <div className="flex md:gap-4 w-full flex-1 min-h-0 px-2 sm:px-3 md:pl-0 md:pr-4 pb-2 sm:pb-3">
         <SideNavigation />

         <div className="flex-1 min-h-0 overflow-y-auto">
           {renderModule()}
         </div>

       </div>
    </div>
  );
}