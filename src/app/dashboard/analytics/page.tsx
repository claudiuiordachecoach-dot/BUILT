"use client";

import { useState, useEffect, useCallback } from "react";
import {
  analyzeContentLibraryReel,
  getTipOfWeek,
  listInstagramMedia,
  syncMyReels,
  type ContentLibraryAnalysis,
} from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaItem = {
  instagram_id: string;
  caption: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  posted_at: string | null;
  thumbnail_url: string | null;
  format_type?: string | null;
};

type ReelCard = {
  id: string;
  format: string;
  date: string;
  title: string;
  views: string;
  viewsRaw: number;
  likes: string;
  likesRaw: number;
  comments: string;
  commentsRaw: number;
  thumbnail_url: string | null;
};

type TimePeriod = "7d" | "1m" | "3m" | "1y";
type ContentTab = "recent" | "top_views" | "top_engagement";
type ChartMode = "daily" | "cumulative";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return iso.split("T")[0];
}

function groupByDay(items: MediaItem[], getValue: (m: MediaItem) => number): { day: string; val: number }[] {
  const map: Record<string, number> = {};
  for (const m of items) {
    const day = formatDate(m.posted_at);
    if (day === "—") continue;
    map[day] = (map[day] ?? 0) + getValue(m);
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, val]) => ({ day, val }));
}

function sparklinePoints(data: number[]): string {
  if (data.length === 0) return "";
  const maxV = Math.max(...data, 1);
  const w = 100;
  const h = 30;
  return data
    .map((v, i) => `${(i / Math.max(data.length - 1, 1)) * w},${h - (v / maxV) * (h - 2)}`)
    .join(" ");
}

function lineChartPath(data: { val: number }[], cumulative: boolean): { path: string; areaPath: string } {
  if (data.length === 0) return { path: "", areaPath: "" };
  const vals = cumulative
    ? data.reduce<number[]>((acc, d, i) => { acc.push((acc[i - 1] ?? 0) + d.val); return acc; }, [])
    : data.map((d) => d.val);
  const maxV = Math.max(...vals, 1);
  const w = 100;
  const h = 60;
  const pts = vals.map((v, i) => ({
    x: (i / Math.max(vals.length - 1, 1)) * w,
    y: h - (v / maxV) * (h - 4),
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath =
    `M ${pts[0].x} ${h} ` +
    pts.map((p) => `L ${p.x} ${p.y}`).join(" ") +
    ` L ${pts[pts.length - 1].x} ${h} Z`;
  return { path, areaPath };
}

function formatPctBadge(pct: number | null): { label: string; up: boolean } {
  if (pct == null) return { label: "—", up: true };
  return { label: `${pct > 0 ? "▲" : "▼"} ${Math.abs(pct).toFixed(1)}%`, up: pct >= 0 };
}

// ─── Static fallback data ─────────────────────────────────────────────────────

const STATIC_SPARKLINE = [40, 55, 48, 70, 62, 88, 95, 102, 98, 115, 130, 142];

const STATIC_LIBRARY: ReelCard[] = [
  {
    id: "s1", format: "TALKING HEAD", date: "2026-05-08",
    title: "De ce eșuezi la dietă deși ești disciplinat la muncă",
    views: "14.2K", viewsRaw: 14200, likes: "892", likesRaw: 892, comments: "67", commentsRaw: 67,
    thumbnail_url: null,
  },
  {
    id: "s2", format: "RANT", date: "2026-05-06",
    title: "Cardio-ul de 1 oră pe zi nu te slăbește. Iată de ce.",
    views: "22.1K", viewsRaw: 22100, likes: "1.3K", likesRaw: 1340, comments: "124", commentsRaw: 124,
    thumbnail_url: null,
  },
  {
    id: "s3", format: "TUTORIAL", date: "2026-05-04",
    title: "Protocolul de 3 mese fără să numeri calorii",
    views: "9.8K", viewsRaw: 9800, likes: "520", likesRaw: 520, comments: "43", commentsRaw: 43,
    thumbnail_url: null,
  },
  {
    id: "s4", format: "TREND", date: "2026-05-01",
    title: "Ce mi-a zis medicul după analizele de la 30 ani",
    views: "31.4K", viewsRaw: 31400, likes: "2.1K", likesRaw: 2100, comments: "198", commentsRaw: 198,
    thumbnail_url: null,
  },
  {
    id: "s5", format: "TALKING HEAD", date: "2026-04-29",
    title: "Cortizolul e motivul real al burții tale",
    views: "18.6K", viewsRaw: 18600, likes: "1K", likesRaw: 1020, comments: "89", commentsRaw: 89,
    thumbnail_url: null,
  },
  {
    id: "s6", format: "BEHIND SCENES", date: "2026-04-27",
    title: "Ziua mea de antrenament la sală — fără BS",
    views: "7.2K", viewsRaw: 7200, likes: "410", likesRaw: 410, comments: "31", commentsRaw: 31,
    thumbnail_url: null,
  },
  {
    id: "s7", format: "TUTORIAL", date: "2026-04-24",
    title: "Cum mănânc 180g proteine fără shake-uri",
    views: "12.3K", viewsRaw: 12300, likes: "670", likesRaw: 670, comments: "55", commentsRaw: 55,
    thumbnail_url: null,
  },
  {
    id: "s8", format: "RANT", date: "2026-04-21",
    title: "Suplimentele nu te salvează dacă nu dormi bine",
    views: "19.5K", viewsRaw: 19500, likes: "1.1K", likesRaw: 1100, comments: "102", commentsRaw: 102,
    thumbnail_url: null,
  },
];

// ─── Format badge colour map ──────────────────────────────────────────────────

function formatBadgeClass(fmt: string): string {
  const f = fmt.toLowerCase();
  if (f.includes("talking")) return "bg-orange-500";
  if (f.includes("rant")) return "bg-blue-600";
  if (f.includes("tutorial")) return "bg-purple-600";
  if (f.includes("trend")) return "bg-emerald-600";
  if (f.includes("behind")) return "bg-zinc-500";
  return "bg-zinc-600";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const pts = sparklinePoints(data);
  if (!pts) return null;
  return (
    <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke={up ? "#3b82f6" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LineChart({ data, mode }: { data: { val: number }[]; mode: ChartMode }) {
  const { path, areaPath } = lineChartPath(data, mode === "cumulative");
  if (!path) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-600 text-[11px] font-mono">
        no data
      </div>
    );
  }
  return (
    <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#blueGrad)" />
      <path d={path} fill="none" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AnalysisPanel({
  data,
  onClose,
}: {
  data: ContentLibraryAnalysis;
  onClose: () => void;
}) {
  const verdictClass =
    data.verdict === "Exceptional"
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
      : data.verdict === "Strong"
      ? "text-built-red bg-built-red/10 border-built-red/20"
      : data.verdict === "Good"
      ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      : "text-red-400 bg-red-400/10 border-red-400/20";

  const perfPct = Math.min(data.score, 100);
  const scriptPct = Math.min(data.hook_score, 100);

  return (
    <div className="mt-4 bg-[#0d0d0d] border border-white/10 rounded-xl p-6 space-y-5">
      {/* Top row */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded border ${verdictClass}`}>
          {data.verdict}
        </span>
        <span className="text-zinc-400 text-[13px]">
          Score: <strong className="text-zinc-100">{data.score}</strong>
        </span>
        <span className="text-zinc-400 text-[13px]">
          Hook Score: <strong className="text-zinc-100">{data.hook_score}</strong>
        </span>
        <button
          onClick={onClose}
          className="ml-auto text-[11px] text-zinc-500 border border-white/10 px-2 py-0.5 rounded hover:bg-white/5 transition-colors"
        >
          Close
        </button>
      </div>

      {/* Score bars */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-[11px] text-zinc-500 mb-1.5">
            <span>Performance</span>
            <span>{perfPct}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full">
            <div className="h-full bg-built-red rounded-full" style={{ width: `${perfPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[11px] text-zinc-500 mb-1.5">
            <span>Script Quality</span>
            <span>{scriptPct}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full">
            <div className="h-full bg-built-red rounded-full" style={{ width: `${scriptPct}%` }} />
          </div>
        </div>
      </div>

      {/* 3-column row */}
      <div className="grid grid-cols-3 gap-4 text-[12px]">
        <div>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-2">HOOK</p>
          <p className="text-zinc-300 leading-relaxed">{data.performance_summary}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-2">WHAT WORKED</p>
          <ul className="space-y-1.5">
            {data.what_worked.slice(0, 3).map((item, i) => (
              <li key={i} className="text-zinc-300 flex gap-1.5">
                <span className="text-built-red shrink-0">▸</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-2">CTA / AUDIENCE FIT</p>
          <p className="text-zinc-300 leading-relaxed">{data.audience_fit}</p>
        </div>
      </div>

      {/* Key Lessons */}
      <div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-2">Key Lessons</p>
        <ul className="space-y-1">
          {data.what_worked.map((item, i) => (
            <li key={i} className="text-zinc-400 text-[12px]">
              {i + 1}. {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Adaptation brief */}
      <div className="border-l-2 border-built-red/40 pl-4">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-1.5">Adaptation Brief</p>
        <p className="text-zinc-300 text-[12px] leading-relaxed">{data.adaptation_brief}</p>
      </div>

      {/* Stronger hook */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-2">
          Suggested Hook for Your Audience
        </p>
        <p className="text-zinc-100 text-[13px] font-medium leading-relaxed">
          &ldquo;{data.stronger_hook}&rdquo;
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => navigator.clipboard.writeText(data.stronger_hook)}
            className="text-[11px] text-built-red border border-built-red/20 bg-built-red/10 px-3 py-1 rounded hover:bg-built-red/20 transition-colors"
          >
            Copy Hook
          </button>
          <button className="text-[11px] text-zinc-500 border border-white/10 px-3 py-1 rounded hover:bg-white/5 transition-colors">
            Save to Idea Bank
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [tip, setTip] = useState<string | null>(null);
  const [liveMedia, setLiveMedia] = useState<MediaItem[]>([]);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // Followers editable
  const [followers, setFollowers] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("built_followers") ?? "2.780";
    return "2.780";
  });
  const [editingFollowers, setEditingFollowers] = useState(false);

  // Period + chart modes
  const [period, setPeriod] = useState<TimePeriod>("1m");
  const [viewsMode, setViewsMode] = useState<ChartMode>("daily");
  const [engMode, setEngMode] = useState<ChartMode>("daily");

  // Content library
  const [contentTab, setContentTab] = useState<ContentTab>("recent");
  const [analysedId, setAnalysedId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<ContentLibraryAnalysis | null>(null);
  const [analysingId, setAnalysingId] = useState<string | null>(null);

  // ── Data loading ───────────────────────────────────────────────────────────
  useEffect(() => {
    getTipOfWeek().then(setTip).catch(() => null);
    listInstagramMedia(30)
      .then((d) => { setLiveMedia(d as MediaItem[]); setMediaLoaded(true); })
      .catch(() => setMediaLoaded(true));
  }, []);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncMsg(null);
    const r = await syncMyReels();
    if (r.ok) {
      setSyncMsg(`✓ ${r.synced} reels sincronizate`);
      const fresh = await listInstagramMedia(30).catch(() => [] as MediaItem[]);
      setLiveMedia(fresh as MediaItem[]);
    } else {
      setSyncMsg(`⚠ ${r.error}`);
    }
    setSyncing(false);
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────────
  const totalViews = liveMedia.length > 0 ? liveMedia.reduce((s, m) => s + (m.views ?? 0), 0) : null;
  const totalLikes = liveMedia.length > 0 ? liveMedia.reduce((s, m) => s + (m.likes ?? 0), 0) : null;
  const totalComments = liveMedia.length > 0 ? liveMedia.reduce((s, m) => s + (m.comments ?? 0), 0) : null;

  const viewsChartData = groupByDay(liveMedia, (m) => m.views ?? 0);
  const engChartData = groupByDay(liveMedia, (m) => m.likes ?? 0);

  // Sparklines from live data or static fallback
  const viewsSparkline =
    liveMedia.length > 0 ? liveMedia.slice(0, 12).map((m) => m.views ?? 0).reverse() : STATIC_SPARKLINE;
  const engSparkline =
    liveMedia.length > 0 ? liveMedia.slice(0, 12).map((m) => m.likes ?? 0).reverse() : STATIC_SPARKLINE;

  // Format performance from live data
  const formatPerf: { label: string; pct: number }[] = (() => {
    if (liveMedia.length === 0) return [
      { label: "Talking Head", pct: 72 },
      { label: "Rant", pct: 58 },
      { label: "Tutorial", pct: 44 },
      { label: "Trend", pct: 38 },
      { label: "Other", pct: 31 },
    ];
    const totals: Record<string, number> = {};
    for (const m of liveMedia) {
      const key = m.format_type ? m.format_type.toLowerCase() : "other";
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      totals[label] = (totals[label] ?? 0) + (m.views ?? 0);
    }
    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([label, v]) => ({ label, pct: Math.round((v / grandTotal) * 100) }));
  })();

  // Engagement breakdown
  const engBreakdown: { label: string; count: string; pct: number }[] = (() => {
    const likes = totalLikes ?? 0;
    const comments = totalComments ?? 0;
    // saves/shares not available in DB — estimate
    const saves = Math.round(likes * 0.4);
    const shares = Math.round(likes * 0.22);
    const total = likes + comments + saves + shares || 1;
    return [
      { label: "Likes", count: fmt(likes), pct: Math.round((likes / total) * 100) },
      { label: "Comments", count: fmt(comments), pct: Math.round((comments / total) * 100) },
      { label: "Saves", count: fmt(saves), pct: Math.round((saves / total) * 100) },
      { label: "Shares", count: fmt(shares), pct: Math.round((shares / total) * 100) },
    ];
  })();

  // Build reel cards
  const reelCards: ReelCard[] =
    mediaLoaded && liveMedia.length > 0
      ? liveMedia.map((m) => ({
          id: m.instagram_id,
          format: (m.format_type ?? "REEL").toUpperCase(),
          date: formatDate(m.posted_at),
          title: m.caption?.slice(0, 80) ?? "Fără caption",
          views: fmt(m.views),
          viewsRaw: m.views ?? 0,
          likes: fmt(m.likes),
          likesRaw: m.likes ?? 0,
          comments: fmt(m.comments),
          commentsRaw: m.comments ?? 0,
          thumbnail_url: m.thumbnail_url ?? null,
        }))
      : STATIC_LIBRARY;

  const sortedReels = [...reelCards].sort((a, b) => {
    if (contentTab === "top_views") return b.viewsRaw - a.viewsRaw;
    if (contentTab === "top_engagement") return b.likesRaw - a.likesRaw;
    return 0; // recent — already ordered from DB
  });

  // KPI values
  const kpiViews = mediaLoaded && totalViews !== null ? fmt(totalViews) : "—";
  const kpiEng = mediaLoaded && totalLikes !== null ? fmt(totalLikes) : "—";

  const kpiCards = [
    { key: "views", label: "TOTAL VIEWS", value: kpiViews, change: null, sparkline: viewsSparkline },
    { key: "eng", label: "ENGAGEMENTS", value: kpiEng, change: null, sparkline: engSparkline },
    { key: "followers", label: "FOLLOWERS", value: followers, change: null, sparkline: STATIC_SPARKLINE },
  ];

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleAnalyse(reel: ReelCard) {
    if (analysedId === reel.id) {
      setAnalysedId(null);
      setAnalysisData(null);
      return;
    }
    setAnalysingId(reel.id);
    const result = await analyzeContentLibraryReel(
      reel.title,
      reel.format,
      reel.views,
      reel.likes,
      reel.comments
    );
    setAnalysingId(null);
    if (result.ok) {
      setAnalysedId(reel.id);
      setAnalysisData(result.analysis);
    }
  }

  const PERIOD_LABELS: TimePeriod[] = ["7d", "1m", "3m", "1y"];
  const CONTENT_TABS: { key: ContentTab; label: string }[] = [
    { key: "recent", label: "Recent" },
    { key: "top_views", label: "Top Views" },
    { key: "top_engagement", label: "Top Engagement" },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">

      {/* ── HEADER SECTION ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_340px] gap-6 items-start">
        {/* Left: Name + bio + stats */}
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 mb-1">
            Claudiu Iordache&apos;s Dashboard
          </h1>
          <p className="text-[13px] text-zinc-500 mb-4">
            {reelCards.length} total posts · Instagram
          </p>
          <p className="text-[13px] text-zinc-400 leading-relaxed max-w-lg">
            Claudiu este un <strong className="text-zinc-200">Hybrid Athlete</strong> cu{" "}
            <strong className="text-zinc-200">7+ ani experiență</strong>.<br />
            Metoda BUILT — Arhitectura Corpului pe 90 de zile.
          </p>

          {/* Sync button */}
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 text-[12px] border border-white/10 bg-white/5 text-zinc-300 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <span className="w-3 h-3 border border-zinc-400 border-t-transparent rounded-full animate-spin" />
                  Sync în curs...
                </>
              ) : (
                <>⟳ Sync Instagram (@iordacheclaudiu_)</>
              )}
            </button>
            {syncMsg && (
              <span className="text-[11px] text-zinc-500 font-mono">{syncMsg}</span>
            )}
          </div>
        </div>

        {/* Right: Tip card */}
        <div className="bg-[#111111] border border-built-red/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-built-red">
              This Week&apos;s Tip
            </span>
          </div>
          {tip ? (
            <p className="text-[13px] text-zinc-300 leading-relaxed">{tip}</p>
          ) : (
            <div className="space-y-2">
              <div className="h-3 bg-white/5 rounded animate-pulse w-full" />
              <div className="h-3 bg-white/5 rounded animate-pulse w-4/5" />
              <div className="h-3 bg-white/5 rounded animate-pulse w-3/5" />
            </div>
          )}
        </div>
      </div>

      {/* ── PLATFORM + TIME TABS ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        {/* Platform tabs */}
        <div className="flex gap-6">
          {["All", "Instagram ✓"].map((tab) => (
            <button
              key={tab}
              className={`text-[13px] pb-3 -mb-3 font-medium transition-colors border-b-2 ${
                tab === "Instagram ✓"
                  ? "border-built-red text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Time tabs */}
        <div className="flex gap-1">
          {PERIOD_LABELS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-[12px] px-3 py-1 rounded font-mono transition-colors ${
                period === p
                  ? "bg-built-red text-white"
                  : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI CARDS ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {kpiCards.map((kpi) => {
          const badge = formatPctBadge(kpi.change);
          return (
            <div key={kpi.key} className="bg-[#111111] border border-white/10 rounded-xl p-5">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2">{kpi.label}</p>

              {kpi.key === "followers" ? (
                editingFollowers ? (
                  <input
                    autoFocus
                    value={followers}
                    onChange={(e) => setFollowers(e.target.value)}
                    onBlur={() => { localStorage.setItem("built_followers", followers); setEditingFollowers(false); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { localStorage.setItem("built_followers", followers); setEditingFollowers(false); }
                    }}
                    className="text-3xl font-semibold text-zinc-100 bg-transparent border-b border-built-red outline-none w-32 mb-3"
                  />
                ) : (
                  <button
                    onClick={() => setEditingFollowers(true)}
                    className="text-3xl font-semibold text-zinc-100 hover:text-built-red transition-colors text-left mb-3 block"
                  >
                    {followers}
                  </button>
                )
              ) : (
                <p className="text-3xl font-semibold text-zinc-100 mb-3">{kpi.value}</p>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    badge.up
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {badge.label}
                </span>
                <span className="text-[11px] text-zinc-600">vs prior period</span>
              </div>

              <div className="h-10">
                <Sparkline data={kpi.sparkline} up={badge.up} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CHARTS ROW ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Views over time */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-semibold text-zinc-200">Views over time</p>
            <div className="flex gap-1">
              {(["daily", "cumulative"] as ChartMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewsMode(m)}
                  className={`text-[11px] px-2.5 py-1 rounded font-mono transition-colors ${
                    viewsMode === m ? "bg-built-red/20 text-built-red" : "text-zinc-500 hover:bg-white/5"
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-36">
            <LineChart data={viewsChartData.length > 0 ? viewsChartData : [{ val: 0 }]} mode={viewsMode} />
          </div>
          {viewsChartData.length > 0 && (
            <div className="flex justify-between mt-2 text-[10px] text-zinc-600 font-mono">
              <span>{viewsChartData[0]?.day ?? ""}</span>
              <span>{viewsChartData[viewsChartData.length - 1]?.day ?? ""}</span>
            </div>
          )}
        </div>

        {/* Engagements over time */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-semibold text-zinc-200">Engagements over time</p>
            <div className="flex gap-1">
              {(["daily", "cumulative"] as ChartMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setEngMode(m)}
                  className={`text-[11px] px-2.5 py-1 rounded font-mono transition-colors ${
                    engMode === m ? "bg-built-red/20 text-built-red" : "text-zinc-500 hover:bg-white/5"
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-36">
            <LineChart data={engChartData.length > 0 ? engChartData : [{ val: 0 }]} mode={engMode} />
          </div>
          {engChartData.length > 0 && (
            <div className="flex justify-between mt-2 text-[10px] text-zinc-600 font-mono">
              <span>{engChartData[0]?.day ?? ""}</span>
              <span>{engChartData[engChartData.length - 1]?.day ?? ""}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── ENGAGEMENT BREAKDOWN + FORMAT PERFORMANCE ─────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Engagement breakdown */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <p className="text-[13px] font-semibold text-zinc-200 mb-4">Engagement Breakdown</p>
          <div className="space-y-3.5">
            {engBreakdown.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="text-zinc-400">{item.label}</span>
                  <div className="flex gap-3">
                    <span className="text-zinc-500">{item.count}</span>
                    <span className="text-zinc-200 font-mono w-8 text-right">{item.pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full">
                  <div className="h-full bg-built-red rounded-full transition-all" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[22px] font-semibold text-zinc-200 mt-5">
            {fmt((totalLikes ?? 0) + (totalComments ?? 0))}
            <span className="text-[13px] text-zinc-500 font-normal ml-2">total</span>
          </p>
        </div>

        {/* Format performance */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <p className="text-[13px] font-semibold text-zinc-200 mb-4">Format Performance</p>
          <div className="space-y-3.5">
            {formatPerf.map((f) => (
              <div key={f.label}>
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="text-zinc-400">{f.label}</span>
                  <span className="text-zinc-200 font-mono">{f.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full">
                  <div className="h-full bg-built-red rounded-full transition-all" style={{ width: `${f.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT LIBRARY ───────────────────────────────────────────────── */}
      <div>
        {/* Library header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <p className="text-[15px] font-semibold text-zinc-100">Content Library</p>
            <span className="text-[12px] text-zinc-500 font-mono">{sortedReels.length} reels</span>
          </div>
          <div className="flex gap-1">
            {CONTENT_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setContentTab(tab.key)}
                className={`text-[12px] px-3 py-1 rounded transition-colors ${
                  contentTab === tab.key
                    ? "bg-built-red/20 text-built-red"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-4">
          {sortedReels.map((reel) => (
            <div
              key={reel.id}
              className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
            >
              {/* Thumbnail */}
              <div className="relative bg-[#1a1a1a]" style={{ paddingBottom: "56.25%" }}>
                {reel.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={reel.thumbnail_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl opacity-10">▶</span>
                  </div>
                )}
                {/* Platform badge */}
                <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#E4405F] text-white z-10">
                  INSTAGRAM
                </span>
                {/* Format badge */}
                <span
                  className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded text-white z-10 ${formatBadgeClass(reel.format)}`}
                >
                  {reel.format}
                </span>
                {/* Date */}
                <span className="absolute bottom-2 left-2 text-[10px] text-white/60 font-mono z-10">
                  {reel.date}
                </span>
              </div>

              {/* Card body */}
              <div className="p-3">
                <p className="text-[12px] text-zinc-200 leading-snug mb-2 line-clamp-2">
                  {reel.title}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-[10px] text-zinc-500 font-mono">
                    <span>▶ {reel.views}</span>
                    <span>♥ {reel.likes}</span>
                    <span>✦ {reel.comments}</span>
                  </div>
                  <button
                    onClick={() => handleAnalyse(reel)}
                    className={`text-[10px] px-2 py-0.5 rounded transition-colors border ${
                      analysedId === reel.id
                        ? "text-built-red border-built-red/30 bg-built-red/10"
                        : "text-zinc-400 border-white/10 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    {analysingId === reel.id ? "..." : analysedId === reel.id ? "✓ Done" : "Analyse"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Inline analysis panel */}
        {analysedId && analysisData && (
          <AnalysisPanel
            data={analysisData}
            onClose={() => { setAnalysedId(null); setAnalysisData(null); }}
          />
        )}
      </div>
    </div>
  );
}
