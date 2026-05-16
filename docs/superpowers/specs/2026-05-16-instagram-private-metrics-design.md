# Design: Instagram Private Metrics — Full Sync + Hook Score + AI Diagnosis

_Data: 2026-05-16_

## Obiectiv

Extinde integrarea Meta API existentă pentru a aduce **toate** metricile private disponibile per Reel/post, calcula Hook Score + Replay Rate, și genera diagnoze Claude per Reel — toate integrate în `/analytics`.

---

## 1. Metrici noi (adăugate la sync)

### Reels / VIDEO
Adăugate la string-ul existent din `fetchMediaInsights`:

| Metrică API | Camp Supabase | Tip | Disponibilitate |
|---|---|---|---|
| `ig_reels_avg_watch_time` | `avg_watch_time_ms` | integer | Garantat (Creator/Business) |
| `ig_reels_video_view_total_time` | `total_watch_time_ms` | integer | Garantat |
| `clips_replays_count` | `replays` | integer | Posturi noi (null pe vechi) |
| `follows` | `follows` | integer | Garantat |
| `profile_visits` | `profile_visits` | integer | Garantat |

### Toate tipurile de media
| Metrică API | Camp Supabase | Tip |
|---|---|---|
| `follows` | `follows` | integer |
| `profile_visits` | `profile_visits` | integer |

---

## 2. Modificări `src/lib/instagram.ts`

**`IgInsights` interface** — adăugăm 5 câmpuri:
```typescript
avg_watch_time_ms?: number;
total_watch_time_ms?: number;
replays?: number;
follows?: number;
profile_visits?: number;
```

**`fetchMediaInsights`** — metrics string pentru REELS:
```
plays,likes,comments,saved,shares,reach,impressions,
ig_reels_avg_watch_time,ig_reels_video_view_total_time,
clips_replays_count,follows,profile_visits
```

Strategia de fetch: un singur apel cu toate metricile. Dacă Meta returnează eroare 400 (metrică incompatibilă cu tip media), retry fără metricile Reels-only. Metrici lipsă din răspuns → `null` în DB (nu eroare).

---

## 3. Migrare Supabase

Tabel: `instagram_media`

```sql
ALTER TABLE instagram_media
  ADD COLUMN IF NOT EXISTS avg_watch_time_ms integer,
  ADD COLUMN IF NOT EXISTS total_watch_time_ms integer,
  ADD COLUMN IF NOT EXISTS replays integer,
  ADD COLUMN IF NOT EXISTS follows integer,
  ADD COLUMN IF NOT EXISTS profile_visits integer,
  ADD COLUMN IF NOT EXISTS hook_score numeric(10,4),
  ADD COLUMN IF NOT EXISTS hook_diagnosis text,
  ADD COLUMN IF NOT EXISTS diagnosed_at timestamptz;
```

`hook_score` și `hook_diagnosis` sunt calculate ulterior (nu din sync), deci pot fi null inițial.

---

## 4. Modificări `src/app/api/instagram/sync/route.ts`

Mapăm noile câmpuri la `upsert`:
```typescript
avg_watch_time_ms: insights.avg_watch_time_ms ?? null,
total_watch_time_ms: insights.total_watch_time_ms ?? null,
replays: insights.replays ?? null,
follows: insights.follows ?? null,
profile_visits: insights.profile_visits ?? null,
```

---

## 5. Hook Score — calcul server-side

Formulă (din ghidul de referință, adaptată):
```
watch_s       = avg_watch_time_ms / 1000
share_pct     = (shares / reach) * 100   -- dacă reach > 0
save_pct      = (saves / reach) * 100
replay_rate   = replays / reach           -- null dacă replays null
hook_score    = watch_s * sqrt(reach) * (1 + share_pct/100 + save_pct/200)
```

Calculat în `analytics/actions.ts` la citire (nu stocat), pe baza datelor din DB. `hook_score` stocat în DB doar după rularea diagnozei Claude (batch).

---

## 6. Diagnoze Claude — `src/app/analytics/actions.ts`

Acțiune nouă: `diagnoseReels(mediaIds: number[])`

- Preia Reelurile din Supabase
- Calculează Hook Score per Reel
- Trimite batch la Claude (Sonnet, max 30 Reels per apel) cu datele metricilor
- Claude returnează per Reel: `diagnosis` string + `action` enum (do_more | stop | fix)
- Upsert `hook_diagnosis` + `diagnosed_at` în DB

**Etichete de diagnoză** (același sistem ca ghidul):
- `"Winner — toate cele 3 axe funcționează"`
- `"Hook puternic, IG nu l-a împins"`
- `"Lumea a dat click, conținutul nu a ținut"`
- `"Concept viral, livrare slabă"`
- `"Slab pe toate axele — elimină formatul"`
- `"Hook aterizat"`
- `"Subperformanță"`

---

## 7. Modificări `/analytics` page

Secțiuni noi în UI (deasupra tabelului existent):

1. **Headline insight** — "Top Reel-ul tău a atins de Nx mai mulți oameni decât mediana"
2. **3-panel grid**:
   - 🟢 Fă mai mult (top 3 hook_score)
   - 🔴 Oprește (bottom 3)
   - 🟡 Fixează (hook_rate top quartile dar watch_s bottom quartile)
3. **Quick stats** — avg watch time, replay winners, follow rate per Reel
4. **Tabel complet** — sortat după hook_score, cu diagnoze colorate

Buton "Sync + Diagnozează" — declanșează sync + diagnoze într-un singur click.

---

## 8. Tipuri TypeScript

`IgMediaRow` din `analytics/actions.ts` se extinde cu noile câmpuri. `IgInsights` din `instagram.ts` primește câmpurile noi. Fără breaking changes la componentele existente — câmpurile noi sunt opționale.

---

## 9. Gestionarea erorilor

- Metrică indisponibilă pe un post → `null` în DB, nu eroare de sync
- Diagnoze Claude eșuează → postul rămâne fără diagnoză, sync continuă
- Token expirat → warning existent în sync se păstrează

---

## 10. Ce NU se schimbă

- OAuth flow (intact)
- Token refresh logic (intact)
- Apify (rămâne pentru competitori — profil public)
- Modulele `/reels`, `/dm`, `/creier` (neafectate)
- Tabelele Supabase existente (doar ALTER, nu DROP)
