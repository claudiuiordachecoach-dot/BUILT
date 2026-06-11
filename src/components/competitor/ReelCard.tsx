"use client";

import { useState, useTransition } from "react";
import {
  analyzeReel,
  remakeReel,
  type CompetitorReel,
  type ReelAnalysis,
  type RemakeOutput,
} from "@/app/competitors/actions";

export function ReelCard({ reel }: { reel: CompetitorReel }) {
  const [isPending, startTransition] = useTransition();
  const [analysis, setAnalysis] = useState<ReelAnalysis | null>(reel.ai_analysis);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [remake, setRemake] = useState<RemakeOutput | null>(reel.remake ?? null);
  const [remakePending, startRemake] = useTransition();

  function runRemake() {
    setError(null);
    startRemake(async () => {
      const r = await remakeReel(reel.id);
      if (r.ok) setRemake(r.data);
      else setError(r.error);
    });
  }

  function runAnalysis() {
    setError(null);
    startTransition(async () => {
      const r = await analyzeReel(reel.id);
      if (r.ok) setAnalysis(r.data);
      else setError(r.error);
    });
  }

  const views = reel.views ?? 0;
  const formattedViews =
    views >= 1_000_000
      ? `${(views / 1_000_000).toFixed(1)}M`
      : views >= 1_000
        ? `${(views / 1_000).toFixed(1)}K`
        : String(views);

  return (
    <div className="bg-built-gray-1 border border-built-gray-2 rounded-sm overflow-hidden">
      <div className="flex gap-4 p-4">
        {reel.thumbnail_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reel.thumbnail_url}
            alt=""
            className="w-24 h-24 object-cover rounded-sm shrink-0 border border-built-gray-2"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-display text-xl text-built-white">{formattedViews}</span>
            <span className="text-xs text-built-gray-text">views</span>
            <span className="text-xs text-built-gray-text">·</span>
            <span className="text-xs text-built-gray-text">
              {reel.likes?.toLocaleString() ?? "?"} likes
            </span>
            {reel.duration_seconds && (
              <>
                <span className="text-xs text-built-gray-text">·</span>
                <span className="text-xs text-built-gray-text">{reel.duration_seconds}s</span>
              </>
            )}
          </div>
          <p className="text-sm text-built-white line-clamp-2 mb-2">
            {reel.caption || <span className="italic text-built-gray-text">fără caption</span>}
          </p>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setExpanded((x) => !x)}
              className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text hover:text-built-white"
            >
              {expanded ? "Ascunde transcript" : "Vezi transcript"}
            </button>
            <a
              href={reel.url}
              target="_blank"
              rel="noopener"
              className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text hover:text-built-white"
            >
              Deschide pe IG ↗
            </a>
            <div className="ml-auto flex gap-2">
              {!analysis && (
                <button
                  onClick={runAnalysis}
                  disabled={isPending}
                  className="font-condensed text-[10px] uppercase tracking-wider px-3 py-1 border border-built-gray-2 text-built-white hover:border-built-white disabled:opacity-40"
                >
                  {isPending ? "Analizez..." : "Analizează"}
                </button>
              )}
              <button
                onClick={runRemake}
                disabled={remakePending}
                className="font-condensed text-[10px] uppercase tracking-wider px-3 py-1 bg-built-red text-white hover:bg-built-red-dark disabled:opacity-40"
              >
                {remakePending ? "Remake..." : remake ? "Remake din nou" : "🔥 Remake"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {expanded && reel.transcript && (
        <div className="px-4 pb-4 border-t border-built-gray-2 pt-3">
          <p className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text mb-1">
            Transcript
          </p>
          <p className="text-xs text-built-white/80 whitespace-pre-wrap">{reel.transcript}</p>
        </div>
      )}

      {analysis && (
        <div className="border-t border-built-red/30 bg-built-red/5 p-4 space-y-2">
          <p className="font-condensed text-[10px] uppercase tracking-wider text-built-red mb-1">
            Analiză AI
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-built-gray-text uppercase font-condensed">Hook: </span>
              <span className="text-built-white">{analysis.hook_type}</span>
            </div>
            <div>
              <span className="text-built-gray-text uppercase font-condensed">Format: </span>
              <span className="text-built-white">{analysis.format}</span>
            </div>
          </div>
          <div className="text-xs">
            <p className="text-built-gray-text uppercase font-condensed mb-1">De ce a funcționat</p>
            <p className="text-built-white">{analysis.why_worked}</p>
          </div>
          <div className="text-xs">
            <p className="text-built-gray-text uppercase font-condensed mb-1">Adaptare BUILT</p>
            <p className="text-built-white italic">{analysis.built_adaptation}</p>
          </div>
        </div>
      )}

      {remake && (
        <div className="border-t border-built-red/40 bg-built-black/40 p-4 space-y-4">
          <p className="font-condensed text-[10px] uppercase tracking-wider text-built-red">
            🔥 Remake BUILT
          </p>

          {/* ANALIZA — 4 secțiuni */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <RemakeList title="Viral Elements" items={remake.analysis.viral_elements} />
            <RemakeList title="Strengths" items={remake.analysis.strengths} />
            <RemakeList title="Adaptation Tips" items={remake.analysis.adaptation_tips} />
            <RemakeList title="Risks" items={remake.analysis.risks} />
          </div>

          {/* POSTAREA REGENERATĂ */}
          <div className="border-t border-built-gray-2 pt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text">
                Postare regenerată · pilon {remake.regenerated.pillar}
              </p>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${remake.regenerated.hook}\n\n${remake.regenerated.script}`,
                  )
                }
                className="font-condensed text-[10px] uppercase tracking-wider px-2 py-1 border border-built-gray-2 text-built-white hover:border-built-white"
              >
                Copiază
              </button>
            </div>
            <p className="text-sm text-built-white font-semibold mb-2">{remake.regenerated.hook}</p>
            <p className="text-sm text-built-white/90 whitespace-pre-wrap">
              {remake.regenerated.script}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="border-t border-built-red bg-built-red/10 p-3">
          <p className="text-built-red text-xs">⚠ {error}</p>
        </div>
      )}
    </div>
  );
}

function RemakeList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-built-gray-text uppercase font-condensed mb-1">{title}</p>
      <ul className="space-y-0.5">
        {items.map((it, i) => (
          <li key={i} className="text-built-white">
            · {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
