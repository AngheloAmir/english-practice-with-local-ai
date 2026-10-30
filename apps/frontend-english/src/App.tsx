import SideNavigation from "./components/navigation/SideNavigation";
import DrawerNavigation from "./components/navigation/DrawerNavigation";
import Header from "./components/Header";
import Sample from "./modules/Sample";

export default function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#334e57] font-sans antialiased text-slate-800 selection:bg-[#1a7f8b] selection:text-white flex flex-col">
       <Header />
       <DrawerNavigation />

       <div className="flex md:gap-4 w-full flex-1 min-h-0 px-2 sm:px-3 md:pl-0 md:pr-4 pb-2 sm:pb-3">
         <SideNavigation />

         {/* Large Inner Canvas (White with rounded corners, matching the reference photo) */}
         <div className="flex-1 min-h-0 overflow-y-auto">
           <Sample />
         </div>
       </div>
    </div>
  );
}