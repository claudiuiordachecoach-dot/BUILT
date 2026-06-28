"use client";

import { useState, useEffect, useRef } from "react";
import { getLastSession, saveWorkoutSession, type WExercise } from "../actions";

export type FullEx = { name: string; order: string; presc: string; rest: string; start: string; video: string; cues: { l: string; v: string }[] };
export type WDay = { key: string; label: string; exercises: FullEx[] };

type SetInput = { kg: string; reps: string };
type ExLog = { sets: SetInput[]; lastBest: { kg: number; reps: number } | null; lastSets: number; open: boolean };

function bestOf(sets: { kg: number; reps: number }[]) {
  let b: { kg: number; reps: number } | null = null;
  for (const s of sets) { if (s.kg <= 0 && s.reps <= 0) continue; if (!b || s.kg > b.kg || (s.kg === b.kg && s.reps > b.reps)) b = s; }
  return b;
}

export default function NativeWorkout({ days, todayKey }: { days: WDay[]; todayKey: string | null }) {
  const [activeKey, setActiveKey] = useState<string>(todayKey && days.some((d) => d.key === todayKey) ? todayKey : days[0]?.key || "");
  const active = days.find((d) => d.key === activeKey);

  const [log, setLog] = useState<ExLog[]>([]);
  const [lastDate, setLastDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [rest, setRest] = useState(0);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (rest <= 0) { if (restRef.current) { clearInterval(restRef.current); restRef.current = null; } return; }
    if (!restRef.current) restRef.current = setInterval(() => setRest((r) => (r <= 1 ? 0 : r - 1)), 1000);
    return () => { if (restRef.current) { clearInterval(restRef.current); restRef.current = null; } };
  }, [rest]);

  useEffect(() => {
    if (!active) return;
    setSaved(false);
    (async () => {
      const last = await getLastSession(active.key);
      setLastDate(last?.logged_on ?? null);
      const byName = new Map((last?.exercises ?? []).map((e) => [e.name, e]));
      setLog(active.exercises.map((ex) => {
        const le = byName.get(ex.name);
        return { sets: [{ kg: "", reps: "" }], lastBest: le ? bestOf(le.sets) : null, lastSets: le?.sets.length ?? 0, open: false };
      }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const setField = (i: number, j: number, f: keyof SetInput, v: string) =>
    setLog((p) => p.map((e, k) => (k === i ? { ...e, sets: e.sets.map((s, m) => (m === j ? { ...s, [f]: v } : s)) } : e)));
  const addSet = (i: number) => setLog((p) => p.map((e, k) => (k === i ? { ...e, sets: [...e.sets, { kg: "", reps: "" }] } : e)));
  const toggleOpen = (i: number) => setLog((p) => p.map((e, k) => (k === i ? { ...e, open: !e.open } : e)));

  function regressed(e: ExLog) {
    if (!e.lastBest) return false;
    const cur = bestOf(e.sets.map((s) => ({ kg: Number(s.kg) || 0, reps: Number(s.reps) || 0 })));
    if (!cur) return false;
    return cur.kg < e.lastBest.kg || (cur.kg === e.lastBest.kg && cur.reps < e.lastBest.reps);
  }

  async function save() {
    if (!active) return;
    setSaving(true);
    const payload: WExercise[] = active.exercises.map((ex, i) => ({
      name: ex.name,
      sets: (log[i]?.sets ?? []).map((s) => ({ kg: Number(s.kg) || 0, reps: Number(s.reps) || 0 })).filter((s) => s.kg > 0 || s.reps > 0),
    })).filter((e) => e.sets.length > 0);
    const r = await saveWorkoutSession(active.key, payload, "");
    setSaving(false);
    if (r.ok) { setSaved(true); setLastDate(new Date().toISOString().slice(0, 10)); setTimeout(() => setSaved(false), 4000); }
    else alert("Loghează măcar un set la un exercițiu.");
  }

  const fmtD = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
  if (days.length === 0) return null;

  return (
    <div className="px-4 pb-28">
      {/* Tab-uri zile + timer pauză */}
      <div className="sticky top-0 z-10 bg-built-black/95 backdrop-blur-sm -mx-4 px-4 py-2.5 flex items-center gap-3 border-b border-white/5">
        <div className="flex gap-1.5 overflow-x-auto flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {days.map((d) => (
            <button key={d.key} onClick={() => setActiveKey(d.key)}
              className={`shrink-0 font-condensed text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors ${
                d.key === activeKey ? "bg-built-red text-white" : "bg-white/5 text-zinc-400 hover:text-white"
              }`}>
              {d.label}{d.key === todayKey ? " · azi" : ""}
            </button>
          ))}
        </div>
        {rest > 0 ? (
          <button onClick={() => setRest(0)} className="shrink-0 font-display text-xl text-built-red tabular-nums leading-none">{Math.floor(rest / 60)}:{String(rest % 60).padStart(2, "0")}</button>
        ) : (
          <div className="shrink-0 flex gap-1">{[60, 90].map((s) => <button key={s} onClick={() => setRest(s)} className="font-condensed text-[10px] text-zinc-500 border border-white/10 hover:text-white px-1.5 py-1 rounded">{s}s</button>)}</div>
        )}
      </div>

      {lastDate && <p className="text-[11px] text-zinc-600 mt-3">Ultima dată {active?.label}: {fmtD(lastDate)}</p>}

      <div className="space-y-3 mt-3">
        {active?.exercises.map((ex, i) => {
          const el = log[i];
          const warn = el && regressed(el);
          return (
            <div key={i} className={`bg-[#111111] border rounded-2xl overflow-hidden ${warn ? "border-amber-500/40" : "border-white/10"}`}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {ex.order && <p className="font-condensed text-[9px] uppercase tracking-[0.2em] text-zinc-600 mb-0.5">{ex.order}</p>}
                    <p className="font-display text-lg text-built-white leading-tight">{ex.name}</p>
                  </div>
                </div>
                {(ex.presc || ex.rest || ex.start) && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ex.presc && <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-built-red/15 text-built-red border border-built-red/30">{ex.presc}</span>}
                    {ex.rest && <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/10">{ex.rest}</span>}
                    {ex.start && <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{ex.start}</span>}
                  </div>
                )}
                {el?.lastBest && <p className="text-[12px] text-zinc-500 mt-2">Data trecută: <span className="text-zinc-300">{el.lastBest.kg}kg × {el.lastBest.reps}</span></p>}
                {warn && <p className="text-[12px] text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 mt-2">↓ Sub data trecută ({el!.lastBest!.kg}kg × {el!.lastBest!.reps}).</p>}

                {/* Logging seturi */}
                <div className="space-y-1.5 mt-3">
                  {el?.sets.map((s, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <span className="font-condensed text-[10px] text-zinc-600 w-9 shrink-0">Set {j + 1}</span>
                      <input inputMode="decimal" value={s.kg} onChange={(e) => setField(i, j, "kg", e.target.value)} placeholder={el?.lastBest ? String(el.lastBest.kg) : "kg"} className="w-20 bg-[#0A0A0A] border border-white/10 rounded-lg px-2.5 py-2 text-sm text-white text-center placeholder-zinc-600 focus:border-built-red/50 focus:outline-none tabular-nums" />
                      <span className="text-zinc-600 text-sm">×</span>
                      <input inputMode="numeric" value={s.reps} onChange={(e) => setField(i, j, "reps", e.target.value)} placeholder={el?.lastBest ? String(el.lastBest.reps) : "reps"} className="w-16 bg-[#0A0A0A] border border-white/10 rounded-lg px-2.5 py-2 text-sm text-white text-center placeholder-zinc-600 focus:border-built-red/50 focus:outline-none tabular-nums" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2.5">
                  <button onClick={() => addSet(i)} className="font-condensed text-[10px] uppercase tracking-wider text-built-red hover:text-built-red-dark">+ set</button>
                  {(ex.video || ex.cues.length > 0) && (
                    <button onClick={() => toggleOpen(i)} className="font-condensed text-[10px] uppercase tracking-wider text-zinc-500 hover:text-white">{el?.open ? "ascunde execuția" : "▼ execuție + video"}</button>
                  )}
                </div>
              </div>

              {/* Execuție + video (colapsabil) */}
              {el?.open && (ex.video || ex.cues.length > 0) && (
                <div className="border-t border-white/10 bg-black/30 p-4 space-y-2.5">
                  {ex.video && (
                    <a href={ex.video} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[12px] font-semibold text-white bg-built-red/90 hover:bg-built-red px-3 py-2 rounded-lg transition-colors">
                      ▶ Video execuție (RO)
                    </a>
                  )}
                  {ex.cues.map((c, k) => (
                    <div key={k}>
                      <p className="font-condensed text-[10px] uppercase tracking-wider text-built-red">{c.l}</p>
                      <p className="text-[13px] text-zinc-300 leading-relaxed">{c.v}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Salvare (sticky jos) */}
      <div className="fixed bottom-[64px] md:bottom-4 left-0 md:left-56 right-0 px-4 z-20">
        <div className="max-w-3xl mx-auto">
          {saved && <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 mb-2 text-center">Antrenament salvat ✓</p>}
          <button onClick={save} disabled={saving} className="w-full font-condensed text-sm uppercase tracking-wider bg-built-red text-white py-3 rounded-xl hover:bg-built-red-dark transition-colors disabled:opacity-50 shadow-lg shadow-black/40">
            {saving ? "Salvez…" : `Salvează ${active?.label ?? "antrenamentul"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
