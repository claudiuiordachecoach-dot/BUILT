"use client";

import { useState } from "react";
import { triggerSync, diagnoseReels } from "@/app/analytics/actions";

export function SyncDiagnoseButton() {
  const [state, setState] = useState<"idle" | "syncing" | "diagnosing" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setState("syncing");
    setMessage(null);

    const composioRes = await fetch("/api/instagram/composio-sync", { method: "POST" });
    const composioJson = await composioRes.json() as { ok?: boolean; synced?: number; error?: string };

    if (!composioRes.ok || composioJson.ok === false) {
      setState("error");
      setMessage(composioJson.error ?? "Eroare sync.");
      return;
    }

    const syncRes = { ok: true as const, synced: composioJson.synced ?? 0 };

    setState("diagnosing");
    const diagnoseRes = await diagnoseReels();
    if (!diagnoseRes.ok) {
      setState("error");
      setMessage(diagnoseRes.error ?? "Eroare diagnoze.");
      return;
    }

    setState("done");
    setMessage(`Sync: ${syncRes.synced} posts · Diagnoze: ${diagnoseRes.diagnosed} Reels`);
  }

  const labels: Record<typeof state, string> = {
    idle:       "Sync & Diagnozează",
    syncing:    "Sync în curs…",
    diagnosing: "Claude analizează…",
    done:       "Gata ✓",
    error:      "Eroare — reîncearcă",
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleClick}
        disabled={state === "syncing" || state === "diagnosing"}
        className="px-4 py-2 bg-built-red text-built-white font-condensed uppercase text-sm tracking-wider hover:bg-built-red/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-sm"
      >
        {labels[state]}
      </button>
      {message && (
        <span className={`text-xs font-condensed ${state === "error" ? "text-red-400" : "text-emerald-400"}`}>
          {message}
        </span>
      )}
    </div>
  );
}
