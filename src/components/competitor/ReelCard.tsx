"use client";

import { useState, useTransition, useEffect } from "react";
import {
  remakeReel,
  type CompetitorReel,
  type RemakeOutput,
} from "@/app/competitors/actions";

function formatViews(views: number) {
  return views >= 1_000_000
    ? `${(views / 1_000_000).toFixed(1)}M`
    : views >= 1_000
      ? `${(views / 1_000).toFixed(1)}K`
      : String(views);
}

export function ReelCard({ reel }: { reel: CompetitorReel }) {
  const [remake, setRemake] = useState<RemakeOutput | null>(reel.remake ?? null);
  const [remakePending, startRemake] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [imgOk, setImgOk] = useState(Boolean(reel.thumbnail_url));

  function runRemake() {
    setError(null);
    setOpen(true);
    startRemake(async () => {
      const r = await remakeReel(reel.id);
      if (r.ok) setRemake(r.data);
      else setError(r.error);
    });
  }

  const views = reel.views ?? 0;

  return (
    <>
      {/* CARD */}
      <div className="group bg-card border border-border rounded-xl overflow-hidden flex flex-col transition-all hover:border-white/20">
        {/* Thumbnail */}
        <div className="relative aspect-[4/5] bg-muted overflow-hidden">
          {imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={reel.thumbnail_url!}
              alt=""
              onError={() => setImgOk(false)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-background">
              <span className="font-display text-4xl text-white/20 tracking-wide">{formatViews(views)}</span>
            </div>
          )}
          {/* View badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1">
            <span className="font-display text-sm text-white leading-none">{formatViews(views)}</span>
            <span className="text-[9px] text-white/60 uppercase tracking-wider">views</span>
          </div>
          {remake && (
            <div className="absolute top-2.5 right-2.5 bg-built-red rounded-full px-2 py-1">
              <span className="text-[9px] text-white uppercase tracking-wider font-condensed">✓ Remake</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          <p className="text-[13px] text-foreground/90 line-clamp-2 leading-snug min-h-[2.4em]">
            {reel.caption || <span className="italic text-muted-foreground">fără caption</span>}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{reel.likes?.toLocaleString() ?? "?"} likes</span>
            <a
              href={reel.url}
              target="_blank"
              rel="noopener"
              className="ml-auto hover:text-foreground transition-colors"
            >
              IG ↗
            </a>
          </div>
          <button
            onClick={remake ? () => setOpen(true) : runRemake}
            disabled={remakePending}
            className="w-full font-condensed text-[11px] uppercase tracking-wider py-2.5 rounded-lg bg-built-red text-white hover:bg-built-red-dark disabled:opacity-40 transition-colors"
          >
            {remakePending ? "Remake..." : remake ? "Vezi Remake" : "🔥 Remake"}
          </button>
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <RemakeModal
          reel={reel}
          remake={remake}
          pending={remakePending}
          error={error}
          onRerun={runRemake}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function RemakeModal({
  reel,
  remake,
  pending,
  error,
  onRerun,
  onClose,
}: {
  reel: CompetitorReel;
  remake: RemakeOutput | null;
  pending: boolean;
  error: string | null;
  onRerun: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function copy() {
    if (!remake) return;
    navigator.clipboard.writeText(`${remake.regenerated.hook}\n\n${remake.regenerated.script}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-card border border-border rounded-2xl w-full max-w-3xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b border-border">
          <div className="flex-1 min-w-0">
            <p className="font-condensed text-[10px] uppercase tracking-widest text-built-red mb-1">
              Reel sursă · {formatViews(reel.views ?? 0)} views
            </p>
            <p className="text-sm text-foreground/80 line-clamp-2">
              {reel.caption || <span className="italic text-muted-foreground">fără caption</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-white/20 flex items-center justify-center transition-colors"
            aria-label="Închide"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {pending && (
            <div className="py-16 text-center">
              <p className="font-display text-2xl text-foreground tracking-wide animate-pulse">
                Generez Remake-ul...
              </p>
              <p className="text-xs text-muted-foreground mt-2">Analizez postarea și o reconstruiesc în vocea ta.</p>
            </div>
          )}

          {error && !pending && (
            <div className="border border-built-red/40 bg-built-red/10 rounded-lg p-4">
              <p className="text-built-red text-sm">⚠ {error}</p>
            </div>
          )}

          {remake && !pending && (
            <>
              {/* Analiză — 4 secțiuni */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                <RemakeList title="Viral Elements" items={remake.analysis.viral_elements} />
                <RemakeList title="Strengths" items={remake.analysis.strengths} />
                <RemakeList title="Adaptation Tips" items={remake.analysis.adaptation_tips} />
                <RemakeList title="Risks" items={remake.analysis.risks} />
              </div>

              {/* Postare regenerată */}
              <div className="rounded-xl border border-border bg-background/40 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-condensed text-[10px] uppercase tracking-widest text-muted-foreground">
                    Postare regenerată · pilon {remake.regenerated.pillar}
                  </p>
                  <button
                    onClick={copy}
                    className="font-condensed text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg border border-border text-foreground hover:border-white/20 transition-colors"
                  >
                    {copied ? "✓ Copiat" : "Copiază"}
                  </button>
                </div>
                <p className="text-[15px] text-foreground font-semibold mb-3 leading-snug">
                  {remake.regenerated.hook}
                </p>
                <p className="text-[14px] text-foreground/85 whitespace-pre-wrap leading-relaxed">
                  {remake.regenerated.script}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={onRerun}
                  className="font-condensed text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  ↻ Remake din nou
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RemakeList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="font-condensed text-[10px] uppercase tracking-widest text-built-red mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="text-[13px] text-foreground/80 leading-snug flex gap-2">
            <span className="text-built-red/50 shrink-0">·</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
