# Instagram Private Metrics — Full Sync + Hook Score + AI Diagnosis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adaugă toate metricile private Instagram lipsă (avg watch time, replays, follows, profile visits), calculează Hook Score per Reel, generează diagnoze Claude și le afișează în `/analytics`.

**Architecture:** Extindem `src/lib/instagram.ts` cu 5 metrici noi → migrăm Supabase cu coloane noi → actualizăm sync route → adăugăm acțiunea `diagnoseReels` în analytics actions → construim `HookScorePanel` component nou → actualizăm `IgMediaGrid` și pagina `/analytics`.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Supabase (postgres), Anthropic SDK (`claude-sonnet-4-6`), Meta Graph API v21.0

---

## File Map

| Fișier | Acțiune | Responsabilitate |
|---|---|---|
| `src/lib/instagram.ts` | Modificat | Adaugă 5 metrici noi la `IgInsights` + `fetchMediaInsights` |
| `src/app/api/instagram/sync/route.ts` | Modificat | Mapează noile câmpuri la upsert |
| `src/app/analytics/actions.ts` | Modificat | Extinde `IgMediaRow`, adaugă `diagnoseReels` + `computeHookScore` |
| `src/components/analytics/HookScorePanel.tsx` | Creat | 3-panel grid (Do More / Stop / Fix) + ranking complet cu diagnoze |
| `src/components/analytics/IgMediaGrid.tsx` | Modificat | Adaugă coloane watch time, hook_score, diagnoză |
| `src/app/analytics/page.tsx` | Modificat | Adaugă `HookScorePanel` + buton "Sync & Diagnozează" |

---

## Task 1: Extinde `IgInsights` și `fetchMediaInsights` în `instagram.ts`

**Files:**
- Modify: `src/lib/instagram.ts:177-224`

- [ ] **Step 1: Extinde interfața `IgInsights`**

Înlocuiește blocul existent (linia 177-185) cu:

```typescript
export interface IgInsights {
  plays?: number;
  likes?: number;
  comments?: number;
  saved?: number;
  shares?: number;
  reach?: number;
  impressions?: number;
  // Metrici noi — private, disponibile cu instagram_manage_insights
  avg_watch_time_ms?: number;   // ig_reels_avg_watch_time (ms)
  total_watch_time_ms?: number; // ig_reels_video_view_total_time (ms)
  replays?: number;             // clips_replays_count (null pe posturi vechi)
  follows?: number;             // followeri noi din acest post
  profile_visits?: number;      // vizite profil din acest post
}
```

- [ ] **Step 2: Actualizează `fetchMediaInsights` cu strategia de fetch în 2 pași**

Înlocuiește funcția `fetchMediaInsights` (linia 187-224) complet cu:

```typescript
export async function fetchMediaInsights(
  mediaId: string,
  mediaType: string,
  accessToken: string,
): Promise<IgInsights> {
  const isReel = mediaType === "VIDEO" || mediaType === "REELS";

  // Metrici comune (toate tipurile de media)
  const commonMetrics = "likes,comments,saved,shares,reach,impressions,follows,profile_visits";
  // Metrici exclusiv Reels
  const reelMetrics = "plays,ig_reels_avg_watch_time,ig_reels_video_view_total_time,clips_replays_count";

  const metrics = isReel ? `${commonMetrics},${reelMetrics}` : commonMetrics;

  async function doFetch(metricStr: string): Promise<Response> {
    return fetch(
      `${GRAPH}/${mediaId}/insights?metric=${metricStr}&access_token=${accessToken}`,
    );
  }

  let res = await doFetch(metrics);

  // Dacă Meta respinge combinația (400), retry fără metrici Reels-only
  if (!res.ok && isReel) {
    res = await doFetch(commonMetrics);
  }

  if (!res.ok) return {};

  const data = (await res.json()) as {
    data: Array<{ name: string; values?: Array<{ value: number }>; value?: number }>;
  };

  const result: IgInsights = {};
  for (const metric of data.data ?? []) {
    // Meta returnează fie `values[0].value` fie `value` direct
    const val = metric.values?.[0]?.value ?? (metric.value as number | undefined) ?? 0;
    switch (metric.name) {
      case "plays":                          result.plays = val; break;
      case "likes":                          result.likes = val; break;
      case "comments":                       result.comments = val; break;
      case "saved":                          result.saved = val; break;
      case "shares":                         result.shares = val; break;
      case "reach":                          result.reach = val; break;
      case "impressions":                    result.impressions = val; break;
      case "ig_reels_avg_watch_time":        result.avg_watch_time_ms = val; break;
      case "ig_reels_video_view_total_time": result.total_watch_time_ms = val; break;
      case "clips_replays_count":            result.replays = val; break;
      case "follows":                        result.follows = val; break;
      case "profile_visits":                 result.profile_visits = val; break;
    }
  }
  return result;
}
```

- [ ] **Step 3: Verifică TypeScript**

```bash
cd "built-ai-command-center" && npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 erori legate de `instagram.ts`. Orice eroare în alt fișier → ignoră momentan (vor fi rezolvate în task-urile următoare).

- [ ] **Step 4: Commit**

```bash
git add src/lib/instagram.ts
git commit -m "feat(instagram): add watch time, replays, follows, profile_visits to insights fetch"
```

---

## Task 2: Migrare Supabase — coloane noi în `instagram_media`

**Files:**
- Create: `supabase/migrations/20260516_instagram_private_metrics.sql`

- [ ] **Step 1: Creează fișierul de migrare**

```sql
-- supabase/migrations/20260516_instagram_private_metrics.sql
ALTER TABLE instagram_media
  ADD COLUMN IF NOT EXISTS avg_watch_time_ms  integer,
  ADD COLUMN IF NOT EXISTS total_watch_time_ms integer,
  ADD COLUMN IF NOT EXISTS replays             integer,
  ADD COLUMN IF NOT EXISTS follows             integer,
  ADD COLUMN IF NOT EXISTS profile_visits      integer,
  ADD COLUMN IF NOT EXISTS hook_score          numeric(10,4),
  ADD COLUMN IF NOT EXISTS hook_diagnosis      text,
  ADD COLUMN IF NOT EXISTS hook_action         text,
  ADD COLUMN IF NOT EXISTS diagnosed_at        timestamptz;
```

- [ ] **Step 2: Rulează migrarea în Supabase**

Opțiunea A — prin Supabase CLI (dacă e instalat):
```bash
supabase db push
```

Opțiunea B — manual în Supabase Dashboard:
1. Deschide Supabase Dashboard → SQL Editor
2. Paste conținutul SQL de mai sus
3. Click Run

- [ ] **Step 3: Verifică că tabelul are coloanele noi**

În Supabase Dashboard → Table Editor → `instagram_media` → verifică că apar: `avg_watch_time_ms`, `total_watch_time_ms`, `replays`, `follows`, `profile_visits`, `hook_score`, `hook_diagnosis`, `hook_action`, `diagnosed_at`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260516_instagram_private_metrics.sql
git commit -m "chore(db): add private metrics + hook score columns to instagram_media"
```

---

## Task 3: Actualizează `sync/route.ts` să mapeze noile câmpuri

**Files:**
- Modify: `src/app/api/instagram/sync/route.ts`

- [ ] **Step 1: Adaugă câmpurile noi la upsert**

În `src/app/api/instagram/sync/route.ts`, în blocul `upsert` (după `impressions`), adaugă:

```typescript
avg_watch_time_ms:  insights.avg_watch_time_ms  ?? null,
total_watch_time_ms: insights.total_watch_time_ms ?? null,
replays:            insights.replays             ?? null,
follows:            insights.follows             ?? null,
profile_visits:     insights.profile_visits      ?? null,
```

Blocul complet `upsert` trebuie să arate:

```typescript
await sb.from("instagram_media").upsert(
  {
    ig_media_id:         m.id,
    media_type:          m.media_type,
    timestamp:           m.timestamp,
    caption:             (m.caption ?? "").slice(0, 5000),
    permalink:           m.permalink,
    thumbnail_url:       m.thumbnail_url ?? m.media_url ?? null,
    plays:               insights.plays              ?? null,
    likes:               insights.likes              ?? null,
    comments:            insights.comments           ?? null,
    saves:               insights.saved              ?? null,
    shares:              insights.shares             ?? null,
    reach:               insights.reach              ?? null,
    impressions:         insights.impressions        ?? null,
    avg_watch_time_ms:   insights.avg_watch_time_ms  ?? null,
    total_watch_time_ms: insights.total_watch_time_ms ?? null,
    replays:             insights.replays             ?? null,
    follows:             insights.follows             ?? null,
    profile_visits:      insights.profile_visits      ?? null,
    synced_at:           new Date().toISOString(),
  },
  { onConflict: "ig_media_id" },
);
```

- [ ] **Step 2: Verifică TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 erori noi.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/instagram/sync/route.ts
git commit -m "feat(sync): persist watch time, replays, follows, profile_visits from Meta API"
```

---

## Task 4: Extinde `IgMediaRow` și adaugă `diagnoseReels` în `analytics/actions.ts`

**Files:**
- Modify: `src/app/analytics/actions.ts`

- [ ] **Step 1: Extinde interfața `IgMediaRow`**

Adaugă câmpurile noi la interfața existentă `IgMediaRow` (după `impressions`):

```typescript
export interface IgMediaRow {
  id: number;
  ig_media_id: string;
  media_type: string;
  timestamp: string | null;
  caption: string | null;
  permalink: string;
  thumbnail_url: string | null;
  plays: number | null;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
  reach: number | null;
  impressions: number | null;
  // Metrici private noi
  avg_watch_time_ms: number | null;
  total_watch_time_ms: number | null;
  replays: number | null;
  follows: number | null;
  profile_visits: number | null;
  // Calculat + diagnoze
  hook_score: number | null;
  hook_diagnosis: string | null;
  hook_action: string | null;
  diagnosed_at: string | null;
}
```

- [ ] **Step 2: Adaugă funcția `computeHookScore`**

Adaugă după interfețe, înainte de primele acțiuni:

```typescript
export function computeHookScore(m: IgMediaRow): number | null {
  const watch_s = m.avg_watch_time_ms != null ? m.avg_watch_time_ms / 1000 : null;
  const reach = m.reach ?? 0;
  if (watch_s == null || reach === 0) return null;
  const share_pct = ((m.shares ?? 0) / reach) * 100;
  const save_pct  = ((m.saves  ?? 0) / reach) * 100;
  return watch_s * Math.sqrt(reach) * (1 + share_pct / 100 + save_pct / 200);
}
```

- [ ] **Step 3: Adaugă acțiunea `diagnoseReels`**

Adaugă la sfârșitul fișierului `analytics/actions.ts`:

```typescript
export type DiagnoseResult =
  | { ok: true; diagnosed: number }
  | { ok: false; error: string };

export async function diagnoseReels(): Promise<DiagnoseResult> {
  const sb = getSupabaseServer();
  const { data: rows, error } = await sb
    .from("instagram_media")
    .select("*")
    .eq("media_type", "VIDEO")
    .order("timestamp", { ascending: false })
    .limit(30);

  if (error || !rows || rows.length === 0) {
    return { ok: false, error: error?.message ?? "Niciun Reel găsit pentru diagnoză." };
  }

  const media = rows as IgMediaRow[];

  // Calculăm Hook Score și pregătim datele pentru Claude
  const withScores = media.map((m) => ({
    id: m.id,
    caption: (m.caption ?? "").slice(0, 80),
    permalink: m.permalink,
    watch_s: m.avg_watch_time_ms != null ? (m.avg_watch_time_ms / 1000).toFixed(1) : null,
    reach: m.reach,
    shares: m.shares,
    saves: m.saves,
    replays: m.replays,
    follows: m.follows,
    hook_score: computeHookScore(m),
  }));

  const sorted = [...withScores].sort((a, b) => (b.hook_score ?? 0) - (a.hook_score ?? 0));
  const medianReach = (() => {
    const reaches = media.map((m) => m.reach ?? 0).sort((a, b) => a - b);
    return reaches[Math.floor(reaches.length / 2)] ?? 0;
  })();

  const prompt = `Ești expert în performanța conținutului Instagram pentru BUILT (fitness coaching, bărbați 28-42 ani, brand voce: direct, arhitectural, no-BS).

Analizează aceste Reels și atribuie fiecăruia o diagnoză și o acțiune.

Reach median: ${medianReach}

Date Reels (JSON):
${JSON.stringify(sorted, null, 2)}

Returnează STRICT un array JSON, câte un obiect per Reel, cu exact aceste câmpuri:
- "id": numărul exact din input
- "diagnosis": una din: "Winner — toate cele 3 axe funcționează" | "Hook puternic, IG nu l-a împins" | "Lumea a dat click, conținutul nu a ținut" | "Concept viral, livrare slabă" | "Slab pe toate axele — elimină formatul" | "Hook aterizat" | "Subperformanță"
- "action": una din: "do_more" | "stop" | "fix"

Logică de diagnoză:
- watch_s >= 12 AND reach >= medianReach AND (shares > 0 OR saves > 0) → "Winner — toate cele 3 axe funcționează", action: "do_more"
- watch_s >= 12 AND reach < medianReach → "Hook puternic, IG nu l-a împins", action: "fix"
- watch_s < 8 AND reach >= medianReach → "Lumea a dat click, conținutul nu a ținut", action: "fix"
- shares > 0 OR saves > 0 AND watch_s < 8 → "Concept viral, livrare slabă", action: "fix"
- watch_s < 8 AND reach < medianReach → "Slab pe toate axele — elimină formatul", action: "stop"
- watch_s >= 8 AND watch_s < 12 AND reach >= medianReach → "Hook aterizat", action: "do_more"
- altfel → "Subperformanță", action: "stop"

Răspunde DOAR cu array-ul JSON, fără markdown, fără text înainte sau după.`;

  try {
    const client = getAnthropicClient();
    const msg = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { ok: false, error: "Răspuns Claude fără text." };
    }

    const t = textBlock.text.trim();
    const start = t.indexOf("[");
    const end = t.lastIndexOf("]");
    if (start === -1) return { ok: false, error: "JSON invalid de la Claude." };

    type DiagRow = { id: number; diagnosis: string; action: string };
    const diagnoses = JSON.parse(t.slice(start, end + 1)) as DiagRow[];

    // Upsert diagnoze + hook_score în DB
    const now = new Date().toISOString();
    for (const d of diagnoses) {
      const score = withScores.find((w) => w.id === d.id)?.hook_score ?? null;
      await sb
        .from("instagram_media")
        .update({
          hook_score:    score,
          hook_diagnosis: d.diagnosis,
          hook_action:   d.action,
          diagnosed_at:  now,
        })
        .eq("id", d.id);
    }

    revalidatePath("/analytics");
    return { ok: true, diagnosed: diagnoses.length };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare diagnoză." };
  }
}
```

Adaugă importul `revalidatePath` dacă nu există deja la topul fișierului — verifică și adaugă dacă lipsește:
```typescript
import { revalidatePath } from "next/cache";
```

- [ ] **Step 4: Verifică TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 erori noi.

- [ ] **Step 5: Commit**

```bash
git add src/app/analytics/actions.ts
git commit -m "feat(analytics): add computeHookScore + diagnoseReels with Claude AI"
```

---

## Task 5: Creează `HookScorePanel.tsx` — panoul de ranking

**Files:**
- Create: `src/components/analytics/HookScorePanel.tsx`

- [ ] **Step 1: Creează componenta**

```typescript
"use client";

import type { IgMediaRow } from "@/app/analytics/actions";
import { computeHookScore } from "@/app/analytics/actions";

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function watchFmt(ms: number | null | undefined): string {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(1)}s`;
}

const ACTION_COLORS: Record<string, string> = {
  do_more: "border-l-emerald-500 bg-emerald-900/10",
  stop:    "border-l-red-500 bg-red-900/10",
  fix:     "border-l-yellow-500 bg-yellow-900/10",
};

const ACTION_LABELS: Record<string, { emoji: string; label: string; color: string }> = {
  do_more: { emoji: "🟢", label: "Fă mai mult", color: "text-emerald-400" },
  stop:    { emoji: "🔴", label: "Oprește",     color: "text-red-400" },
  fix:     { emoji: "🟡", label: "Fixează",     color: "text-yellow-400" },
};

export function HookScorePanel({ media }: { media: IgMediaRow[] }) {
  const reels = media.filter((m) => m.media_type === "VIDEO");
  if (reels.length === 0) return null;

  // Calculăm hook_score pentru reeluri fără diagnoză încă
  const withScore = reels.map((m) => ({
    ...m,
    hook_score: m.hook_score ?? computeHookScore(m),
  }));

  const sorted = [...withScore].sort((a, b) => (b.hook_score ?? 0) - (a.hook_score ?? 0));
  const top = sorted[0];
  const median = sorted[Math.floor(sorted.length / 2)];
  const multiplier =
    top && median && (median.reach ?? 0) > 0
      ? ((top.reach ?? 0) / (median.reach ?? 1)).toFixed(1)
      : null;

  const doMore = sorted.filter((m) => m.hook_action === "do_more").slice(0, 3);
  const stop   = sorted.filter((m) => m.hook_action === "stop").slice(0, 3);
  const fix    = sorted.filter((m) => m.hook_action === "fix").slice(0, 3);

  // Fallback dacă nu s-a rulat diagnoze încă: top 3 / bottom 3
  const doMoreFallback = doMore.length > 0 ? doMore : sorted.slice(0, 3);
  const stopFallback   = stop.length   > 0 ? stop   : [...sorted].reverse().slice(0, 3);
  const fixFallback    = fix.length    > 0 ? fix    : [];

  const maxScore = sorted[0]?.hook_score ?? 1;

  return (
    <div className="mb-8">
      {/* Headline */}
      {multiplier && (
        <div className="mb-6 p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-1">
            Insight principal
          </p>
          <p className="font-display text-2xl text-built-white">
            Top Reel-ul tău a atins de{" "}
            <span className="text-built-red">{multiplier}×</span> mai mulți oameni decât mediana
          </p>
        </div>
      )}

      {/* 3-Panel Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { title: "🟢 Fă mai mult", items: doMoreFallback, borderColor: "border-emerald-500/40" },
          { title: "🔴 Oprește",     items: stopFallback,   borderColor: "border-red-500/40" },
          { title: "🟡 Fixează",     items: fixFallback,    borderColor: "border-yellow-500/40" },
        ].map(({ title, items, borderColor }) => (
          <div key={title} className={`p-4 bg-built-gray-1 border ${borderColor} rounded-sm`}>
            <p className="font-condensed text-xs uppercase tracking-wider mb-3 text-built-white">
              {title}
            </p>
            {items.length === 0 ? (
              <p className="text-xs text-built-gray-text italic">
                Rulează diagnoze pentru a vedea
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((m) => (
                  <a
                    key={m.id}
                    href={m.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-built-gray-text hover:text-built-white transition-colors line-clamp-2"
                  >
                    {(m.caption ?? "—").slice(0, 60)}…
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Avg watch time",
            value: (() => {
              const vals = reels.map((m) => m.avg_watch_time_ms).filter((v): v is number => v != null);
              if (vals.length === 0) return "—";
              return `${(vals.reduce((a, b) => a + b, 0) / vals.length / 1000).toFixed(1)}s`;
            })(),
          },
          {
            label: "Reels cu hook ≥ 12s",
            value: String(reels.filter((m) => (m.avg_watch_time_ms ?? 0) >= 12_000).length),
          },
          {
            label: "Replay winners (≥ 1.2×)",
            value: String(
              reels.filter((m) => {
                const reach = m.reach ?? 0;
                return reach > 0 && (m.replays ?? 0) / reach >= 1.2;
              }).length,
            ),
          },
          {
            label: "Total follows din Reels",
            value: fmt(reels.reduce((s, m) => s + (m.follows ?? 0), 0)),
          },
        ].map(({ label, value }) => (
          <div key={label} className="p-3 bg-built-gray-1 border border-built-gray-2 rounded-sm text-center">
            <p className="font-condensed text-[9px] text-built-gray-text uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="font-display text-xl text-built-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Ranking complet */}
      <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-3">
        Ranking complet — Hook Score
      </p>
      <div className="space-y-2">
        {sorted.map((m, i) => {
          const score = m.hook_score ?? 0;
          const barW = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
          const actionKey = m.hook_action ?? "";
          const borderClass = ACTION_COLORS[actionKey] ?? "border-l-built-gray-2 bg-built-gray-1";
          const actionMeta = ACTION_LABELS[actionKey];

          return (
            <div
              key={m.id}
              className={`flex gap-4 items-center p-3 rounded-sm border-l-2 border border-built-gray-2 ${borderClass}`}
            >
              <span className="font-display text-2xl text-built-gray-text w-8 shrink-0 text-center">
                {i + 1}
              </span>
              {m.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.thumbnail_url}
                  alt=""
                  className="w-12 h-12 object-cover rounded-sm shrink-0 border border-built-gray-2"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-built-white line-clamp-1 mb-1">
                  {m.caption || <span className="italic text-built-gray-text">fără caption</span>}
                </p>
                {/* Bar Hook Score */}
                <div className="h-1 bg-built-gray-2 rounded-full mb-1 w-full">
                  <div
                    className="h-1 bg-built-red rounded-full"
                    style={{ width: `${barW}%` }}
                  />
                </div>
                <div className="flex gap-3 text-[10px] text-built-gray-text flex-wrap">
                  <span>watch: {watchFmt(m.avg_watch_time_ms)}</span>
                  <span>reach: {fmt(m.reach)}</span>
                  <span>saves: {fmt(m.saves)}</span>
                  <span>shares: {fmt(m.shares)}</span>
                  {m.follows != null && <span>+follows: {fmt(m.follows)}</span>}
                  {m.replays != null && <span>replays: {fmt(m.replays)}</span>}
                </div>
              </div>
              <div className="shrink-0 text-right">
                {m.hook_diagnosis && (
                  <p className={`text-[10px] font-condensed uppercase mb-1 ${actionMeta?.color ?? "text-built-gray-text"}`}>
                    {actionMeta?.emoji} {actionMeta?.label}
                  </p>
                )}
                <p className="text-xs text-built-gray-text italic line-clamp-1 max-w-[160px]">
                  {m.hook_diagnosis ?? "fără diagnoză"}
                </p>
                <p className="font-display text-base text-built-white mt-1">
                  {score > 0 ? score.toFixed(1) : "—"}
                </p>
                <a
                  href={m.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-built-red hover:underline"
                >
                  deschide →
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verifică TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 erori noi.

- [ ] **Step 3: Commit**

```bash
git add src/components/analytics/HookScorePanel.tsx
git commit -m "feat(analytics): add HookScorePanel with ranking, 3-panel grid, diagnoses"
```

---

## Task 6: Actualizează `IgMediaGrid.tsx` cu noile metrici

**Files:**
- Modify: `src/components/analytics/IgMediaGrid.tsx`

- [ ] **Step 1: Adaugă watch time și profile_visits în `MediaRow`**

Găsește blocul din `MediaRow` cu array-ul de metrici (linia ~75):

```typescript
// Înlocuiește blocul existent cu:
<div className="grid grid-cols-6 gap-2 shrink-0 text-center">
  {[
    { label: "plays",     val: m.plays },
    { label: "likes",     val: m.likes },
    { label: "saves",     val: m.saves },
    { label: "reach",     val: m.reach },
    { label: "follows",   val: m.follows },
    { label: "watch",     val: m.avg_watch_time_ms != null ? Math.round(m.avg_watch_time_ms / 1000) : null, suffix: "s" },
  ].map(({ label, val, suffix }) => (
    <div key={label}>
      <p className="font-condensed text-[9px] text-built-gray-text uppercase">{label}</p>
      <p className="font-display text-base text-built-white">
        {val != null ? `${fmt(val)}${suffix ?? ""}` : "—"}
      </p>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Verifică TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 erori noi.

- [ ] **Step 3: Commit**

```bash
git add src/components/analytics/IgMediaGrid.tsx
git commit -m "feat(analytics): show watch time + follows in IgMediaGrid"
```

---

## Task 7: Actualizează `/analytics` page — adaugă `HookScorePanel` + buton Sync & Diagnozează

**Files:**
- Modify: `src/app/analytics/page.tsx`

- [ ] **Step 1: Adaugă importurile**

La topul `analytics/page.tsx`, adaugă după importurile existente:

```typescript
import { HookScorePanel } from "@/components/analytics/HookScorePanel";
import { SyncDiagnoseButton } from "@/components/analytics/SyncDiagnoseButton";
```

- [ ] **Step 2: Creează `SyncDiagnoseButton` — buton client care declanșează sync + diagnoze**

Creează fișierul nou:

```typescript
// src/components/analytics/SyncDiagnoseButton.tsx
"use client";

import { useState } from "react";
import { triggerSync } from "@/app/analytics/actions";
import { diagnoseReels } from "@/app/analytics/actions";

export function SyncDiagnoseButton() {
  const [state, setState] = useState<"idle" | "syncing" | "diagnosing" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setState("syncing");
    setMessage(null);

    const syncRes = await triggerSync();
    if (!syncRes.ok) {
      setState("error");
      setMessage(syncRes.error ?? "Eroare sync.");
      return;
    }

    setState("diagnosing");
    const diagnoseRes = await diagnoseReels();
    if (!diagnoseRes.ok) {
      setState("error");
      setMessage(diagnoseRes.error ?? "Eroare diagnoze.");
      return;
    }

    setState("done");
    setMessage(`Sync: ${syncRes.synced} posts · Diagnoze: ${diagnoseRes.diagnosed} Reels`);
  }

  const labels: Record<typeof state, string> = {
    idle:       "Sync & Diagnozează",
    syncing:    "Sync în curs…",
    diagnosing: "Claude analizează…",
    done:       "Gata ✓",
    error:      "Eroare — reîncearcă",
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleClick}
        disabled={state === "syncing" || state === "diagnosing"}
        className="px-4 py-2 bg-built-red text-built-white font-condensed uppercase text-sm tracking-wider hover:bg-built-red/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-sm"
      >
        {labels[state]}
      </button>
      {message && (
        <span className={`text-xs font-condensed ${state === "error" ? "text-red-400" : "text-emerald-400"}`}>
          {message}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Adaugă `HookScorePanel` și `SyncDiagnoseButton` în pagină**

În `analytics/page.tsx`, găsește secțiunea cu comentariul `{/* STATS din Instagram */}` și adaugă **deasupra** tabelului `IgMediaGrid`, după stats grid-ul cu 4 coloane:

```tsx
{/* SYNC & DIAGNOZEAZĂ */}
<div className="mb-6">
  <SyncDiagnoseButton />
</div>

{/* HOOK SCORE PANEL */}
{igMedia.length > 0 && (
  <HookScorePanel media={igMedia} />
)}
```

- [ ] **Step 4: Verifică TypeScript complet**

```bash
npx tsc --noEmit 2>&1 | head -50
```

Expected: 0 erori.

- [ ] **Step 5: Build de verificare**

```bash
npm run build 2>&1 | tail -20
```

Expected: build reușit fără erori.

- [ ] **Step 6: Commit final**

```bash
git add src/app/analytics/page.tsx src/components/analytics/SyncDiagnoseButton.tsx
git commit -m "feat(analytics): wire HookScorePanel + SyncDiagnoseButton in /analytics page"
```

---

## Self-Review — Spec Coverage Check

| Cerință spec | Task acoperitor |
|---|---|
| `ig_reels_avg_watch_time` adăugat la fetch | Task 1 |
| `ig_reels_video_view_total_time` adăugat | Task 1 |
| `clips_replays_count` adăugat | Task 1 |
| `follows` adăugat | Task 1 |
| `profile_visits` adăugat | Task 1 |
| Retry dacă Meta respinge combinația | Task 1 (strategia 2-pași) |
| Coloane noi în Supabase | Task 2 |
| Sync mapează noile câmpuri | Task 3 |
| `IgMediaRow` extins | Task 4 |
| `computeHookScore` formulă corectă | Task 4 |
| `diagnoseReels` cu Claude Sonnet | Task 4 |
| Etichete de diagnoză corecte (7 variante) | Task 4 |
| `hook_action` stocat în DB | Task 4 |
| Headline insight (Nx multiplier) | Task 5 |
| 3-panel grid (Do More / Stop / Fix) | Task 5 |
| Quick stats (watch time, replay winners, follows) | Task 5 |
| Ranking complet cu diagnoze | Task 5 |
| `IgMediaGrid` afișează watch time + follows | Task 6 |
| Buton "Sync & Diagnozează" | Task 7 |
| Apify neafectat | ✅ nemodificat |
| Celelalte module neafectate | ✅ nemodificate |
