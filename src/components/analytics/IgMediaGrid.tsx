"use client";

import type { IgMediaRow } from "@/app/analytics/actions";

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
      className={`flex gap-4 items-center p-3 rounded-sm border ${
        highlight
          ? "bg-built-gray-1 border-built-red/40"
          : "bg-built-gray-1 border-built-gray-2"
      }`}
    >
      {m.thumbnail_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={m.thumbnail_url}
          alt=""
          className="w-14 h-14 object-cover rounded-sm shrink-0 border border-built-gray-2"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-built-white line-clamp-1 mb-0.5">
          {m.caption || <span className="italic text-built-gray-text">fără caption</span>}
        </p>
        <div className="flex gap-3 text-xs text-built-gray-text flex-wrap">
          <span>{date}</span>
          <span>·</span>
          <span className="font-condensed">{m.media_type}</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 shrink-0 text-center">
        {[
          { label: "plays", val: m.plays },
          { label: "likes", val: m.likes },
          { label: "saves", val: m.saves },
          { label: "reach", val: m.reach },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className="font-condensed text-[9px] text-built-gray-text uppercase">{label}</p>
            <p className="font-display text-base text-built-white">{fmt(val)}</p>
          </div>
        ))}
      </div>
      <a
        href={m.permalink}
        target="_blank"
        rel="noopener"
        className="text-built-gray-text hover:text-built-white text-xs shrink-0"
      >
        ↗
      </a>
    </div>
  );
}
