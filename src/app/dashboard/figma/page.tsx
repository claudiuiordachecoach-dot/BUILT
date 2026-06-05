"use client";
import { useState, useEffect } from "react";

export default function FigmaPluginPage() {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/built-figma-plugin.js")
      .then(r => r.text())
      .then(setCode);
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-1">FIGMA PLUGIN</p>
      <h1 className="text-[26px] font-semibold text-zinc-100 mb-2">BUILT Sales Strategy — Generator Figma</h1>
      <p className="text-[13px] text-zinc-500 mb-8 max-w-[620px]">
        Rulează o dată în Figma → 8 frame-uri complete apar pe canvas: Overview, ICP, Content, DM, Sales Call, Offer, Obiecții, KPIs.
      </p>

      {/* Steps */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { n:"1", t:"Deschide Figma", d:"Orice file, orice pagină goală" },
          { n:"2", t:"Main menu → Plugins", d:"→ Development → New Plugin" },
          { n:"3", t:"Alege Run once", d:"Blank — fără manifest, fără setup" },
          { n:"4", t:"Paste + Run", d:"Înlocuiești codul cu cel de jos și dai Run" },
        ].map(s => (
          <div key={s.n} className="bg-[#111] border border-white/[0.07] rounded-xl p-4">
            <div className="w-7 h-7 rounded-lg bg-[#C0392B]/20 border border-[#C0392B]/30 flex items-center justify-center text-[#C0392B] text-[11px] font-bold mb-3">
              {s.n}
            </div>
            <p className="text-[12px] text-zinc-200 font-medium mb-1">{s.t}</p>
            <p className="text-[11px] text-zinc-600">{s.d}</p>
          </div>
        ))}
      </div>

      {/* Code block */}
      <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-700" />
            <p className="text-[11px] font-mono text-zinc-500">built-figma-plugin.js</p>
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

      {/* What you get */}
      <div className="mt-8 grid grid-cols-4 gap-3">
        {[
          { n:"01", l:"System Overview",    c:"#C0392B" },
          { n:"02", l:"ICP Profile",        c:"#7C3AED" },
          { n:"03", l:"Content System",     c:"#C0392B" },
          { n:"04", l:"DM Qualification",   c:"#7C3AED" },
          { n:"05", l:"Sales Call",          c:"#D97706" },
          { n:"06", l:"Offer Architecture", c:"#C0392B" },
          { n:"07", l:"Objection Matrix",   c:"#C0392B" },
          { n:"08", l:"KPIs Dashboard",     c:"#0891B2" },
        ].map(fr => (
          <div key={fr.n} className="bg-[#111] border border-white/[0.07] rounded-lg px-4 py-3">
            <p className="text-[9px] font-mono mb-0.5" style={{color:fr.c}}>{fr.n}</p>
            <p className="text-[11px] text-zinc-400">{fr.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
