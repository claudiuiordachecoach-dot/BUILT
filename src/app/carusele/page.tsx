// src/app/carusele/page.tsx
"use client";

import { useState } from "react";
import { GeneratorTab } from "@/components/carusele/GeneratorTab";
import { AgentTab } from "@/components/carusele/AgentTab";

type Tab = "generator" | "agent";

export default function CaruselePage() {
  const [activeTab, setActiveTab] = useState<Tab>("generator");

  return (
    <div className="p-8 max-w-6xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">M4 · Generator Carusele</p>
      <h1 className="font-display text-5xl tracking-[0.06em] text-built-white mb-2">CARUSELE BUILT</h1>
      <p className="text-built-gray-text mb-6">8–10 slide-uri cu text + brief de design. PNG-uri gata de Instagram.</p>

      <div className="flex gap-1 mb-8 border-b border-built-gray-2">
        {(["generator", "agent"] as Tab[]).map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 font-condensed text-xs uppercase tracking-wider transition-colors ${activeTab === tab ? "text-built-white border-b-2 border-built-red -mb-px" : "text-built-gray-text hover:text-built-white"}`}>
            {tab === "generator" ? "Generator" : "Agent ✦"}
          </button>
        ))}
      </div>

      {activeTab === "generator" ? <GeneratorTab /> : <AgentTab />}
    </div>
  );
}
