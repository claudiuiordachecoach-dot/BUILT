"use client";

import { useState, useTransition, useOptimistic, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { ReelRecord } from "@/app/reels/actions";
import type { WeekDay } from "@/lib/week";
import { setSchedule } from "@/app/actions";
import { ReelDailyCard } from "./ReelDailyCard";

interface WeeklyCalendarProps {
  week: WeekDay[];
  scheduledReels: ReelRecord[];
  unscheduledReels: ReelRecord[];
}

interface OptimisticMove {
  reelId: number;
  dateIso: string | null;
}

function applyMove(
  reels: ReelRecord[],
  move: OptimisticMove
): ReelRecord[] {
  return reels.map((r) =>
    r.id === move.reelId ? { ...r, scheduled_for: move.dateIso } : r
  );
}

export function WeeklyCalendar({
  week,
  scheduledReels,
  unscheduledReels,
}: WeeklyCalendarProps) {
  const [, startTransition] = useTransition();
  const [activeReelId, setActiveReelId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allReels = useMemo(
    () => [...scheduledReels, ...unscheduledReels],
    [scheduledReels, unscheduledReels]
  );

  const [optimisticReels, applyOptimistic] = useOptimistic<
    ReelRecord[],
    OptimisticMove
  >(allReels, applyMove);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    })
  );

  const reelsByDay = useMemo(() => {
    const map = new Map<string, ReelRecord[]>();
    for (const day of week) {
      map.set(day.iso, []);
    }
    for (const reel of optimisticReels) {
      if (reel.scheduled_for && map.has(reel.scheduled_for)) {
        map.get(reel.scheduled_for)!.push(reel);
      }
    }
    return map;
  }, [optimisticReels, week]);

  const pool = useMemo(
    () => optimisticReels.filter((r) => r.scheduled_for === null),
    [optimisticReels]
  );

  const activeReel = activeReelId
    ? optimisticReels.find((r) => r.id === activeReelId) ?? null
    : null;

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as
      | { reelId: number }
      | undefined;
    if (data?.reelId) {
      setActiveReelId(data.reelId);
    }
    setError(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveReelId(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as
      | { reelId: number; currentDate: string | null }
      | undefined;
    const overData = over.data.current as
      | { dateIso: string | null }
      | undefined;

    if (!activeData || !overData) return;
    if (activeData.currentDate === overData.dateIso) return;

    const move: OptimisticMove = {
      reelId: activeData.reelId,
      dateIso: overData.dateIso,
    };

    startTransition(async () => {
      applyOptimistic(move);
      const result = await setSchedule(move.reelId, move.dateIso);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <DndContext
      id="built-weekly-calendar"
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {error && (
        <div className="mb-4 p-3 bg-built-red/10 border border-built-red text-built-red font-condensed text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Calendar 7 zile */}
        <div className="grid grid-cols-7 gap-2">
          {week.map((day) => {
            const reels = reelsByDay.get(day.iso) ?? [];
            return (
              <DayColumn key={day.iso} day={day} reels={reels} />
            );
          })}
        </div>

        {/* Pool nescheduled */}
        <PoolColumn reels={pool} />
      </div>

      <DragOverlay>
        {activeReel ? <ReelDailyCard reel={activeReel} compact isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function DayColumn({ day, reels }: { day: WeekDay; reels: ReelRecord[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day.iso}`,
    data: { dateIso: day.iso },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[280px] p-2 border rounded-sm transition-colors ${
        isOver
          ? "bg-built-red/10 border-built-red"
          : day.isToday
          ? "bg-built-gray-1 border-built-red/50"
          : day.isPast
          ? "bg-built-black/40 border-built-gray-2/50"
          : "bg-built-gray-1 border-built-gray-2"
      }`}
    >
      <div className="mb-2 pb-2 border-b border-built-gray-2/60">
        <div
          className={`font-condensed text-[10px] uppercase tracking-wider ${
            day.isToday ? "text-built-red" : "text-built-gray-text"
          }`}
        >
          {day.label}
        </div>
        <div
          className={`font-display text-base ${
            day.isToday ? "text-built-red" : "text-built-white"
          }`}
        >
          {day.date.getUTCDate()}
        </div>
      </div>
      <div className="space-y-2">
        {reels.length === 0 ? (
          <div className="text-[10px] text-built-gray-text/60 italic py-2 text-center">
            {day.isPast ? "—" : "gol"}
          </div>
        ) : (
          reels.map((reel) => (
            <ReelDailyCard key={reel.id} reel={reel} compact />
          ))
        )}
      </div>
    </div>
  );
}

function PoolColumn({ reels }: { reels: ReelRecord[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "pool",
    data: { dateIso: null },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[280px] p-3 border rounded-sm transition-colors ${
        isOver
          ? "bg-built-red/10 border-built-red"
          : "bg-built-gray-1 border-built-gray-2"
      }`}
    >
      <div className="mb-3 pb-2 border-b border-built-gray-2/60">
        <div className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text">
          Pool
        </div>
        <div className="font-display text-base tracking-wider text-built-white">
          Neprogramate ({reels.length})
        </div>
        <div className="text-[10px] text-built-gray-text mt-1">
          Trage spre o zi ca să programezi.
        </div>
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {reels.length === 0 ? (
          <div className="text-[11px] text-built-gray-text/60 italic py-4 text-center">
            Nu ai reels neprogramate. Generează din M2.
          </div>
        ) : (
          reels.map((reel) => (
            <ReelDailyCard key={reel.id} reel={reel} compact />
          ))
        )}
      </div>
    </div>
  );
}
