"use client";
import { useState, useEffect } from "react";

const PLUGINS = [
  {
    id: "sales",
    file: "/built-figma-plugin.js",
    title: "Sales Strategy System",
    desc: "8 frame-uri: ICP, Content, DM, Apel, Ofertă, Obiecții, KPIs",
    frames: [
      {n:"01",l:"System Overview",c:"#C0392B"},
      {n:"02",l:"ICP Profile",c:"#7C3AED"},
      {n:"03",l:"Content System",c:"#C0392B"},
      {n:"04",l:"DM Qualification",c:"#7C3AED"},
      {n:"05",l:"Sales Call",c:"#D97706"},
      {n:"06",l:"Offer Architecture",c:"#C0392B"},
      {n:"07",l:"Objection Matrix",c:"#C0392B"},
      {n:"08",l:"KPIs Dashboard",c:"#0891B2"},
    ]
  },
  {
    id: "pi",
    file: "/built-pattern-interrupt-plugin.js",
    title: "Pattern Interrupt Strategy",
    desc: "6 frame-uri: Problema, Ce e PI, Timeline Reel, Script Template, Checklist, Calendar",
    frames: [
      {n:"01",l:"Problema retenției",c:"#C0392B"},
      {n:"02",l:"Ce este PI",c:"#7C3AED"},
      {n:"03",l:"Timeline Reel",c:"#059669"},
      {n:"04",l:"Script Template",c:"#D97706"},
      {n:"05",l:"Checklist + Algoritm",c:"#0891B2"},
      {n:"06",l:"Calendar Săptămânal",c:"#C0392B"},
    ]
  },
  {
    id: "dmfunnel",
    file: "/built-dm-funnel-plugin.js",
    title: "Funnel DM-to-Client",
    desc: "1 frame: 5 faze (Atragere → Deschidere → Descoperire → Punte → Anti-no-show) + gating + obiecții CAR",
    frames: [
      {n:"01",l:"Adu-i în DM",c:"#C0392B"},
      {n:"02",l:"Deschiderea",c:"#7C3AED"},
      {n:"03",l:"Descoperirea",c:"#D97706"},
      {n:"04",l:"Puntea",c:"#0891B2"},
      {n:"05",l:"Anti-no-show",c:"#059669"},
      {n:"CAR",l:"Obiecții",c:"#C0392B"},
    ]
  }
];

export default function FigmaPluginPage() {
  const [active, setActive] = useState("pi");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  const plugin = PLUGINS.find(p => p.id === active)!;

  useEffect(() => {
    setCode("");
    fetch(plugin.file).then(r => r.text()).then(setCode);
  }, [active, plugin.file]);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-1">FIGMA PLUGINS</p>
      <h1 className="text-[26px] font-semibold text-zinc-100 mb-6">Generatoare Figma BUILT</h1>

      {/* Plugin selector */}
      <div className="flex gap-3 mb-8">
        {PLUGINS.map(p => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            className={`flex-1 text-left px-5 py-4 rounded-xl border transition-colors ${
              active === p.id
                ? "border-[#C0392B]/40 bg-[#C0392B]/10"
                : "border-white/[0.07] bg-[#111] hover:border-white/20"
            }`}
          >
            <p className={`text-[12px] font-bold mb-1 ${active === p.id ? "text-[#C0392B]" : "text-zinc-400"}`}>
              {p.title}
            </p>
            <p className="text-[11px] text-zinc-600">{p.desc}</p>
          </button>
        ))}
      </div>

      {/* Steps */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          {n:"1",t:"Figma Desktop",d:"Deschide fișierul în care vrei designul"},
          {n:"2",t:"Plugins → Development",d:"→ New Plugin → Run once"},
          {n:"3",t:"Salvează plugin-ul",d:"Îi dai orice nume și Save as"},
          {n:"4",t:"Paste + Run",d:"Înlocuiești code.js cu codul de jos"},
        ].map(s => (
          <div key={s.n} className="bg-[#111] border border-white/[0.07] rounded-xl p-4">
            <div className="w-7 h-7 rounded-lg bg-[#C0392B]/20 border border-[#C0392B]/30 flex items-center justify-center text-[#C0392B] text-[11px] font-bold mb-3">{s.n}</div>
            <p className="text-[12px] text-zinc-200 font-medium mb-1">{s.t}</p>
            <p className="text-[11px] text-zinc-600">{s.d}</p>
          </div>
        ))}
      </div>

      {/* Code block */}
      <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-700" />
            <p className="text-[11px] font-mono text-zinc-500">{plugin.file.slice(1)}</p>
          </div>
          <button
            onClick={copy}
            className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors font-medium ${
              copied
                ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                : "text-[#C0392B] border-[#C0392B]/30 hover:bg-[#C0392B]/10"
            }`}
          >
            {copied ? "✓ Copiat!" : "Copiază codul"}
          </button>
        </div>
        <pre className="p-5 text-[11px] text-zinc-500 font-mono leading-relaxed overflow-auto max-h-[400px] whitespace-pre-wrap">
          {code || "Se încarcă..."}
        </pre>
      </div>

      {/* Frames preview */}
      <div className="grid grid-cols-4 gap-3">
        {plugin.frames.map(fr => (
          <div key={fr.n} className="bg-[#111] border border-white/[0.07] rounded-lg px-4 py-3">
            <p className="text-[9px] font-mono mb-0.5" style={{color:fr.c}}>{fr.n}</p>
            <p className="text-[11px] text-zinc-400">{fr.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
