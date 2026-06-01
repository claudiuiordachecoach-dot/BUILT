"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  analyzeContentLibraryReel,
  getTipOfWeek,
  listInstagramMedia,
  syncMyReels,
  saveReelAnalysis,
  getFollowersCount,
  classifyExistingReels,
  type ContentLibraryAnalysis,
} from "./actions";
import { loadOnboarding } from "@/app/dashboard/onboarding/actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaItem = {
  instagram_id: string;
  caption: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
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

type TimePeriod = "7d" | "1d" | "1m" | "3m" | "1y";
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

const PERIOD_DAYS: Record<TimePeriod, number> = { "7d": 7, "1d": 1, "1m": 30, "3m": 90, "1y": 365 };

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
        stroke="#C0392B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LineChart({ data, mode }: { data: { val: number; day?: string }[]; mode: ChartMode }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; val: number; day: string } | null>(null);

  const vals = mode === "cumulative"
    ? data.reduce<number[]>((acc, d, i) => { acc.push((acc[i - 1] ?? 0) + d.val); return acc; }, [])
    : data.map(d => d.val);

  if (vals.length === 0) return (
    <div className="flex items-center justify-center h-full text-zinc-600 text-[11px] font-mono">no data</div>
  );

  const maxV = Math.max(...vals, 1);
  const w = 100; const h = 60;
  const pts = vals.map((v, i) => ({
    x: (i / Math.max(vals.length - 1, 1)) * w,
    y: h - (v / maxV) * (h - 4),
    val: v,
    day: data[i]?.day ?? "",
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `M ${pts[0].x} ${h} ` + pts.map(p => `L ${p.x} ${p.y}`).join(" ") + ` L ${pts[pts.length - 1].x} ${h} Z`;

  const tooltipIdx = tooltip
    ? Math.max(0, Math.min(Math.round((tooltip.x / 100) * (pts.length - 1)), pts.length - 1))
    : null;

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 100 60"
        className="w-full h-full"
        preserveAspectRatio="none"
        onMouseLeave={() => setTooltip(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const xPct = (e.clientX - rect.left) / rect.width;
          const idx = Math.round(xPct * (pts.length - 1));
          const p = pts[Math.max(0, Math.min(idx, pts.length - 1))];
          if (p) setTooltip({ x: xPct * 100, y: e.clientY - rect.top, val: p.val, day: p.day });
        }}
      >
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C0392B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C0392B" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#grad)" />
        <path d={path} fill="none" stroke="#C0392B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        {tooltipIdx !== null && pts[tooltipIdx] && (
          <circle
            cx={pts[tooltipIdx].x}
            cy={pts[tooltipIdx].y}
            r="1.5"
            fill="#C0392B"
          />
        )}
      </svg>
      {tooltip && tooltipIdx !== null && pts[tooltipIdx] && (
        <div
          className="absolute pointer-events-none bg-[#1a1a1a] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-200 whitespace-nowrap z-10 shadow-lg"
          style={{ left: `calc(${tooltip.x}% + 8px)`, top: Math.max(0, tooltip.y - 30) }}
        >
          <span className="font-mono font-bold">{fmt(pts[tooltipIdx].val)}</span>
          {pts[tooltipIdx].day && <span className="text-zinc-500 ml-2">{pts[tooltipIdx].day}</span>}
        </div>
      )}
    </div>
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
    <div className="built-card mt-4 bg-[#0d0d0d] border border-white/10 rounded-xl p-6 space-y-5">
      {/* Top row */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded border ${verdictClass}`}>
          {data.verdict}
        </span>
        <span className="text-zinc-400 text-[13px]">
          Score: <strong className="text-zinc-100 font-mono-stats">{data.score}</strong>
        </span>
        <span className="text-zinc-400 text-[13px]">
          Hook Score: <strong className="text-zinc-100 font-mono-stats">{data.hook_score}</strong>
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
            <span className="font-mono-stats">{perfPct}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full">
            <div className="h-full bg-built-red rounded-full" style={{ width: `${perfPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[11px] text-zinc-500 mb-1.5">
            <span>Script Quality</span>
            <span className="font-mono-stats">{scriptPct}</span>
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
      <div className="built-card bg-[#111111] border border-white/10 rounded-xl p-4">
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
  const [aboutText, setAboutText] = useState<string | null>(null);

  // Followers — din DB, actualizat la fiecare sync
  const [followers, setFollowers] = useState<string>("—");
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
    loadOnboarding().then(data => {
      const niche = (data as Record<string, string>).niche;
      const tp = (data as Record<string, string>).transformation_promise;
      const name = (data as Record<string, string>).full_name;
      if (niche || tp) setAboutText([niche, tp].filter(Boolean).join(" · "));
      else if (name) setAboutText(`${name} — Hybrid Athlete · Metoda BUILT`);
    }).catch(() => null);
    listInstagramMedia(200)
      .then((d) => { setLiveMedia(d as MediaItem[]); setMediaLoaded(true); })
      .catch(() => setMediaLoaded(true));
    getFollowersCount().then((n) => {
      if (n && n > 0) setFollowers(fmt(n));
    }).catch(() => null);
  }, []);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncMsg(null);
    const r = await syncMyReels();
    if (r.ok) {
      setSyncMsg(`✓ ${r.synced} reels sincronizate — clasificare formate...`);
      await classifyExistingReels().catch(() => null);
      const fresh = await listInstagramMedia(200).catch(() => [] as MediaItem[]);
      setLiveMedia(fresh as MediaItem[]);
      if (r.followers && r.followers > 0) setFollowers(fmt(r.followers));
      setSyncMsg(`✓ ${r.synced} reels sincronizate + formate clasificate`);
    } else {
      setSyncMsg(`⚠ ${r.error}`);
    }
    setSyncing(false);
  }, []);

  // ── Period filter ──────────────────────────────────────────────────────────
  const filteredMedia = useMemo(() => {
    if (liveMedia.length === 0) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - PERIOD_DAYS[period]);
    return liveMedia.filter(m => m.posted_at ? new Date(m.posted_at) >= cutoff : false);
  }, [liveMedia, period]);

  // ── Derived data ───────────────────────────────────────────────────────────
  const totalViews = filteredMedia.length > 0 ? filteredMedia.reduce((s, m) => s + (m.views ?? 0), 0) : null;
  const totalLikes = filteredMedia.length > 0 ? filteredMedia.reduce((s, m) => s + (m.likes ?? 0), 0) : null;
  const totalComments = filteredMedia.length > 0 ? filteredMedia.reduce((s, m) => s + (m.comments ?? 0), 0) : null;

  const viewsChartData = groupByDay(filteredMedia, (m) => m.views ?? 0);
  const engChartData = groupByDay(filteredMedia, (m) => m.likes ?? 0);

  // Sparklines from filtered data or static fallback
  const viewsSparkline =
    filteredMedia.length > 0 ? filteredMedia.slice(0, 12).map((m) => m.views ?? 0).reverse() : STATIC_SPARKLINE;
  const engSparkline =
    filteredMedia.length > 0 ? filteredMedia.slice(0, 12).map((m) => m.likes ?? 0).reverse() : STATIC_SPARKLINE;

  // Engagement breakdown — saves/shares reale dacă există în DB, altfel estimate
  const engBreakdown: { label: string; count: string; pct: number; estimated?: boolean }[] = (() => {
    const likes = totalLikes ?? 0;
    const comments = totalComments ?? 0;
    const realSaves = filteredMedia.length > 0 ? filteredMedia.reduce((s, m) => s + ((m.saves ?? null) !== null ? (m.saves as number) : 0), 0) : null;
    const realShares = filteredMedia.length > 0 ? filteredMedia.reduce((s, m) => s + ((m.shares ?? null) !== null ? (m.shares as number) : 0), 0) : null;
    const hasSaves = filteredMedia.some(m => m.saves != null);
    const hasShares = filteredMedia.some(m => m.shares != null);
    const saves = hasSaves ? (realSaves ?? 0) : Math.round(likes * 0.4);
    const shares = hasShares ? (realShares ?? 0) : Math.round(likes * 0.22);
    const total = likes + comments + saves + shares || 1;
    return [
      { label: "Likes", count: fmt(likes), pct: Math.round((likes / total) * 100) },
      { label: "Comments", count: fmt(comments), pct: Math.round((comments / total) * 100) },
      { label: "Saves", count: fmt(saves), pct: Math.round((saves / total) * 100), estimated: !hasSaves },
      { label: "Shares", count: fmt(shares), pct: Math.round((shares / total) * 100), estimated: !hasShares },
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

  // KPI values cu % change față de perioada anterioară
  const kpiViews = mediaLoaded && totalViews !== null ? fmt(totalViews) : "—";
  const kpiEng = mediaLoaded && totalLikes !== null ? fmt(totalLikes) : "—";

  const prevFilteredMedia = useMemo(() => {
    if (liveMedia.length === 0) return [];
    const days = PERIOD_DAYS[period];
    const now = new Date();
    const prevEnd = new Date(now); prevEnd.setDate(prevEnd.getDate() - days);
    const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - days);
    return liveMedia.filter(m => {
      if (!m.posted_at) return false;
      const d = new Date(m.posted_at);
      return d >= prevStart && d < prevEnd;
    });
  }, [liveMedia, period]);

  const pctChange = (curr: number | null, prev: number | null): number | null => {
    if (curr === null || prev === null || prev === 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const prevViews = prevFilteredMedia.length > 0 ? prevFilteredMedia.reduce((s, m) => s + (m.views ?? 0), 0) : null;
  const prevLikes = prevFilteredMedia.length > 0 ? prevFilteredMedia.reduce((s, m) => s + (m.likes ?? 0), 0) : null;

  const kpiCards = [
    { key: "views", label: "TOTAL VIEWS", value: kpiViews, change: pctChange(totalViews, prevViews), sparkline: viewsSparkline },
    { key: "eng", label: "ENGAGEMENTS", value: kpiEng, change: pctChange(totalLikes, prevLikes), sparkline: engSparkline },
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
      // Feedback loop: salvează learning-ul în DB pentru generare scripturi
      saveReelAnalysis(reel.id, result.analysis).catch(() => {});
    }
  }

  const PERIOD_LABELS: TimePeriod[] = ["7d", "1d", "1m", "3m", "1y"];
  const CONTENT_TABS: { key: ContentTab; label: string }[] = [
    { key: "recent", label: "Recent" },
    { key: "top_views", label: "Top Views" },
    { key: "top_engagement", label: "Top Engagement" },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">


      <div className="px-8 space-y-6">

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
            {aboutText ?? (
              <>Claudiu este un <strong className="text-zinc-200">Hybrid Athlete</strong> cu{" "}
              <strong className="text-zinc-200">7+ ani experiență</strong>.<br />
              Metoda BUILT — Arhitectura Corpului pe 90 de zile.</>
            )}
          </p>

          {/* Sync + Classify buttons */}
          <div className="flex items-center gap-3 mt-5 flex-wrap">
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
            <button
              onClick={async () => {
                setSyncMsg("Clasificare formate...");
                const r = await classifyExistingReels();
                if (r.ok) {
                  setSyncMsg(`✓ ${r.classified} reels clasificate`);
                  const fresh = await listInstagramMedia(200).catch(() => [] as MediaItem[]);
                  setLiveMedia(fresh as MediaItem[]);
                } else {
                  setSyncMsg(`⚠ ${r.error}`);
                }
              }}
              disabled={syncing}
              className="flex items-center gap-2 text-[12px] border border-white/10 bg-white/5 text-zinc-300 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              ◈ Clasifică formate
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
          <button
            disabled
            className="text-[13px] pb-3 -mb-3 font-medium border-b-2 border-transparent text-zinc-600 opacity-50 cursor-not-allowed"
          >
            YouTube <span className="text-[9px] text-zinc-600 ml-1">SOON</span>
          </button>
          <button
            disabled
            className="text-[13px] pb-3 -mb-3 font-medium border-b-2 border-transparent text-zinc-600 opacity-50 cursor-not-allowed"
          >
            TikTok <span className="text-[9px] text-zinc-600 ml-1">SOON</span>
          </button>
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
            <div key={kpi.key} className="built-card bg-[#111111] border border-white/10 rounded-xl p-5">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2">{kpi.label}</p>

              <p className="text-3xl font-semibold text-zinc-100 mb-3 font-mono-stats">
                {kpi.key === "followers" ? followers : kpi.value}
              </p>

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
        <div className="built-card bg-[#111111] border border-white/10 rounded-xl p-5">
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
          <div className="h-36 overflow-visible relative">
            <LineChart data={viewsChartData.length > 0 ? viewsChartData : [{ val: 0 }]} mode={viewsMode} />
          </div>
          {viewsChartData.length > 0 && (
            <div className="flex justify-between mt-2 text-[10px] text-zinc-600 font-mono font-mono-stats">
              <span>{viewsChartData[0]?.day ?? ""}</span>
              <span>{viewsChartData[viewsChartData.length - 1]?.day ?? ""}</span>
            </div>
          )}
        </div>

        {/* Engagements over time */}
        <div className="built-card bg-[#111111] border border-white/10 rounded-xl p-5">
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
          <div className="h-36 overflow-visible relative">
            <LineChart data={engChartData.length > 0 ? engChartData : [{ val: 0 }]} mode={engMode} />
          </div>
          {engChartData.length > 0 && (
            <div className="flex justify-between mt-2 text-[10px] text-zinc-600 font-mono font-mono-stats">
              <span>{engChartData[0]?.day ?? ""}</span>
              <span>{engChartData[engChartData.length - 1]?.day ?? ""}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── ENGAGEMENT BREAKDOWN + FORMAT PERFORMANCE ─────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Engagement breakdown — matches William Scott */}
        <div className="built-card bg-[#111111] border border-white/10 rounded-xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Engagement Breakdown</p>
          <p className="text-[28px] font-semibold text-zinc-100 font-mono mb-4">
            {fmt((totalLikes ?? 0) + (totalComments ?? 0))}
            <span className="text-[14px] text-zinc-500 font-normal ml-2">total</span>
          </p>
          <div className="space-y-3">
            {engBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-[13px]">
                <span className="text-zinc-400 w-24 flex items-center gap-1">
                  {item.label}
                  {item.estimated && <span className="text-[10px] text-zinc-600 font-mono">(est.)</span>}
                </span>
                <span className="text-zinc-200 font-mono flex-1 text-right">{item.count}</span>
                <span className="text-zinc-500 font-mono w-14 text-right">({item.pct}%)</span>
              </div>
            ))}
          </div>
          {/* TOP REEL */}
          {reelCards.length > 0 && (() => {
            const top = [...reelCards].sort((a, b) => b.viewsRaw - a.viewsRaw)[0];
            return (
              <div className="mt-5 pt-4 border-t border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Top Reel</p>
                <a
                  href={`https://www.instagram.com/reel/${top.id}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block hover:bg-white/[0.02] rounded-lg p-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-zinc-100 font-mono text-[14px] font-semibold">{top.views}</span>
                    <span className="text-zinc-600 text-[11px]">views</span>
                    <span className="text-zinc-600 text-[11px]">·</span>
                    <span className="text-zinc-500 text-[11px]">{top.likes} likes</span>
                    <span className="ml-auto text-zinc-700 group-hover:text-zinc-500 text-[10px] transition-colors">↗</span>
                  </div>
                  <p className="text-zinc-400 text-[12px] leading-relaxed line-clamp-2">{top.title}</p>
                </a>
              </div>
            );
          })()}
        </div>

        {/* Format performance */}
        <div className="built-card bg-[#111111] border border-white/10 rounded-xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Format Performance</p>
          <p className="text-[10px] text-zinc-700 mb-3">All-time · avg views per format</p>
          {(() => {
            const totals: Record<string, { views: number; count: number }> = {};
            const source = liveMedia.length > 0 ? liveMedia : [];
            for (const m of source) {
              const key = (m.format_type ?? "other").toLowerCase();
              if (!totals[key]) totals[key] = { views: 0, count: 0 };
              totals[key].views += m.views ?? 0;
              totals[key].count += 1;
            }
            // Sort by average views per reel
            const entries = Object.entries(totals)
              .map(([k, v]) => [k, Math.round(v.views / Math.max(v.count, 1))] as [string, number])
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6);

            const fallback = [["talking head", 142000], ["rant", 98000], ["tutorial", 76000], ["trend", 54000], ["bts", 28000]] as [string, number][];
            const display = entries.length > 0 ? entries : fallback;
            const max = display[0][1] as number;
            return (
              <div className="space-y-3">
                {display.map(([label, avg]) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-[11px] text-zinc-400 w-24 shrink-0 capitalize font-medium">{label}</span>
                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${((avg as number) / max) * 100}%` }} />
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono w-16 text-right">{fmt(avg as number)}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── CONTENT LIBRARY ───────────────────────────────────────────────── */}
      <div>
        {/* Library header — William Scott style */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-semibold text-zinc-100">Content Library</p>
            <span className="text-[14px] text-zinc-500">({sortedReels.length})</span>
          </div>
          <div className="flex gap-1">
            {CONTENT_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setContentTab(tab.key)}
                className={`text-[12px] px-3 py-1.5 rounded-lg transition-colors ${
                  contentTab === tab.key
                    ? "text-zinc-100 bg-white/10"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5-column grid — matches William Scott */}
        <div className="grid grid-cols-5 gap-3">
          {sortedReels.map((reel) => (
            <div
              key={reel.id}
              className={`built-card bg-[#111111] border rounded-xl overflow-hidden transition-colors ${
                analysedId === reel.id ? "border-built-red/40" : "border-white/[0.08] hover:border-white/20"
              }`}
            >
              {/* Thumbnail */}
              <div className="relative bg-[#1a1a1a]" style={{ paddingBottom: "75%" }}>
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
                    <svg className="w-8 h-8 text-white/10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                )}
                {/* Platform + Format badges on thumbnail */}
                <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/60 text-white/80 backdrop-blur-sm">
                    instagram
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white z-10 ${formatBadgeClass(reel.format)}`}>
                    {reel.format}
                  </span>
                </div>
                {/* Date */}
                <span className="absolute top-2 right-2 text-[9px] text-white/60 font-mono z-10 bg-black/40 px-1 rounded">
                  {reel.date}
                </span>
              </div>

              {/* Card body */}
              <div className="p-3">
                <p className="text-[12px] text-zinc-200 leading-snug mb-2.5 line-clamp-2 min-h-[36px]">
                  {reel.title}
                </p>
                {/* Stats */}
                <div className="flex items-center gap-2.5 text-[11px] text-zinc-500 mb-2.5">
                  <span className="flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {reel.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {reel.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {reel.comments}
                  </span>
                </div>
                {/* Analyse button — full width, William Scott style */}
                <button
                  onClick={() => handleAnalyse(reel)}
                  disabled={analysingId === reel.id}
                  className={`w-full text-[11px] py-1.5 rounded-lg border transition-colors font-medium flex items-center justify-center gap-1.5 ${
                    analysedId === reel.id
                      ? "text-built-red border-built-red/30 bg-built-red/10"
                      : "text-zinc-400 border-white/10 hover:border-white/25 hover:text-zinc-200 hover:bg-white/5"
                  }`}
                >
                  {analysingId === reel.id ? (
                    <><span className="w-2.5 h-2.5 border border-zinc-400 border-t-transparent rounded-full animate-spin" />Analysing...</>
                  ) : analysedId === reel.id ? (
                    <>✓ Re-analyse</>
                  ) : (
                    <>✦ Analyse</>
                  )}
                </button>
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

      </div>{/* /px-8 */}
    </div>
  );
}
