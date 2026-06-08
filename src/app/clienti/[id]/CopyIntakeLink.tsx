"use client";

import { useState } from "react";

export function CopyIntakeLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const url = `${window.location.origin}/fisa-start/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copy}
      className="font-condensed uppercase tracking-[0.15em] text-[11px] border border-built-red text-built-red px-3 py-1.5 hover:bg-built-red hover:text-white transition-colors"
    >
      {copied ? "Copiat ✓" : "Copiază link Fișa de Start"}
    </button>
  );
}
