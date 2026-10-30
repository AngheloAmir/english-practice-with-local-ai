import { useState, useMemo } from "react";
import { useApp } from "../../state/app";
import type { DailyScore } from "../../state/_types";

interface DashboardTrendChartProps {
  timeframe: "weekly" | "monthly";
}

type MetricType = "score" | "duration";

export default function DashboardTrendChart({ timeframe }: DashboardTrendChartProps) {
  const modulescores = useApp.use.modulescores();

  const [activeMetric, setActiveMetric] = useState<MetricType>("score");
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    dayLabel: string;
    grammarScore?: number;
    grammarDuration?: number;
    shadowingScore?: number;
    shadowingDuration?: number;
    x: number;
    y: number;
  } | null>(null);

  // Sliced data based on timeframe
  const filteredModules = useMemo(() => {
    const daysCount = timeframe === "weekly" ? 7 : 30;
    return modulescores.map((mod) => ({
      ...mod,
      dailyscores: mod.dailyscores.slice(-daysCount),
    }));
  }, [modulescores, timeframe]);

  const timeDates = useMemo(() => {
    if (!filteredModules.length || !filteredModules[0].dailyscores.length) return [];
    return filteredModules[0].dailyscores.map((d) => d.date);
  }, [filteredModules]);

  const grammarMod = filteredModules.find((m) => m.name === "grammar");
  const shadowingMod = filteredModules.find((m) => m.name === "speechshadowing");

  // Helper: Format date string
  const formatDayLabel = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (timeframe === "weekly") {
        return d.toLocaleDateString("en-US", { weekday: "short" });
      }
      return `${d.getMonth() + 1}/${d.getDate()}`;
    } catch {
      return dateStr;
    }
  };

  // SVG chart dimensions matching clean landscape canvas
  const chartWidth = 960;
  const chartHeight = 240;
  const padX = 50;
  const padY = 24;
  const innerW = chartWidth - padX * 2;
  const innerH = chartHeight - padY * 2;

  const lineChartData = useMemo(() => {
    if (!timeDates.length) return { grammarPoints: [], shadowingPoints: [], minVal: 60, maxVal: 100 };

    const getVal = (scoreObj?: DailyScore) => {
      if (!scoreObj) return 0;
      return activeMetric === "score" ? scoreObj.score : scoreObj.duration;
    };

    let maxVal = activeMetric === "score" ? 100 : 60;
    let minVal = activeMetric === "score" ? 60 : 0;

    timeDates.forEach((_, i) => {
      const gVal = getVal(grammarMod?.dailyscores[i]);
      const sVal = getVal(shadowingMod?.dailyscores[i]);
      if (activeMetric === "duration") {
        if (gVal > maxVal) maxVal = Math.ceil(gVal / 10) * 10;
        if (sVal > maxVal) maxVal = Math.ceil(sVal / 10) * 10;
      }
    });

    const range = maxVal - minVal || 1;
    const stepX = timeDates.length > 1 ? innerW / (timeDates.length - 1) : innerW;

    const grammarPoints = timeDates.map((date, i) => {
      const scoreObj = grammarMod?.dailyscores[i];
      const val = getVal(scoreObj);
      const x = padX + i * stepX;
      const y = padY + innerH - ((val - minVal) / range) * innerH;
      return { x, y, val, date, scoreObj };
    });

    const shadowingPoints = timeDates.map((date, i) => {
      const scoreObj = shadowingMod?.dailyscores[i];
      const val = getVal(scoreObj);
      const x = padX + i * stepX;
      const y = padY + innerH - ((val - minVal) / range) * innerH;
      return { x, y, val, date, scoreObj };
    });

    return { grammarPoints, shadowingPoints, minVal, maxVal };
  }, [timeDates, grammarMod, shadowingMod, activeMetric, innerW, innerH]);

  const makePath = (points: { x: number; y: number }[]) => {
    if (!points.length) return "";
    return points.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, "");
  };

  const grammarPath = makePath(lineChartData.grammarPoints);
  const shadowingPath = makePath(lineChartData.shadowingPoints);

  // Gradient area underneath the lower curve to match the reference graphic
  const combinedAreaPath =
    lineChartData.shadowingPoints.length > 0
      ? `${shadowingPath} L ${lineChartData.shadowingPoints[lineChartData.shadowingPoints.length - 1].x} ${
          padY + innerH
        } L ${lineChartData.shadowingPoints[0].x} ${padY + innerH} Z`
      : "";

  return (
    <div className="bg-[#1e2027] rounded-[24px] border border-[#292c37] p-5 sm:p-6 shadow-sm flex flex-col gap-3">
      {/* Top controls: Metric toggle & legends aligned to the right (matches reference image) */}
      <div className="flex items-center justify-end gap-3 pb-1">
        {/* Metric Toggle: Score (%) vs Duration (Mins) */}
        <div className="flex items-center bg-[#16171d] p-1 rounded-xl text-xs font-bold border border-[#292c37]">
          <button
            onClick={() => setActiveMetric("score")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeMetric === "score"
                ? "bg-blue-600 text-white shadow-xs font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🎯 Score (%)
          </button>
          <button
            onClick={() => setActiveMetric("duration")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeMetric === "duration"
                ? "bg-blue-600 text-white shadow-xs font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ⏱️ Duration (mins)
          </button>
        </div>

        {/* Module Legends */}
        <div className="flex items-center gap-3 text-xs font-bold ml-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
            <span className="text-slate-300">Grammar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]"></span>
            <span className="text-slate-300">Shadowing</span>
          </div>
        </div>
      </div>

      {/* SVG Line Chart Canvas */}
      <div className="relative w-full overflow-x-auto select-none pt-2">
        <svg
          className="w-full h-64 sm:h-72"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartBlueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#1e2027" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padY + innerH * ratio;
            const valueLabel = Math.round(
              lineChartData.maxVal - ratio * (lineChartData.maxVal - lineChartData.minVal)
            );
            return (
              <g key={idx}>
                <line
                  x1={padX}
                  y1={y}
                  x2={chartWidth - padX}
                  y2={y}
                  stroke="#282b36"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={padX - 10}
                  y={y + 3.5}
                  fill="#8b949e"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  {valueLabel}
                  {activeMetric === "score" ? "%" : "m"}
                </text>
              </g>
            );
          })}

          {/* Shaded Area Fill below the curves */}
          {combinedAreaPath && <path d={combinedAreaPath} fill="url(#chartBlueGrad)" />}

          {/* Smooth Trend Lines */}
          {grammarPath && (
            <path
              d={grammarPath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}
          {shadowingPath && (
            <path
              d={shadowingPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {/* Data points & Interactive Hover Targets */}
          {lineChartData.grammarPoints.map((pt, i) => {
            const shadowPt = lineChartData.shadowingPoints[i];
            return (
              <g key={i}>
                {/* Grammar point dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="#1e2027"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  className="transition-all hover:r-6 cursor-pointer"
                />

                {/* Shadowing point dot */}
                {shadowPt && (
                  <circle
                    cx={shadowPt.x}
                    cy={shadowPt.y}
                    r="4.5"
                    fill="#1e2027"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    className="transition-all hover:r-6 cursor-pointer"
                  />
                )}

                {/* Vertical hover hit-area */}
                <rect
                  x={pt.x - 18}
                  y={padY}
                  width={36}
                  height={innerH}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    const gScore = grammarMod?.dailyscores[i];
                    const sScore = shadowingMod?.dailyscores[i];
                    setHoveredPoint({
                      date: pt.date,
                      dayLabel: formatDayLabel(pt.date),
                      grammarScore: gScore?.score,
                      grammarDuration: gScore?.duration,
                      shadowingScore: sScore?.score,
                      shadowingDuration: sScore?.duration,
                      x: pt.x,
                      y: Math.min(pt.y, shadowPt ? shadowPt.y : pt.y),
                    });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}

          {/* X-Axis Day Labels */}
          {lineChartData.grammarPoints.map((pt, i) => {
            if (timeframe === "monthly" && i % 4 !== 0 && i !== lineChartData.grammarPoints.length - 1) {
              return null;
            }
            return (
              <text
                key={i}
                x={pt.x}
                y={chartHeight - 4}
                fill="#8b949e"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
              >
                {formatDayLabel(pt.date)}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-[#13141a]/95 backdrop-blur-md text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-[#2e313f]"
            style={{
              left: `${(hoveredPoint.x / chartWidth) * 100}%`,
              top: `10%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="font-bold text-[11px] text-slate-300 pb-1 mb-1 border-b border-white/10">
              {hoveredPoint.date} ({hoveredPoint.dayLabel})
            </div>
            <div className="flex flex-col gap-1 text-[11px]">
              <div className="flex items-center justify-between gap-3 text-blue-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span> Grammar:
                </span>
                <span className="font-extrabold">
                  {hoveredPoint.grammarScore}% • {hoveredPoint.grammarDuration}m
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sky-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span> Shadowing:
                </span>
                <span className="font-extrabold">
                  {hoveredPoint.shadowingScore}% • {hoveredPoint.shadowingDuration}m
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
