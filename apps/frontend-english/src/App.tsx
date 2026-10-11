import Navigation from "./state/components/Navigation";
import Header from "./state/components/Header";
import Sample from "./state/modules/Sample";

export default function App() {
  return (
    <div className="min-h-screen bg-[#334e57] flex flex-col justify-center items-center p-3 sm:p-5 md:p-8 font-sans antialiased text-slate-800 selection:bg-[#1a7f8b] selection:text-white">
      {/* Outer Application Frame matching the dark teal aesthetic */}
      <div className="w-full max-w-[1380px] bg-[#3a5661] rounded-[32px] sm:rounded-[38px] p-3 sm:p-6 shadow-2xl border border-white/10 flex flex-col gap-4 text-white">

        <Header />

        <div className="flex gap-2 sm:gap-4 w-full">
          <Navigation />

          {/* Large Inner Canvas (White with rounded corners, matching the reference photo) */}
          <Sample />
        </div>

      </div>
    </div>
  );
}