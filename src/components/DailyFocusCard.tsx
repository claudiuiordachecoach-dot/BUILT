"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { ReelRecord, Pillar } from "@/app/reels/actions";
import { markPosted, setStatus } from "@/app/actions";

const PILLAR_LABEL: Record<Pillar, string> = {
  B: "Base Strength",
  U: "Unbreakable Capacity",
  I: "Intelligent Fueling",
  L: "Lifestyle Integration",
  T: "Tough Mindset",
  mix: "Mix",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  edited: "Editat",
  posted: "Postat",
  archived: "Arhivat",
};

interface DailyFocusCardProps {
  todayLong: string;
  reel: ReelRecord | null;
}

export function DailyFocusCard({ todayLong, reel }: DailyFocusCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!reel) {
    return (
      <div className="p-8 bg-built-gray-1 border border-built-gray-2 rounded-sm">
        <p className="font-condensed text-xs text-built-gray-text uppercase tracking-wider mb-2">
          Astăzi · {todayLong}
        </p>
        <h2 className="font-display text-3xl tracking-wider text-built-white mb-4">
          Niciun reel programat azi.
        </h2>
        <p className="text-built-gray-text leading-relaxed mb-5 max-w-2xl">
          Trage unul din pool pe ziua de azi în calendarul de mai jos, sau
          generează unul nou din M2.
        </p>
        <Link
          href="/reels"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-built-red hover:bg-built-red-dark transition-colors text-built-white font-condensed text-xs"
        >
          Generează reel nou →
        </Link>
      </div>
    );
  }

  const variant = reel.body?.variants?.[0];
  const isPosted = reel.status === "posted";

  function handleMarkPosted() {
    setError(null);
    startTransition(async () => {
      const result = await markPosted(reel!.id);
      if (!result.ok) setError(result.error);
    });
  }

  function handleUnpost() {
    setError(null);
    startTransition(async () => {
      const result = await setStatus(reel!.id, "edited");
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="p-8 bg-built-gray-1 border border-built-red/40 rounded-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">
            Astăzi · {todayLong}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-condensed text-[10px] text-built-white/80 px-2 py-1 bg-built-red/30 border border-built-red/60">
              Pilon {reel.pillar} · {PILLAR_LABEL[reel.pillar]}
            </span>
            <span className="font-condensed text-[10px] text-built-gray-text uppercase">
              {STATUS_LABEL[reel.status] ?? reel.status}
            </span>
            {variant?.psychological_trigger && (
              <span className="font-condensed text-[10px] text-built-gray-text">
                · {variant.psychological_trigger}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isPosted ? (
            <button
              type="button"
              onClick={handleUnpost}
              disabled={isPending}
              className="px-4 py-2 border border-built-gray-2 hover:border-built-red text-built-gray-text hover:text-built-white font-condensed text-xs transition-colors disabled:opacity-50"
            >
              {isPending ? "..." : "Demarchează"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleMarkPosted}
              disabled={isPending}
              className="px-5 py-2.5 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs disabled:opacity-50 transition-colors"
            >
              {isPending ? "..." : "Marchează postat"}
            </button>
          )}
          <Link
            href="/reels"
            className="font-condensed text-[10px] text-built-gray-text hover:text-built-red transition-colors"
          >
            Editează în M2 →
          </Link>
        </div>
      </div>

      <h2 className="font-display text-3xl tracking-wider text-built-white mb-5 leading-tight">
        {reel.hook || variant?.hook || "(fără hook)"}
      </h2>

      {variant && (
        <div className="space-y-4 max-w-3xl">
          <div>
            <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-1">
              Problemă / Validare
            </p>
            <p className="text-sm text-built-white/90 leading-relaxed">
              {variant.problem_validation}
            </p>
          </div>
          <div>
            <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-1">
              Sistemul BUILT
            </p>
            <p className="text-sm text-built-white/90 leading-relaxed">
              {variant.built_system}
            </p>
          </div>
          <div>
            <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-1">
              CTA
            </p>
            <p className="text-sm text-built-red leading-relaxed">
              {variant.cta}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-built-red/10 border border-built-red text-built-red font-condensed text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
