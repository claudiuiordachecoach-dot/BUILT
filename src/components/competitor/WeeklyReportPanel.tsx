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

const DAY_NAMES = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

export function WeeklyReportPanel({ initial }: { initial: WeeklyReport | null }) {
  const [report, setReport] = useState<WeeklyReport | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function generate() {
    setError(null);
    startTransition(async () => {
      const r = await generateWeeklyReport();
      if (r.ok) setReport(r.data);
      else setError(r.error);
    });
  }

  return (
    <div className="bg-built-gray-1 border border-built-red/40 rounded-sm p-6 mb-6">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <p className="font-condensed text-[10px] text-built-red uppercase tracking-wider mb-1">
            Weekly Intelligence Report
          </p>
          <h2 className="font-display text-3xl tracking-[0.04em] text-built-white">
            7 SCRIPTURI · SĂPTĂMÂNA VIITOARE
          </h2>
          {report && (
            <p className="text-xs text-built-gray-text mt-1">
              {report.week_start} — {report.week_end} · {report.total_reels} reels din{" "}
              {report.competitors_count} competitori
            </p>
          )}
        </div>
        <button
          onClick={generate}
          disabled={isPending}
          className="font-condensed uppercase tracking-wider text-xs bg-built-red text-white px-5 py-2.5 hover:bg-built-red-dark disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? "Analizez..." : report ? "Regenerează raport" : "Generează raport"}
        </button>
      </div>

      {error && <p className="text-built-red text-xs mb-3">⚠ {error}</p>}

      {!report && !isPending && (
        <p className="text-built-gray-text text-sm">
          Adaugă competitori, rulează scrape-ul, apoi apasă <strong>Generează raport</strong>. AI-ul va analiza
          ce a funcționat săptămâna asta și va scrie 7 hook-uri pentru săptămâna viitoare.
        </p>
      )}

      {report && (
        <div className="space-y-5">
          {report.raw_summary && (
            <div className="bg-built-black/40 border-l-2 border-built-red px-4 py-3">
              <p className="text-sm text-built-white">{report.raw_summary}</p>
            </div>
          )}

          {report.patterns && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <PatternsCol title="Top hooks" items={report.patterns.top_hooks} />
              <PatternsCol title="Top formate" items={report.patterns.top_formats} />
              <PatternsCol title="Teme recurente" items={report.patterns.common_themes} />
            </div>
          )}

          <div>
            <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-2">
              Scripturi generate
            </p>
            <div className="space-y-2">
              {report.generated_scripts?.map((s) => (
                <div
                  key={s.day}
                  className="flex gap-3 items-start p-3 bg-built-black/40 border border-built-gray-2 rounded-sm"
                >
                  <div className="shrink-0 w-12 text-center">
                    <p className="font-display text-xl text-built-red">{s.day}</p>
                    <p className="font-condensed text-[9px] text-built-gray-text uppercase">
                      {DAY_NAMES[s.day - 1] ?? "?"}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base text-built-white tracking-wide leading-tight mb-1">
                      {s.hook}
                    </p>
                    <p className="text-xs text-built-gray-text mb-1.5">{s.angle}</p>
                    <span className="font-condensed text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-built-red/20 text-built-red rounded-sm">
                      {s.pillar} · {PILLAR_LABEL[s.pillar] ?? s.pillar}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PatternsCol({ title, items }: { title: string; items: string[] | undefined }) {
  return (
    <div>
      <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-2">
        {title}
      </p>
      <ul className="space-y-1">
        {(items ?? []).map((it, i) => (
          <li key={i} className="text-built-white">
            <span className="text-built-red">›</span> {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
