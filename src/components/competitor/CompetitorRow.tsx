"use client";

import { useTransition } from "react";
import {
  removeCompetitor,
  toggleCompetitor,
  type Competitor,
} from "@/app/competitors/actions";

function timeAgo(iso: string | null): string {
  if (!iso) return "niciodată";
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3600_000);
  if (h < 1) return "acum";
  if (h < 24) return `${h}h în urmă`;
  return `${Math.floor(h / 24)}z în urmă`;
}

export function CompetitorRow({ c }: { c: Competitor }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-4 p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm hover:border-built-red/40 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-display text-lg text-built-white tracking-wide">
            {c.handle}
          </span>
          {!c.is_active && (
            <span className="font-condensed text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-built-gray-2 text-built-gray-text rounded-sm">
              Inactiv
            </span>
          )}
        </div>
        <div className="flex gap-4 text-xs text-built-gray-text">
          <span>{c.followers_count ? `${c.followers_count.toLocaleString()} follow` : "—"}</span>
          <span>·</span>
          <span>{c.reels_count ?? 0} reels</span>
          <span>·</span>
          <span>scrape: {timeAgo(c.last_scraped_at)}</span>
        </div>
        {c.niche_notes && (
          <p className="text-xs text-built-gray-text mt-1 italic line-clamp-1">{c.niche_notes}</p>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => startTransition(async () => { await toggleCompetitor(c.id); })}
          disabled={isPending}
          className="font-condensed text-[10px] uppercase tracking-wider px-3 py-1.5 border border-built-gray-2 text-built-gray-text hover:border-built-red hover:text-built-white disabled:opacity-40"
        >
          {c.is_active ? "Pauză" : "Pornește"}
        </button>
        <button
          onClick={() => {
            if (confirm(`Șterge ${c.handle} și toate reels-urile lui?`)) {
              startTransition(async () => { await removeCompetitor(c.id); });
            }
          }}
          disabled={isPending}
          className="font-condensed text-[10px] uppercase tracking-wider px-3 py-1.5 border border-built-gray-2 text-built-gray-text hover:border-built-red hover:text-built-red disabled:opacity-40"
        >
          Șterge
        </button>
      </div>
    </div>
  );
}
