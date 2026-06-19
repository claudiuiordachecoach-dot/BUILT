"use client";
import { useState } from "react";
import Link from "next/link";
import {
  BONUSURI,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  getBonusesByCategory,
  type BonusCategory,
} from "@/data/bonusuri";

const CATEGORY_ICONS: Record<BonusCategory, string> = {
  alimentatie: "🍽",
  antrenament: "⚡",
  crize: "🚨",
  events: "🎉",
};

const CATEGORY_DESCRIPTIONS: Record<BonusCategory, string> = {
  alimentatie: "Restaurant, fast-food, grătar, familie, sărbători",
  antrenament: "Hotel, sală nouă, acasă, timp limitat",
  crize: "Urgență, săptămână pierdută, binge, stres, boală",
  events: "Nuntă, all-inclusive, vacanță cu familia",
};

export default function BonusuriPage() {
  const [activeCategory, setActiveCategory] = useState<BonusCategory>("alimentatie");
  const protocols = getBonusesByCategory(activeCategory);

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <span className="text-[10px] font-bold text-built-red uppercase tracking-widest mb-2 block">
          Pachet Exclusiv
        </span>
        <h1 className="font-display text-4xl tracking-wider text-built-white">Biblioteca de Protocol BUILT</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Orice situație din cele 90 de zile are un protocol. Nu ești niciodată singur.
        </p>
      </div>

      {/* Cookbook cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <a
          href="/BUILT_Cookbook_v2.html"
          className="flex items-center gap-4 bg-[#111111] border border-built-red/30 hover:border-built-red/60 rounded-xl p-4 transition-all group"
        >
          <span className="text-3xl">🥩</span>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-built-red uppercase tracking-widest block mb-0.5">
              Nutriție &amp; Performanță
            </span>
            <h3 className="text-sm font-bold text-white group-hover:text-built-red transition-colors">
              BUILT 50 — Cookbook
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5 truncate">
              Cartea de rețete oficială
            </p>
          </div>
          <span className="text-zinc-600 group-hover:text-built-red transition-colors text-sm shrink-0">→</span>
        </a>

        {/* Claudia Cookbook */}
        <a
          href="/Cartea_Retete_Claudia.html"
          className="flex items-center gap-4 bg-[#111111] border border-orange-500/30 hover:border-orange-500/60 rounded-xl p-4 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-3xl relative z-10">👩‍🍳</span>
          <div className="flex-1 min-w-0 relative z-10">
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest block mb-0.5">
              Personalizat
            </span>
            <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
              Cartea de Rețete — Claudia
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5 truncate">
              Meniul tău personalizat (7 zile)
            </p>
          </div>
          <span className="text-zinc-600 group-hover:text-orange-400 transition-colors text-sm shrink-0 relative z-10">→</span>
        </a>

        {/* Alexandru Cookbook */}
        <a
          href="/Cartea_Retete_Alex.html"
          className="flex items-center gap-4 bg-[#111111] border border-blue-500/30 hover:border-blue-500/60 rounded-xl p-4 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-3xl relative z-10">👨‍🍳</span>
          <div className="flex-1 min-w-0 relative z-10">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-0.5">
              Personalizat
            </span>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
              Cartea de Rețete — Alex
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5 truncate">
              Meniul tău personalizat (7 zile)
            </p>
          </div>
          <span className="text-zinc-600 group-hover:text-blue-400 transition-colors text-sm shrink-0 relative z-10">→</span>
        </a>
      </div>

      {/* Tab navigation */}
      <div className="flex overflow-x-auto gap-1 pb-1 mb-6 scrollbar-none border-b border-white/5">
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 border-b-2 ${
              activeCategory === cat
                ? "text-white border-built-red bg-built-red/5"
                : "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/5"
            }`}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            {CATEGORY_LABELS[cat]}
            <span className="text-[10px] font-normal text-zinc-600 ml-0.5">
              {getBonusesByCategory(cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Category description */}
      <p className="text-xs text-zinc-600 mb-5">
        {CATEGORY_DESCRIPTIONS[activeCategory]}
      </p>

      {/* Protocol cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {protocols.map((protocol) => (
          <Link
            key={protocol.id}
            href={`/client/bonusuri/${protocol.id}`}
            className="bg-[#111111] border border-white/10 hover:border-built-red/40 rounded-xl p-5 transition-all group flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] font-bold text-built-red uppercase tracking-widest">
                Protocol {protocol.id.split("-")[0].toUpperCase()}
              </span>
              <span className="text-2xl ml-2 leading-none">{protocol.icon}</span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-built-red transition-colors mb-1">
              {protocol.title}
            </h3>
            <p className="text-xs text-zinc-500 mb-3">{protocol.subtitle}</p>
            <p className="text-xs text-zinc-400 leading-relaxed flex-1">
              {protocol.shortDescription}
            </p>
            <div className="mt-4 pt-3 border-t border-white/5">
              <p className="text-[11px] font-bold text-zinc-500 italic line-clamp-1">
                &ldquo;{protocol.goldenRule}&rdquo;
              </p>
            </div>
            <div className="mt-3 text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
              Citește protocolul →
            </div>
          </Link>
        ))}
      </div>

      {/* Footer counter */}
      <div className="mt-10 p-5 bg-built-red/5 border border-built-red/20 rounded-xl">
        <p className="text-xs text-zinc-400 leading-relaxed">
          <span className="font-bold text-white">{BONUSURI.length} protocoale</span> acoperă
          fiecare situație previzibilă din cele 90 de zile. Dacă îți apare o situație care nu
          e acoperită, scrie-mi în mesaje — o adăugăm.
        </p>
      </div>
    </div>
  );
}
