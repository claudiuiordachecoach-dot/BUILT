"use client";

import { useState, useEffect, useRef } from "react";
import { getLastSession, getWorkoutDays, saveWorkoutSession, type WExercise, type WorkoutDay } from "../actions";

type SetInput = { kg: string; reps: string };
type Ex = { name: string; lastBest: { kg: number; reps: number } | null; lastSets: number; sets: SetInput[] };
export type PlanDay = { key: string; label: string; exercises: string[] };

function bestOf(sets: { kg: number; reps: number }[]): { kg: number; reps: number } | null {
  let b: { kg: number; reps: number } | null = null;
  for (const s of sets) {
    if (s.kg <= 0 && s.reps <= 0) continue;
    if (!b || s.kg > b.kg || (s.kg === b.kg && s.reps > b.reps)) b = s;
  }
  return b;
}
const fmtD = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("ro-RO", { day: "numeric", month: "short" });

export default function TodayWorkoutLogger({
  planDays,
  todayKey,
  onClose,
  onSaved,
}: {
  planDays: PlanDay[];
  todayKey: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [chosen, setChosen] = useState<PlanDay | null>(null);

  if (chosen) {
    return <LogScreen day={chosen} onBack={() => setChosen(null)} onSaved={onSaved} />;
  }
  return <ChoiceScreen planDays={planDays} todayKey={todayKey} onPick={setChosen} onClose={onClose} />;
}

// ───────────────────────────────────────── FAZA 1: alege antrenamentul ──
function ChoiceScreen({
  planDays,
  todayKey,
  onPick,
  onClose,
}: {
  planDays: PlanDay[];
  todayKey: string | null;
  onPick: (d: PlanDay) => void;
  onClose: () => void;
}) {
  const [recent, setRecent] = useState<WorkoutDay[]>([]);
  const [custom, setCustom] = useState("");
  useEffect(() => { getWorkoutDays().then(setRecent).catch(() => {}); }, []);

  const lastFor = (key: string) => recent.find((r) => r.label === key)?.lastDate ?? null;
  const planKeys = new Set(planDays.map((d) => d.key));
  const extras = recent.filter((r) => !planKeys.has(r.label)); // antrenamente trecute care nu-s în plan

  const today = todayKey ? planDays.find((d) => d.key === todayKey) : null;
  const rest = planDays.filter((d) => d.key !== todayKey);

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto w-full">
      <div className="mb-5">
        <button onClick={onClose} className="font-condensed text-[10px] uppercase tracking-wider text-zinc-500 hover:text-built-white transition-colors">← Înapoi la plan</button>
        <h1 className="font-display text-3xl tracking-wide text-built-white leading-none mt-1">Ce antrenezi azi?</h1>
        <p className="text-zinc-500 text-sm mt-1">Alege din plan, repetă unul trecut, sau pornește unul liber.</p>
      </div>

      {today && (
        <button onClick={() => onPick(today)} className="w-full text-left bg-built-red/[0.1] border border-built-red/50 rounded-xl p-4 mb-4 press transition-colors hover:bg-built-red/[0.16]">
          <p className="font-condensed text-[10px] text-built-red uppercase tracking-wider">Recomandat azi</p>
          <p className="font-display text-2xl text-built-white leading-tight">{today.label}</p>
          <p className="text-[12px] text-zinc-400 mt-0.5">{today.exercises.length} exerciții{lastFor(today.key) ? ` · ultima dată ${fmtD(lastFor(today.key)!)}` : ""}</p>
        </button>
      )}

      {rest.length > 0 && (
        <>
          <p className="font-condensed text-[10px] uppercase tracking-wider text-zinc-500 mb-2">{today ? "Sau altă zi din plan" : "Planul tău"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {rest.map((d) => (
              <button key={d.key} onClick={() => onPick(d)} className="text-left bg-[#111111] border border-white/10 hover:border-built-red/40 rounded-xl p-4 press transition-colors">
                <p className="font-display text-xl text-built-white">{d.label}</p>
                <p className="text-[12px] text-zinc-500 mt-0.5">{d.exercises.length} exerciții{lastFor(d.key) ? ` · ${fmtD(lastFor(d.key)!)}` : ""}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {extras.length > 0 && (
        <>
          <p className="font-condensed text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Repetă din trecut</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {extras.map((r) => (
              <button key={r.label} onClick={() => onPick({ key: r.label, label: r.label, exercises: [] })} className="text-left bg-[#111111] border border-white/10 hover:border-built-red/40 rounded-xl p-4 press transition-colors">
                <p className="font-display text-xl text-built-white">{r.label}</p>
                <p className="text-[12px] text-zinc-500 mt-0.5">ultima dată {r.lastDate ? fmtD(r.lastDate) : "—"} · {r.count} {r.count === 1 ? "sesiune" : "sesiuni"}</p>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
        <p className="font-condensed text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Antrenament liber</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === "Enter" && custom.trim() && onPick({ key: custom.trim(), label: custom.trim(), exercises: [] })} placeholder="ex: Piept liber / Cardio + abdomen" className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-built-red/50 focus:outline-none" />
          <button onClick={() => custom.trim() && onPick({ key: custom.trim(), label: custom.trim(), exercises: [] })} className="shrink-0 font-condensed text-[11px] uppercase tracking-wider bg-built-red text-white px-4 py-2.5 rounded-lg hover:bg-built-red-dark transition-colors">Începe →</button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────── FAZA 2: logging focusat ──
function LogScreen({ day, onBack, onSaved }: { day: PlanDay; onBack: () => void; onSaved: () => void }) {
  const [ex, setEx] = useState<Ex[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDate, setLastDate] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");

  const [rest, setRest] = useState(0);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (rest <= 0) { if (restRef.current) { clearInterval(restRef.current); restRef.current = null; } return; }
    if (!restRef.current) restRef.current = setInterval(() => setRest((r) => (r <= 1 ? 0 : r - 1)), 1000);
    return () => { if (restRef.current) { clearInterval(restRef.current); restRef.current = null; } };
  }, [rest]);

  useEffect(() => {
    (async () => {
      const last = await getLastSession(day.key);
      setLastDate(last?.logged_on ?? null);
      const byName = new Map((last?.exercises ?? []).map((e) => [e.name, e]));
      const seed: Ex[] = day.exercises.map((name) => {
        const le = byName.get(name);
        return { name, lastBest: le ? bestOf(le.sets) : null, lastSets: le?.sets.length ?? 0, sets: [{ kg: "", reps: "" }] };
      });
      for (const le of last?.exercises ?? []) {
        if (!day.exercises.includes(le.name)) seed.push({ name: le.name, lastBest: bestOf(le.sets), lastSets: le.sets.length, sets: [{ kg: "", reps: "" }] });
      }
      setEx(seed.length ? seed : [{ name: "", lastBest: null, lastSets: 0, sets: [{ kg: "", reps: "" }] }]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day.key]);

  const setField = (i: number, j: number, f: keyof SetInput, v: string) =>
    setEx((p) => p.map((e, k) => (k === i ? { ...e, sets: e.sets.map((s, m) => (m === j ? { ...s, [f]: v } : s)) } : e)));
  const addSet = (i: number) => setEx((p) => p.map((e, k) => (k === i ? { ...e, sets: [...e.sets, { kg: "", reps: "" }] } : e)));
  const removeSet = (i: number, j: number) => setEx((p) => p.map((e, k) => (k === i ? { ...e, sets: e.sets.filter((_, m) => m !== j) } : e)));
  const setName = (i: number, v: string) => setEx((p) => p.map((e, k) => (k === i ? { ...e, name: v } : e)));
  const removeEx = (i: number) => setEx((p) => p.filter((_, k) => k !== i));
  const addEx = () => { const n = newName.trim(); if (!n) return; setEx((p) => [...p, { name: n, lastBest: null, lastSets: 0, sets: [{ kg: "", reps: "" }] }]); setNewName(""); };

  function regressed(e: Ex): boolean {
    if (!e.lastBest) return false;
    const cur = bestOf(e.sets.map((s) => ({ kg: Number(s.kg) || 0, reps: Number(s.reps) || 0 })));
    if (!cur) return false;
    return cur.kg < e.lastBest.kg || (cur.kg === e.lastBest.kg && cur.reps < e.lastBest.reps);
  }

  async function save() {
    setSaving(true);
    const payload: WExercise[] = ex.map((e) => ({
      name: e.name.trim(),
      sets: e.sets.map((s) => ({ kg: Number(s.kg) || 0, reps: Number(s.reps) || 0 })).filter((s) => s.kg > 0 || s.reps > 0),
    }));
    const r = await saveWorkoutSession(day.key, payload, note);
    setSaving(false);
    if (r.ok) onSaved();
    else alert("Adaugă măcar un set (kg sau reps) la un exercițiu.");
  }

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <button onClick={onBack} className="font-condensed text-[10px] uppercase tracking-wider text-zinc-500 hover:text-built-white transition-colors">← Alege altul</button>
          <h1 className="font-display text-3xl tracking-wide text-built-white leading-none mt-1 truncate">{day.label}</h1>
          {lastDate && <p className="text-[11px] text-zinc-600 mt-1">ultima dată: {fmtD(lastDate)}</p>}
        </div>
        <div className="shrink-0 text-right">
          {rest > 0 ? (
            <button onClick={() => setRest(0)} className="font-display text-2xl text-built-red tabular-nums leading-none">
              {Math.floor(rest / 60)}:{String(rest % 60).padStart(2, "0")}
              <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-condensed">pauză · stop</span>
            </button>
          ) : (
            <div className="flex gap-1">
              {[60, 90, 120].map((s) => (
                <button key={s} onClick={() => setRest(s)} className="font-condensed text-[10px] text-zinc-400 border border-white/10 hover:border-built-red/40 hover:text-built-white px-2 py-1 rounded transition-colors">{s}s</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Se încarcă…</p>
      ) : (
        <>
          <div className="space-y-3">
            {ex.map((e, i) => {
              const warn = regressed(e);
              return (
                <div key={i} className={`bg-[#111111] border rounded-xl p-4 ${warn ? "border-amber-500/40" : "border-white/10"}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <input value={e.name} onChange={(ev) => setName(i, ev.target.value)} placeholder="Nume exercițiu" className="flex-1 bg-transparent font-display text-lg text-built-white leading-tight focus:outline-none border-b border-transparent focus:border-built-red/40" />
                    <button onClick={() => removeEx(i)} className="shrink-0 text-zinc-600 hover:text-built-red text-lg leading-none">×</button>
                  </div>
                  {e.lastBest ? (
                    <p className="text-[12px] text-zinc-500 mb-2">Data trecută: <span className="text-zinc-300">{e.lastBest.kg}kg × {e.lastBest.reps}</span>{e.lastSets ? ` · ${e.lastSets} ${e.lastSets === 1 ? "set" : "seturi"}` : ""}</p>
                  ) : null}
                  {warn && (
                    <p className="text-[12px] text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 mb-2">↓ Sub data trecută ({e.lastBest!.kg}kg × {e.lastBest!.reps}). Dacă nu e zi proastă, mai ai un set în tine.</p>
                  )}
                  <div className="space-y-1.5">
                    {e.sets.map((s, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <span className="font-condensed text-[10px] text-zinc-600 w-10 shrink-0">Set {j + 1}</span>
                        <input inputMode="decimal" value={s.kg} onChange={(ev) => setField(i, j, "kg", ev.target.value)} placeholder={e.lastBest ? String(e.lastBest.kg) : "kg"} className="w-20 bg-[#0A0A0A] border border-white/10 rounded-lg px-2.5 py-2 text-sm text-white text-center placeholder-zinc-600 focus:border-built-red/50 focus:outline-none tabular-nums" />
                        <span className="text-zinc-600 text-sm">kg ×</span>
                        <input inputMode="numeric" value={s.reps} onChange={(ev) => setField(i, j, "reps", ev.target.value)} placeholder={e.lastBest ? String(e.lastBest.reps) : "reps"} className="w-16 bg-[#0A0A0A] border border-white/10 rounded-lg px-2.5 py-2 text-sm text-white text-center placeholder-zinc-600 focus:border-built-red/50 focus:outline-none tabular-nums" />
                        <span className="text-zinc-600 text-sm">reps</span>
                        {e.sets.length > 1 && <button onClick={() => removeSet(i, j)} className="ml-auto text-zinc-700 hover:text-built-red text-sm">×</button>}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => addSet(i)} className="font-condensed text-[10px] uppercase tracking-wider text-built-red hover:text-built-red-dark transition-colors mt-2.5">+ set</button>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addEx()} placeholder="Adaugă un exercițiu" className="flex-1 bg-[#111111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-built-red/50 focus:outline-none" />
            <button onClick={addEx} className="shrink-0 font-condensed text-[10px] uppercase tracking-wider text-built-red border border-built-red/40 hover:bg-built-red/10 px-4 py-2.5 rounded-lg transition-colors">+ exercițiu</button>
          </div>

          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Notă (opțional): cum a mers azi?" className="w-full bg-[#111111] border border-white/10 rounded-lg p-3 text-sm text-white placeholder-zinc-600 focus:border-built-red/50 focus:outline-none resize-y mt-3" />

          <button onClick={save} disabled={saving} className="w-full font-condensed text-sm uppercase tracking-wider bg-built-red text-white py-3 rounded-lg hover:bg-built-red-dark transition-colors disabled:opacity-50 mt-3">{saving ? "Salvez…" : "Salvează antrenamentul"}</button>
        </>
      )}
    </div>
  );
}
