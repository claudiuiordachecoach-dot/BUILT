"use client";

import { useState, useEffect, useRef } from "react";
import { getWorkoutDays, getLastSession, saveWorkoutSession, type WorkoutDay, type WExercise } from "../actions";

type SetInput = { kg: string; reps: string };
type ExState = {
  name: string;
  rest: string;
  lastBest: { kg: number; reps: number } | null;
  lastSets: number;
  sets: SetInput[];
};

function bestOf(sets: { kg: number; reps: number }[]): { kg: number; reps: number } | null {
  let best: { kg: number; reps: number } | null = null;
  for (const s of sets) {
    if (s.kg <= 0 && s.reps <= 0) continue;
    if (!best || s.kg > best.kg || (s.kg === best.kg && s.reps > best.reps)) best = s;
  }
  return best;
}

const fmtDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("ro-RO", { day: "numeric", month: "short" });

export default function WorkoutSession() {
  const [mode, setMode] = useState<"pick" | "active">("pick");
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [loading, setLoading] = useState(true);

  const [dayLabel, setDayLabel] = useState("");
  const [exercises, setExercises] = useState<ExState[]>([]);
  const [note, setNote] = useState("");
  const [newDayName, setNewDayName] = useState("");
  const [newExName, setNewExName] = useState("");
  const [opening, setOpening] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Rest timer
  const [rest, setRest] = useState(0);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (rest <= 0) { if (restRef.current) { clearInterval(restRef.current); restRef.current = null; } return; }
    if (!restRef.current) restRef.current = setInterval(() => setRest((r) => (r <= 1 ? 0 : r - 1)), 1000);
    return () => { if (restRef.current) { clearInterval(restRef.current); restRef.current = null; } };
  }, [rest]);

  async function loadDays() {
    setLoading(true);
    setDays(await getWorkoutDays());
    setLoading(false);
  }
  useEffect(() => { loadDays(); }, []);

  async function openDay(label: string) {
    setOpening(true);
    const last = await getLastSession(label);
    const exs: ExState[] = (last?.exercises ?? []).map((e) => ({
      name: e.name,
      rest: e.rest ? String(e.rest) : "",
      lastBest: bestOf(e.sets),
      lastSets: e.sets.length,
      sets: [{ kg: "", reps: "" }],
    }));
    setDayLabel(label);
    setExercises(exs);
    setNote("");
    setOpening(false);
    setMode("active");
  }

  function startNew() {
    const name = newDayName.trim();
    if (!name) return;
    setDayLabel(name);
    setExercises([]);
    setNote("");
    setNewDayName("");
    setMode("active");
  }

  function addExercise() {
    const n = newExName.trim();
    if (!n) return;
    setExercises((p) => [...p, { name: n, rest: "", lastBest: null, lastSets: 0, sets: [{ kg: "", reps: "" }] }]);
    setNewExName("");
  }
  function addSet(i: number) {
    setExercises((p) => p.map((e, k) => (k === i ? { ...e, sets: [...e.sets, { kg: "", reps: "" }] } : e)));
  }
  function removeSet(i: number, j: number) {
    setExercises((p) => p.map((e, k) => (k === i ? { ...e, sets: e.sets.filter((_, m) => m !== j) } : e)));
  }
  function setField(i: number, j: number, field: keyof SetInput, val: string) {
    setExercises((p) => p.map((e, k) => (k === i ? { ...e, sets: e.sets.map((s, m) => (m === j ? { ...s, [field]: val } : s)) } : e)));
  }
  function setRestField(i: number, val: string) {
    setExercises((p) => p.map((e, k) => (k === i ? { ...e, rest: val } : e)));
  }
  function removeExercise(i: number) {
    setExercises((p) => p.filter((_, k) => k !== i));
  }

  function regressed(e: ExState): boolean {
    if (!e.lastBest) return false;
    const cur = bestOf(e.sets.map((s) => ({ kg: Number(s.kg) || 0, reps: Number(s.reps) || 0 })));
    if (!cur) return false;
    return cur.kg < e.lastBest.kg || (cur.kg === e.lastBest.kg && cur.reps < e.lastBest.reps);
  }

  async function save() {
    setSaving(true);
    const payload: WExercise[] = exercises.map((e) => ({
      name: e.name,
      rest: e.rest ? Number(e.rest) : undefined,
      sets: e.sets.map((s) => ({ kg: Number(s.kg) || 0, reps: Number(s.reps) || 0 })).filter((s) => s.kg > 0 || s.reps > 0),
    }));
    const r = await saveWorkoutSession(dayLabel, payload, note);
    setSaving(false);
    if (r.ok) {
      setMode("pick");
      setToast("Antrenament salvat. Data viitoare îți arăt cât ai făcut azi.");
      setTimeout(() => setToast(""), 4000);
      loadDays();
    } else {
      setToast("Nu s-a salvat — adaugă măcar un exercițiu cu un set.");
      setTimeout(() => setToast(""), 4000);
    }
  }

  // ─────────────────────────────────────────────────────── PICK ──
  if (mode === "pick") {
    return (
      <div className="space-y-6">
        <div>
          <p className="font-condensed text-[11px] text-built-red uppercase tracking-[0.25em] mb-1">Base Strength</p>
          <h1 className="font-display text-4xl tracking-wider text-built-white">Antrenamentul de azi</h1>
          <p className="text-zinc-500 mt-1">Alege ziua pe care o faci la sală. Loghezi seturile, iar data viitoare vezi exact cât ai ridicat.</p>
        </div>

        {toast && <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2.5">{toast}</p>}

        {loading ? (
          <p className="text-zinc-500 text-sm">Se încarcă…</p>
        ) : (
          <>
            {days.length > 0 && (
              <div>
                <p className="font-condensed text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Reia un antrenament</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {days.map((d) => (
                    <button
                      key={d.label}
                      onClick={() => openDay(d.label)}
                      disabled={opening}
                      className="text-left bg-[#111111] border border-white/10 hover:border-built-red/40 rounded-xl p-4 press transition-colors disabled:opacity-60"
                    >
                      <p className="font-display text-xl text-built-white">{d.label}</p>
                      <p className="text-[12px] text-zinc-500 mt-0.5">
                        ultima dată {d.lastDate ? fmtDate(d.lastDate) : "—"} · {d.count} {d.count === 1 ? "sesiune" : "sesiuni"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
              <p className="font-condensed text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Antrenament nou</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={newDayName}
                  onChange={(e) => setNewDayName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && startNew()}
                  placeholder="ex: Piept + Triceps / Antrenament A / Picioare"
                  className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-built-red/50 focus:outline-none"
                />
                <button
                  onClick={startNew}
                  className="shrink-0 font-condensed text-[11px] uppercase tracking-wider bg-built-red text-white px-4 py-2.5 rounded-lg hover:bg-built-red-dark transition-colors"
                >
                  Începe →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ───────────────────────────────────────────────────── ACTIVE ──
  return (
    <div className="space-y-5">
      {/* Header focusat */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <button onClick={() => setMode("pick")} className="font-condensed text-[10px] uppercase tracking-wider text-zinc-500 hover:text-built-white transition-colors">← Înapoi</button>
          <h1 className="font-display text-3xl tracking-wide text-built-white leading-none mt-1 truncate">{dayLabel}</h1>
        </div>
        {/* Rest timer */}
        <div className="shrink-0 text-right">
          {rest > 0 ? (
            <button onClick={() => setRest(0)} className="font-display text-2xl text-built-red tabular-nums leading-none">
              {Math.floor(rest / 60)}:{String(rest % 60).padStart(2, "0")}
              <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-condensed">pauză · oprește</span>
            </button>
          ) : (
            <div className="flex gap-1">
              {[60, 90, 120].map((s) => (
                <button key={s} onClick={() => setRest(s)} className="font-condensed text-[10px] text-zinc-400 border border-white/10 hover:border-built-red/40 hover:text-built-white px-2 py-1 rounded transition-colors">
                  {s}s
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exerciții */}
      {exercises.map((e, i) => {
        const warn = regressed(e);
        return (
          <div key={i} className={`bg-[#111111] border rounded-xl p-4 ${warn ? "border-amber-500/40" : "border-white/10"}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-display text-lg text-built-white leading-tight">{e.name}</p>
                {e.lastBest ? (
                  <p className="text-[12px] text-zinc-500 mt-0.5">
                    Data trecută: <span className="text-zinc-300">{e.lastBest.kg}kg × {e.lastBest.reps}</span>
                    {e.lastSets > 0 && ` · ${e.lastSets} ${e.lastSets === 1 ? "set" : "seturi"}`}
                  </p>
                ) : (
                  <p className="text-[12px] text-zinc-600 mt-0.5">prima dată — setezi reperul</p>
                )}
              </div>
              <button onClick={() => removeExercise(i)} className="shrink-0 text-zinc-600 hover:text-built-red text-lg leading-none">×</button>
            </div>

            {warn && (
              <p className="text-[12px] text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 mb-2">
                ↓ Sub data trecută ({e.lastBest!.kg}kg × {e.lastBest!.reps}). Dacă nu e zi proastă, mai ai un set în tine.
              </p>
            )}

            <div className="space-y-1.5">
              {e.sets.map((s, j) => (
                <div key={j} className="flex items-center gap-2">
                  <span className="font-condensed text-[10px] text-zinc-600 w-10 shrink-0">Set {j + 1}</span>
                  <input
                    inputMode="decimal"
                    value={s.kg}
                    onChange={(ev) => setField(i, j, "kg", ev.target.value)}
                    placeholder={e.lastBest ? String(e.lastBest.kg) : "kg"}
                    className="w-20 bg-[#0A0A0A] border border-white/10 rounded-lg px-2.5 py-2 text-sm text-white text-center placeholder-zinc-600 focus:border-built-red/50 focus:outline-none tabular-nums"
                  />
                  <span className="text-zinc-600 text-sm">kg ×</span>
                  <input
                    inputMode="numeric"
                    value={s.reps}
                    onChange={(ev) => setField(i, j, "reps", ev.target.value)}
                    placeholder={e.lastBest ? String(e.lastBest.reps) : "reps"}
                    className="w-16 bg-[#0A0A0A] border border-white/10 rounded-lg px-2.5 py-2 text-sm text-white text-center placeholder-zinc-600 focus:border-built-red/50 focus:outline-none tabular-nums"
                  />
                  <span className="text-zinc-600 text-sm">reps</span>
                  {e.sets.length > 1 && (
                    <button onClick={() => removeSet(i, j)} className="ml-auto text-zinc-700 hover:text-built-red text-sm">×</button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-2.5">
              <button onClick={() => addSet(i)} className="font-condensed text-[10px] uppercase tracking-wider text-built-red hover:text-built-red-dark transition-colors">+ set</button>
              <span className="text-zinc-700">·</span>
              <span className="flex items-center gap-1.5">
                <input
                  inputMode="numeric"
                  value={e.rest}
                  onChange={(ev) => setRestField(i, ev.target.value)}
                  placeholder="pauză s"
                  className="w-16 bg-[#0A0A0A] border border-white/10 rounded px-2 py-1 text-[12px] text-white text-center placeholder-zinc-600 focus:border-built-red/50 focus:outline-none"
                />
                {e.rest && Number(e.rest) > 0 && (
                  <button onClick={() => setRest(Number(e.rest))} className="font-condensed text-[10px] uppercase tracking-wider text-zinc-400 border border-white/10 hover:border-built-red/40 hover:text-built-white px-2 py-1 rounded transition-colors">▶ pauză</button>
                )}
              </span>
            </div>
          </div>
        );
      })}

      {/* Adaugă exercițiu */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={newExName}
          onChange={(e) => setNewExName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addExercise()}
          placeholder="Adaugă exercițiu (ex: Genuflexiuni, Împins la piept)"
          className="flex-1 bg-[#111111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-built-red/50 focus:outline-none"
        />
        <button onClick={addExercise} className="shrink-0 font-condensed text-[11px] uppercase tracking-wider text-built-red border border-built-red/40 hover:bg-built-red/10 px-4 py-2.5 rounded-lg transition-colors">+ exercițiu</button>
      </div>

      {/* Notă + salvare */}
      {exercises.length > 0 && (
        <>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Notă (opțional): cum a mers azi?"
            className="w-full bg-[#111111] border border-white/10 rounded-lg p-3 text-sm text-white placeholder-zinc-600 focus:border-built-red/50 focus:outline-none resize-y"
          />
          <button
            onClick={save}
            disabled={saving}
            className="w-full font-condensed text-sm uppercase tracking-wider bg-built-red text-white py-3 rounded-lg hover:bg-built-red-dark transition-colors disabled:opacity-50"
          >
            {saving ? "Salvez…" : "Salvează antrenamentul"}
          </button>
        </>
      )}
    </div>
  );
}
