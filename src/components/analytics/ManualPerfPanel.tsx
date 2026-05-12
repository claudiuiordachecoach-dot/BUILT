"use client";

import { useState, useTransition } from "react";
import { saveReelPerformance, type ReelWithPerf } from "@/app/analytics/actions";

type PerfData = { views: number; likes: number; saves: number; comments: number };

export function ManualPerfPanel({ reels }: { reels: ReelWithPerf[] }) {
  const [editId, setEditId] = useState<number | null>(null);
  const [perf, setPerf] = useState({ views: "", likes: "", saves: "", comments: "" });
  const [isPending, startTransition] = useTransition();

  function openEdit(r: ReelWithPerf) {
    const p = r.performance as PerfData | null;
    setPerf({
      views: String(p?.views || ""),
      likes: String(p?.likes || ""),
      saves: String(p?.saves || ""),
      comments: String(p?.comments || ""),
    });
    setEditId(r.id);
  }

  function handleSave(id: number) {
    startTransition(async () => {
      await saveReelPerformance(id, {
        views: Number(perf.views) || 0,
        likes: Number(perf.likes) || 0,
        saves: Number(perf.saves) || 0,
        comments: Number(perf.comments) || 0,
      });
      setEditId(null);
    });
  }

  const withPerf = reels.filter((r) => {
    const p = r.performance as PerfData | null;
    return p && p.views > 0;
  });

  return (
    <div>
      {withPerf.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[...withPerf]
            .sort((a, b) => ((b.performance as PerfData).saves || 0) - ((a.performance as PerfData).saves || 0))
            .slice(0, 3)
            .map((r) => {
              const p = r.performance as PerfData;
              return (
                <div key={r.id} className="p-4 bg-built-gray-1 border border-built-red/40 rounded-sm">
                  <span className="font-condensed text-[10px] text-built-red">Pilon {r.pillar}</span>
                  <p className="text-sm text-built-white mt-1 mb-3 line-clamp-2">{r.hook}</p>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    {(["views", "likes", "saves", "comments"] as const).map((k) => (
                      <div key={k}>
                        <p className="font-condensed text-[9px] text-built-gray-text uppercase">{k}</p>
                        <p className="font-display text-base text-built-white">
                          {(p[k] ?? 0).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      <div className="space-y-2">
        {reels.map((r) => {
          const p = r.performance as PerfData | null;
          const hasPerf = p && p.views > 0;
          return (
            <div key={r.id} className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="font-condensed text-[10px] text-built-red shrink-0">
                    {r.pillar}
                  </span>
                  <span className="text-sm text-built-white truncate">{r.hook}</span>
                  {hasPerf && (
                    <span className="font-condensed text-[9px] text-emerald-400 shrink-0">
                      {p.views.toLocaleString()} views · {p.saves} saves
                    </span>
                  )}
                </div>
                <button
                  onClick={() => (editId === r.id ? setEditId(null) : openEdit(r))}
                  className="ml-3 px-3 py-1 border border-built-gray-2 hover:border-built-red text-built-gray-text hover:text-built-white font-condensed text-[10px] shrink-0"
                >
                  {hasPerf ? "Update" : "+ Stats"}
                </button>
              </div>

              {editId === r.id && (
                <div className="mt-3 flex items-end gap-3 flex-wrap">
                  {(["views", "likes", "saves", "comments"] as const).map((k) => (
                    <div key={k}>
                      <p className="font-condensed text-[9px] text-built-gray-text uppercase mb-1">
                        {k}
                      </p>
                      <input
                        type="number"
                        value={perf[k]}
                        onChange={(e) => setPerf((prev) => ({ ...prev, [k]: e.target.value }))}
                        className="w-24 bg-built-black border border-built-gray-2 text-built-white text-sm px-2 py-1 focus:outline-none focus:border-built-red"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => handleSave(r.id)}
                    disabled={isPending}
                    className="px-4 py-2 bg-built-red text-white font-condensed text-xs disabled:opacity-50"
                  >
                    {isPending ? "..." : "Salvează"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
