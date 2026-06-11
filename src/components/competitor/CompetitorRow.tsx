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
  const clean = c.handle.replace(/^@/, "");
  const initial = (clean[0] ?? "?").toUpperCase();

  return (
    <div
      className={`group flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-white/20 transition-colors ${
        isPending ? "opacity-50" : ""
      } ${!c.is_active ? "opacity-60" : ""}`}
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-built-red/15 text-built-red flex items-center justify-center font-display text-base shrink-0">
        {initial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-foreground truncate">{clean}</span>
          {!c.is_active && (
            <span className="font-condensed text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
              pauză
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground truncate">
          {c.reels_count ?? 0} reels · {timeAgo(c.last_scraped_at)}
        </p>
      </div>

      {/* Actions — discrete, mai vizibile la hover */}
      <div className="flex items-center gap-1 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => startTransition(async () => { await toggleCompetitor(c.id); })}
          disabled={isPending}
          title={c.is_active ? "Pauză" : "Pornește"}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
        >
          {c.is_active ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        <button
          onClick={() => {
            if (confirm(`Șterge ${c.handle} și toate reels-urile lui?`)) {
              startTransition(async () => { await removeCompetitor(c.id); });
            }
          }}
          disabled={isPending}
          title="Șterge"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-built-red hover:bg-built-red/10 transition-colors disabled:opacity-40"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
        </button>
      </div>
    </div>
  );
}
