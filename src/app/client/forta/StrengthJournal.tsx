"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getStrengthJournal, logStrengthSet, deleteStrengthSet, type StrengthJournal as Journal } from "../actions";
import { COMPOUND_LIFTS, type StrengthExercise } from "@/lib/strength";

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
}

export default function StrengthJournal() {
  const [journal, setJournal] = useState<Journal | null>(null);
  const [exercise, setExercise] = useState<string>(COMPOUND_LIFTS[0]);
  const [custom, setCustom] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pr, setPr] = useState<string | null>(null);

  async function load() {
    const j = await getStrengthJournal();
    setJournal(j);
  }
  useEffect(() => {
    load();
  }, []);

  const usingCustom = exercise === "__custom__";
  const finalExercise = usingCustom ? custom.trim() : exercise;

  // Exercițiile sugerate: compusele BUILT + orice ai mai logat tu
  const loggedNames = (journal?.exercises ?? []).map((e) => e.name);
  const chips = [...COMPOUND_LIFTS, ...loggedNames.filter((n) => !COMPOUND_LIFTS.includes(n))];

  async function save() {
    setErr(null);
    setPr(null);
    if (!finalExercise) {
      setErr("Alege sau scrie un exercițiu.");
      return;
    }
    if (!(Number(weight) > 0)) {
      setErr("Pune greutatea în kg.");
      return;
    }
    setSaving(true);
    const res = await logStrengthSet({
      exercise: finalExercise,
      weight: Number(weight),
      reps: reps ? Number(reps) : undefined,
      note: note || undefined,
    });
    setSaving(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    if (res.isPR) {
      setPr(`Record nou — ${Number(weight)} kg la ${finalExercise}.`);
      setTimeout(() => setPr(null), 6000);
    }
    setWeight("");
    setReps("");
    setNote("");
    await load();
  }

  async function remove(id: string) {
    await deleteStrengthSet(id);
    await load();
  }

  const inputCls =
    "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-built-red";

  return (
    <div className="space-y-6">
      {/* Formular de log */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
        <p className="text-sm font-semibold text-zinc-200 mb-3">Notează un set</p>

        {/* Exerciții — chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setExercise(c)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                exercise === c ? "border-built-red text-built-red bg-built-red/10" : "border-white/10 text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {c}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setExercise("__custom__")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              usingCustom ? "border-built-red text-built-red bg-built-red/10" : "border-white/10 text-zinc-400 hover:text-zinc-100"
            }`}
          >
            Altul
          </button>
        </div>

        {usingCustom && (
          <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Numele exercițiului" className={`${inputCls} mb-3`} />
        )}

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[11px] text-zinc-500 mb-1">Greutate (kg)</label>
            <input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" placeholder="ex: 80" className={inputCls} />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] text-zinc-500 mb-1">Repetări</label>
            <input value={reps} onChange={(e) => setReps(e.target.value)} inputMode="numeric" placeholder="ex: 5" className={inputCls} />
          </div>
        </div>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notă (opțional): cum s-a simțit setul" className={`${inputCls} mt-3`} />

        {err && <p className="text-xs text-built-red mt-3">{err}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="mt-4 w-full bg-built-red text-white text-sm font-semibold py-3 rounded-lg press transition-colors hover:bg-built-red/90 disabled:opacity-50"
        >
          {saving ? "Se salvează…" : "Salvează setul"}
        </button>

        {pr && (
          <div className="mt-3 flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2.5 anim-fade">
            <span className="text-[10px] font-bold uppercase tracking-widest text-green-400 border border-green-500/40 rounded px-1.5 py-0.5">Record nou</span>
            <span className="text-sm text-green-300">{pr}</span>
          </div>
        )}
      </div>

      {/* Carduri per exercițiu */}
      {journal === null ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-built-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : journal.exercises.length === 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-xl p-8 text-center">
          <p className="text-zinc-300 font-medium">Aici începe dovada.</p>
          <p className="text-zinc-500 text-sm mt-1">Notează primul tău set de mai sus. Peste câteva săptămâni vei vedea negru pe alb cât ai crescut.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {journal.exercises.map((ex) => (
            <ExerciseCard key={ex.name} ex={ex} />
          ))}
        </div>
      )}

      {/* Seturi recente */}
      {journal && journal.recent.length > 0 && (
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <p className="text-sm font-semibold text-zinc-200 mb-3">Ultimele seturi</p>
          <div className="space-y-1.5">
            {journal.recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-white font-medium">{r.weight} kg</span>
                  {r.reps != null && <span className="text-zinc-500">× {r.reps}</span>}
                  <span className="text-zinc-400 truncate">{r.exercise}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-zinc-600">{fmtDate(r.date)}</span>
                  <button onClick={() => remove(r.id)} className="text-zinc-600 hover:text-built-red text-xs">Șterge</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExerciseCard({ ex }: { ex: StrengthExercise }) {
  const data = ex.points.map((p) => ({ date: fmtDate(p.date), weight: p.weight }));
  const grew = ex.deltaFromStart > 0;
  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-zinc-200 font-semibold">{ex.name}</p>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            ultima: {ex.last.weight} kg{ex.last.reps != null ? ` × ${ex.last.reps}` : ""} · {fmtDate(ex.last.date)} · {ex.sessions} {ex.sessions === 1 ? "sesiune" : "sesiuni"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white leading-none">{ex.best} <span className="text-sm font-medium text-zinc-500">kg</span></p>
          <p className="text-[10px] text-zinc-600">recordul tău</p>
        </div>
      </div>

      {ex.points.length >= 2 && (
        <>
          {grew && (
            <p className="text-xs text-green-400 font-medium mb-2">+{ex.deltaFromStart.toFixed(1)} kg de la primul set</p>
          )}
          <div style={{ height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} minTickGap={24} />
                <YAxis tick={{ fill: "#71717a", fontSize: 10 }} domain={["dataMin - 5", "dataMax + 5"]} />
                <Tooltip
                  contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#a1a1aa", fontSize: 10 }}
                  itemStyle={{ fontSize: 11 }}
                />
                <Line type="monotone" dataKey="weight" stroke="#C0392B" strokeWidth={2} dot={{ r: 2.5, fill: "#C0392B" }} name="kg" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
