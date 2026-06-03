"use client";
import { useState, useEffect } from "react";
import { submitCheckin, getClientCheckinsForClient, type ClientCheckin } from "../actions";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function RangeInput({ label, value, onChange, min, max, step = 1, unit }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit: string;
}) {
  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-zinc-200">{label}</label>
        <span className="text-lg font-bold text-built-red">{value}<span className="text-xs text-zinc-500 ml-0.5">{unit}</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-built-red" />
      <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function CheckinPage() {
  const [form, setForm] = useState({ training_adherence: 70, nutrition_adherence: 70, energy_level: 6, sleep_hours: 7, hydration_l: 2.5, stress_level: 5, notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ClientCheckin[]>([]);

  useEffect(() => {
    getClientCheckinsForClient().then(setHistory);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await submitCheckin(form);
    const updated = await getClientCheckinsForClient();
    setHistory(updated);
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-xl font-bold text-white mb-2">Check-in Săptămânal</h1>
      <p className="text-sm text-zinc-500 mb-6">Evaluează săptămâna ta sincer.</p>

      {submitted ? (
        <div className="flex flex-col items-center justify-center py-10 mb-12">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl mb-4">✓</div>
          <h2 className="text-lg font-bold text-white mb-1">Check-in trimis!</h2>
          <p className="text-sm text-zinc-500 text-center">Claudiu analizează săptămâna ta și îți trimite feedback în curând.</p>
          <button onClick={() => setSubmitted(false)} className="mt-4 text-xs text-zinc-500 hover:text-white transition-colors">← Trimite alt check-in</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mb-12">
          <RangeInput label="Antrenament" value={form.training_adherence} onChange={v => setForm(f => ({...f, training_adherence: v}))} min={0} max={100} unit="%" />
          <RangeInput label="Nutriție" value={form.nutrition_adherence} onChange={v => setForm(f => ({...f, nutrition_adherence: v}))} min={0} max={100} unit="%" />
          <RangeInput label="Energie" value={form.energy_level} onChange={v => setForm(f => ({...f, energy_level: v}))} min={1} max={10} unit="/10" />
          <RangeInput label="Somn" value={form.sleep_hours} onChange={v => setForm(f => ({...f, sleep_hours: v}))} min={0} max={12} step={0.5} unit="h" />
          <RangeInput label="Hidratare" value={form.hydration_l} onChange={v => setForm(f => ({...f, hydration_l: v}))} min={0} max={6} step={0.5} unit="L" />
          <RangeInput label="Stres" value={form.stress_level} onChange={v => setForm(f => ({...f, stress_level: v}))} min={1} max={10} unit="/10" />
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
      )}

      {history.length > 0 && (
        <div className="border-t border-white/5 pt-8">
          <h2 className="text-sm font-bold text-white mb-6">Progresul Meu</h2>

          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Performanță</p>
          <div className="bg-[#111111] border border-white/10 rounded-xl p-4 mb-2" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week_number" tick={{ fill: "#71717a", fontSize: 10 }} tickFormatter={(v: number) => `S${v}`} />
                <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#a1a1aa", fontSize: 10 }}
                  itemStyle={{ fontSize: 11 }}
                  labelFormatter={(v) => `Săptămâna ${v}`}
                  formatter={(value: unknown, name: unknown) => [`${value}%`, name as string]}
                />
                <Line type="monotone" dataKey="training_adherence" stroke="#C0392B" strokeWidth={2} dot={{ r: 3, fill: "#C0392B" }} name="Antrenament" />
                <Line type="monotone" dataKey="nutrition_adherence" stroke="#a1a1aa" strokeWidth={2} dot={{ r: 3, fill: "#a1a1aa" }} name="Nutriție" />
                <Line type="monotone" dataKey={(d: ClientCheckin) => d.energy_level * 10} stroke="#e4e4e7" strokeWidth={2} dot={{ r: 3, fill: "#e4e4e7" }} name="Energie" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mb-6">
            {([["#C0392B", "Antrenament %"], ["#a1a1aa", "Nutriție %"], ["#e4e4e7", "Energie ×10"]] as [string, string][]).map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-0.5" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-zinc-500">{label}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Lifestyle</p>
          <div className="bg-[#111111] border border-white/10 rounded-xl p-4 mb-2" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week_number" tick={{ fill: "#71717a", fontSize: 10 }} tickFormatter={(v: number) => `S${v}`} />
                <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#a1a1aa", fontSize: 10 }}
                  itemStyle={{ fontSize: 11 }}
                  labelFormatter={(v) => `Săptămâna ${v}`}
                  formatter={(value: unknown, name: unknown) => {
                    const v = Number(value);
                    if (name === "Somn") return [`${(v * 12 / 100).toFixed(1)}h`, name as string];
                    if (name === "Hidratare") return [`${(v * 6 / 100).toFixed(1)}L`, name as string];
                    if (name === "Stres") return [`${(v / 10).toFixed(0)}/10`, name as string];
                    return [`${v}`, name as string];
                  }}
                />
                <Line type="monotone" dataKey={(d: ClientCheckin) => d.sleep_hours != null ? (d.sleep_hours / 12) * 100 : null} stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: "#60a5fa" }} name="Somn" connectNulls={false} />
                <Line type="monotone" dataKey={(d: ClientCheckin) => d.hydration_l != null ? (d.hydration_l / 6) * 100 : null} stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: "#34d399" }} name="Hidratare" connectNulls={false} />
                <Line type="monotone" dataKey={(d: ClientCheckin) => d.stress_level != null ? d.stress_level * 10 : null} stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: "#f97316" }} name="Stres" connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mb-6">
            {([["#60a5fa", "Somn (max 12h)"], ["#34d399", "Hidratare (max 6L)"], ["#f97316", "Stres /10"]] as [string, string][]).map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-0.5" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-zinc-500">{label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {[...history].reverse().map(c => (
              <div key={c.id} className="bg-[#111111] border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-built-red">Săptămâna {c.week_number}</span>
                  <span className="text-[10px] text-zinc-600">{new Date(c.created_at).toLocaleDateString("ro-RO")}</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                  <span className="text-[10px] text-zinc-500">Antren: <span className="text-zinc-300">{c.training_adherence}%</span></span>
                  <span className="text-[10px] text-zinc-500">Nutriție: <span className="text-zinc-300">{c.nutrition_adherence}%</span></span>
                  <span className="text-[10px] text-zinc-500">Energie: <span className="text-zinc-300">{c.energy_level}/10</span></span>
                  {c.sleep_hours != null && <span className="text-[10px] text-zinc-500">Somn: <span className="text-zinc-300">{c.sleep_hours}h</span></span>}
                  {c.hydration_l != null && <span className="text-[10px] text-zinc-500">Hidratare: <span className="text-zinc-300">{c.hydration_l}L</span></span>}
                  {c.stress_level != null && <span className="text-[10px] text-zinc-500">Stres: <span className="text-zinc-300">{c.stress_level}/10</span></span>}
                </div>
                {c.notes && <p className="text-xs text-zinc-400 mb-3 italic">&ldquo;{c.notes}&rdquo;</p>}
                {c.ai_feedback ? (
                  <div className="border-l-2 border-built-red pl-3">
                    <p className="text-[10px] font-bold text-built-red uppercase tracking-widest mb-1">Feedback Claudiu</p>
                    <p className="text-xs text-zinc-300 leading-relaxed">{c.ai_feedback}</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-600 italic">Claudiu analizează această săptămână.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
