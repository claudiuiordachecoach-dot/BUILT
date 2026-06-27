"use client";

import { useState, useTransition } from "react";
import {
  auditCreier,
  updateCurrentFacts,
  type CreierSectionView,
  type StaleFlag,
} from "@/app/dashboard/creier-audit/actions";

const SEV: Record<string, { label: string; cls: string }> = {
  high: { label: "Important", cls: "bg-built-red/15 text-built-red" },
  medium: { label: "Mediu", cls: "bg-amber-500/15 text-amber-400" },
  low: { label: "Minor", cls: "bg-white/10 text-zinc-400" },
};

export function CreierAuditClient({
  sections,
  initialFacts,
}: {
  sections: CreierSectionView[];
  initialFacts: string;
}) {
  const [flags, setFlags] = useState<StaleFlag[] | null>(null);
  const [auditErr, setAuditErr] = useState<string | null>(null);
  const [auditing, startAudit] = useTransition();

  const [facts, setFacts] = useState(initialFacts);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saving, startSave] = useTransition();

  function runAudit() {
    setAuditErr(null);
    startAudit(async () => {
      const r = await auditCreier();
      if (r.ok) setFlags(r.data);
      else setAuditErr(r.error);
    });
  }

  function save() {
    setSaveErr(null);
    setSaved(false);
    startSave(async () => {
      const r = await updateCurrentFacts(facts);
      if (r.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else setSaveErr(r.error);
    });
  }

  return (
    <div className="space-y-8">
      {/* AUDIT */}
      <section className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <h2 className="font-display text-2xl tracking-wide text-foreground mb-1">CE PARE ÎNVECHIT</h2>
            <p className="text-[13px] text-muted-foreground max-w-xl">
              AI-ul scanează Creierul și-ți arată faptele perisabile (cifre, ofertă, dovezi) care ar trebui verificate. Filozofia și vocea nu se ating.
            </p>
          </div>
          <button
            onClick={runAudit}
            disabled={auditing}
            className="font-condensed uppercase tracking-wider text-[11px] bg-built-red text-white px-5 py-2.5 rounded-lg hover:bg-built-red-dark disabled:opacity-40 transition-colors"
          >
            {auditing ? "Scanez..." : flags ? "Scanează din nou" : "Scanează Creierul"}
          </button>
        </div>

        {auditErr && (
          <div className="border border-built-red/40 bg-built-red/10 rounded-lg p-4 mb-4">
            <p className="text-built-red text-sm">⚠ {auditErr}</p>
          </div>
        )}

        {auditing && (
          <p className="text-muted-foreground text-sm py-8 text-center animate-pulse">
            Scanez cele {sections.length} secțiuni după fapte perisabile...
          </p>
        )}

        {flags && !auditing && (
          flags.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nimic evident învechit. Verifică totuși manual cifrele importante.</p>
          ) : (
            <div className="space-y-2.5">
              {flags.map((f, i) => {
                const sev = SEV[f.severity] ?? SEV.low;
                return (
                  <div key={i} className="rounded-lg border border-border bg-background/40 p-4">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`font-condensed text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${sev.cls}`}>
                        {sev.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{f.section}</span>
                    </div>
                    <p className="text-[14px] text-foreground font-semibold leading-snug">{f.fact}</p>
                    <p className="text-[13px] text-muted-foreground mt-1">
                      <span className="text-foreground/80">Acum în Creier:</span> „{f.current_value}”
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 italic">{f.why}</p>
                  </div>
                );
              })}
            </div>
          )
        )}

        {!flags && !auditing && (
          <p className="text-muted-foreground text-sm">Apasă <strong className="text-foreground">Scanează Creierul</strong> ca să vezi ce fapte par învechite.</p>
        )}
      </section>

      {/* FAPTE CURENTE */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-display text-2xl tracking-wide text-foreground mb-1">FAPTELE TALE CURENTE</h2>
        <p className="text-[13px] text-muted-foreground max-w-2xl mb-4">
          Scrie aici, în limbaj simplu, faptele la zi: câți clienți, câți followeri, oferta și prețurile, stadiul, dovezi recente.
          <strong className="text-foreground"> Astea au prioritate</strong> peste orice din Creier — și ajung automat în TOATE uneltele (Studio Viral, Co-pilot DM, generatoare).
        </p>
        <textarea
          value={facts}
          onChange={(e) => setFacts(e.target.value)}
          rows={8}
          placeholder={"Ex:\n- 8 clienți activi (iunie 2026)\n- ~5.800 followeri Instagram\n- Oferta: 3 pachete 200 / 400 / 700 EUR (Hartă / Co-pilot / Cauză)\n- Stadiu: early scale, target 10 clienți la 500 EUR/lună\n- Dovezi recente: Alex (PM IT), Felicia (menopauză), Anastasia (−42kg)"}
          className="w-full bg-background border border-border text-foreground text-[13px] px-4 py-3 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-muted-foreground/60 resize-none leading-relaxed"
        />
        {saveErr && <p className="text-built-red text-xs mt-2">⚠ {saveErr}</p>}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={save}
            disabled={saving}
            className="font-condensed uppercase tracking-wider text-[11px] bg-built-red text-white px-5 py-2.5 rounded-lg hover:bg-built-red-dark disabled:opacity-40 transition-colors"
          >
            {saving ? "Salvez..." : "Salvează faptele curente"}
          </button>
          {saved && <span className="text-[12px] text-emerald-400">✓ Salvat — ajunge în toate uneltele</span>}
        </div>
      </section>

      {/* SECȚIUNI (referință) */}
      <section>
        <p className="font-condensed text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
          Cele {sections.length} secțiuni ale Creierului
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sections.map((s) => (
            <div key={s.key} className="bg-card border border-border rounded-xl p-4">
              <p className="text-[13px] text-foreground font-semibold mb-1">{s.title}</p>
              <p className="text-[12px] text-muted-foreground line-clamp-2">{s.preview}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
