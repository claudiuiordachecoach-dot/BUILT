"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { shiftWeek } from "@/lib/week";

interface WeekNavigatorProps {
  weekStartIso: string;
  rangeLabel: string;
  todayWeekStartIso: string;
}

export function WeekNavigator({
  weekStartIso,
  rangeLabel,
  todayWeekStartIso,
}: WeekNavigatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isCurrentWeek = weekStartIso === todayWeekStartIso;

  function navigate(targetIso: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (targetIso === todayWeekStartIso) {
      params.delete("week");
    } else {
      params.set("week", targetIso);
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/?${qs}` : "/");
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => navigate(shiftWeek(weekStartIso, -1))}
        disabled={isPending}
        className="px-3 py-1.5 bg-built-gray-1 border border-built-gray-2 hover:border-built-red transition-colors text-built-white font-condensed text-xs disabled:opacity-40"
        aria-label="Săptămâna anterioară"
      >
        ←
      </button>
      <div className="text-center min-w-[180px]">
        <div className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider">
          {isCurrentWeek ? "Săptămâna curentă" : "Săptămână"}
        </div>
        <div className="font-display text-base tracking-wider text-built-white">
          {rangeLabel}
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate(shiftWeek(weekStartIso, 1))}
        disabled={isPending}
        className="px-3 py-1.5 bg-built-gray-1 border border-built-gray-2 hover:border-built-red transition-colors text-built-white font-condensed text-xs disabled:opacity-40"
        aria-label="Săptămâna următoare"
      >
        →
      </button>
      {!isCurrentWeek && (
        <button
          type="button"
          onClick={() => navigate(todayWeekStartIso)}
          disabled={isPending}
          className="ml-2 px-3 py-1.5 bg-built-red hover:bg-built-red-dark transition-colors text-built-white font-condensed text-xs disabled:opacity-40"
        >
          Azi
        </button>
      )}
    </div>
  );
}
