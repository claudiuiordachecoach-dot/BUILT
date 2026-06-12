"use client";

import { useState, useTransition } from "react";
import { generateIntervention, type ClientRisk, type RiskLevel } from "@/app/clienti/actions";

const LEVEL: Record<RiskLevel, { label: string; cls: string }> = {
  disparut: { label: "Dispărut", cls: "bg-built-red/15 text-built-red" },
  aluneca: { label: "Alunecă", cls: "bg-orange-500/15 text-orange-400" },
  epuizat: { label: "Epuizat", cls: "bg-amber-500/15 text-amber-400" },
  atentie: { label: "Atenție", cls: "bg-yellow-500/15 text-yellow-400" },
  ok: { label: "OK", cls: "bg-white/10 text-zinc-400" },
};

export function RetentionPanel({ risks }: { risks: ClientRisk[] }) {
  const needs = risks.filter((r) => r.level !== "ok");

  return (
    <section className="bg-[#111111] border border-white/[0.08] rounded-xl p-6 mb-8">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="font-display text-2xl tracking-wide text-zinc-100">CINE ARE NEVOIE DE TINE</h2>
        <span className="text-[11px] text-zinc-500 font-mono">{needs.length} de atins</span>
      </div>
      <p className="text-[13px] text-zinc-500 mb-5">
        Detectat automat din check-in-uri. Generează intervenția pe Skill 3 (elimini vinovăția → un singur pas), o editezi și o trimiți.
      </p>

      {needs.length === 0 ? (
        <p className="text-zinc-500 text-sm">Toți clienții sunt pe traseu. Nimic de stins acum.</p>
      ) : (
        <div className="space-y-3">
          {needs.map((r) => (
            <RiskRow key={r.client.id} risk={r} />
          ))}
        </div>
      )}
    </section>
  );
}

function RiskRow({ risk }: { risk: ClientRisk }) {
  const [draft, setDraft] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const lvl = LEVEL[risk.level];

  function run() {
    setErr(null);
    start(async () => {
      const r = await generateIntervention(risk.client.id);
      if (r.ok) setDraft(r.data);
      else setErr(r.error);
    });
  }

  function copy() {
    if (draft == null) return;
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#0a0a0a] p-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`font-condensed text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${lvl.cls}`}>
          {lvl.label}
        </span>
        <span className="text-[14px] text-zinc-100 font-semibold">{risk.client.name}</span>
        <span className="text-[12px] text-zinc-500">{risk.reason}</span>
        {draft == null && (
          <button
            onClick={run}
            disabled={pending}
            className="ml-auto font-condensed text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg bg-built-red text-white hover:bg-built-red/90 disabled:opacity-40 transition-colors"
          >
            {pending ? "Scriu..." : "Generează intervenția"}
          </button>
        )}
      </div>

      {err && <p className="text-built-red text-xs mt-2">⚠ {err}</p>}

      {draft != null && (
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <p className="font-condensed text-[9px] uppercase tracking-widest text-zinc-500 mb-2">
            Draft intervenție · editează înainte să trimiți
          </p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            className="w-full bg-[#111111] border border-white/[0.08] text-zinc-200 text-[13px] px-3 py-2.5 rounded-lg focus:outline-none focus:border-built-red/40 resize-none leading-relaxed"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={copy}
              className="font-condensed text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg bg-built-red/15 text-built-red hover:bg-built-red/25 transition-colors"
            >
              {copied ? "Copiat!" : "Copiază"}
            </button>
            <button
              onClick={run}
              disabled={pending}
              className="font-condensed text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-zinc-200 disabled:opacity-40 transition-colors"
            >
              {pending ? "..." : "↻ Altă variantă"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
