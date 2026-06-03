"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTodayBrief, type TodayBrief } from "./actions";

function Copy({ text, label = "Copiază" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-[10px] font-condensed uppercase tracking-wider px-2.5 py-1 rounded border border-built-gray-2 text-built-gray-text hover:text-built-white hover:border-built-red/50 transition-colors"
    >
      {copied ? "✓ Copiat" : label}
    </button>
  );
}

export default function AziPage() {
  const [brief, setBrief] = useState<TodayBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(force = false) {
    setLoading(true);
    setError(null);
    const r = await getTodayBrief(force);
    setLoading(false);
    if (r.ok) setBrief(r.brief); else setError(r.error);
  }

  useEffect(() => { load(false); }, []);

  const today = new Date().toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">Centrul de Comandă</p>
          <h1 className="font-display text-5xl tracking-[0.06em] text-built-white mb-1">AZI</h1>
          <p className="text-built-gray-text capitalize">{today}{brief ? ` · ${brief.cadence.format}` : ""}</p>
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded border border-built-gray-2 text-built-gray-text hover:text-built-white hover:border-built-red/50 transition-colors disabled:opacity-50"
        >
          {loading ? "Generez..." : "↻ Regenerează"}
        </button>
      </div>

      {error && <p className="text-built-red text-sm mb-6">⚠ {error}</p>}

      {loading && !brief && (
        <p className="text-built-gray-text">Îți pregătesc briefingul de azi...</p>
      )}

      {brief && (
        <div className="space-y-5">
          {/* Cadența zilei */}
          <div className="bg-built-red/10 border border-built-red/30 rounded-xl p-5">
            <p className="text-[10px] font-condensed uppercase tracking-widest text-built-red mb-1">Focusul zilei</p>
            <p className="font-display text-2xl text-built-white tracking-wide mb-1">{brief.cadence.format}</p>
            <p className="text-built-gray-text text-sm">{brief.cadence.focus}</p>
          </div>

          {/* Ce postezi azi */}
          <div className="bg-built-gray-1 border border-built-gray-2 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xl text-built-white tracking-wide">📲 Ce postezi azi</h3>
              <Copy text={`${brief.ready_hook}\n\n${brief.caption_starter}`} label="Copiază hook+caption" />
            </div>
            <p className="text-built-gray-text text-sm mb-3">{brief.content_idea}</p>
            <div className="bg-built-black border border-built-gray-2 rounded-lg p-3 mb-2">
              <p className="text-[10px] font-condensed uppercase tracking-widest text-built-red mb-1">Hook gata de folosit</p>
              <p className="text-built-white">{brief.ready_hook}</p>
            </div>
            <div className="bg-built-black border border-built-gray-2 rounded-lg p-3">
              <p className="text-[10px] font-condensed uppercase tracking-widest text-built-gray-text mb-1">Început de caption</p>
              <p className="text-built-white/90 text-sm">{brief.caption_starter}</p>
            </div>
            <div className="flex gap-2 mt-3">
              <Link href="/dashboard/repurpose" className="text-xs px-3 py-1.5 rounded bg-built-red/15 border border-built-red/30 text-built-red hover:bg-built-red/25 transition-colors">Extinde în 4 piese →</Link>
              <Link href="/dashboard/hooks" className="text-xs px-3 py-1.5 rounded border border-built-gray-2 text-built-gray-text hover:text-built-white transition-colors">Alte hook-uri</Link>
            </div>
          </div>

          {/* Ce faci azi (business) */}
          <div className="bg-built-gray-1 border border-built-gray-2 rounded-xl p-5">
            <h3 className="font-display text-xl text-built-white tracking-wide mb-3">🎯 Ce faci azi (clienți)</h3>
            <p className="text-built-white mb-1">{brief.business_action}</p>
            <p className="text-built-gray-text text-sm mb-3">{brief.business_why}</p>
            <Link href="/dashboard/outreach" className="text-xs px-3 py-1.5 rounded border border-built-gray-2 text-built-gray-text hover:text-built-white transition-colors">Deschide DM Sales →</Link>
          </div>

          {/* Mindset */}
          <div className="border-l-2 border-built-red pl-4 py-1">
            <p className="text-[10px] font-condensed uppercase tracking-widest text-built-gray-text mb-1">Nota de azi</p>
            <p className="text-built-white/90 italic">{brief.mindset_note}</p>
          </div>
        </div>
      )}
    </div>
  );
}
