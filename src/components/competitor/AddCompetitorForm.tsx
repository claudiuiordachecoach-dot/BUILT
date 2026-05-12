"use client";

import { useState, useTransition } from "react";
import { addCompetitor } from "@/app/competitors/actions";

export function AddCompetitorForm() {
  const [handle, setHandle] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const r = await addCompetitor(handle, notes);
      if (!r.ok) {
        setError(r.error);
      } else {
        setHandle("");
        setNotes("");
      }
    });
  }

  return (
    <div className="p-5 bg-built-gray-1 border border-built-gray-2 rounded-sm mb-6">
      <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-3">
        Adaugă competitor
      </p>
      <div className="flex gap-3 items-start flex-wrap">
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="@handle"
          disabled={isPending}
          className="flex-1 min-w-[180px] bg-built-black border border-built-gray-2 text-built-white text-sm px-3 py-2 focus:outline-none focus:border-built-red disabled:opacity-50"
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Note nișă (opțional)"
          disabled={isPending}
          className="flex-[2] min-w-[200px] bg-built-black border border-built-gray-2 text-built-white text-sm px-3 py-2 focus:outline-none focus:border-built-red disabled:opacity-50"
        />
        <button
          onClick={submit}
          disabled={isPending || !handle.trim()}
          className="font-condensed uppercase tracking-wider text-xs bg-built-red text-white px-5 py-2 hover:bg-built-red-dark disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? "Adaug..." : "Adaugă"}
        </button>
      </div>
      {error && <p className="text-built-red text-xs mt-2">⚠ {error}</p>}
    </div>
  );
}
