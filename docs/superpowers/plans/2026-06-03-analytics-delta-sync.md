# Analytics Delta Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix analytics dashboard să afișeze totaluri reale din DB (nu filtrate după posted_at) și să tracked delta views între sincronizări, cu sync complet manual și sync light zilnic automat.

**Architecture:** Adăugăm `views_previous` și `last_synced_at` în `instagram_media`. La fiecare sync salvăm views-urile anterioare înainte de upsert, calculăm delta în UI. Sync-ul zilnic automat aduce doar ultimele 20 reels (ieftin), sync-ul complet manual aduce toate 500.

**Tech Stack:** Next.js 15 (App Router), Supabase, Apify `instagram-reel-scraper`, Vercel Cron, TypeScript

---

## File Map

| Fișier | Acțiune | Responsabilitate |
|---|---|---|
| `supabase/migrations/20260603_delta_views.sql` | Creat | Adaugă `views_previous`, `last_synced_at` |
| `src/app/dashboard/analytics/actions.ts` | Modificat | `syncAllReels()` + `syncRecentReels()` cu delta; `listInstagramMedia` returnează câmpurile noi |
| `src/app/api/cron/sync-instagram/route.ts` | Modificat | Apelează `syncRecentReels` în loc de `syncMyReels` |
| `vercel.json` | Modificat | Schimbă schedule cron `sync-instagram` din săptămânal în zilnic |
| `src/app/dashboard/analytics/page.tsx` | Modificat | KPI totals fără filtru `posted_at`, KPI nou `viewsGained`, butoane sync full/light, fix format breakdown |

---

### Task 1: Migrare DB — adaugă `views_previous` și `last_synced_at`

**Files:**
- Create: `supabase/migrations/20260603_delta_views.sql`

- [ ] **Step 1: Creează fișierul de migrare**

```sql
-- supabase/migrations/20260603_delta_views.sql
ALTER TABLE public.instagram_media
  ADD COLUMN IF NOT EXISTS views_previous integer,
  ADD COLUMN IF NOT EXISTS last_synced_at  timestamptz;
```

- [ ] **Step 2: Rulează migrarea în Supabase**

Deschide Supabase Dashboard → SQL Editor → paste conținutul și Run.

Verifică că nu returnează eroare. Dacă merge, coloana există.

- [ ] **Step 3: Verifică că coloanele există**

În Supabase SQL Editor:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'instagram_media'
  AND column_name IN ('views_previous', 'last_synced_at');
```

Expected: 2 rânduri returnate.

- [ ] **Step 4: Commit**

```bash
git add "supabase/migrations/20260603_delta_views.sql"
git commit -m "feat: add views_previous and last_synced_at to instagram_media"
```

---

### Task 2: Update `actions.ts` — sync cu delta tracking

**Files:**
- Modify: `src/app/dashboard/analytics/actions.ts`

- [ ] **Step 1: Actualizează `listInstagramMedia` să returneze câmpurile noi**

Găsește funcția `listInstagramMedia` (linia ~127) și înlocuiește:

```typescript
export async function listInstagramMedia(limit = 200) {
  const supabase = getSupabaseServer({ useServiceRole: true });
  const { data } = await supabase
    .from("instagram_media")
    .select("instagram_id, caption, views, likes, comments, saves, shares, posted_at, thumbnail_url, format_type, views_previous, last_synced_at")
    .order("posted_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((m) => ({
    instagram_id: m.instagram_id,
    caption: m.caption,
    views: m.views,
    likes: m.likes,
    comments: m.comments,
    saves: m.saves ?? null,
    shares: m.shares ?? null,
    posted_at: m.posted_at,
    thumbnail_url: m.thumbnail_url,
    format_type: m.format_type,
    views_previous: m.views_previous ?? null,
    last_synced_at: m.last_synced_at ?? null,
  }));
}
```

- [ ] **Step 2: Adaugă `syncAllReels()` — înlocuiește `syncMyReels()`**

Înlocuiește întreaga funcție `syncMyReels` (linia ~213) cu aceasta (același corp, dar cu delta logic adăugat și nume schimbat):

```typescript
export async function syncAllReels(): Promise<{ ok: true; synced: number; followers: number | null } | { ok: false; error: string }> {
  try {
    const { reels, followersCount } = await scrapeInstagramProfile("iordacheclaudiu_", 0);
    if (reels.length === 0) return { ok: false, error: "Apify a returnat 0 reels — verifică APIFY_API_KEY." };
    const supabase = getSupabaseServer({ useServiceRole: true });

    if (followersCount && followersCount > 0) {
      await supabase.from("creier_metadata").upsert({
        key: "instagram_followers",
        value: { count: followersCount, updated_at: new Date().toISOString() }
      });
    }

    // Citim views curente din DB pentru a salva delta
    const ids = reels.map(r => r.id || "").filter(Boolean);
    const { data: existing } = await supabase
      .from("instagram_media")
      .select("instagram_id, views")
      .in("instagram_id", ids);
    const currentViews: Record<string, number> = {};
    for (const row of existing ?? []) {
      currentViews[row.instagram_id] = row.views ?? 0;
    }

    const toClassify = reels
      .filter(r => r.caption?.trim())
      .map(r => ({ id: r.id || "", caption: r.caption }));
    const formats = await classifyFormats(toClassify);

    let synced = 0;
    let lastError = "";
    const now = new Date().toISOString();
    for (const reel of reels) {
      const id = reel.id || `apify_${Date.now()}_${synced}`;
      const item = reel as typeof reel & { savesCount?: number; sharesCount?: number };
      const { error } = await supabase.from("instagram_media").upsert({
        instagram_id: id,
        thumbnail_url: reel.thumbnailUrl,
        caption: reel.caption,
        views_previous: currentViews[id] ?? null,
        views: reel.viewsCount,
        likes: reel.likesCount,
        comments: reel.commentsCount,
        saves: item.savesCount ?? null,
        shares: item.sharesCount ?? null,
        posted_at: reel.timestamp || now,
        format_type: formats[reel.id || ""] ?? "TALKING HEAD",
        last_synced_at: now,
      }, { onConflict: "instagram_id" });
      if (!error) synced++;
      else lastError = error.message;
    }
    if (synced === 0 && lastError) return { ok: false, error: `DB: ${lastError}` };
    return { ok: true, synced, followers: followersCount };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Eroare necunoscută" };
  }
}
```

- [ ] **Step 3: Adaugă `syncRecentReels()` — sync light pentru cron zilnic**

Adaugă după `syncAllReels()`:

```typescript
export async function syncRecentReels(): Promise<{ ok: true; synced: number; followers: number | null } | { ok: false; error: string }> {
  try {
    const { reels, followersCount } = await scrapeInstagramProfile("iordacheclaudiu_", 20);
    if (reels.length === 0) return { ok: false, error: "Apify a returnat 0 reels." };
    const supabase = getSupabaseServer({ useServiceRole: true });

    if (followersCount && followersCount > 0) {
      await supabase.from("creier_metadata").upsert({
        key: "instagram_followers",
        value: { count: followersCount, updated_at: new Date().toISOString() }
      });
    }

    const ids = reels.map(r => r.id || "").filter(Boolean);
    const { data: existing } = await supabase
      .from("instagram_media")
      .select("instagram_id, views")
      .in("instagram_id", ids);
    const currentViews: Record<string, number> = {};
    for (const row of existing ?? []) {
      currentViews[row.instagram_id] = row.views ?? 0;
    }

    let synced = 0;
    const now = new Date().toISOString();
    for (const reel of reels) {
      const id = reel.id || `apify_${Date.now()}_${synced}`;
      const item = reel as typeof reel & { savesCount?: number; sharesCount?: number };
      const { error } = await supabase.from("instagram_media").upsert({
        instagram_id: id,
        thumbnail_url: reel.thumbnailUrl,
        caption: reel.caption,
        views_previous: currentViews[id] ?? null,
        views: reel.viewsCount,
        likes: reel.likesCount,
        comments: reel.commentsCount,
        saves: item.savesCount ?? null,
        shares: item.sharesCount ?? null,
        posted_at: reel.timestamp || now,
        last_synced_at: now,
      }, { onConflict: "instagram_id" });
      if (!error) synced++;
    }
    return { ok: true, synced, followers: followersCount };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Eroare necunoscută" };
  }
}
```

- [ ] **Step 4: Păstrează `syncMyReels` ca alias pentru compatibilitate cu codul existent**

Adaugă după `syncRecentReels`:

```typescript
/** @deprecated Use syncAllReels instead */
export const syncMyReels = syncAllReels;
```

- [ ] **Step 5: Build check**

```bash
cd "built-ai-command-center" && npm run build 2>&1 | tail -20
```

Expected: Build reușit fără erori TypeScript.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/analytics/actions.ts
git commit -m "feat: add syncAllReels/syncRecentReels with delta views tracking"
```

---

### Task 3: Update cron route și vercel.json

**Files:**
- Modify: `src/app/api/cron/sync-instagram/route.ts`
- Modify: `vercel.json`

- [ ] **Step 1: Actualizează cron route să folosească `syncRecentReels`**

Înlocuiește tot conținutul din `src/app/api/cron/sync-instagram/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { syncRecentReels } = await import("@/app/dashboard/analytics/actions");
    const result = await syncRecentReels();
    return NextResponse.json({ success: result.ok, synced: result.ok ? result.synced : 0 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
```

- [ ] **Step 2: Actualizează `vercel.json` — cron zilnic în loc de săptămânal**

Înlocuiește entry-ul `sync-instagram` din `vercel.json`:

```json
{ "path": "/api/cron/sync-instagram", "schedule": "0 7 * * *" }
```

(era `"0 5 * * 1"` = luni la 05:00, devine `"0 7 * * *"` = zilnic la 07:00)

- [ ] **Step 3: Build check**

```bash
cd "built-ai-command-center" && npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/cron/sync-instagram/route.ts vercel.json
git commit -m "feat: switch cron to daily syncRecentReels"
```

---

### Task 4: Update `page.tsx` — KPI totals, viewsGained, sync buttons, format fix

**Files:**
- Modify: `src/app/dashboard/analytics/page.tsx`

- [ ] **Step 1: Adaugă `views_previous` și `last_synced_at` în tipul `MediaItem`**

Găsește tipul `MediaItem` (linia ~17) și adaugă câmpurile noi:

```typescript
type MediaItem = {
  instagram_id: string;
  caption: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
  posted_at: string | null;
  thumbnail_url: string | null;
  format_type?: string | null;
  views_previous?: number | null;
  last_synced_at?: string | null;
};
```

- [ ] **Step 2: Importă `syncAllReels` și `syncRecentReels` în loc de `syncMyReels`**

Găsește importul din `./actions` și înlocuiește `syncMyReels` cu:

```typescript
import {
  analyzeContentLibraryReel,
  getTipOfWeek,
  listInstagramMedia,
  syncAllReels,
  syncRecentReels,
  saveReelAnalysis,
  getFollowersCount,
  classifyExistingReels,
  type ContentLibraryAnalysis,
} from "./actions";
```

- [ ] **Step 3: Adaugă state `syncingFull` și handler pentru sync complet**

Găsește `const [syncing, setSyncing] = useState(false)` și adaugă după:

```typescript
const [syncingFull, setSyncingFull] = useState(false);
const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
```

Găsește handler-ul `handleSync` (care apelează `syncMyReels`) și înlocuiește-l cu două handlere:

```typescript
const handleSyncLight = useCallback(async () => {
  setSyncing(true);
  const result = await syncRecentReels();
  if (result.ok) {
    const fresh = await listInstagramMedia(200);
    setLiveMedia(fresh);
    setLastSyncedAt(new Date().toISOString());
    if (result.followers && result.followers > 0) setFollowers(fmt(result.followers));
  }
  setSyncing(false);
}, []);

const handleSyncFull = useCallback(async () => {
  setSyncingFull(true);
  const result = await syncAllReels();
  if (result.ok) {
    const fresh = await listInstagramMedia(200);
    setLiveMedia(fresh);
    setLastSyncedAt(new Date().toISOString());
    if (result.followers && result.followers > 0) setFollowers(fmt(result.followers));
  }
  setSyncingFull(false);
}, []);
```

- [ ] **Step 4: Setează `lastSyncedAt` din datele încărcate inițial**

Găsește `useEffect` care apelează `listInstagramMedia` și adaugă după `setLiveMedia(media)`:

```typescript
const mostRecent = media.find(m => m.last_synced_at);
if (mostRecent?.last_synced_at) setLastSyncedAt(mostRecent.last_synced_at);
```

- [ ] **Step 5: Schimbă `totalViews` să nu mai filtreze după `posted_at`**

Găsește blocul `filteredMedia` și derivatele (linia ~495). Înlocuiește logica de calcul KPI:

```typescript
// KPI totals — suma din TOATE reels-urile din DB (snapshot la ultima sincronizare)
const totalViews = liveMedia.length > 0 ? liveMedia.reduce((s, m) => s + (m.views ?? 0), 0) : null;
const totalLikes = liveMedia.length > 0 ? liveMedia.reduce((s, m) => s + (m.likes ?? 0), 0) : null;
const totalComments = liveMedia.length > 0 ? liveMedia.reduce((s, m) => s + (m.comments ?? 0), 0) : null;

// Views câștigate față de sync-ul anterior
const viewsGained = liveMedia.length > 0
  ? liveMedia.reduce((s, m) => {
      if (m.views_previous == null) return s;
      return s + Math.max(0, (m.views ?? 0) - m.views_previous);
    }, 0)
  : null;

// filteredMedia rămâne pentru grafice și content library (filtrat după perioadă)
const filteredMedia = useMemo(() => {
  if (liveMedia.length === 0) return [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - PERIOD_DAYS[period]);
  return liveMedia.filter(m => m.posted_at ? new Date(m.posted_at) >= cutoff : true);
}, [liveMedia, period]);
```

**Notă:** `totalViews`, `totalLikes`, `totalComments`, `viewsGained` NU sunt în `useMemo` — sunt calculate direct din `liveMedia` (care e state, deci React re-renderizează automat când se schimbă). Mută-le în afara oricărui `useMemo` existent.

- [ ] **Step 6: Adaugă `viewsGained` în array-ul `kpiCards`**

Găsește `const kpiCards = [...]` și adaugă un card nou:

```typescript
const kpiCards = [
  { key: "views", label: "TOTAL VIEWS", value: mediaLoaded && totalViews !== null ? fmt(totalViews) : "—", change: null, sparkline: viewsSparkline, sublabel: lastSyncedAt ? `La ${lastSyncedAt.split("T")[0]}` : undefined },
  { key: "gained", label: "VIEWS CÂȘTIGATE", value: mediaLoaded && viewsGained !== null && viewsGained > 0 ? fmt(viewsGained) : "—", change: null, sparkline: STATIC_SPARKLINE, sublabel: "De la ultima sincronizare" },
  { key: "eng", label: "ENGAGEMENTS", value: kpiEng, change: pctChange(totalLikes, prevLikes), sparkline: engSparkline },
  { key: "followers", label: "FOLLOWERS", value: followers, change: null, sparkline: STATIC_SPARKLINE },
];
```

- [ ] **Step 7: Actualizează render-ul card-urilor KPI să afișeze `sublabel`**

Găsește în JSX unde se renderizează `kpiCards` și adaugă sub valoare:

```tsx
{kpi.sublabel && (
  <p className="text-white/40 text-xs mt-1">{kpi.sublabel}</p>
)}
```

- [ ] **Step 8: Înlocuiește butonul de sync din header cu două butoane**

Găsește butonul "Sync" existent în JSX (caută `handleSync` sau `syncing`) și înlocuiește:

```tsx
<div className="flex gap-2">
  <button
    onClick={handleSyncLight}
    disabled={syncing || syncingFull}
    className="text-xs px-3 py-1.5 rounded border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-colors disabled:opacity-40"
  >
    {syncing ? "Se sincronizează..." : "Sync acum"}
  </button>
  <button
    onClick={handleSyncFull}
    disabled={syncing || syncingFull}
    className="text-xs px-3 py-1.5 rounded bg-[#C0392B]/20 hover:bg-[#C0392B]/40 text-[#C0392B] border border-[#C0392B]/30 transition-colors disabled:opacity-40"
  >
    {syncingFull ? "Sync complet..." : "Sync complet"}
  </button>
</div>
```

- [ ] **Step 9: Fix format breakdown — fallback `null` → "REEL"**

Găsește în JSX unde se calculează format breakdown (caută `format_type` sau `formatBreakdown`). Orice `.format_type` null trebuie să devină `"REEL"`:

```typescript
const formatBreakdown = useMemo(() => {
  const counts: Record<string, number> = {};
  for (const m of liveMedia) {
    const fmt = (m.format_type ?? "REEL").toUpperCase();
    counts[fmt] = (counts[fmt] ?? 0) + (m.views ?? 0);
  }
  const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, views]) => ({ label, views, pct: Math.round((views / total) * 100) }));
}, [liveMedia]);
```

Înlocuiește orice calcul similar existent (caută `format_type` în blocurile `useMemo` sau calcule directe).

- [ ] **Step 10: Build check și verificare TypeScript**

```bash
cd "built-ai-command-center" && npm run build 2>&1 | tail -30
```

Expected: 0 erori TypeScript. Dacă sunt erori de tip (ex: `sublabel` lipsă din tipul kpiCard), adaugă câmpul opțional în tipul local.

- [ ] **Step 11: Commit**

```bash
git add src/app/dashboard/analytics/page.tsx
git commit -m "feat: analytics KPI fără filtru posted_at, viewsGained, sync buttons, format fix"
```

---

### Task 5: Verificare finală

- [ ] **Step 1: Pornește dev server și verifică pagina**

```bash
cd "built-ai-command-center" && npm run dev
```

Deschide `http://localhost:3000/dashboard/analytics`.

Verifică:
- TOTAL VIEWS afișează suma tuturor reels-urilor (nu filtrat)
- Cardul "VIEWS CÂȘTIGATE" există (arată "—" dacă nu ai încă 2 sync-uri)
- Butoanele "Sync acum" și "Sync complet" sunt vizibile în header
- Format breakdown nu mai arată "Other" (sau dacă arată, e pentru reels neclasificate, nu pentru toate)

- [ ] **Step 2: Testează "Sync acum"**

Apasă "Sync acum" — verifică că:
- Butonul intră în stare loading
- După ~2 minute se întoarce și cifrele se actualizează
- `last_synced_at` din DB se actualizează (verifică în Supabase: `SELECT instagram_id, views, views_previous, last_synced_at FROM instagram_media LIMIT 5`)

- [ ] **Step 3: Commit final dacă sunt ajustări minore**

```bash
git add -p && git commit -m "fix: analytics minor UI adjustments"
```
