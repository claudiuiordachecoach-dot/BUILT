"use client";

import type { IgMediaRow } from "@/app/analytics/types";

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function IgMediaGrid({ media }: { media: IgMediaRow[] }) {
  if (media.length === 0) return null;

  const videos = media.filter((m) => m.media_type === "VIDEO");
  const topByPlays = [...videos]
    .sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0))
    .slice(0, 5);

  return (
    <div className="mb-8">
      {topByPlays.length > 0 && (
        <div className="mb-6">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-3">
            Top 5 reels după plays
          </p>
          <div className="space-y-2">
            {topByPlays.map((m) => (
              <MediaRow key={m.id} m={m} highlight />
            ))}
          </div>
        </div>
      )}

      <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-3">
        Toate ({media.length} posts)
      </p>
      <div className="space-y-2">
        {media.map((m) => (
          <MediaRow key={m.id} m={m} />
        ))}
      </div>
    </div>
  );
}

function MediaRow({ m, highlight }: { m: IgMediaRow; highlight?: boolean }) {
  const date = m.timestamp ? new Date(m.timestamp).toLocaleDateString("ro-RO") : "—";
  return (
    <div
      className={`flex flex-col gap-2 p-3 rounded-sm border ${
        highlight
          ? "bg-built-gray-1 border-built-red/40"
          : "bg-built-gray-1 border-built-gray-2"
      }`}
    >
      {/* Rând sus: thumbnail + titlu + link */}
      <div className="flex gap-3 items-center">
        {m.thumbnail_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.thumbnail_url}
            alt=""
            className="w-12 h-12 object-cover rounded-sm shrink-0 border border-built-gray-2"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-built-white line-clamp-2 mb-0.5">
            {m.caption || <span className="italic text-built-gray-text">fără caption</span>}
          </p>
          <div className="flex gap-2 text-xs text-built-gray-text flex-wrap">
            <span>{date}</span>
            <span>·</span>
            <span className="font-condensed">{m.media_type}</span>
          </div>
        </div>
        <a
          href={m.permalink}
          target="_blank"
          rel="noopener"
          className="text-built-gray-text hover:text-built-white text-xs shrink-0 pl-1"
        >
          ↗
        </a>
      </div>
      {/* Rând jos: statistici */}
      <div className="grid grid-cols-6 gap-1 text-center pt-1 border-t border-white/[0.05]">
        {[
          { label: "plays",   val: m.plays },
          { label: "likes",   val: m.likes },
          { label: "saves",   val: m.saves },
          { label: "reach",   val: m.reach },
          { label: "follows", val: m.follows },
          { label: "watch",   val: m.avg_watch_time_ms != null ? Math.round(m.avg_watch_time_ms / 1000) : null },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className="font-condensed text-[8px] text-built-gray-text uppercase">{label}</p>
            <p className="font-display text-sm text-built-white">{val != null ? fmt(val) : "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
