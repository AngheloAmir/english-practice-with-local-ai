import { useMemo } from "react";
import { useApp } from "../../state/app";

interface DashboardMetricsProps {
  timeframe: "weekly" | "monthly";
  setTimeframe: (tf: "weekly" | "monthly") => void;
}

export default function DashboardMetrics({ timeframe, setTimeframe }: DashboardMetricsProps) {
  const modulescores = useApp.use.modulescores();

  const stats = useMemo(() => {
    let totalMinutes = 0;
    let totalScoreSum = 0;
    let totalScoreCount = 0;

    const daysCount = timeframe === "weekly" ? 7 : 30;

    modulescores.forEach((mod) => {
      const sliced = mod.dailyscores.slice(-daysCount);
      sliced.forEach((d) => {
        totalMinutes += d.duration;
        totalScoreSum += d.score;
        totalScoreCount += 1;
      });
    });

    const avgScore = totalScoreCount > 0 ? Math.round(totalScoreSum / totalScoreCount) : 0;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return {
      totalTime: timeFormatted,
      avgScore,
      totalSessions: totalScoreCount,
    };
  }, [modulescores, timeframe]);

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* 3 Metric Cards matching reference design */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 flex-1 max-w-4xl">
        {/* Card 1: Total Practice Time */}
        <div className="bg-[#1e2027] border border-[#292c37] rounded-2xl p-4 text-white shadow-sm flex items-center gap-3.5 min-h-[92px]">
          <div className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 text-base font-bold">
            ⏱️
          </div>
          <div className="flex flex-col justify-between flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Practice Time
            </span>
            <div className="mt-0.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {stats.totalTime}
              </span>
              <div className="text-[10px] sm:text-[11px] text-blue-400 font-medium mt-0.5 flex items-center gap-1">
                <span>↗</span> +18% vs previous period
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="bg-[#1e2027] border border-[#292c37] rounded-2xl p-4 shadow-xs flex items-center gap-3.5 min-h-[92px]">
          <div className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 text-base font-bold">
            🎯
          </div>
          <div className="flex flex-col justify-between flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Average Score
            </span>
            <div className="mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {stats.avgScore}%
              </span>
              <div className="text-[10px] sm:text-[11px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                <span>↑</span> +3.5% accuracy gain
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Sessions Completed */}
        <div className="bg-[#1e2027] border border-[#292c37] rounded-2xl p-4 shadow-xs flex items-center gap-3.5 min-h-[92px]">
          <div className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 text-base font-bold">
            🏆
          </div>
          <div className="flex flex-col justify-between flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Sessions Completed
            </span>
            <div className="mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {stats.totalSessions}
              </span>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">
                {timeframe === "weekly" ? "Across 7 days" : "Across 30 days"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top-Right Timeframe Switcher */}
      <div className="self-end md:self-start flex items-center bg-[#1e2027] p-1 rounded-2xl border border-[#292c37] shrink-0">
        <button
          onClick={() => setTimeframe("weekly")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            timeframe === "weekly"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          📅 Weekly View
        </button>
        <button
          onClick={() => setTimeframe("monthly")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            timeframe === "monthly"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          🗓️ Monthly View
        </button>
      </div>
    </div>
  );
}
