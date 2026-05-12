"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createConversation } from "./actions";

export function NewConversationButton() {
  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await createConversation(handle);
      if (result.ok) { setOpen(false); setHandle(""); router.push(`/dm/${result.id}`); }
      else setError(result.error);
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="px-4 py-2 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs transition-colors">
        + Prospect nou
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input value={handle} onChange={(e) => setHandle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="@handle sau nume"
        className="bg-built-black border border-built-red text-built-white text-sm px-3 py-2 focus:outline-none w-48" />
      <button type="button" onClick={handleSubmit} disabled={isPending}
        className="px-4 py-2 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs disabled:opacity-50">
        {isPending ? "..." : "Adaugă"}
      </button>
      <button type="button" onClick={() => { setOpen(false); setHandle(""); setError(null); }}
        className="px-3 py-2 border border-built-gray-2 text-built-gray-text font-condensed text-xs">
        ✕
      </button>
      {error && <span className="text-built-red font-condensed text-xs">{error}</span>}
    </div>
  );
}
