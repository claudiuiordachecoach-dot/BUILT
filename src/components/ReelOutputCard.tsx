"use client";

import { useState, useTransition } from "react";
import {
  saveReelEdit,
  type Pillar,
  type ReelRecord,
  type ReelVariant,
} from "@/app/reels/actions";

const PILLAR_COLORS: Record<Pillar, string> = {
  B: "border-built-red text-built-red",
  U: "border-built-red text-built-red",
  I: "border-built-red text-built-red",
  L: "border-built-red text-built-red",
  T: "border-built-red text-built-red",
  mix: "border-built-gray-text text-built-gray-text",
};

const STATUS_COLOR: Record<ReelRecord["status"], string> = {
  draft: "text-built-gray-text border-built-gray-2",
  edited: "text-yellow-500 border-yellow-500",
  posted: "text-green-400 border-green-400",
  archived: "text-built-gray-text border-built-gray-2 opacity-50",
};

export function ReelOutputCard({ reel }: { reel: ReelRecord }) {
  const [expanded, setExpanded] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<ReelVariant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const created = new Date(reel.created_at);
  const dateLabel = created.toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  function startEdit(i: number) {
    setEditingIndex(i);
    setDraft({ ...reel.body.variants[i] });
    setError(null);
  }

  function cancelEdit() {
    setEditingIndex(null);
    setDraft(null);
    setError(null);
  }

  function attemptSave() {
    if (editingIndex === null || !draft) return;
    startTransition(async () => {
      const res = await saveReelEdit(reel.id, editingIndex, draft);
      if (res.ok) {
        setEditingIndex(null);
        setDraft(null);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="bg-built-gray-1 border border-built-gray-2 rounded-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-4 hover:bg-built-gray-2/50 transition-colors"
      >
        <div className="flex flex-col items-center w-12 shrink-0">
          <div
            className={`font-display text-2xl border-2 w-10 h-10 flex items-center justify-center rounded-sm ${
              PILLAR_COLORS[reel.pillar]
            }`}
          >
            {reel.pillar}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`font-condensed text-[10px] px-2 py-0.5 border rounded ${
                STATUS_COLOR[reel.status]
              }`}
            >
              {reel.status}
            </span>
            <span className="font-condensed text-[10px] text-built-gray-text">
              #{reel.id}
            </span>
            <span className="font-condensed text-[10px] text-built-gray-text">
              {dateLabel}
            </span>
            <span className="font-condensed text-[10px] text-built-gray-text">
              {reel.body.variants.length} variante
            </span>
          </div>
          <p className="text-sm text-built-white/80 italic mb-1 line-clamp-1">
            {reel.body.angle}
          </p>
          <p className="font-display text-base tracking-wide text-built-white line-clamp-2">
            {reel.hook}
          </p>
        </div>

        <div
          className={`shrink-0 text-built-gray-text transition-transform self-center ${
            expanded ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          ▼
        </div>
      </button>

      {expanded && (
        <div className="border-t border-built-gray-2 bg-built-black/40 p-4 space-y-4">
          {reel.body.variants.map((variant, i) => {
            const isEditing = editingIndex === i;
            const v = isEditing && draft ? draft : variant;
            return (
              <div
                key={i}
                className="bg-built-gray-1/40 border border-built-gray-2 rounded-sm p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg text-built-red">
                      V{i + 1}
                    </span>
                    <span className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text">
                      {v.psychological_trigger} · {v.estimated_duration_sec}s
                    </span>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => startEdit(i)}
                      className="font-condensed text-[10px] uppercase tracking-wider px-2 py-1 border border-built-gray-2 text-built-gray-text hover:text-built-white hover:border-built-gray-text rounded-sm transition-colors"
                    >
                      Editează
                    </button>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={attemptSave}
                        disabled={isPending}
                        className="font-condensed text-[10px] uppercase tracking-wider px-2 py-1 bg-built-red text-built-white hover:bg-built-red-dark rounded-sm disabled:opacity-50"
                      >
                        {isPending ? "..." : "Salvează"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={isPending}
                        className="font-condensed text-[10px] uppercase tracking-wider px-2 py-1 bg-built-gray-2 text-built-white hover:bg-built-gray-1 rounded-sm disabled:opacity-50"
                      >
                        Anulează
                      </button>
                    </div>
                  )}
                </div>

                <Section
                  label="Hook (0–3s)"
                  value={v.hook}
                  editing={isEditing}
                  onChange={(val) => draft && setDraft({ ...draft, hook: val })}
                />
                <Section
                  label="Problemă / Validare (3–20s)"
                  value={v.problem_validation}
                  editing={isEditing}
                  onChange={(val) =>
                    draft && setDraft({ ...draft, problem_validation: val })
                  }
                />
                <Section
                  label="Sistemul BUILT (20–50s)"
                  value={v.built_system}
                  editing={isEditing}
                  onChange={(val) =>
                    draft && setDraft({ ...draft, built_system: val })
                  }
                />
                <Section
                  label="CTA (3–5s)"
                  value={v.cta}
                  editing={isEditing}
                  onChange={(val) => draft && setDraft({ ...draft, cta: val })}
                />

                {isEditing && error && (
                  <div className="mt-2 p-2 bg-built-red-dark/20 border border-built-red rounded-sm">
                    <p className="text-xs text-built-white/90">{error}</p>
                  </div>
                )}
              </div>
            );
          })}

          {reel.body.usage && (
            <div className="text-[10px] text-built-gray-text font-condensed pt-2 border-t border-built-gray-2">
              Tokens: input {reel.body.usage.input_tokens} · output{" "}
              {reel.body.usage.output_tokens} · cache_read{" "}
              {reel.body.usage.cache_read_input_tokens} · cache_creation{" "}
              {reel.body.usage.cache_creation_input_tokens}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  label,
  value,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (val: string) => void;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text mb-1">
        {label}
      </p>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={Math.max(2, Math.min(6, value.split("\n").length + 1))}
          className="w-full bg-built-black border border-built-gray-2 text-built-white text-sm p-2 rounded-sm focus:outline-none focus:border-built-red leading-relaxed"
        />
      ) : (
        <p className="text-sm text-built-white/90 leading-relaxed whitespace-pre-wrap">
          {value}
        </p>
      )}
    </div>
  );
}
