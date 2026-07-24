"use client";

import { useState } from "react";
import { toggleTodayItem } from "../actions";

const ITEMS: { key: string; label: string; icon: string }[] = [
  { key: "antrenament", label: "Antrenament", icon: "⚡" },
  { key: "nutritie", label: "Nutriție pe plan", icon: "◉" },
  { key: "hidratare", label: "Hidratare (2L+)", icon: "💧" },
  { key: "somn", label: "Somn 7h+", icon: "🌙" },
];

export default function DailyChecklist({
  clientId,
  initial,
}: {
  clientId: number;
  initial: Record<string, boolean>;
}) {
  const [state, setState] = useState<Record<string, boolean>>(initial || {});

  const toggle = async (key: string) => {
    const next = !state[key];
    setState((s) => ({ ...s, [key]: next }));
    try {
      await toggleTodayItem(clientId, key, next);
    } catch {
      setState((s) => ({ ...s, [key]: !next })); // revert la eroare
    }
  };

  const done = ITEMS.filter((i) => state[i.key]).length;

  return (
    <div id="executia-ta" className="bg-[#111111] border border-white/10 rounded-2xl p-5 mb-5 scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <span className="font-condensed text-[11px] text-zinc-400 uppercase tracking-[0.2em]">Azi · execuția ta</span>
        <span className="font-display text-xl text-built-red leading-none">{done}/{ITEMS.length}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map((item) => {
          const active = !!state[item.key];
          return (
            <button
              key={item.key}
              onClick={() => toggle(item.key)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all active:scale-[0.97] text-left ${
                active
                  ? "bg-built-red/15 border-built-red/40 shadow-[0_0_15px_rgba(192,57,43,0.15)]"
                  : "bg-[#1a1a1a] border-white/10 hover:border-white/20"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  active ? "bg-built-red text-white" : "bg-white/5 text-zinc-600"
                }`}
              >
                {active ? "✓" : ""}
              </span>
              <span className={`text-sm ${active ? "text-white font-medium" : "text-zinc-400"}`}>
                {item.icon} {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {done === ITEMS.length && (
        <p className="text-xs text-green-400 mt-3 text-center">Zi completă. Sistemul rulează. 🔥</p>
      )}
    </div>
  );
}
