"use client";

import { useState, useTransition } from "react";
import { testAICache, type CacheTestResult } from "@/app/creier/actions";

export function UpdateAIButton() {
  const [result, setResult] = useState<CacheTestResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function trigger() {
    startTransition(async () => {
      const res = await testAICache();
      setResult(res);
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={trigger}
        disabled={isPending}
        className="font-condensed text-xs uppercase tracking-wider px-4 py-2 bg-built-red text-built-white hover:bg-built-red-dark transition-colors rounded-sm disabled:opacity-50"
      >
        {isPending ? "Trimit la AI..." : "Update AI · test cache"}
      </button>

      {result && result.ok && (
        <div className="text-right">
          <div className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text mb-1">
            Usage ultim request · creier {(result.creierBytes / 1024).toFixed(1)}KB
          </div>
          <div className="flex gap-3 text-xs font-mono">
            <Stat
              label="cache_creation"
              value={result.usage.cache_creation_input_tokens}
              hot={result.usage.cache_creation_input_tokens > 0}
            />
            <Stat
              label="cache_read"
              value={result.usage.cache_read_input_tokens}
              good={result.usage.cache_read_input_tokens > 0}
            />
            <Stat
              label="input"
              value={result.usage.input_tokens}
            />
            <Stat
              label="output"
              value={result.usage.output_tokens}
            />
          </div>
          <div className="text-[10px] text-built-gray-text mt-1">
            {result.usage.cache_read_input_tokens > 0
              ? "✓ Caching merge — creierul s-a citit din cache"
              : result.usage.cache_creation_input_tokens > 0
              ? "Cache scris. Click din nou ca să verifici read."
              : "Apel fără cache (creier prea mic sau prim request)."}
          </div>
        </div>
      )}

      {result && !result.ok && (
        <div className="text-right">
          <div className="font-condensed text-[10px] uppercase tracking-wider text-built-red mb-1">
            Eroare
          </div>
          <div className="text-xs text-built-white/90 max-w-md">{result.error}</div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hot,
  good,
}: {
  label: string;
  value: number;
  hot?: boolean;
  good?: boolean;
}) {
  const color = good
    ? "text-green-400 border-green-400"
    : hot
    ? "text-yellow-500 border-yellow-500"
    : "text-built-white border-built-gray-2";
  return (
    <div className={`flex flex-col items-center px-2 py-1 border rounded-sm ${color}`}>
      <span className="font-condensed text-[9px] uppercase tracking-wider opacity-70">
        {label}
      </span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}
