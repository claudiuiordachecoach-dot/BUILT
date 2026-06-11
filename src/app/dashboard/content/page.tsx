"use client";

import { useState, useEffect, type ReactNode } from "react";
import {
  listCompetitors,
  addCompetitor,
  removeCompetitor,
  generateWeeklyPackageAI,
  generateSingleScript,
  getLatestWeeklyPackage,
  listWeeklyPackages,
  getWeeklyPackageById,
  type WeeklyScript,
  type WeeklyPackage,
} from "./actions";
import {
  listInstagramMedia,
  syncMyReels,
  classifyExistingReels,
  analyzeContentLibraryReel,
  type ContentLibraryAnalysis,
} from "../analytics/actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "creator_cult" | "content_intel";

type MediaItem = {
  instagram_id: string;
  caption: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  posted_at: string | null;
  format_type?: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function totalViewsStr(items: MediaItem[]): string {
  return fmt(items.reduce((s, m) => s + (m.views ?? 0), 0));
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

const FORMAT_COLOR: Record<string, string> = {
  "TALKING HEAD": "text-cyan-400",
  "RANT":          "text-orange-400",
  "STORY TIME":    "text-purple-400",
  "TREND":         "text-blue-400",
  "TUTORIAL":      "text-emerald-400",
  "Q&A":           "text-yellow-400",
  "LIST":          "text-indigo-400",
  "BTS":           "text-zinc-400",
  "BEHIND SCENES": "text-zinc-400",
  "CLIENT PROOF":  "text-amber-400",
  "OTHER":         "text-zinc-500",
};

function getColor(format: string) {
  return FORMAT_COLOR[format.toUpperCase()] ?? "text-zinc-500";
}

// ─── Verdict config ───────────────────────────────────────────────────────────

const VERDICT_STYLE: Record<string, string> = {
  Exceptional: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Strong:      "text-built-red bg-built-red/10 border-built-red/20",
  Good:        "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  Weak:        "text-red-400 bg-red-500/10 border-red-500/20",
};

// ─── Analysis Panel ───────────────────────────────────────────────────────────

function AnalysisPanel({
  data,
  onClose,
}: {
  data: ContentLibraryAnalysis;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const scoreOutOf10 = (data.score / 10).toFixed(1);

  return (
    <div className="col-span-4 bg-[#0d0d0d] border border-white/10 rounded-xl p-6 space-y-5">
      {/* Top row */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded border ${VERDICT_STYLE[data.verdict] ?? "text-zinc-400 bg-white/5 border-white/10"}`}>
          {data.verdict}
        </span>
        <span className="text-zinc-400 text-[13px]">
          Score: <strong className="text-zinc-100 font-mono">{scoreOutOf10}/10</strong>
        </span>
        <span className="text-zinc-400 text-[13px]">
          Hook: <strong className="text-zinc-100 font-mono">{(data.hook_score / 10).toFixed(1)}/10</strong>
        </span>
        <button
          onClick={onClose}
          className="ml-auto text-[11px] text-zinc-500 border border-white/10 px-3 py-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          × Închide
        </button>
      </div>

      {/* Score bars */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-[11px] text-zinc-500 mb-1.5">
            <span>Scor Performanță</span>
            <span className="font-mono">{data.score}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full">
            <div className="h-full bg-built-red rounded-full transition-all" style={{ width: `${data.score}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[11px] text-zinc-500 mb-1.5">
            <span>Calitate Hook</span>
            <span className="font-mono">{data.hook_score}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full">
            <div className="h-full bg-built-red rounded-full transition-all" style={{ width: `${data.hook_score}%` }} />
          </div>
        </div>
      </div>

      {/* 3-col breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[12px]">
        <div>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-2">De Ce a Performat</p>
          <p className="text-zinc-300 leading-relaxed">{data.performance_summary}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-2">Ce a Funcționat</p>
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
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-2">Potrivire Audiență</p>
          <p className="text-zinc-300 leading-relaxed">{data.audience_fit}</p>
        </div>
      </div>

      {/* Suggested hook */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-2">
          Hook Sugerat pentru Audiența BUILT
        </p>
        <p className="text-zinc-100 text-[13px] font-medium leading-relaxed mb-3">
          &ldquo;{data.stronger_hook}&rdquo;
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(data.stronger_hook); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="text-[11px] text-built-red border border-built-red/20 bg-built-red/10 px-3 py-1 rounded-lg hover:bg-built-red/20 transition-colors"
          >
            {copied ? "✓ Copiat" : "Copiază Hook"}
          </button>
          <span className="text-[11px] text-zinc-600">
            {data.adaptation_brief}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Reel Card ────────────────────────────────────────────────────────────────

function ReelCard({
  item,
  onAnalyse,
  analysing,
  analysed,
}: {
  item: MediaItem;
  onAnalyse: () => void;
  analysing: boolean;
  analysed: boolean;
}) {
  const format = (item.format_type ?? "REEL").toUpperCase();

  return (
    <div className={`bg-[#111111] border rounded-xl p-4 transition-colors ${analysed ? "border-built-red/30" : "border-white/[0.08] hover:border-white/20"}`}>
      {/* Top row */}
      <div className="flex items-start justify-between mb-2.5 gap-2">
        <span className={`text-[11px] font-bold uppercase tracking-wide ${getColor(format)}`}>
          {format}
        </span>
        <span className="text-[11px] text-zinc-600 shrink-0">{formatDate(item.posted_at)}</span>
      </div>

      {/* Caption */}
      <p className="text-[13px] text-zinc-200 leading-snug line-clamp-3 mb-4 min-h-[58px]">
        {item.caption?.slice(0, 120) ?? "Fără caption"}
      </p>

      {/* Stats + Analyse */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {fmt(item.views)}
          </span>
          <span className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {fmt(item.likes)}
          </span>
          <span className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {fmt(item.comments)}
          </span>
        </div>
        <button
          onClick={onAnalyse}
          disabled={analysing}
          className={`w-full text-[11px] px-2 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
            analysed
              ? "text-built-red border-built-red/30 bg-built-red/10"
              : "text-zinc-400 border-white/10 hover:border-white/20 hover:bg-white/5"
          }`}
        >
          {analysing ? (
            <span className="flex items-center justify-center gap-1">
              <span className="w-2.5 h-2.5 border border-zinc-400 border-t-transparent rounded-full animate-spin" />
              ...
            </span>
          ) : analysed ? "✓ Analizat" : "✨ Analizează"}
        </button>
      </div>
    </div>
  );
}

// ─── Script Card ──────────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copiază" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-[10px] text-zinc-500 border border-white/10 px-2 py-0.5 rounded hover:bg-white/5 hover:text-zinc-300 transition-colors shrink-0"
    >
      {copied ? "✓" : label}
    </button>
  );
}

function ScriptCard({ script, index }: { script: WeeklyScript; index: number }) {
  const [open, setOpen] = useState(false);

  const COLORS = ["bg-orange-500","bg-purple-600","bg-teal-600","bg-blue-600","bg-built-red","bg-emerald-600","bg-amber-600"];

  return (
    <div className="bg-[#111111] border border-white/[0.08] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors text-left">
        <span className={`w-8 h-8 rounded-lg ${COLORS[index % 7]} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
          {script.day.slice(0, 2).toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">{script.day} · {script.type}</p>
          <p className="text-sm text-zinc-300 truncate">&ldquo;{script.hook}&rdquo;</p>
        </div>
        <span className={`text-zinc-500 transition-transform shrink-0 ${open ? "rotate-90" : ""}`}>›</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
          {/* HOOK */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Hook</p>
              <CopyButton text={script.hook} />
            </div>
            <div className="border-l-2 border-built-red pl-3">
              <p className="text-sm text-zinc-200 italic">&ldquo;{script.hook}&rdquo;</p>
            </div>
          </div>

          {/* FULL SCRIPT */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Script Complet</p>
              <CopyButton text={script.full_script} />
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{script.full_script}</p>
          </div>

          {/* CAPTION */}
          {script.caption && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Caption</p>
                <CopyButton text={script.caption} />
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{script.caption}</p>
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <div className="flex-1 min-w-0 mr-3">
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-1">CTA</p>
              <p className="text-sm text-built-red font-medium">{script.cta}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <CopyButton text={script.cta} label="Copiază CTA" />
              <CopyButton text={`HOOK:\n${script.hook}\n\nSCRIPT:\n${script.full_script}\n\nCAPTION:\n${script.caption}\n\nCTA: ${script.cta}`} label="Copiază Tot" />
            </div>
          </div>

          {/* Competitor comments */}
          {script.competitor_comments && script.competitor_comments.length > 0 && (
            <div className="border-t border-white/5 pt-4 space-y-2">
              <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-mono">Din audiența competitorilor</p>
              {script.competitor_comments.map((c, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[9px] text-zinc-500 shrink-0 mt-0.5 font-mono">
                    {c.user.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-[12px] text-zinc-600 leading-relaxed italic">&ldquo;{c.text}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContentPage() {
  const [tab, setTab] = useState<Tab>("creator_cult");
  const [reels, setReels] = useState<MediaItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // Analyse state
  const [analysingId, setAnalysingId] = useState<string | null>(null);
  const [analysedId, setAnalysedId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<ContentLibraryAnalysis | null>(null);
  const [analysedReelIndex, setAnalysedReelIndex] = useState<number | null>(null);

  // Content Intel
  const [competitors, setCompetitors] = useState<{ id: number; handle: string }[]>([]);
  const [handle, setHandle] = useState("");
  const [weeklyPkg, setWeeklyPkg] = useState<WeeklyPackage | null>(null);
  const [generatingPkg, setGeneratingPkg] = useState(false);
  const [genFormat, setGenFormat] = useState("Talking Head");
  const [genPilon, setGenPilon] = useState("Pilon B — Base Strength");
  const [genLoading, setGenLoading] = useState(false);
  const [quickScripts, setQuickScripts] = useState<WeeklyScript[]>([]);
  const [pastPackages, setPastPackages] = useState<{ id: number; week_of: string; created_at: string }[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<number | "current">("current");

  useEffect(() => {
    listInstagramMedia(200).then(d => {
      setReels(d.length > 0 ? d as MediaItem[] : []);
    }).catch(() => setReels([]));
    listCompetitors().then(setCompetitors);
    getLatestWeeklyPackage().then(pkg => {
      if (pkg) setWeeklyPkg(pkg);
    }).catch(() => null);
    listWeeklyPackages().then(setPastPackages).catch(() => null);
  }, []);

  const handleSync = async () => {
    setSyncing(true); setSyncMsg("Sync în curs...");
    const r = await syncMyReels();
    if (r.ok) {
      setSyncMsg(`✓ ${r.synced} reels · clasificare formate...`);
      await classifyExistingReels().catch(() => null);
      const fresh = await listInstagramMedia(200).catch(() => []);
      setReels(fresh as MediaItem[]);
      setSyncMsg(`✓ ${r.synced} reels sincronizate + clasificate`);
    } else {
      setSyncMsg(`⚠ ${r.error}`);
    }
    setSyncing(false);
  };

  const handleAnalyse = async (item: MediaItem, index: number) => {
    // Toggle off
    if (analysedId === item.instagram_id) {
      setAnalysedId(null); setAnalysisData(null); setAnalysedReelIndex(null);
      return;
    }
    setAnalysingId(item.instagram_id);
    const result = await analyzeContentLibraryReel(
      item.caption?.slice(0, 100) ?? "Fără caption",
      (item.format_type ?? "REEL").toUpperCase(),
      fmt(item.views),
      fmt(item.likes),
      fmt(item.comments)
    );
    setAnalysingId(null);
    if (result.ok) {
      setAnalysedId(item.instagram_id);
      setAnalysisData(result.analysis);
      // Insert panel after the row containing this card (4 columns)
      setAnalysedReelIndex(index);
    }
  };

  const handleAddCompetitor = async () => {
    if (!handle.trim()) return;
    await addCompetitor(handle);
    setHandle("");
    listCompetitors().then(setCompetitors);
  };

  const handleGeneratePkg = async () => {
    setGeneratingPkg(true);
    const result = await generateWeeklyPackageAI();
    if (result.ok) {
      setWeeklyPkg(result.pkg);
      setSelectedPkgId("current");
      listWeeklyPackages().then(setPastPackages).catch(() => null);
    }
    setGeneratingPkg(false);
  };

  const handleSelectPkg = async (id: number) => {
    if (id === (selectedPkgId as number)) return;
    setSelectedPkgId(id);
    const pkg = await getWeeklyPackageById(id);
    if (pkg) setWeeklyPkg(pkg);
  };

  const handleGenerateSingle = async () => {
    setGenLoading(true);
    const result = await generateSingleScript(genFormat, genPilon);
    if (result.ok) setQuickScripts(prev => [result.script, ...prev]);
    setGenLoading(false);
  };

  // Build grid rows with analysis panel insertion
  const buildGrid = () => {
    const cols = 4;
    const rows: ReactNode[] = [];
    for (let i = 0; i < reels.length; i += cols) {
      const rowItems = reels.slice(i, i + cols);
      const rowIndex = Math.floor(i / cols);
      rows.push(
        <div key={`row-${rowIndex}`} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {rowItems.map((item, j) => (
            <ReelCard
              key={item.instagram_id}
              item={item}
              onAnalyse={() => handleAnalyse(item, i + j)}
              analysing={analysingId === item.instagram_id}
              analysed={analysedId === item.instagram_id}
            />
          ))}
          {/* Pad empty cells */}
          {rowItems.length < cols && Array.from({ length: cols - rowItems.length }).map((_, k) => (
            <div key={`pad-${k}`} />
          ))}
        </div>
      );
      // Insert analysis panel after the row containing the analysed reel
      if (analysedId && analysisData && analysedReelIndex !== null) {
        const rowStart = Math.floor(rowIndex) * cols;
        const rowEnd = rowStart + cols;
        if (analysedReelIndex >= i && analysedReelIndex < i + cols) {
          rows.push(
            <AnalysisPanel
              key="analysis-panel"
              data={analysisData}
              onClose={() => { setAnalysedId(null); setAnalysisData(null); setAnalysedReelIndex(null); }}
            />
          );
        }
      }
    }
    return rows;
  };

  return (
    <div className="min-h-screen">
      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-white/[0.08] px-8">
        <div className="flex items-center gap-8">
          {([
            { key: "creator_cult",  label: "Reels-urile Tale" },
            { key: "content_intel", label: "Inteligență Conținut" },
          ] as { key: Tab; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`py-4 text-[13px] font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-white text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">

        {/* ── CREATOR CULT TAB ─────────────────────────────────────────────── */}
        {tab === "creator_cult" && (
          <div>
            <p className="text-[13px] text-zinc-500 mb-6">
              Reels-urile tale, inteligență competitori și scripturi săptămânale — totul într-un singur loc.
            </p>

            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                Reels-urile Tale
              </p>
              <div className="flex items-center gap-4">
                <span className="text-[12px] text-zinc-500 font-mono">
                  {reels.length} reels · {totalViewsStr(reels)}
                </span>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="text-[11px] border border-white/10 bg-white/5 text-zinc-400 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {syncing ? (
                    <><span className="w-2.5 h-2.5 border border-zinc-400 border-t-transparent rounded-full animate-spin" />Sync...</>
                  ) : "⟳ Sync Instagram"}
                </button>
              </div>
            </div>
            {syncMsg && <p className="text-[11px] text-zinc-600 font-mono mb-3">{syncMsg}</p>}

            {/* Reels grid — with analysis panel inserted inline */}
            {reels.length > 0 ? (
              <div className="space-y-3">{buildGrid()}</div>
            ) : (
              <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-12 text-center">
                <p className="text-[13px] text-zinc-500 mb-2">Niciun reel sincronizat.</p>
                <button onClick={handleSync} className="text-[12px] text-built-red hover:opacity-80 transition-opacity">
                  ⟳ Sync Instagram →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CONTENT INTEL TAB ────────────────────────────────────────────── */}
        {tab === "content_intel" && (
          <div className="space-y-6">
            <p className="text-[13px] text-zinc-500">
              Inteligență competitori, scripturi săptămânale și strategie de conținut generată de AI.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_300px] gap-6">
              {/* Past Packages Sidebar */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3 px-1">Pachete</p>
                <button
                  onClick={() => setSelectedPkgId("current")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition-colors ${
                    selectedPkgId === "current"
                      ? "bg-built-red/10 text-built-red border border-built-red/20"
                      : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                  }`}
                >
                  Săptămâna asta
                </button>
                {pastPackages.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPkg(p.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition-colors ${
                      selectedPkgId === p.id
                        ? "bg-white/10 text-zinc-100"
                        : "text-zinc-600 hover:bg-white/5 hover:text-zinc-400"
                    }`}
                  >
                    Săpt. {new Date(p.week_of).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" })}
                  </button>
                ))}
              </div>

              {/* Centre — Scripts */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Scripturile Săptămânii</p>
                  <button
                    onClick={handleGeneratePkg}
                    disabled={generatingPkg}
                    className="flex items-center gap-2 text-[12px] bg-built-red text-white px-4 py-2 rounded-lg font-semibold hover:bg-built-red/90 disabled:opacity-50 transition-all"
                  >
                    {generatingPkg ? (
                      <><span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />Generez...</>
                    ) : "⚡ Regenerează Săptămâna"}
                  </button>
                </div>

                {weeklyPkg ? (
                  <div className="space-y-2">
                    {weeklyPkg.intelligence_report && (
                      <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-5 mb-4 space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">→ Raport de Inteligență Săptămânală</p>

                        {weeklyPkg.intelligence_report.whats_popping?.length > 0 && (
                          <div>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-2">Ce Funcționează Săptămâna Asta</p>
                            <ul className="space-y-1.5">
                              {weeklyPkg.intelligence_report.whats_popping.map((item, i) => (
                                <li key={i} className="text-[12px] text-zinc-300 flex gap-2">
                                  <span className="text-built-red shrink-0">*</span>{item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {weeklyPkg.intelligence_report.performance_last_week?.length > 0 && (
                          <div>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-2">Performanța Săptămânii Trecute</p>
                            <ul className="space-y-1.5">
                              {weeklyPkg.intelligence_report.performance_last_week.map((item, i) => (
                                <li key={i} className="text-[12px] text-zinc-400 flex gap-2">
                                  <span className="text-zinc-600 shrink-0">—</span>{item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {weeklyPkg.intelligence_report.accounts_to_watch?.length > 0 && (
                          <div>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-2">Conturi de Urmărit</p>
                            <div className="flex flex-wrap gap-2">
                              {weeklyPkg.intelligence_report.accounts_to_watch.map((item, i) => (
                                <span key={i} className="text-[11px] text-zinc-400 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {weeklyPkg.scripts.map((script, i) => (
                      <ScriptCard key={i} script={script} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-8 text-center">
                    <p className="text-[13px] text-zinc-500 mb-2">Niciun pachet generat.</p>
                    <p className="text-[12px] text-zinc-600">Apasă &ldquo;Regenerează Săptămâna&rdquo; pentru a genera scripturi AI pe baza datelor tale reale.</p>
                  </div>
                )}

                {quickScripts.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Generate Rapid</p>
                    {quickScripts.map((script, i) => (
                      <ScriptCard key={i} script={script} index={i} />
                    ))}
                  </div>
                )}
              </div>

              {/* Right */}
              <div className="space-y-4">
                {/* Competitors */}
                <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Competitori</p>
                    <a
                      href="/competitors"
                      className="text-[10px] text-zinc-500 border border-white/10 px-2 py-1 rounded hover:bg-white/5 transition-colors"
                    >
                      Studio Viral ↗
                    </a>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={handle}
                      onChange={e => setHandle(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleAddCompetitor(); }}
                      placeholder="@username"
                      className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-[12px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-built-red/50"
                    />
                    <button onClick={handleAddCompetitor} className="bg-built-red/10 hover:bg-built-red/20 border border-built-red/30 text-built-red px-3 py-2 rounded-lg text-[12px] font-semibold">
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {competitors.map(c => (
                      <span key={c.id} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2.5 py-1 text-[11px] text-zinc-300">
                        @{c.handle}
                        <button onClick={() => removeCompetitor(c.id).then(() => listCompetitors().then(setCompetitors))} className="text-zinc-600 hover:text-zinc-300 ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Script generator */}
                <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Generează Script</p>
                  <select
                    value={genFormat}
                    onChange={e => setGenFormat(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-300 text-[12px] px-3 py-2 rounded-lg mb-2 focus:outline-none focus:border-built-red/40"
                  >
                    {["Talking Head","Rant","Tutorial","Behind the scenes","Client proof"].map(f => <option key={f}>{f}</option>)}
                  </select>
                  <select
                    value={genPilon}
                    onChange={e => setGenPilon(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-300 text-[12px] px-3 py-2 rounded-lg mb-3 focus:outline-none focus:border-built-red/40"
                  >
                    {["Pilon B — Base Strength","Pilon U — Unbreakable Capacity","Pilon I — Intelligent Fueling","Pilon L — Lifestyle Integration","Pilon T — Tough Mindset"].map(p => <option key={p}>{p}</option>)}
                  </select>
                  <button
                    onClick={handleGenerateSingle}
                    disabled={genLoading}
                    className="w-full bg-built-red/10 text-built-red border border-built-red/20 text-[12px] py-2 rounded-lg hover:bg-built-red/20 transition-colors disabled:opacity-50"
                  >
                    {genLoading ? "Generează..." : "✦ Generează Script"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
