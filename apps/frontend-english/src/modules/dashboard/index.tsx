import { useState } from "react";
import DashboardMetrics from "./DashboardMetrics";
import DashboardTrendChart from "./DashboardTrendChart";

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("weekly");

  return (
    <main className="flex-1 bg-[#16171d] border border-[#23252e] rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 lg:p-7 shadow-2xl flex flex-col gap-6 overflow-y-auto min-h-full">
      <DashboardMetrics timeframe={timeframe} setTimeframe={setTimeframe} />
      <DashboardTrendChart timeframe={timeframe} />
    </main>
  );
}
