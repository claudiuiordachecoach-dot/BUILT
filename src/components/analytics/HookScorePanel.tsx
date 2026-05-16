"use client";

import type { IgMediaRow } from "@/app/analytics/types";
import { computeHookScore } from "@/app/analytics/types";

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function watchFmt(ms: number | null | undefined): string {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(1)}s`;
}

const ACTION_COLORS: Record<string, string> = {
  do_more: "border-l-emerald-500 bg-emerald-900/10",
  stop:    "border-l-red-500 bg-red-900/10",
  fix:     "border-l-yellow-500 bg-yellow-900/10",
};

const ACTION_LABELS: Record<string, { emoji: string; label: string; color: string }> = {
  do_more: { emoji: "🟢", label: "Fă mai mult", color: "text-emerald-400" },
  stop:    { emoji: "🔴", label: "Oprește",     color: "text-red-400" },
  fix:     { emoji: "🟡", label: "Fixează",     color: "text-yellow-400" },
};

export function HookScorePanel({ media }: { media: IgMediaRow[] }) {
  const reels = media.filter((m) => m.media_type === "VIDEO");
  if (reels.length === 0) return null;

  const withScore = reels.map((m) => ({
    ...m,
    hook_score: m.hook_score ?? computeHookScore(m),
  }));

  const sorted = [...withScore].sort((a, b) => (b.hook_score ?? 0) - (a.hook_score ?? 0));
  const top = sorted[0];
  const median = sorted[Math.floor(sorted.length / 2)];
  const multiplier =
    top && median && (median.reach ?? 0) > 0
      ? ((top.reach ?? 0) / (median.reach ?? 1)).toFixed(1)
      : null;

  const doMore = sorted.filter((m) => m.hook_action === "do_more").slice(0, 3);
  const stop   = sorted.filter((m) => m.hook_action === "stop").slice(0, 3);
  const fix    = sorted.filter((m) => m.hook_action === "fix").slice(0, 3);

  const doMoreFallback = doMore.length > 0 ? doMore : sorted.slice(0, 3);
  const stopFallback   = stop.length   > 0 ? stop   : [...sorted].reverse().slice(0, 3);
  const fixFallback    = fix.length    > 0 ? fix    : [];

  const maxScore = sorted[0]?.hook_score ?? 1;

  return (
    <div className="mb-8">
      {multiplier && (
        <div className="mb-6 p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-1">
            Insight principal
          </p>
          <p className="font-display text-2xl text-built-white">
            Top Reel-ul tău a atins de{" "}
            <span className="text-built-red">{multiplier}×</span> mai mulți oameni decât mediana
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { title: "🟢 Fă mai mult", items: doMoreFallback, borderColor: "border-emerald-500/40" },
          { title: "🔴 Oprește",     items: stopFallback,   borderColor: "border-red-500/40" },
          { title: "🟡 Fixează",     items: fixFallback,    borderColor: "border-yellow-500/40" },
        ].map(({ title, items, borderColor }) => (
          <div key={title} className={`p-4 bg-built-gray-1 border ${borderColor} rounded-sm`}>
            <p className="font-condensed text-xs uppercase tracking-wider mb-3 text-built-white">
              {title}
            </p>
            {items.length === 0 ? (
              <p className="text-xs text-built-gray-text italic">
                Rulează diagnoze pentru a vedea
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((m) => (
                  <a
                    key={m.id}
                    href={m.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-built-gray-text hover:text-built-white transition-colors line-clamp-2"
                  >
                    {(m.caption ?? "—").slice(0, 60)}…
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Avg watch time",
            value: (() => {
              const vals = reels.map((m) => m.avg_watch_time_ms).filter((v): v is number => v != null);
              if (vals.length === 0) return "—";
              return `${(vals.reduce((a, b) => a + b, 0) / vals.length / 1000).toFixed(1)}s`;
            })(),
          },
          {
            label: "Reels cu hook ≥ 12s",
            value: String(reels.filter((m) => (m.avg_watch_time_ms ?? 0) >= 12_000).length),
          },
          {
            label: "Replay winners (≥ 1.2×)",
            value: String(
              reels.filter((m) => {
                const reach = m.reach ?? 0;
                return reach > 0 && (m.replays ?? 0) / reach >= 1.2;
              }).length,
            ),
          },
          {
            label: "Total follows din Reels",
            value: fmt(reels.reduce((s, m) => s + (m.follows ?? 0), 0)),
          },
        ].map(({ label, value }) => (
          <div key={label} className="p-3 bg-built-gray-1 border border-built-gray-2 rounded-sm text-center">
            <p className="font-condensed text-[9px] text-built-gray-text uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="font-display text-xl text-built-white">{value}</p>
          </div>
        ))}
      </div>

      <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-3">
        Ranking complet — Hook Score
      </p>
      <div className="space-y-2">
        {sorted.map((m, i) => {
          const score = m.hook_score ?? 0;
          const barW = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
          const actionKey = m.hook_action ?? "";
          const borderClass = ACTION_COLORS[actionKey] ?? "border-l-built-gray-2 bg-built-gray-1";
          const actionMeta = ACTION_LABELS[actionKey];

          return (
            <div
              key={m.id}
              className={`flex gap-4 items-center p-3 rounded-sm border-l-2 border border-built-gray-2 ${borderClass}`}
            >
              <span className="font-display text-2xl text-built-gray-text w-8 shrink-0 text-center">
                {i + 1}
              </span>
              {m.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.thumbnail_url}
                  alt=""
                  className="w-12 h-12 object-cover rounded-sm shrink-0 border border-built-gray-2"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-built-white line-clamp-1 mb-1">
                  {m.caption || <span className="italic text-built-gray-text">fără caption</span>}
                </p>
                <div className="h-1 bg-built-gray-2 rounded-full mb-1 w-full">
                  <div
                    className="h-1 bg-built-red rounded-full"
                    style={{ width: `${barW}%` }}
                  />
                </div>
                <div className="flex gap-3 text-[10px] text-built-gray-text flex-wrap">
                  <span>watch: {watchFmt(m.avg_watch_time_ms)}</span>
                  <span>reach: {fmt(m.reach)}</span>
                  <span>saves: {fmt(m.saves)}</span>
                  <span>shares: {fmt(m.shares)}</span>
                  {m.follows != null && <span>+follows: {fmt(m.follows)}</span>}
                  {m.replays != null && <span>replays: {fmt(m.replays)}</span>}
                </div>
              </div>
              <div className="shrink-0 text-right">
                {m.hook_diagnosis && (
                  <p className={`text-[10px] font-condensed uppercase mb-1 ${actionMeta?.color ?? "text-built-gray-text"}`}>
                    {actionMeta?.emoji} {actionMeta?.label}
                  </p>
                )}
                <p className="text-xs text-built-gray-text italic line-clamp-1 max-w-[160px]">
                  {m.hook_diagnosis ?? "fără diagnoză"}
                </p>
                <p className="font-display text-base text-built-white mt-1">
                  {score > 0 ? score.toFixed(1) : "—"}
                </p>
                <a
                  href={m.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-built-red hover:underline"
                >
                  deschide →
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
