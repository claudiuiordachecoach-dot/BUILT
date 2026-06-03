"use client";

import { useState, useEffect } from "react";
import {
  generateHooks,
  listHookBanks,
  type HookBankRecord,
  type HookItem,
} from "./actions";

const TYPE_COLOR: Record<string, string> = {
  "contraintuitiv": "text-cyan-400",
  "cifră+durere": "text-built-red",
  "oglindire": "text-purple-400",
  "provocare": "text-amber-400",
};

function HookRow({ h }: { h: HookItem }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-start gap-3 p-3 bg-built-black border border-built-gray-2 rounded-lg group">
      <div className="flex-1">
        <p className="text-built-white text-sm mb-1">{h.text}</p>
        <div className="flex gap-2">
          <span className={`text-[10px] font-condensed uppercase tracking-wider ${TYPE_COLOR[h.type] ?? "text-built-gray-text"}`}>{h.type}</span>
          <span className="text-[10px] font-condensed uppercase tracking-wider text-built-gray-text">· pilon {h.pillar}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={async () => { await navigator.clipboard.writeText(h.text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="text-[10px] font-condensed uppercase tracking-wider px-2.5 py-1 rounded border border-built-gray-2 text-built-gray-text hover:text-built-white hover:border-built-red/50 transition-colors shrink-0"
      >
        {copied ? "✓" : "Copiază"}
      </button>
    </div>
  );
}

export default function HooksPage() {
  const [angle, setAngle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HookBankRecord | null>(null);
  const [history, setHistory] = useState<HookBankRecord[]>([]);

  useEffect(() => {
    listHookBanks().then((h) => { setHistory(h); if (h[0]) setResult(h[0]); }).catch(() => setHistory([]));
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    const r = await generateHooks(angle.trim());
    setLoading(false);
    if (r.ok) {
      setResult(r.record);
      setHistory((h) => [r.record, ...h]);
    } else {
      setError(r.error);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">Bancă de Hook-uri</p>
      <h1 className="font-display text-5xl tracking-[0.06em] text-built-white mb-2">HOOK-URI CARE OPRESC SCROLLUL</h1>
      <p className="text-built-gray-text mb-6">12 hook-uri gata de folosit, alimentate de ce a performat deja la tine + Creierul tău. Lasă unghiul gol pentru variație pe toți pilonii.</p>

      <div className="bg-built-gray-1 border border-built-gray-2 rounded-xl p-5 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
            placeholder="Unghi opțional: ex. cortizol și grăsime abdominală"
            className="flex-1 min-w-[240px] bg-built-black border border-built-gray-2 rounded-lg px-4 py-2.5 text-built-white placeholder-built-gray-text/50 focus:outline-none focus:border-built-red/50 transition-colors"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="bg-built-red hover:bg-built-red/85 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Generez..." : "Generează 12 hook-uri"}
          </button>
        </div>
        {error && <p className="text-built-red text-sm mt-3">⚠ {error}</p>}
      </div>

      {result && (
        <div className="mb-10">
          <p className="text-[11px] text-built-gray-text mb-3">Alimentat de: {result.body.fed_by}</p>
          <div className="space-y-2">
            {result.body.hooks.map((h, i) => <HookRow key={i} h={h} />)}
          </div>
        </div>
      )}

      {history.length > 1 && (
        <div>
          <p className="font-condensed text-xs text-built-gray-text uppercase tracking-wider mb-3">Bănci generate anterior</p>
          <div className="space-y-2">
            {history.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setResult(h)}
                className="w-full text-left bg-built-gray-1 border border-built-gray-2 rounded-lg px-4 py-3 hover:border-built-red/40 transition-colors"
              >
                <p className="text-built-white text-sm truncate">{h.body.angle || "Mix pe toți pilonii"} — {h.body.hooks.length} hook-uri</p>
                <p className="text-[11px] text-built-gray-text">{new Date(h.created_at).toLocaleString("ro-RO")}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
