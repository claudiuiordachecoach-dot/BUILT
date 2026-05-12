"use client";

import { useState } from "react";
import type { StoryRecord, StoryType } from "@/app/stories/actions";

const TYPE_LABEL: Record<StoryType, string> = {
  question: "Întrebare",
  bts: "BTS",
  mini_lesson: "Mini-lecție",
  recap: "Recap",
  vulnerability: "Vulnerabilitate",
};

const TYPE_COLOR: Record<StoryType, string> = {
  question: "text-built-red",
  bts: "text-blue-400",
  mini_lesson: "text-amber-400",
  recap: "text-emerald-400",
  vulnerability: "text-purple-400",
};

const STATUS_DOT: Record<string, string> = {
  draft: "bg-built-gray-text",
  edited: "bg-amber-500",
  posted: "bg-emerald-500",
  archived: "bg-built-gray-2",
};

export function StoryPackCard({ story }: { story: StoryRecord }) {
  const [expanded, setExpanded] = useState(false);
  const stories = story.body?.stories ?? [];

  return (
    <div className="bg-built-gray-1 border border-built-gray-2 rounded-sm overflow-hidden">
      <button type="button" onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-built-gray-2 transition-colors text-left">
        <div className="flex items-center gap-3">
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[story.status] ?? "bg-built-gray-2"}`} />
          <span className="font-condensed text-[10px] text-built-red">Pilon {story.pillar}</span>
          <span className="font-display text-base tracking-wider text-built-white truncate max-w-xs">
            {story.hook || story.body?.theme || "(fără titlu)"}
          </span>
          <span className="font-condensed text-[10px] text-built-gray-text">{stories.length} stories</span>
        </div>
        <span className="text-built-gray-text text-sm">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-built-gray-2 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stories.map((s, i) => (
            <div key={i} className="p-3 bg-built-black border border-built-gray-2 rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-condensed text-[10px] uppercase ${TYPE_COLOR[s.type] ?? "text-built-gray-text"}`}>
                  {TYPE_LABEL[s.type] ?? s.type}
                </span>
                <span className="font-condensed text-[9px] text-built-gray-text">{s.estimated_sec}s</span>
              </div>
              <p className="font-display text-base tracking-wider text-built-white mb-2">{s.title}</p>
              <p className="text-xs text-built-white/80 leading-relaxed mb-2">{s.body}</p>
              {s.cta && <p className="text-xs text-built-red">{s.cta}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
