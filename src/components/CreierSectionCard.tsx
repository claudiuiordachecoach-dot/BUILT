"use client";

import { useState, useTransition } from "react";
import type { CreierSection } from "@/lib/creier";
import { saveSection } from "@/app/creier/actions";

const STATUS_LABEL: Record<CreierSection["status"], string> = {
  completed: "Complet",
  draft: "Draft",
  pending: "Lipsă",
};

const STATUS_COLOR: Record<CreierSection["status"], string> = {
  completed: "text-built-red border-built-red",
  draft: "text-yellow-500 border-yellow-500",
  pending: "text-built-gray-text border-built-gray-2",
};

type Mode = "collapsed" | "view" | "edit";

export function CreierSectionCard({ section }: { section: CreierSection }) {
  const [mode, setMode] = useState<Mode>("collapsed");
  const [draftJson, setDraftJson] = useState<string>("");
  const [draftStatus, setDraftStatus] = useState<CreierSection["status"]>(
    section.status
  );
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [isPending, startTransition] = useTransition();

  function enterEdit() {
    const initial = section.data
      ? JSON.stringify(section.data, null, 2)
      : "{}";
    setDraftJson(initial);
    setDraftStatus(section.status);
    setError(null);
    setMode("edit");
  }

  function cancelEdit() {
    setDraftJson("");
    setError(null);
    setMode("view");
  }

  function attemptSave() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(draftJson);
    } catch (e) {
      setError(
        `JSON invalid: ${e instanceof Error ? e.message : "eroare la parse"}`
      );
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await saveSection(section.key, parsed, draftStatus);
      if (res.ok) {
        setSavedFlash(true);
        setMode("view");
        setTimeout(() => setSavedFlash(false), 2000);
      } else {
        setError(res.error);
      }
    });
  }

  const expanded = mode !== "collapsed";

  return (
    <div className="bg-built-gray-1 border border-built-gray-2 rounded-sm overflow-hidden">
      <button
        onClick={() =>
          setMode(mode === "collapsed" ? "view" : mode === "edit" ? "edit" : "collapsed")
        }
        disabled={mode === "edit"}
        className={`w-full text-left p-5 flex items-start gap-4 transition-colors ${
          mode === "edit"
            ? "cursor-default"
            : "hover:bg-built-gray-2/50"
        }`}
      >
        <div className="font-display text-2xl text-built-red w-12 shrink-0 pt-1">
          {section.order < 10 ? `0${section.order}` : section.order}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-display text-xl tracking-wider text-built-white">
              {section.title}
            </h3>
            <span
              className={`font-condensed text-[10px] px-2 py-0.5 border rounded ${
                STATUS_COLOR[section.status]
              }`}
            >
              {STATUS_LABEL[section.status]}
            </span>
            {savedFlash && (
              <span className="font-condensed text-[10px] px-2 py-0.5 text-green-400 border border-green-400 rounded">
                Salvat
              </span>
            )}
          </div>
          <p className="text-sm text-built-gray-text leading-relaxed">
            {section.description}
          </p>
        </div>

        <div
          className={`shrink-0 text-built-gray-text transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          ▼
        </div>
      </button>

      {expanded && (
        <div className="border-t border-built-gray-2 bg-built-black/40">
          {mode === "view" && (
            <div className="p-5 space-y-4">
              {section.data ? (
                <pre className="text-xs text-built-white/80 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(section.data, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-built-gray-text italic">
                  Secțiune neconstruită încă.
                </p>
              )}
              <div className="flex gap-2 pt-2 border-t border-built-gray-2">
                <button
                  onClick={enterEdit}
                  className="font-condensed text-xs uppercase tracking-wider px-3 py-1.5 bg-built-red text-built-white hover:bg-built-red-dark transition-colors rounded-sm"
                >
                  Editează
                </button>
              </div>
            </div>
          )}

          {mode === "edit" && (
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <label className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text">
                  Status
                </label>
                <select
                  value={draftStatus}
                  onChange={(e) =>
                    setDraftStatus(e.target.value as CreierSection["status"])
                  }
                  disabled={isPending}
                  className="bg-built-black border border-built-gray-2 text-built-white text-xs font-condensed px-2 py-1 rounded-sm focus:outline-none focus:border-built-red"
                >
                  <option value="completed">Complet</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Lipsă</option>
                </select>
              </div>

              <textarea
                value={draftJson}
                onChange={(e) => setDraftJson(e.target.value)}
                disabled={isPending}
                spellCheck={false}
                rows={Math.min(30, Math.max(10, draftJson.split("\n").length + 1))}
                className="w-full bg-built-black border border-built-gray-2 text-built-white text-xs font-mono p-3 rounded-sm focus:outline-none focus:border-built-red leading-relaxed"
              />

              {error && (
                <div className="p-3 bg-built-red-dark/20 border border-built-red rounded-sm">
                  <p className="text-xs text-built-red font-condensed mb-1">
                    Eroare
                  </p>
                  <p className="text-xs text-built-white/90">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-built-gray-2">
                <button
                  onClick={attemptSave}
                  disabled={isPending}
                  className="font-condensed text-xs uppercase tracking-wider px-3 py-1.5 bg-built-red text-built-white hover:bg-built-red-dark transition-colors rounded-sm disabled:opacity-50"
                >
                  {isPending ? "Salvez..." : "Salvează"}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={isPending}
                  className="font-condensed text-xs uppercase tracking-wider px-3 py-1.5 bg-built-gray-2 text-built-white hover:bg-built-gray-1 transition-colors rounded-sm disabled:opacity-50"
                >
                  Anulează
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
