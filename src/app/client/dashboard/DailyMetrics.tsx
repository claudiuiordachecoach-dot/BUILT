"use client";

import { useState } from "react";
import { saveTodayMetric } from "../actions";

const METRICS: { key: string; label: string; unit: string; step: number; decimal: boolean; placeholder: string }[] = [
  { key: "steps", label: "Pași", unit: "azi", step: 100, decimal: false, placeholder: "8000" },
  { key: "sleep_h", label: "Somn", unit: "ore", step: 0.5, decimal: true, placeholder: "7.5" },
  { key: "weight", label: "Greutate", unit: "kg", step: 0.1, decimal: true, placeholder: "85.0" },
  { key: "waist", label: "Talie", unit: "cm", step: 0.5, decimal: true, placeholder: "90" },
];

export default function DailyMetrics({
  clientId,
  initial,
}: {
  clientId: number;
  initial: Record<string, number | undefined>;
}) {
  const [vals, setVals] = useState<Record<string, string>>(() => ({
    steps: initial.steps != null ? String(initial.steps) : "",
    sleep_h: initial.sleep_h != null ? String(initial.sleep_h) : "",
    weight: initial.weight != null ? String(initial.weight) : "",
    waist: initial.waist != null ? String(initial.waist) : "",
  }));
  const [saved, setSaved] = useState<string | null>(null);

  async function commit(key: string) {
    const raw = vals[key].trim().replace(",", ".");
    const num = raw === "" ? null : Number(raw);
    if (raw !== "" && (num === null || Number.isNaN(num))) return;
    try {
      await saveTodayMetric(clientId, key, num);
      setSaved(key);
      setTimeout(() => setSaved((s) => (s === key ? null : s)), 1600);
    } catch {
      /* păstrăm valoarea în UI; reîncearcă la următorul blur */
    }
  }

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 mb-5">
      <p className="font-condensed text-[11px] text-zinc-400 uppercase tracking-[0.2em] mb-4">Azi · numerele tale</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {METRICS.map((m) => (
          <div key={m.key}>
            <label className="text-[10px] font-condensed uppercase tracking-wider text-zinc-500 mb-1.5 block">
              {m.label}
            </label>
            <input
              type="number"
              inputMode={m.decimal ? "decimal" : "numeric"}
              step={m.step}
              min={0}
              value={vals[m.key]}
              placeholder={m.placeholder}
              onChange={(e) => setVals((v) => ({ ...v, [m.key]: e.target.value }))}
              onBlur={() => commit(m.key)}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-base text-white text-center tabular-nums placeholder-zinc-700 focus:outline-none focus:border-built-red/50 transition-colors"
            />
            <p className="text-[10px] text-center mt-1 h-3.5">
              {saved === m.key ? <span className="text-green-400">salvat ✓</span> : <span className="text-zinc-600">{m.unit}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
