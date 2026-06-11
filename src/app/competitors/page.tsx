import {
  listCompetitors,
  listRecentReels,
  getCurrentWeekReport,
  listMyTopPosts,
} from "./actions";
import { StudioViralTabs } from "@/components/competitor/StudioViralTabs";

export const dynamic = "force-dynamic";

export default async function CompetitorsPage() {
  let competitors: Awaited<ReturnType<typeof listCompetitors>> = [];
  let recentReels: Awaited<ReturnType<typeof listRecentReels>> = [];
  let report: Awaited<ReturnType<typeof getCurrentWeekReport>> = null;
  let myPosts: Awaited<ReturnType<typeof listMyTopPosts>> = [];
  let dbError: string | null = null;

  try {
    [competitors, recentReels, report, myPosts] = await Promise.all([
      listCompetitors(),
      listRecentReels(7, 30),
      getCurrentWeekReport(),
      listMyTopPosts(12),
    ]);
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Eroare DB";
  }

  return (
    <div className="p-8 max-w-7xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">
        Studio Viral · Content Intelligence
      </p>
      <h1 className="font-display text-5xl tracking-[0.06em] text-foreground mb-3">
        STUDIO VIRAL
      </h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Creatorii din nișa ta, conținutul lor viral, planul tău săptămânal și butonul{" "}
        <strong className="text-foreground">Remake</strong> — totul într-un loc. Din orice postare care
        a explodat, AI-ul îți scoate de ce a funcționat + postarea regândită în vocea ta.
      </p>

      {dbError ? (
        <div className="bg-built-red/10 border border-built-red text-built-red p-4 rounded-xl text-sm">
          <p className="font-condensed uppercase mb-1">⚠ Tabelele nu sunt încă create.</p>
          <p className="text-xs text-foreground/80">
            Rulează <code className="bg-background px-1.5 py-0.5 rounded">supabase/m6_competitors.sql</code> în
            Supabase SQL Editor, apoi reîncarcă.
          </p>
          <p className="text-xs text-muted-foreground mt-1">{dbError}</p>
        </div>
      ) : (
        <StudioViralTabs competitors={competitors} recentReels={recentReels} report={report} myPosts={myPosts} />
      )}
    </div>
  );
}
