"use client";

import { useState, useTransition } from "react";
import { triggerSync, type IgAccount } from "@/app/analytics/actions";

export function IgConnectPanel({ account }: { account: IgAccount | null }) {
  const [isPending, startTransition] = useTransition();
  const [syncResult, setSyncResult] = useState<string | null>(null);

  function handleSync() {
    setSyncResult(null);
    startTransition(async () => {
      const r = await triggerSync();
      if (r.ok) setSyncResult(`✓ ${r.synced} media sincronizate`);
      else setSyncResult(`⚠ ${r.error}`);
    });
  }

  return (
    <div className="bg-built-gray-1 border border-built-gray-2 rounded-sm p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-1">
          Instagram
        </p>
        {account ? (
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-built-white font-condensed">@{account.username}</span>
            <span className="text-built-gray-text text-xs">
              {account.followers_count?.toLocaleString() ?? "—"} followeri
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-built-gray-text" />
            <span className="text-built-gray-text text-sm">Neconectat</span>
          </div>
        )}
        {syncResult && (
          <p className="text-xs mt-1 text-built-gray-text">{syncResult}</p>
        )}
      </div>

      <div className="flex gap-2">
        {account && (
          <button
            onClick={handleSync}
            disabled={isPending}
            className="font-condensed uppercase tracking-wider text-xs px-4 py-2 bg-built-gray-2 text-built-white hover:bg-built-red disabled:opacity-40"
          >
            {isPending ? "Sync..." : "Sync acum"}
          </button>
        )}
        <a
          href="/api/instagram/connect"
          className="font-condensed uppercase tracking-wider text-xs px-4 py-2 bg-built-red text-white hover:bg-built-red-dark"
        >
          {account ? "Reconectează" : "Conectează Instagram"}
        </a>
      </div>
    </div>
  );
}
