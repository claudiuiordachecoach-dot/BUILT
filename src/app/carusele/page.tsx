"use client";

import { useState, useEffect, useTransition } from "react";
import { generateCarusel, listCarusele, type CaruselRecord } from "@/app/carusele/actions";
import type { Pillar } from "@/app/reels/actions";

const PILLARS: { id: Pillar; label: string }[] = [
  { id: "B", label: "B · Forță" }, { id: "U", label: "U · Cardio" },
  { id: "I", label: "I · Nutriție" }, { id: "L", label: "L · Lifestyle" },
  { id: "T", label: "T · Mindset" }, { id: "mix", label: "Mix" },
];

const THEMES = [
  "De ce nu slăbești deși faci sport",
  "Sistemul de 5 principii BUILT",
  "Cum arată o săptămână corectă de antrenament",
  "Nutriție fără cântar și fără obsesie",
  "Identitatea omului de sistem",
];

const STATUS_DOT: Record<string, string> = {
  draft: "bg-built-gray-text", edited: "bg-amber-500",
  posted: "bg-emerald-500", archived: "bg-built-gray-2",
};

function CaruselCard({ c }: { c: CaruselRecord }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-built-gray-1 border border-built-gray-2 rounded-sm overflow-hidden">
      <button type="button" onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-built-gray-2 transition-colors text-left">
        <div className="flex items-center gap-3">
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[c.status]}`} />
          <span className="font-condensed text-[10px] text-built-red">Pilon {c.pillar}</span>
          <span className="font-display text-base tracking-wider truncate max-w-xs">{c.hook}</span>
          <span className="font-condensed text-[10px] text-built-gray-text">{c.body?.slides?.length ?? 0} slide-uri</span>
        </div>
        <span className="text-built-gray-text text-sm">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="border-t border-built-gray-2 p-4 space-y-3">
          {(c.body?.slides ?? []).map((s) => (
            <div key={s.position} className="flex gap-4 p-3 bg-built-black border border-built-gray-2 rounded-sm">
              <span className="font-display text-2xl text-built-red/40 w-8 shrink-0">{s.position}</span>
              <div className="flex-1">
                <p className="font-display text-lg tracking-wider text-built-white mb-1">{s.title}</p>
                <p className="text-sm text-built-white/80 mb-2">{s.body}</p>
                <p className="font-condensed text-[10px] text-built-gray-text">Design: {s.design_brief}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CaruselePage() {
  const [carusele, setCarusele] = useState<CaruselRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pillar, setPillar] = useState<Pillar>("mix");
  const [theme, setTheme] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    listCarusele().then((c) => { setCarusele(c); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  function handleGenerate() {
    const t = theme.trim() || "Sistemul bate voința";
    setError(null);
    startTransition(async () => {
      const result = await generateCarusel(pillar, t);
      if (result.ok) { setCarusele((prev) => [result.carusel, ...prev]); setTheme(""); }
      else setError(result.error);
    });
  }

  return (
    <div className="p-8 max-w-4xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">M4 · Generator Carusele</p>
      <h1 className="font-display text-5xl tracking-[0.06em] text-built-white mb-2">CARUSELE BUILT</h1>
      <p className="text-built-gray-text mb-8">8–10 slide-uri cu text + brief de design pentru Canva. Hook → problemă → sistem → aplicare → reframe → CTA.</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[["Total", carusele.length], ["Draft", carusele.filter(c => c.status === "draft").length], ["Postate", carusele.filter(c => c.status === "posted").length]].map(([l, v]) => (
          <div key={l} className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
            <p className="font-condensed text-[10px] text-built-gray-text uppercase">{l}</p>
            <p className="font-display text-3xl text-built-red mt-1">{v}</p>
          </div>
        ))}
      </div>

      <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm mb-8">
        <p className="font-condensed text-[10px] text-built-red uppercase tracking-wider mb-4">Generator</p>
        <h2 className="font-display text-2xl tracking-wider mb-6">Construiește un Carusel</h2>
        <div className="mb-5">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-2">Pilon</p>
          <div className="flex flex-wrap gap-2">
            {PILLARS.map((p) => (
              <button key={p.id} type="button" onClick={() => setPillar(p.id)}
                className={`px-3 py-1.5 border font-condensed text-xs transition-colors ${pillar === p.id ? "bg-built-red border-built-red text-built-white" : "border-built-gray-2 text-built-gray-text hover:border-built-red hover:text-built-white"}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-2">Temă</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {THEMES.map((t) => (
              <button key={t} type="button" onClick={() => setTheme(t)}
                className="px-2 py-1 border border-built-gray-2 text-built-gray-text font-condensed text-[10px] hover:border-built-red hover:text-built-white transition-colors">
                {t}
              </button>
            ))}
          </div>
          <textarea value={theme} onChange={(e) => setTheme(e.target.value)} rows={2}
            placeholder="Sau scrie tema ta..."
            className="w-full bg-built-black border border-built-gray-2 text-built-white text-sm p-3 resize-none focus:outline-none focus:border-built-red" />
        </div>
        {error && <p className="text-built-red font-condensed text-xs mb-3">{error}</p>}
        <button type="button" onClick={handleGenerate} disabled={isPending}
          className="px-6 py-3 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs disabled:opacity-50 transition-colors">
          {isPending ? "Generează... (~25s)" : "Generează Carusel →"}
        </button>
      </div>

      <div>
        <h3 className="font-condensed text-[11px] text-built-gray-text uppercase tracking-wider mb-3">Istoric ({carusele.length})</h3>
        {loading ? <p className="text-built-gray-text text-sm">Se încarcă...</p>
          : carusele.length === 0 ? <p className="text-built-gray-text text-sm">Niciun carusel generat încă.</p>
          : <div className="space-y-3">{carusele.map((c) => <CaruselCard key={c.id} c={c} />)}</div>}
      </div>
    </div>
  );
}
