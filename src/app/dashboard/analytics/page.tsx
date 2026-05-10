"use client";

import { useState } from "react";
import { analyzeContentLibraryReel, type ContentLibraryAnalysis } from "./actions";

const KPI_CARDS = [
  {
    label: "Total Views",
    value: "284,920",
    change: "+12.4%",
    up: true,
    data: [40, 55, 48, 70, 62, 88, 95, 102, 98, 115, 130, 142],
  },
  {
    label: "Engagements",
    value: "18,340",
    change: "+8.7%",
    up: true,
    data: [20, 28, 22, 35, 30, 44, 48, 52, 49, 58, 66, 72],
  },
  {
    label: "Followers",
    value: "2,780",
    change: "-1.2%",
    up: false,
    data: [80, 82, 81, 83, 82, 84, 83, 82, 81, 80, 81, 79],
  },
];

const FORMAT_PERF = [
  { label: "Talking Head", pct: 72 },
  { label: "Rant", pct: 58 },
  { label: "Trend", pct: 44 },
  { label: "Tutorial", pct: 38 },
  { label: "Behind the scenes", pct: 31 },
];

const ENGAGEMENT_BREAKDOWN = [
  { label: "Likes", pct: 54, count: "9,900" },
  { label: "Comments", pct: 12, count: "2,200" },
  { label: "Saves", pct: 22, count: "4,000" },
  { label: "Shares", pct: 12, count: "2,240" },
];

const CONTENT_LIBRARY = [
  {
    id: 1,
    format: "TALKING HEAD",
    formatColor: "bg-orange-500",
    date: "2026-05-08",
    title: "De ce eșuezi la dietă deși ești disciplinat la muncă",
    views: "14,200",
    likes: "892",
    comments: "67",
  },
  {
    id: 2,
    format: "RANT",
    formatColor: "bg-blue-600",
    date: "2026-05-06",
    title: "Cardio-ul de 1 oră pe zi nu te slăbește. Iată de ce.",
    views: "22,100",
    likes: "1,340",
    comments: "124",
  },
  {
    id: 3,
    format: "TUTORIAL",
    formatColor: "bg-purple-600",
    date: "2026-05-04",
    title: "Protocolul de 3 mese fără să numeri calorii",
    views: "9,800",
    likes: "520",
    comments: "43",
  },
  {
    id: 4,
    format: "TREND",
    formatColor: "bg-emerald-600",
    date: "2026-05-01",
    title: "Ce mi-a zis medicul după analizele de la 30 ani",
    views: "31,400",
    likes: "2,100",
    comments: "198",
  },
  {
    id: 5,
    format: "TALKING HEAD",
    formatColor: "bg-orange-500",
    date: "2026-04-29",
    title: "Cortizolul e motivul real al burții tale",
    views: "18,600",
    likes: "1,020",
    comments: "89",
  },
  {
    id: 6,
    format: "BEHIND SCENES",
    formatColor: "bg-zinc-500",
    date: "2026-04-27",
    title: "Ziua mea de antrenament la sală — fără BS",
    views: "7,200",
    likes: "410",
    comments: "31",
  },
];

export default function AnalyticsPage() {
  const [analysedId, setAnalysedId] = useState<number | null>(null);
  const [analysisData, setAnalysisData] = useState<ContentLibraryAnalysis | null>(null);
  const [analysingId, setAnalysingId] = useState<number | null>(null);

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] text-built-red font-mono uppercase tracking-widest mb-1">
          Dashboard · Analytics
        </p>
        <h1 className="text-4xl font-display tracking-[0.06em] text-zinc-100">
          BUILT DASHBOARD
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Performanța contului tău Instagram · ultimele 30 de zile
        </p>
      </div>

      {/* THIS WEEK'S FOCUS */}
      <div className="mb-8 p-5 bg-[#111111] border border-white/10 rounded-xl">
        <p className="text-[10px] text-built-red font-mono uppercase tracking-widest mb-2">
          THIS WEEK&apos;S FOCUS
        </p>
        <p className="text-zinc-300 text-sm leading-relaxed">
          Două reels de tip <strong className="text-zinc-100">Talking Head</strong> pe săptămână ·
          Crește save rate-ul la <strong className="text-zinc-100">&gt;5%</strong> pe fiecare post ·
          Obiectiv followeri mai: <strong className="text-zinc-100">+150</strong>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {KPI_CARDS.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[#111111] border border-white/10 rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">
                  {kpi.label}
                </p>
                <p className="text-3xl font-display tracking-wider text-zinc-100">
                  {kpi.value}
                </p>
              </div>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                  kpi.up
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-built-red/10 text-built-red"
                }`}
              >
                {kpi.change}
              </span>
            </div>
            <div className="h-10">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <polyline
                  points={kpi.data
                    .map(
                      (v, i) =>
                        `${(i / (kpi.data.length - 1)) * 100},${30 - (v / Math.max(...kpi.data)) * 28}`
                    )
                    .join(" ")}
                  fill="none"
                  stroke={kpi.up ? "#10b981" : "#C0392B"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Views Over Time */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-zinc-200">Views Over Time</p>
            <div className="flex gap-1">
              <button className="text-[10px] px-2 py-1 rounded bg-built-red/20 text-built-red font-mono">
                Daily
              </button>
              <button className="text-[10px] px-2 py-1 rounded text-zinc-500 hover:bg-white/5 font-mono">
                Cumulative
              </button>
            </div>
          </div>
          <div className="h-36 flex items-end gap-1">
            {[40, 65, 52, 80, 75, 95, 88, 110, 102, 125, 118, 142, 130, 155].map(
              (v, i) => (
                <div
                  key={i}
                  className="flex-1 bg-built-red/20 rounded-sm hover:bg-built-red/40 transition-colors"
                  style={{ height: `${(v / 155) * 100}%` }}
                />
              )
            )}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-zinc-600 font-mono">
            <span>22 Apr</span>
            <span>10 Mai</span>
          </div>
        </div>

        {/* Engagement Breakdown */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <p className="text-sm font-semibold text-zinc-200 mb-4">
            Engagement Breakdown
          </p>
          <div className="space-y-3">
            {ENGAGEMENT_BREAKDOWN.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-zinc-400">{item.label}</span>
                  <div className="flex gap-3">
                    <span className="text-zinc-500">{item.count}</span>
                    <span className="text-zinc-200 font-mono w-8 text-right">
                      {item.pct}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full">
                  <div
                    className="h-full bg-built-red rounded-full"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Format Performance */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-5 mb-8">
        <p className="text-sm font-semibold text-zinc-200 mb-4">
          Format Performance
        </p>
        <div className="space-y-2.5">
          {FORMAT_PERF.map((f) => (
            <div key={f.label} className="flex items-center gap-4">
              <span className="text-[12px] text-zinc-400 w-40">{f.label}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full">
                <div
                  className="h-full bg-built-red rounded-full"
                  style={{ width: `${f.pct}%` }}
                />
              </div>
              <span className="text-[12px] text-zinc-200 font-mono w-8 text-right">
                {f.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content Library */}
      <div>
        <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-4 font-mono">
          Content Library
        </p>
        <div className="grid grid-cols-3 gap-4">
          {CONTENT_LIBRARY.map((reel) => (
            <div
              key={reel.id}
              className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
            >
              {/* Thumbnail placeholder */}
              <div className="h-32 bg-[#1a1a1a] flex items-center justify-center relative">
                <span className="text-4xl opacity-10">▶</span>
                <span
                  className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded ${reel.formatColor} text-white`}
                >
                  {reel.format}
                </span>
              </div>
              <div className="p-3">
                <p className="text-[10px] text-zinc-600 font-mono mb-1">
                  {reel.date}
                </p>
                <p className="text-[12px] text-zinc-200 leading-snug mb-2 line-clamp-2">
                  {reel.title}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-[10px] text-zinc-500 font-mono">
                    <span>▶ {reel.views}</span>
                    <span>♥ {reel.likes}</span>
                    <span>✦ {reel.comments}</span>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (analysedId === reel.id) {
                        setAnalysedId(null);
                        setAnalysisData(null);
                        return;
                      }
                      setAnalysingId(reel.id);
                      const result = await analyzeContentLibraryReel(
                        reel.title, reel.format, reel.views, reel.likes, reel.comments
                      );
                      setAnalysingId(null);
                      if (result.ok) {
                        setAnalysedId(reel.id);
                        setAnalysisData(result.analysis);
                      }
                    }}
                    className="text-[10px] text-built-red border border-built-red/30 px-2 py-0.5 rounded hover:bg-built-red/10 transition-colors"
                  >
                    {analysingId === reel.id ? "..." : analysedId === reel.id ? "✓ Analysed" : "Analyse"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Inline analysis panel */}
        {analysedId && analysisData && (
          <div className="mt-4 bg-[#0d0d0d] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  analysisData.verdict === "Exceptional" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                  analysisData.verdict === "Strong" ? "text-blue-400 bg-blue-400/10 border-blue-400/20" :
                  analysisData.verdict === "Good" ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" :
                  "text-built-red bg-built-red/10 border-built-red/20"
                }`}>
                  {analysisData.verdict}
                </span>
                <span className="text-zinc-600 text-[11px] font-mono">
                  Score: {analysisData.score} · Hook: {analysisData.hook_score}
                </span>
              </div>
              <button
                onClick={() => { setAnalysedId(null); setAnalysisData(null); }}
                className="text-[11px] text-zinc-600 border border-white/10 px-2 py-0.5 rounded hover:bg-white/5"
              >
                Re-analyse
              </button>
            </div>

            <p className="text-zinc-400 text-[12px] leading-relaxed">{analysisData.performance_summary}</p>

            <div>
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-2">What Worked</p>
              <ul className="space-y-1.5">
                {analysisData.what_worked.map((item, i) => (
                  <li key={i} className="flex gap-2 text-[12px] text-zinc-300">
                    <span className="text-built-red shrink-0">▸</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1">Audience Fit</p>
              <p className="text-zinc-400 text-[12px]">{analysisData.audience_fit}</p>
            </div>

            <div className="border-l-4 border-l-built-red pl-4">
              <p className="text-[10px] text-built-red font-mono uppercase tracking-widest mb-1">Adaptation Brief</p>
              <p className="text-zinc-300 text-[12px] leading-relaxed">{analysisData.adaptation_brief}</p>
            </div>

            <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-2">Stronger Hook</p>
              <p className="text-zinc-200 text-[13px] font-medium leading-relaxed">&ldquo;{analysisData.stronger_hook}&rdquo;</p>
              <button
                onClick={() => navigator.clipboard.writeText(analysisData.stronger_hook)}
                className="mt-2 text-[10px] text-zinc-500 border border-white/10 px-2 py-0.5 rounded hover:bg-white/5"
              >
                Copy Hook
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
