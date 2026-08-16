"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Entry = { label: string; weight_kg: number; date: string };

export default function WeightSummary({ gallery }: { gallery: Entry[] }) {
  const validPoints = (gallery || [])
    .filter((e) => typeof e.weight_kg === "number" && e.weight_kg > 0)
    .filter((e) => {
      const l = (e.label || "").toLowerCase();
      return !l.includes("pranz") && !l.includes("prânz") && !l.includes("cina") && !l.includes("cină") && !l.includes("gustare") && !l.includes("mese") && !l.includes("mic dejun");
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Grupăm pe zile ca să nu apară mai multe puncte în aceeași zi
  const pointsByDay = new Map<string, number>();
  validPoints.forEach(e => {
    const day = new Date(e.date).toLocaleDateString("ro-RO", { month: "short", day: "numeric" });
    pointsByDay.set(day, e.weight_kg);
  });

  const chartData = Array.from(pointsByDay.entries()).map(([day, kg]) => ({ name: day, kg }));

  if (chartData.length === 0) {
    return (
      <div className="bg-[#111111] border border-white/10 rounded-lg p-6">
        <p className="text-sm text-zinc-500">
          Adaugă prima intrare în Galeria de Progres ca să vezi greutatea și evoluția.
        </p>
      </div>
    );
  }

  const current = chartData[chartData.length - 1].kg;
  const previous = chartData.length > 1 ? chartData[chartData.length - 2].kg : current;
  const delta = +(current - previous).toFixed(1);
  const deltaLabel =
    delta === 0 ? "stabil" : delta < 0 ? `${delta} kg față de ieri` : `+${delta} kg față de ieri`;
  const deltaColor = delta < 0 ? "text-green-400" : delta > 0 ? "text-built-red" : "text-zinc-400";

  return (
    <div className="bg-[#111111] border border-white/10 rounded-lg p-6">
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-4xl font-display tracking-wide text-white">{current}</span>
        <span className="text-lg text-zinc-400">kg</span>
        <span className={`text-sm font-medium ${deltaColor}`}>· {deltaLabel}</span>
      </div>
      <p className="text-[11px] uppercase tracking-widest text-zinc-600 mb-4">Greutatea actuală</p>

      {chartData.length >= 2 && (
        <div className="h-40 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip
                contentStyle={{ background: "#0A0A0A", border: "1px solid #252525", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#F5F5F5" }}
                formatter={(v) => `${v} kg`}
              />
              <Line type="monotone" dataKey="kg" stroke="#C0392B" strokeWidth={2} dot={{ r: 3, fill: "#C0392B" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
