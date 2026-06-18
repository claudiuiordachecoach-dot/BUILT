"use client";

type Entry = { weight_kg: number; date: string };

export default function WeightGoal({
  gallery,
  target,
}: {
  gallery: Entry[];
  target?: number | null;
}) {
  if (target == null) return null;

  const points = (gallery || [])
    .filter((e) => typeof e.weight_kg === "number")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (points.length === 0) return null;

  const start = points[0].weight_kg;
  const current = points[points.length - 1].weight_kg;

  const total = Math.abs(target - start);
  const done = Math.abs(start - current);
  const pct = total === 0 ? 100 : Math.max(0, Math.min(100, Math.round((done / total) * 100)));
  const reached =
    (target <= start && current <= target) || (target > start && current >= target);

  return (
    <div className="bg-[#111111] border border-white/10 rounded-lg p-6">
      <div className="flex justify-between items-baseline mb-3">
        <p className="text-[11px] uppercase tracking-widest text-zinc-600">Obiectiv</p>
        <p className="text-sm text-zinc-400">
          <span className="text-white font-semibold">{current} kg</span> → {target} kg
        </p>
      </div>

      <div className="h-3 bg-[#1f1f1f] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${reached ? "bg-green-500" : "bg-built-red"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-zinc-500 mt-2">
        {reached ? "🎯 Obiectiv atins!" : `${pct}% din drum · start ${start} kg`}
      </p>
    </div>
  );
}
