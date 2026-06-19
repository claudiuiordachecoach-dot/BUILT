"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

export type PillarScores = { B: number; U: number; I: number; L: number; T: number };

const PILLARS: { key: keyof PillarScores; label: string }[] = [
  { key: "B", label: "Forță" },
  { key: "U", label: "Capacitate" },
  { key: "I", label: "Nutriție" },
  { key: "L", label: "Lifestyle" },
  { key: "T", label: "Mindset" },
];

export default function PillarRadar({ scores }: { scores: PillarScores }) {
  const data = PILLARS.map((p) => ({ pillar: p.label, value: Math.round(scores[p.key]) }));

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-5 mb-5">
      <span className="text-sm font-semibold text-zinc-200">Cei 5 piloni BUILT</span>
      <div className="h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="pillar" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
            <Radar dataKey="value" stroke="#C0392B" fill="#C0392B" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-zinc-600 text-center">Pe baza ultimului check-in</p>
    </div>
  );
}
