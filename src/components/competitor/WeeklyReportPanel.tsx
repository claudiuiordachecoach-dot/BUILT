"use client";

import { useState, useTransition } from "react";
import { generateWeeklyReport, type WeeklyReport } from "@/app/competitors/actions";

const PILLAR_LABEL: Record<string, string> = {
  B: "Base Strength",
  U: "Unbreakable Capacity",
  I: "Intelligent Fueling",
  L: "Lifestyle Integration",
  T: "Tough Mindset",
  mix: "Mix",
};

const DAY_NAMES = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];

type Script = NonNullable<WeeklyReport["generated_scripts"]>[number];

export function WeeklyReportPanel({ initial }: { initial: WeeklyReport | null }) {
  const [report, setReport] = useState<WeeklyReport | null>(initial);
  const [cadence, setCadence] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function generate() {
    setError(null);
    startTransition(async () => {
      const r = await generateWeeklyReport(cadence);
      if (r.ok) setReport(r.data);
      else setError(r.error);
    });
  }

  // Grupează postările pe zile (1–7)
  const byDay = new Map<number, Script[]>();
  for (const s of report?.generated_scripts ?? []) {
    const arr = byDay.get(s.day) ?? [];
    arr.push(s);
    byDay.set(s.day, arr);
  }

  return (
    <div>
      {/* Header + control */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl tracking-wide text-foreground mb-1.5">
            PLANUL TĂU · SĂPTĂMÂNA VIITOARE
          </h2>
          <p className="text-[13px] text-muted-foreground max-w-xl">
            AI-ul studiază ce a performat la creatorii tăi + Creierul tău și-ți scrie planul pe zile,
            cu postarea gata de filmat.
          </p>
          {report && (
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {report.week_start} — {report.week_end} · {report.total_reels} reels din {report.competitors_count} creatori
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Cadență */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            {([1, 2] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCadence(c)}
                className={`font-condensed text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors ${
                  cadence === c ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}/zi
              </button>
            ))}
          </div>
          <button
            onClick={generate}
            disabled={isPending}
            className="font-condensed uppercase tracking-wider text-[11px] bg-built-red text-white px-5 py-2.5 rounded-lg hover:bg-built-red-dark disabled:opacity-40 transition-colors"
          >
            {isPending ? "Generez..." : report ? "Regenerează" : "Generează planul"}
          </button>
        </div>
      </div>

      {error && (
        <div className="border border-built-red/40 bg-built-red/10 rounded-lg p-4 mb-6">
          <p className="text-built-red text-sm">⚠ {error}</p>
        </div>
      )}

      {isPending && (
        <div className="py-16 text-center">
          <p className="font-display text-2xl text-foreground tracking-wide animate-pulse">Construiesc planul...</p>
          <p className="text-xs text-muted-foreground mt-2">Analizez ce a performat și scriu postările pe zile.</p>
        </div>
      )}

      {!report && !isPending && (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Alege cadența și apasă <strong className="text-foreground">Generează planul</strong>.
            AI-ul îți scoate săptămâna întreagă, zi cu zi, din ce a performat la creatorii tăi.
          </p>
        </div>
      )}

      {report && !isPending && (
        <div className="space-y-6">
          {/* Insight + pattern-uri */}
          {report.raw_summary && (
            <div className="rounded-xl bg-card border-l-2 border-built-red px-5 py-4">
              <p className="text-sm text-foreground/90">{report.raw_summary}</p>
            </div>
          )}
          {report.patterns && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <PatternsCol title="Top hooks" items={report.patterns.top_hooks} />
              <PatternsCol title="Top formate" items={report.patterns.top_formats} />
              <PatternsCol title="Teme recurente" items={report.patterns.common_themes} />
            </div>
          )}

          {/* Plan zi-cu-zi */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {DAY_NAMES.map((name, i) => {
              const posts = byDay.get(i + 1) ?? [];
              if (posts.length === 0) return null;
              return (
                <div key={i} className="bg-card border border-border rounded-xl p-4">
                  <p className="font-display text-lg tracking-wide text-foreground mb-3">{name}</p>
                  <div className="space-y-3">
                    {posts.map((s, j) => (
                      <PostBlock key={j} s={s} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PostBlock({ s }: { s: Script }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  function copy() {
    navigator.clipboard.writeText(s.script ? `${s.hook}\n\n${s.script}` : `${s.hook}\n\n${s.angle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div className="rounded-lg bg-background/40 border border-border p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-condensed text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-built-red/15 text-built-red rounded shrink-0">
          {s.pillar} · {PILLAR_LABEL[s.pillar] ?? s.pillar}
        </span>
        <button
          onClick={copy}
          className="font-condensed text-[9px] uppercase tracking-wider px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors shrink-0"
        >
          {copied ? "✓ Copiat" : "Copiază"}
        </button>
      </div>

      {/* Hook = clickabil pentru a deschide postarea */}
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left group">
        <p className="text-[13px] text-foreground font-semibold leading-snug group-hover:text-built-red transition-colors">
          {s.hook}
        </p>
      </button>

      {open && s.script && (
        <p className="text-[13px] text-foreground/80 whitespace-pre-wrap leading-relaxed mt-2 pt-2 border-t border-border">
          {s.script}
        </p>
      )}

      {s.script ? (
        <button
          onClick={() => setOpen((o) => !o)}
          className="font-condensed text-[9px] uppercase tracking-wider text-muted-foreground hover:text-foreground mt-2 transition-colors"
        >
          {open ? "Ascunde ↑" : "Vezi postarea ↓"}
        </button>
      ) : (
        <p className="text-[12px] text-muted-foreground italic mt-1">{s.angle}</p>
      )}
    </div>
  );
}

function PatternsCol({ title, items }: { title: string; items: string[] | undefined }) {
  return (
    <div>
      <p className="font-condensed text-[10px] text-built-red uppercase tracking-widest mb-2">{title}</p>
      <ul className="space-y-1.5">
        {(items ?? []).map((it, i) => (
          <li key={i} className="text-[13px] text-foreground/80 leading-snug flex gap-2">
            <span className="text-built-red/50 shrink-0">·</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
