"use client";
import { useState } from "react";
import { submitCheckin } from "../actions";

function RangeInput({ label, value, onChange, min, max, unit }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; unit: string;
}) {
  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-zinc-200">{label}</label>
        <span className="text-lg font-bold text-built-red">{value}<span className="text-xs text-zinc-500 ml-0.5">{unit}</span></span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-built-red" />
      <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function CheckinPage() {
  const [form, setForm] = useState({ training_adherence: 70, nutrition_adherence: 70, energy_level: 6, mood: 6, notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await submitCheckin(form);
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl mb-4">✓</div>
      <h2 className="text-lg font-bold text-white mb-1">Check-in trimis!</h2>
      <p className="text-sm text-zinc-500">Claudiu va revizui raportul tău în curând.</p>
    </div>
  );

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-xl font-bold text-white mb-2">Check-in Săptămânal</h1>
      <p className="text-sm text-zinc-500 mb-6">Evaluează săptămâna ta sincer.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <RangeInput label="Aderență antrenament" value={form.training_adherence} onChange={v => setForm(f => ({...f, training_adherence: v}))} min={0} max={100} unit="%" />
        <RangeInput label="Aderență nutriție" value={form.nutrition_adherence} onChange={v => setForm(f => ({...f, nutrition_adherence: v}))} min={0} max={100} unit="%" />
        <RangeInput label="Nivel de energie" value={form.energy_level} onChange={v => setForm(f => ({...f, energy_level: v}))} min={1} max={10} unit="/10" />
        <RangeInput label="Dispoziție" value={form.mood} onChange={v => setForm(f => ({...f, mood: v}))} min={1} max={10} unit="/10" />
        <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
          <label className="block text-sm font-semibold text-zinc-200 mb-2">Note (opțional)</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
            rows={4} placeholder="Ce a mers bine? Unde ai întâmpinat dificultăți?"
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-zinc-300 placeholder-zinc-700 resize-none focus:outline-none" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-built-red hover:bg-built-red/90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all">
          {loading ? "Se trimite..." : "Trimite Check-in"}
        </button>
      </form>
    </div>
  );
}
