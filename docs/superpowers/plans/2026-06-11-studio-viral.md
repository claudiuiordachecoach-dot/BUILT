# Studio Viral Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replica fluxului „rtar" din video în BUILT Command Center — feed cu reels virale ale creatorilor urmăriți + buton Remake (analiză structurată + postare regenerată în vocea BUILT) — pe o conductă de date dovedită că funcționează.

**Architecture:** Evoluăm modulul existent `/competitors` (rebrand „Studio Viral"). Refolosim backend-ul real (scraper Python + Apify, `listRecentReels`, weekly report). Reparăm conducta eliminând scraper-ul TS rupt. Adăugăm o singură capacitate nouă: acțiunea `remakeReel` + panoul ei UI.

**Tech Stack:** Next.js (App Router, server actions), Supabase (Postgres + RLS), Anthropic SDK (Opus `MODELS.deep`), Python + Apify pentru scraping, Tailwind cu design system BUILT.

**Notă despre testare:** Codebase-ul NU are framework de teste (nici jest, nici vitest) și nu introducem unul (over-engineering pentru acest proiect). Verificăm prin: `npx tsc --noEmit` (typecheck), `npm run build`, `npm run lint`, un script `tsx` de verificare a datelor, și rulare reală a scrape-ului. Aceasta e metoda de verificare deja folosită în repo (vezi `scripts/test-connections.ts`).

**Notă despre DDL:** Claudiu rulează SQL-ul în Supabase manual. Pașii de DDL livrează snippet-ul gata de copiat; execuția lui e o acțiune a userului, marcată explicit.

**Branch:** Toată munca pe branch-ul `studio-viral` (preview deploy pe Vercel, fără să atingem producția). Push/merge în `main` doar la final, când Claudiu aprobă.

---

## Task 0: Branch de lucru

**Files:** niciunul (doar git)

- [ ] **Step 1: Creează branch-ul**

```bash
cd "/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center"
git checkout -b studio-viral
```

- [ ] **Step 2: Confirmă branch-ul**

Run: `git branch --show-current`
Expected: `studio-viral`

---

## FAZA 1 — O singură conductă, dovedită

## Task 1: Retrage scraper-ul TS rupt + cron-ul Vercel

Scraper-ul TS (`scrapeCompetitors`) scrie în coloane inexistente și eșuează silențios la fiecare rulare a cron-ului Vercel de luni. Sursa reală de adevăr e scraper-ul Python (GitHub Actions). Eliminăm duplicatul rupt.

**Files:**
- Delete: `src/app/api/cron/scrape-competitors/route.ts`
- Modify: `src/app/dashboard/content/actions.ts` (șterge funcția `scrapeCompetitors` + importurile devenite nefolosite)
- Modify: `vercel.json` (șterge linia de cron)

- [ ] **Step 1: Confirmă că nimic altceva nu importă `scrapeCompetitors`**

Run:
```bash
grep -rn "scrapeCompetitors" src/ --include="*.ts" --include="*.tsx"
```
Expected: doar 2 hit-uri — definiția în `dashboard/content/actions.ts` și importul din `api/cron/scrape-competitors/route.ts`. Dacă apar și alte locuri, oprește-te și raportează.

- [ ] **Step 2: Șterge ruta de cron**

```bash
rm -rf src/app/api/cron/scrape-competitors
```

- [ ] **Step 3: Șterge funcția `scrapeCompetitors` din `dashboard/content/actions.ts`**

Șterge întreaga funcție `export async function scrapeCompetitors() { ... }` (în jur de liniile 31–85). După ștergere, verifică dacă importurile `scrapeInstagramReels`, `scrapeReelComments`, `ApifyComment` (linia 5) și `transcribeVideoUrl` (importul dinamic din funcție) mai sunt folosite în fișier:

```bash
grep -nE "scrapeInstagramReels|scrapeReelComments|ApifyComment|transcribeVideoUrl" src/app/dashboard/content/actions.ts
```
Dacă vreunul nu mai apare nicăieri în fișier (în afară de linia de import), șterge-l din import-ul de la linia 5 ca să nu rămână import nefolosit.

- [ ] **Step 4: Șterge linia de cron din `vercel.json`**

Înlocuiește blocul `crons` astfel (elimină linia `scrape-competitors`):

```json
  "crons": [
    { "path": "/api/cron/sync-instagram", "schedule": "0 7 * * *" },
    { "path": "/api/cron/weekly-scripts", "schedule": "0 7 * * 1" }
  ]
```

- [ ] **Step 5: Typecheck + build pentru a confirma că nimic nu s-a rupt**

Run:
```bash
npx tsc --noEmit 2>&1 | grep -E "content/actions|scrape-competitors" || echo "NICIO eroare nouă în fișierele atinse"
```
Expected: `NICIO eroare nouă în fișierele atinse` (repo-ul are erori TS preexistente în alte fișiere — ne uităm doar la ce am atins).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix(competitors): retrage scraper-ul TS rupt + cron-ul Vercel duplicat

Scraper-ul TS scria in coloane inexistente (competitor_handle, instagram_id)
si esua silentios la fiecare cron de luni. Sursa unica de adevar ramane
scraper-ul Python via GitHub Actions."
```

---

## Task 2: Dovedește că data aterizează (script de verificare + scrape real)

**Files:**
- Create: `scripts/verify-competitor-data.ts`
- Modify: `package.json` (adaugă script `verify:competitors`)

- [ ] **Step 1: Creează scriptul de verificare**

Create `scripts/verify-competitor-data.ts`:

```ts
/**
 * Verifică ce date au aterizat în competitor_reels.
 * Rulează: npm run verify:competitors
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  const sb = createClient(url, key);

  const { count: competitors } = await sb
    .from("competitors")
    .select("id", { count: "exact", head: true });

  const { data: reels, count: reelsCount } = await sb
    .from("competitor_reels")
    .select("id, views, caption, transcript, posted_at", { count: "exact" })
    .order("views", { ascending: false, nullsFirst: false })
    .limit(5);

  console.log("─── VERIFICARE CONDUCTĂ COMPETITOR ───");
  console.log(`Competitori în DB:        ${competitors ?? 0}`);
  console.log(`Total reels în DB:        ${reelsCount ?? 0}`);
  const withCaption = (reels ?? []).filter((r) => (r.caption ?? "").length > 0).length;
  const withTranscript = (reels ?? []).filter((r) => (r.transcript ?? "").length > 0).length;
  console.log(`Top 5 — cu caption:       ${withCaption}/${(reels ?? []).length}`);
  console.log(`Top 5 — cu transcript:    ${withTranscript}/${(reels ?? []).length}`);
  console.log("");
  console.log("Top 5 reels după views:");
  for (const r of reels ?? []) {
    const cap = (r.caption ?? "").slice(0, 50).replace(/\n/g, " ");
    console.log(`  • ${r.views ?? "?"} views · "${cap}..." · postat ${r.posted_at ?? "?"}`);
  }

  if ((reelsCount ?? 0) === 0) {
    console.log("\n⚠ ZERO reels. Adaugă competitori și rulează `npm run scrape:competitors`.");
    process.exit(1);
  }
  console.log("\n✓ Conducta livrează date.");
}

main().catch((e) => {
  console.error("Eroare:", e);
  process.exit(1);
});
```

- [ ] **Step 2: Adaugă scriptul în `package.json`**

În blocul `scripts`, adaugă:
```json
    "verify:competitors": "tsx scripts/verify-competitor-data.ts"
```

- [ ] **Step 3: Precondiție — asigură-te că există competitori și data scrape-uită**

Dacă DB-ul nu are competitori încă, adaugă 2–3 din nișă prin UI (`/competitors`, formularul „Adaugă competitor") SAU confirmă că există:
```bash
npm run verify:competitors
```
Dacă întoarce `ZERO reels`, rulează scrape-ul real (necesită `.venv` Python + `APIFY_API_KEY` în `.env.local`):
```bash
npm run scrape:competitors
```

- [ ] **Step 4: Rulează verificarea**

Run: `npm run verify:competitors`
Expected: `✓ Conducta livrează date.` + listă de top-5 reels cu views reale și caption-uri. (Transcript poate fi 0/5 — e ok, Remake-ul lucrează pe caption; transcript = enhancement ulterior.)

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-competitor-data.ts package.json
git commit -m "feat(competitors): script verify:competitors pentru a dovedi conducta de date"
```

---

## FAZA 2 — Remake

## Task 3: DDL — coloana `remake` (rulat manual de Claudiu)

**Files:**
- Create: `supabase/m6b_remake_column.sql`

- [ ] **Step 1: Creează fișierul SQL**

Create `supabase/m6b_remake_column.sql`:

```sql
-- BUILT — adaugă coloana `remake` pe competitor_reels (idempotent)
-- Rulează în Supabase SQL Editor.
alter table public.competitor_reels add column if not exists remake jsonb;
notify pgrst, 'reload schema';
```

- [ ] **Step 2: Acțiune USER — rulează SQL-ul**

⚠ Acțiune manuală a lui Claudiu: deschide Supabase → SQL Editor → lipește conținutul din `supabase/m6b_remake_column.sql` → Run. Confirmă „Success".

- [ ] **Step 3: Commit**

```bash
git add supabase/m6b_remake_column.sql
git commit -m "feat(competitors): migratie SQL pentru coloana remake"
```

---

## Task 4: Acțiunea `remakeReel` + tipul `RemakeOutput`

**Files:**
- Modify: `src/app/competitors/actions.ts` (adaugă interfața `RemakeOutput`, extinde `CompetitorReel`, adaugă funcția `remakeReel`)

- [ ] **Step 1: Adaugă interfața `RemakeOutput` după `ReelAnalysis`**

În `src/app/competitors/actions.ts`, după interfața `ReelAnalysis` (linia ~45), adaugă:

```ts
export interface RemakeOutput {
  analysis: {
    viral_elements: string[];   // ce a oprit scrollul
    strengths: string[];        // ce face postarea puternică
    adaptation_tips: string[];  // cum o adaptezi la tine
    risks: string[];            // ce să NU copiezi orbește
  };
  regenerated: {
    hook: string;               // hook-ul regenerat
    script: string;             // scriptul/caption-ul complet, vocea BUILT
    pillar: "B" | "U" | "I" | "L" | "T" | "mix";
  };
}
```

- [ ] **Step 2: Extinde interfața `CompetitorReel` cu câmpul `remake`**

În interfața `CompetitorReel` (liniile ~24–38), adaugă după `ai_analysis`:

```ts
  remake: RemakeOutput | null;
```

- [ ] **Step 3: Adaugă funcția `remakeReel` la finalul fișierului**

```ts
// ════════════════════════════════════════════════════════════════════
// AI: Remake — analiză structurată + postare regenerată în vocea BUILT
// ════════════════════════════════════════════════════════════════════

export async function remakeReel(reelId: number): Promise<Result<RemakeOutput>> {
  const sb = getSupabaseServer();
  const { data: reel, error } = await sb
    .from("competitor_reels")
    .select("*, competitors(handle, niche_notes)")
    .eq("id", reelId)
    .single();
  if (error || !reel) return { ok: false, error: error?.message ?? "Reel inexistent." };

  const handle = (reel.competitors as { handle: string } | null)?.handle ?? "?";
  const task = `# TASK: REMAKE — transformă acest reel viral într-o postare BUILT gata de publicat

## Reel viral (sursă)
- Cont: ${handle}
- Views: ${reel.views ?? "?"} · Likes: ${reel.likes ?? "?"}
- Caption: "${(reel.caption ?? "").slice(0, 1000)}"
- Transcript (dacă există): "${(reel.transcript ?? "").slice(0, 2000)}"

## Misiunea ta
1. Analizează DE CE a funcționat postarea asta — mecanistic, nu generic.
2. Regenerează postarea COMPLET în vocea lui Claudiu (BUILT), adaptată la audiența BUILT.
   - NU traduci, NU copiezi — reconstruiești ideea în limbajul și mecanismul BUILT.
   - Folosește contextul din Creier ca sursă de adevăr despre cine e Claudiu și cui i se adresează.
   - NU forța o grilă de frici. NU folosi clișee de fitness ("trage tare", "crede în tine").
   - Ton: direct, matur, structural. Postarea trebuie gata de copiat și filmat/postat.
3. Atribuie un pilon BUILT (B/U/I/L/T sau mix) dacă se potrivește natural.

## Format JSON strict (FĂRĂ markdown, FĂRĂ text înainte/după):
{
  "analysis": {
    "viral_elements": ["element concret 1", "element 2", "element 3"],
    "strengths": ["punct forte 1", "punct forte 2"],
    "adaptation_tips": ["cum adaptezi la BUILT 1", "tip 2", "tip 3"],
    "risks": ["ce să NU copiezi orbește 1", "risc 2"]
  },
  "regenerated": {
    "hook": "hook-ul regenerat, scurt și contraintuitiv",
    "script": "scriptul/caption-ul complet în vocea BUILT, gata de copiat (paragrafe scurte)",
    "pillar": "B"
  }
}`;

  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({
      creierJson: JSON.stringify(creier, null, 2),
      taskContext: task,
    });
    const message = await client.messages.create({
      model: MODELS.deep,
      max_tokens: 2000,
      system: systemBlocks,
      messages: [{ role: "user", content: "Generează Remake-ul. JSON strict." }],
    });
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns gol." };

    const t = textBlock.text.trim();
    const a = t.indexOf("{");
    const b = t.lastIndexOf("}");
    if (a === -1 || b <= a) return { ok: false, error: "JSON invalid." };
    const remake = JSON.parse(t.slice(a, b + 1)) as RemakeOutput;

    await sb.from("competitor_reels").update({ remake }).eq("id", reelId);
    revalidatePath("/competitors");
    return { ok: true, data: remake };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}
```

- [ ] **Step 4: Typecheck fișierul atins**

Run:
```bash
npx tsc --noEmit 2>&1 | grep "competitors/actions" || echo "NICIO eroare în competitors/actions.ts"
```
Expected: `NICIO eroare în competitors/actions.ts`

- [ ] **Step 5: Commit**

```bash
git add src/app/competitors/actions.ts
git commit -m "feat(competitors): actiunea remakeReel + tipul RemakeOutput"
```

---

## FAZA 3 — UI „Studio Viral"

## Task 5: Buton + panou Remake pe `ReelCard`

**Files:**
- Modify: `src/components/competitor/ReelCard.tsx`

- [ ] **Step 1: Actualizează importul și adaugă state pentru Remake**

Schimbă importul (linia 4):
```ts
import {
  analyzeReel,
  remakeReel,
  type CompetitorReel,
  type ReelAnalysis,
  type RemakeOutput,
} from "@/app/competitors/actions";
```

După `const [expanded, setExpanded] = useState(false);` (linia ~10), adaugă:
```ts
  const [remake, setRemake] = useState<RemakeOutput | null>(reel.remake ?? null);
  const [remakePending, startRemake] = useTransition();

  function runRemake() {
    setError(null);
    startRemake(async () => {
      const r = await remakeReel(reel.id);
      if (r.ok) setRemake(r.data);
      else setError(r.error);
    });
  }
```

- [ ] **Step 2: Adaugă butonul „Remake" lângă butonul „Analizează"**

În blocul de butoane (după butonul „Analizează", în jur de linia 81), adaugă butonul Remake. Înlocuiește blocul `{!analysis && ( ... )}` cu:

```tsx
            <div className="ml-auto flex gap-2">
              {!analysis && (
                <button
                  onClick={runAnalysis}
                  disabled={isPending}
                  className="font-condensed text-[10px] uppercase tracking-wider px-3 py-1 border border-built-gray-2 text-built-white hover:border-built-white disabled:opacity-40"
                >
                  {isPending ? "Analizez..." : "Analizează"}
                </button>
              )}
              <button
                onClick={runRemake}
                disabled={remakePending}
                className="font-condensed text-[10px] uppercase tracking-wider px-3 py-1 bg-built-red text-white hover:bg-built-red-dark disabled:opacity-40"
              >
                {remakePending ? "Remake..." : remake ? "Remake din nou" : "🔥 Remake"}
              </button>
            </div>
```

(`ml-auto` se mută pe containerul de butoane — scoate `ml-auto` de pe vechiul buton Analizează.)

- [ ] **Step 3: Adaugă panoul de rezultat Remake după panoul `{analysis && (...)}`**

După blocul `{analysis && ( ... )}` (se termină la linia ~119), adaugă:

```tsx
      {remake && (
        <div className="border-t border-built-red/40 bg-built-black/40 p-4 space-y-4">
          <p className="font-condensed text-[10px] uppercase tracking-wider text-built-red">
            🔥 Remake BUILT
          </p>

          {/* ANALIZA — 4 secțiuni */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <RemakeList title="Viral Elements" items={remake.analysis.viral_elements} />
            <RemakeList title="Strengths" items={remake.analysis.strengths} />
            <RemakeList title="Adaptation Tips" items={remake.analysis.adaptation_tips} />
            <RemakeList title="Risks" items={remake.analysis.risks} />
          </div>

          {/* POSTAREA REGENERATĂ */}
          <div className="border-t border-built-gray-2 pt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text">
                Postare regenerată · pilon {remake.regenerated.pillar}
              </p>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${remake.regenerated.hook}\n\n${remake.regenerated.script}`,
                  )
                }
                className="font-condensed text-[10px] uppercase tracking-wider px-2 py-1 border border-built-gray-2 text-built-white hover:border-built-white"
              >
                Copiază
              </button>
            </div>
            <p className="text-sm text-built-white font-semibold mb-2">{remake.regenerated.hook}</p>
            <p className="text-sm text-built-white/90 whitespace-pre-wrap">
              {remake.regenerated.script}
            </p>
          </div>
        </div>
      )}
```

- [ ] **Step 4: Adaugă componenta helper `RemakeList` la finalul fișierului**

După funcția `ReelCard` (după linia 128), adaugă:

```tsx
function RemakeList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-built-gray-text uppercase font-condensed mb-1">{title}</p>
      <ul className="space-y-0.5">
        {items.map((it, i) => (
          <li key={i} className="text-built-white">
            · {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 5: Typecheck**

Run:
```bash
npx tsc --noEmit 2>&1 | grep "ReelCard" || echo "NICIO eroare în ReelCard.tsx"
```
Expected: `NICIO eroare în ReelCard.tsx`

- [ ] **Step 6: Commit**

```bash
git add src/components/competitor/ReelCard.tsx
git commit -m "feat(competitors): buton + panou Remake pe ReelCard"
```

---

## Task 6: Rebrand pagina → „Studio Viral"

**Files:**
- Modify: `src/app/competitors/page.tsx`

- [ ] **Step 1: Actualizează titlul și descrierea**

În `src/app/competitors/page.tsx`, înlocuiește blocul eyebrow + h1 + descriere (liniile 33–42):

```tsx
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
```

- [ ] **Step 2: Actualizează textul de la secțiunea REELS ca să menționeze Remake**

Înlocuiește paragraful de sub titlul „REELS · ULTIMELE 7 ZILE" (liniile 94–98):

```tsx
          <p className="text-xs text-built-gray-text mb-4">
            Sortate descrescător după views. Apasă{" "}
            <strong className="text-built-white">🔥 Remake</strong> pe oricare ca să primești analiza
            (de ce a mers) + postarea regenerată în vocea BUILT, gata de copiat.
          </p>
```

- [ ] **Step 3: Build complet (verificarea finală reală)**

Run: `npm run build`
Expected: build reușit („Compiled successfully" / „✓ Generating static pages"). Dacă build-ul pică pe alt fișier preexistent (erorile TS cunoscute), confirmă că eroarea NU e în `competitors/` sau `ReelCard.tsx`.

- [ ] **Step 4: Lint pe fișierele atinse**

Run: `npm run lint 2>&1 | grep -E "competitors|ReelCard" || echo "Lint curat pe fișierele atinse"`
Expected: `Lint curat pe fișierele atinse`

- [ ] **Step 5: Commit**

```bash
git add src/app/competitors/page.tsx
git commit -m "feat(competitors): rebrand pagina in Studio Viral"
```

---

## Task 7: Verificare end-to-end (manual, cu Claudiu)

**Files:** niciunul

- [ ] **Step 1: Pornește dev server**

Run: `npm run dev`
Deschide `http://localhost:3000/competitors`.

- [ ] **Step 2: Checklist vizual end-to-end**

Confirmă:
- [ ] Titlul e „STUDIO VIRAL"
- [ ] Se văd competitorii adăugați
- [ ] Feed-ul „REELS · ULTIMELE 7 ZILE" afișează reels cu views reale (din Task 2)
- [ ] Click pe „🔥 Remake" pe un reel → apare panoul cu 4 secțiuni (Viral Elements / Strengths / Adaptation Tips / Risks) + postarea regenerată
- [ ] Butonul „Copiază" copiază hook + script
- [ ] Reîncarcă pagina → Remake-ul persistă (citit din coloana `remake`)

- [ ] **Step 3: Push branch pentru preview deploy (acțiune gated — doar la OK de la Claudiu)**

```bash
git push -u origin studio-viral
```
Vercel creează un preview deploy. Claudiu testează pe link-ul de preview înainte de merge în `main`.

---

## Self-Review (rulat de autor)

**Spec coverage:**
- Faza 1 (conducta) → Task 1 (retrage TS rupt) + Task 2 (dovadă date). ✓
- Faza 2 (Remake) → Task 3 (DDL) + Task 4 (acțiune + tip). ✓
- Faza 3 (ecran) → Task 5 (panou Remake) + Task 6 (rebrand) + Task 7 (verificare). ✓
- Non-goal „fără grilă de frici" → reflectat explicit în prompt-ul `remakeReel`. ✓
- Non-goal „nu curățăm Creierul" → contextul folosit așa cum e (`readCreierFromSupabase`), risc documentat. ✓
- Decizie storage `remake jsonb` pe `competitor_reels` (nu `generated_outputs`) → Task 3. ✓
- Decizie transcript = enhancement, Remake pe caption → notat în Task 2 step 4 + prompt tolerant la transcript gol. ✓

**Type consistency:** `RemakeOutput` definit în Task 4, importat și folosit identic în Task 5; câmpurile `analysis.{viral_elements,strengths,adaptation_tips,risks}` și `regenerated.{hook,script,pillar}` consistente între acțiune, panou și helper. `CompetitorReel.remake` extins în Task 4, citit în Task 5. ✓

**Placeholder scan:** fără TBD/TODO; tot codul e complet în pași. ✓
