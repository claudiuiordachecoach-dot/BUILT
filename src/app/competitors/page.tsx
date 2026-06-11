import {
  listCompetitors,
  listRecentReels,
  getCurrentWeekReport,
} from "./actions";
import { AddCompetitorForm } from "@/components/competitor/AddCompetitorForm";
import { CompetitorRow } from "@/components/competitor/CompetitorRow";
import { ReelCard } from "@/components/competitor/ReelCard";
import { WeeklyReportPanel } from "@/components/competitor/WeeklyReportPanel";

export const dynamic = "force-dynamic";

export default async function CompetitorsPage() {
  let competitors: Awaited<ReturnType<typeof listCompetitors>> = [];
  let recentReels: Awaited<ReturnType<typeof listRecentReels>> = [];
  let report: Awaited<ReturnType<typeof getCurrentWeekReport>> = null;
  let dbError: string | null = null;

  try {
    [competitors, recentReels, report] = await Promise.all([
      listCompetitors(),
      listRecentReels(7, 30),
      getCurrentWeekReport(),
    ]);
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Eroare DB";
  }

  const activeCount = competitors.filter((c) => c.is_active).length;

  return (
    <div className="p-8 max-w-7xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">
        Studio Viral · Content Intelligence
      </p>
      <h1 className="font-display text-5xl tracking-[0.06em] text-built-white mb-3">
        STUDIO VIRAL
      </h1>
      <p className="text-built-gray-text mb-8 max-w-2xl">
        Creatorii din nișa ta, reels-urile lor virale sortate după views, și butonul{" "}
        <strong className="text-built-white">Remake</strong>: din orice postare care a explodat,
        AI-ul îți scoate de ce a funcționat + postarea regândită complet în vocea ta, gata de filmat.
      </p>

      {dbError && (
        <div className="bg-built-red/10 border border-built-red text-built-red p-4 rounded-sm mb-6 text-sm">
          <p className="font-condensed uppercase mb-1">⚠ Tabelele M6 nu sunt încă create.</p>
          <p className="text-xs text-built-white/80">
            Rulează{" "}
            <code className="bg-built-black px-1.5 py-0.5">supabase/m6_competitors.sql</code> în
            Supabase SQL Editor, apoi reîncarcă pagina.
          </p>
          <p className="text-xs text-built-gray-text mt-1">{dbError}</p>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Stat label="Competitori activi" value={String(activeCount)} />
        <Stat
          label="Reels (7 zile)"
          value={String(recentReels.length)}
          sub={recentReels.length === 0 ? "npm run scrape:competitors" : "scrape-uite"}
        />
        <Stat
          label="Total competitori"
          value={String(competitors.length)}
          sub={competitors.length === 0 ? "Adaugă primul mai jos" : ""}
        />
      </div>

      {/* WEEKLY INTELLIGENCE REPORT */}
      <WeeklyReportPanel initial={report} />

      {/* ADD COMPETITOR */}
      <AddCompetitorForm />

      {/* COMPETITORS LIST */}
      <div className="space-y-2 mb-10">
        {competitors.length === 0 && !dbError ? (
          <p className="text-built-gray-text text-sm italic p-6 text-center bg-built-gray-1/50 border border-dashed border-built-gray-2 rounded-sm">
            Niciun competitor adăugat încă.
          </p>
        ) : (
          competitors.map((c) => <CompetitorRow key={c.id} c={c} />)
        )}
      </div>

      {/* RECENT REELS */}
      {recentReels.length > 0 && (
        <div className="mb-10">
          <h2 className="font-display text-2xl tracking-wide text-foreground mb-1.5">
            REELS · ULTIMELE 7 ZILE
          </h2>
          <p className="text-[13px] text-muted-foreground mb-6 max-w-2xl">
            Sortate descrescător după views. Apasă{" "}
            <strong className="text-foreground">🔥 Remake</strong> pe oricare ca să primești analiza
            (de ce a mers) + postarea regenerată în vocea BUILT, gata de copiat.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentReels.map((r) => (
              <ReelCard key={r.id} reel={r} />
            ))}
          </div>
        </div>
      )}

      {/* SCRAPE INSTRUCTIONS */}
      <div className="p-5 bg-built-gray-1/50 border border-built-gray-2 rounded-sm">
        <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-3">
          Cum se scrape-ează
        </p>
        <p className="text-xs text-built-white/80 mb-2">
          <strong>Local (manual):</strong> rulează{" "}
          <code className="bg-built-black px-1.5 py-0.5 rounded">npm run scrape:competitors</code>{" "}
          în terminal din folderul proiectului.
        </p>
        <p className="text-xs text-built-white/80">
          <strong>Automat (după conectare GitHub):</strong>{" "}
          <code className="bg-built-black px-1.5 py-0.5 rounded">
            .github/workflows/scrape-competitors.yml
          </code>{" "}
          rulează lunea 09:00. Adaugă secrets{" "}
          <code className="bg-built-black px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> și{" "}
          <code className="bg-built-black px-1.5 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> în
          repo → Settings → Secrets.
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="font-condensed text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p className="font-display text-3xl text-foreground tracking-wide">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}
