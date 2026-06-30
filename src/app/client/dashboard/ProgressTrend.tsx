"use client";

import { useEffect, useState } from "react";
import { getMetricHistory, type MetricPoint } from "../actions";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
}

export default function ProgressTrend({ clientId }: { clientId: number }) {
  const [points, setPoints] = useState<MetricPoint[] | null>(null);
  const [target, setTarget] = useState<number | null>(null);

  useEffect(() => {
    getMetricHistory(clientId).then((r) => { setPoints(r.points); setTarget(r.targetWeight); }).catch(() => setPoints([]));
  }, [clientId]);

  if (points === null) return null;
  const weightPts = points.filter((p) => p.weight != null);
  const waistPts = points.filter((p) => p.waist != null);
  // Nu randăm un card mort — apare doar când ai destule date ca să spună o poveste.
  if (weightPts.length < 2 && waistPts.length < 2) return null;

  const wDelta = weightPts.length >= 2 ? weightPts[weightPts.length - 1].weight! - weightPts[0].weight! : null;
  const waDelta = waistPts.length >= 2 ? waistPts[waistPts.length - 1].waist! - waistPts[0].waist! : null;
  const hasWaist = waistPts.length >= 2;

  const data = points.map((p) => ({ date: fmtDate(p.date), weight: p.weight ?? null, waist: p.waist ?? null }));

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-condensed text-[11px] text-zinc-400 uppercase tracking-[0.2em]">Evoluția ta</p>
        {target != null && weightPts.length > 0 && <span className="text-[11px] text-zinc-500">țintă {target} kg</span>}
      </div>

      <div className="flex gap-6 mb-4">
        {wDelta != null && (
          <div>
            <p className={`text-2xl font-bold ${wDelta <= 0 ? "text-green-400" : "text-amber-400"}`}>
              {wDelta <= 0 ? "−" : "+"}{Math.abs(wDelta).toFixed(1)} <span className="text-sm font-medium">kg</span>
            </p>
            <p className="text-[10px] text-zinc-600">de la prima cântărire</p>
          </div>
        )}
        {waDelta != null && (
          <div>
            <p className={`text-2xl font-bold ${waDelta <= 0 ? "text-green-400" : "text-amber-400"}`}>
              {waDelta <= 0 ? "−" : "+"}{Math.abs(waDelta).toFixed(1)} <span className="text-sm font-medium">cm</span>
            </p>
            <p className="text-[10px] text-zinc-600">talie</p>
          </div>
        )}
      </div>

      <div style={{ height: 170 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} minTickGap={20} />
            <YAxis tick={{ fill: "#71717a", fontSize: 10 }} domain={["dataMin - 2", "dataMax + 2"]} />
            <Tooltip
              contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
              labelStyle={{ color: "#a1a1aa", fontSize: 10 }} itemStyle={{ fontSize: 11 }}
            />
            {target != null && <ReferenceLine y={target} stroke="#3FAE6A" strokeDasharray="4 4" />}
            <Line type="monotone" dataKey="weight" stroke="#C0392B" strokeWidth={2} dot={{ r: 2.5, fill: "#C0392B" }} name="Greutate (kg)" connectNulls />
            {hasWaist && <Line type="monotone" dataKey="waist" stroke="#60a5fa" strokeWidth={2} dot={{ r: 2.5, fill: "#60a5fa" }} name="Talie (cm)" connectNulls />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 mt-2">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-built-red" /><span className="text-[10px] text-zinc-500">Greutate</span></span>
        {hasWaist && <span className="flex items-center gap-1.5"><span className="w-3 h-0.5" style={{ background: "#60a5fa" }} /><span className="text-[10px] text-zinc-500">Talie</span></span>}
        {target != null && <span className="flex items-center gap-1.5"><span className="w-3 h-0.5" style={{ background: "#3FAE6A" }} /><span className="text-[10px] text-zinc-500">Țintă</span></span>}
      </div>
    </div>
  );
}
