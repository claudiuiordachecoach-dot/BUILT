# Spec — BUILT Studio Viral

_Data: 2026-06-11 · Status: aprobat pentru planificare_

## Context

Iordache Claudiu (CMO BUILT) vrea să replice în Command Center fluxul de creare
de conținut arătat într-un video cu platforma „rtar" (Daniel Taman): track
creatori din nișă → feed cu conținutul lor viral sortat după views → buton
**Remake** care, dintr-o postare virală, scoate o analiză + o postare regenerată
în vocea ta → plan săptămânal.

Obiectivul real nu e o interfață frumoasă, ci **un instrument zilnic care chiar
funcționează**. Citat: „degeaba facem o interfață frumoasă dacă funcționalitățile
nu există".

## Ce există deja (verificat în cod)

Modulul `/competitors` acoperă ~70% din fluxul din video:

- **Track creatori** — CRUD competitori (`competitors/actions.ts`), tabel `competitors`
- **Scraping real** — Apify (reels: views, likes, caption, video) + AssemblyAI
  (transcript) + comentarii pe top-3
- **Feed viral sortat după views** — `listRecentReels()` ordonează `views desc`
- **Context profund la AI** — 107 câmpuri onboarding → `creier_sections`
- **Analiză per-reel** — `analyzeReel()`: hook_type, why_worked, format, built_adaptation
- **Plan săptămânal** — `generateWeeklyReport()`: pattern-uri + 7 scripturi pe piloni

## Probleme descoperite (decisive pentru design)

1. **Două scrapere care se bat:**
   - TS `scrapeCompetitors` (`dashboard/content/actions.ts`), rulat de cron-ul
     Vercel `/api/cron/scrape-competitors` (luni 5:30). **Rupt pe schemă**: scrie
     în coloane inexistente (`competitor_handle`, `instagram_id`, `comments`) și
     omite coloanele NOT NULL (`competitor_id`, `shortcode`, `url`). Insert-ul
     eșuează, prins silențios de `try/catch`. → eșec-fantomă recurent.
   - Python `scripts/scrape_competitors.py`, rulat prin **GitHub Actions**
     (`.github/workflows/scrape-competitors.yml`) + `npm run scrape:competitors`.
     **Scrie corect pe schemă** (`competitor_id`, `shortcode`, dedup pe shortcode).
     Aceasta e sursa reală de adevăr.

2. **Capacitatea „Remake" lipsește.** `analyzeReel()` dă o analiză ușoară +
   o frază de adaptare, dar NU produce postarea regenerată completă și nici
   structura `viral_elements / strengths / adaptation_tips / risks` din video.

3. **Creierul (contextul) e parțial învechit.** Decizie explicită a userului:
   se lasă pe după, nu se curăță în acest proiect. Risc asumat: primele Remake-uri
   pot scoate fapte vechi (nr. followeri, clienți, ofertă).

## Goals

- O singură conductă de date, dovedită că aterizează reels cu views + transcript.
- Acțiune nouă **Remake** care întoarce analiză structurată + postare regenerată.
- Un singur ecran „Studio Viral" cu fluxul complet, ca în video.

## Non-goals (out of scope)

- Curățarea Creierului / actualizarea faptelor învechite.
- Maparea pe „cele 7 frici BUILT" (userul nu se regăsește în ele — eliminată).
- Reconstrucția modulelor care merg (content, hooks, calendar).
- Schimbarea sursei de scraping (rămâne Apify + Python/GitHub Actions).

## Design

### Faza 1 — O singură conductă, dovedită

**Sursă unică de adevăr = Python + GitHub Actions** (deja scrie schema corect).

1. **Dovada că data curge:** rulează `npm run scrape:competitors` pe 2-3 creatori
   reali din nișă. Verificare cu ochii: `competitor_reels` are rânduri cu `views`,
   `caption`, `transcript` populate.
2. **Transcript:** dacă Python nu populează `transcript` (varianta TS folosea
   AssemblyAI, Python posibil nu), se adaugă pasul de transcriere în Python sau
   se confirmă că shortcode-urile au transcript din altă cale. Decizie în plan.
3. **Retragerea duplicatului rupt:** se elimină cron-ul Vercel
   `/api/cron/scrape-competitors` (din `vercel.json`) + funcția TS `scrapeCompetitors`
   (sau devine no-op clar marcat). Scopul: zero eșecuri-fantomă, o singură cale.

**Criteriu de succes Faza 1:** după un scrape, feed-ul `/competitors` afișează
reels reale cu views și transcript; nu mai există a doua cale de scraping activă.

### Faza 2 — Remake

**Acțiune nouă** `remakeReel(reelId: number): Promise<Result<RemakeOutput>>` în
`competitors/actions.ts`, model `MODELS.deep` (Opus).

Input pentru AI: caption + transcript + views/likes ale reel-ului + contextul din
`creier_sections` (așa cum e). Output JSON strict:

```ts
interface RemakeOutput {
  analysis: {
    viral_elements: string[];   // ce a oprit scrollul
    strengths: string[];        // ce face postarea puternică
    adaptation_tips: string[];  // cum o adaptezi la tine
    risks: string[];            // ce să NU copiezi orbește
  };
  regenerated: {
    hook: string;               // hook-ul regenerat
    script: string;             // scriptul/caption-ul complet, vocea BUILT, gata de copiat
    pillar: "B" | "U" | "I" | "L" | "T" | "mix"; // tag opțional, light
  };
}
```

**Reguli de prompt:** adaptare la audiența BUILT și vocea Claudiu din context;
fără grilă de frici impusă; fără clișee fitness; ton direct, structural. Postarea
trebuie să fie gata de copiat, nu un schelet.

**Persistență:** coloană nouă `remake jsonb` pe `competitor_reels` (DDL idempotent,
rulat manual de user). Se păstrează ultimul Remake per reel. NU se folosește
`generated_outputs` (CHECK-ul lui permite doar M2/M3/M4 și n-are referință la reel).

```sql
alter table public.competitor_reels add column if not exists remake jsonb;
notify pgrst, 'reload schema';
```

**Criteriu de succes Faza 2:** click pe un reel real → primești analiză pe 4
secțiuni + o postare regenerată coerentă, în limba română, în vocea BUILT,
salvată și reafișabilă.

### Faza 3 — Ecranul unificat „Studio Viral"

Se evoluează ruta `/competitors` (rebrand „Studio Viral"), un singur ecran:

```
[ Creatorii tăi ]   chips · add / remove            (refolosit)
──────────────────────────────────────────────────
[ Feed viral ]   sortat după views ↓               (refolosit)
 ┌─────┐ ┌─────┐ ┌─────┐
 │743K │ │321K │ │212K │   click pe oricare →
 └─────┘ └─────┘ └─────┘
──────────────────────────────────────────────────
[ Panou Remake ]   analiză 4 secțiuni + postare regenerată   (NOU)
[ Plan săptămânal ]   weekly report existent, ca tab          (refolosit)
```

- **Refolosite:** `AddCompetitorForm`, `CompetitorRow`, `ReelCard`,
  `listRecentReels`, `generateWeeklyReport` + UI-ul lor.
- **Nou:** panoul Remake (componentă) + butonul „Remake" pe `ReelCard`.
- Restul e re-aranjare de layout, nu logică nouă.

**Criteriu de succes Faza 3:** dintr-un singur ecran poți: vedea creatorii,
vedea feed-ul viral, da Remake pe un reel și vedea rezultatul, deschide planul
săptămânal — fără să schimbi pagina.

## Riscuri

- **Creier învechit** (asumat) — Remake-ul poate cita fapte vechi până se curăță
  contextul, separat.
- **Transcript Python** — dacă lipsește, Remake-ul lucrează doar pe caption
  (mai slab). Se confirmă/repară în Faza 1.
- **GitHub Actions secrets** — scrape-ul automat depinde de secretele setate în
  repo (APIFY_API_KEY, Supabase). De verificat că rulează.

## Ordine de implementare

Faza 1 → Faza 2 → Faza 3. Fiecare fază are criteriu de succes verificabil înainte
de a trece la următoarea. Nu se construiește UI nou (Faza 3) până data nu curge
(Faza 1) și Remake-ul nu scoate ceva real (Faza 2).
