import SpeechHeaderControls from "./SpeechHeaderControls";
import SpeechPassageCard from "./SpeechPassageCard";
import SpeechActionGrid from "./SpeechActionGrid";
import SpeechRecordingPlayer from "./SpeechRecordingPlayer";

export default function Speech() {
  return (
    <main className="flex-1 bg-[#fcfdfe] rounded-[28px] sm:rounded-[34px] p-4 sm:p-6 lg:p-7 shadow-2xl flex flex-col gap-6 overflow-y-auto min-h-full">
      <div className="w-full max-w-4xl xl:max-w-5xl mx-auto flex flex-col gap-6">
        <SpeechHeaderControls />
        <SpeechPassageCard />
        <SpeechActionGrid />
        <SpeechRecordingPlayer />
      </div>
    </main>
  );
}
