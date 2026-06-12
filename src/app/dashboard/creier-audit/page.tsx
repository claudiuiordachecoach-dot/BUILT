import { getCreierSections, getCurrentFacts } from "./actions";
import { CreierAuditClient } from "@/components/creier/CreierAuditClient";

export const dynamic = "force-dynamic";

export default async function CreierAuditPage() {
  let sections: Awaited<ReturnType<typeof getCreierSections>> = [];
  let facts = "";
  let dbError: string | null = null;

  try {
    [sections, facts] = await Promise.all([getCreierSections(), getCurrentFacts()]);
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Eroare DB";
  }

  return (
    <div className="p-8 max-w-5xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">
        Fundație · Context AI
      </p>
      <h1 className="font-display text-5xl tracking-[0.06em] text-foreground mb-3">AUDIT CREIER</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Creierul e fundația pe care generează TOT (Studio Viral, Co-pilot DM, generatoare). Dacă are cifre
        vechi, tot ce iese e ușor fals. Aici vezi ce pare învechit și scrii faptele la zi — o singură dată,
        ajung peste tot.
      </p>

      {dbError ? (
        <div className="bg-built-red/10 border border-built-red text-built-red p-4 rounded-xl text-sm">
          <p className="font-condensed uppercase mb-1">⚠ Eroare</p>
          <p className="text-xs text-muted-foreground mt-1">{dbError}</p>
        </div>
      ) : (
        <CreierAuditClient sections={sections} initialFacts={facts} />
      )}
    </div>
  );
}
