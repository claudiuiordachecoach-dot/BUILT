"use client";

import { useState } from "react";
import { AddCompetitorForm } from "./AddCompetitorForm";
import { CompetitorRow } from "./CompetitorRow";
import { ReelCard } from "./ReelCard";
import { WeeklyReportPanel } from "./WeeklyReportPanel";
import type { Competitor, CompetitorReel, WeeklyReport } from "@/app/competitors/actions";

type TabId = "feed" | "plan" | "creatori";

export function StudioViralTabs({
  competitors,
  recentReels,
  report,
}: {
  competitors: Competitor[];
  recentReels: CompetitorReel[];
  report: WeeklyReport | null;
}) {
  const [tab, setTab] = useState<TabId>("feed");
  const activeCount = competitors.filter((c) => c.is_active).length;

  const TABS: { id: TabId; label: string; count?: number }[] = [
    { id: "feed", label: "Feed Viral", count: recentReels.length || undefined },
    { id: "plan", label: "Plan Săptămânal" },
    { id: "creatori", label: "Creatori", count: competitors.length || undefined },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-built-red text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.count != null && (
              <span className="ml-1.5 text-[11px] text-muted-foreground">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* FEED VIRAL */}
      {tab === "feed" && (
        <div>
          {recentReels.length === 0 ? (
            <EmptyState
              title="Niciun reel încă"
              sub="Adaugă creatori în tab-ul Creatori, apoi rulează scrape-ul. Aici apare conținutul lor viral, sortat după views."
            />
          ) : (
            <>
              <p className="text-[13px] text-muted-foreground mb-6 max-w-2xl">
                Sortate descrescător după views. Apasă <strong className="text-foreground">🔥 Remake</strong> pe
                oricare ca să primești analiza (de ce a mers) + postarea regenerată în vocea BUILT.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentReels.map((r) => (
                  <ReelCard key={r.id} reel={r} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* PLAN SĂPTĂMÂNAL */}
      {tab === "plan" && <WeeklyReportPanel initial={report} />}

      {/* CREATORI */}
      {tab === "creatori" && (
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Creatori activi" value={String(activeCount)} />
            <Stat label="Reels (7 zile)" value={String(recentReels.length)} />
            <Stat label="Total creatori" value={String(competitors.length)} />
          </div>

          <AddCompetitorForm />

          {competitors.length === 0 ? (
            <EmptyState title="Niciun creator adăugat" sub="Adaugă primul cont de mai sus." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {competitors.map((c) => (
                <CompetitorRow key={c.id} c={c} />
              ))}
            </div>
          )}

          <div className="rounded-xl border border-border bg-card/40 p-5">
            <p className="font-condensed text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
              Cum se trag reels-urile
            </p>
            <p className="text-xs text-foreground/70">
              Local: <code className="bg-background px-1.5 py-0.5 rounded">npm run scrape:competitors</code>.
              Automat: GitHub Actions rulează lunea (vezi <code className="bg-background px-1.5 py-0.5 rounded">.github/workflows/scrape-competitors.yml</code>).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="font-condensed text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">{label}</p>
      <p className="font-display text-3xl text-foreground tracking-wide">{value}</p>
    </div>
  );
}

function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
      <p className="font-display text-xl text-foreground tracking-wide mb-1">{title}</p>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">{sub}</p>
    </div>
  );
}
