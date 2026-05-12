"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { ReelRecord, Pillar } from "@/app/reels/actions";

const PILLAR_BG: Record<Pillar, string> = {
  B: "bg-built-red/30 border-built-red/60",
  U: "bg-blue-900/30 border-blue-700/60",
  I: "bg-amber-900/30 border-amber-700/60",
  L: "bg-emerald-900/30 border-emerald-700/60",
  T: "bg-purple-900/30 border-purple-700/60",
  mix: "bg-built-gray-2 border-built-gray-2",
};

const STATUS_DOT: Record<string, string> = {
  draft: "bg-built-gray-text",
  edited: "bg-amber-500",
  posted: "bg-emerald-500",
  archived: "bg-built-gray-2",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  edited: "Editat",
  posted: "Postat",
  archived: "Arhivat",
};

interface ReelDailyCardProps {
  reel: ReelRecord;
  compact?: boolean;
  isOverlay?: boolean;
}

export function ReelDailyCard({
  reel,
  compact = false,
  isOverlay = false,
}: ReelDailyCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `reel-${reel.id}`,
      data: { reelId: reel.id, currentDate: reel.scheduled_for },
      disabled: isOverlay,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  const hook = reel.hook || reel.body?.variants?.[0]?.hook || "(fără hook)";
  const truncatedHook = compact && hook.length > 80 ? hook.slice(0, 77) + "…" : hook;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group p-2.5 border rounded-sm cursor-grab active:cursor-grabbing select-none transition-shadow ${
        PILLAR_BG[reel.pillar]
      } ${isOverlay ? "shadow-xl ring-2 ring-built-red" : ""}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-condensed text-[10px] text-built-white/80 tracking-wider">
          Pilon {reel.pillar}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              STATUS_DOT[reel.status] ?? "bg-built-gray-2"
            }`}
            aria-label={STATUS_LABEL[reel.status]}
          />
          <span className="font-condensed text-[9px] text-built-gray-text uppercase">
            {STATUS_LABEL[reel.status] ?? reel.status}
          </span>
        </div>
      </div>
      <p
        className={`text-built-white leading-snug ${
          compact ? "text-[11px]" : "text-xs"
        }`}
      >
        {truncatedHook}
      </p>
    </div>
  );
}
