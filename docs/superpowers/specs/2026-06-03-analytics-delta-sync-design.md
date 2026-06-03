# Analytics Fix — Delta Views + Sync Inteligent
_Data: 2026-06-03_

## Problemă

Dashboard-ul arată 289.7K views vs Instagram real 905K views pe ultimele 30 zile.

**Cauza:** Dashboard-ul filtrează reels după `posted_at` (data publicării), deci un reel vechi care continuă să primească views azi nu apare în totalul perioadei. Instagram numără views primite în fereastă, indiferent când a fost postat conținutul.

**Limitare permanentă:** Nu avem Meta API. Apify returnează un snapshot cumulativ al views pe fiecare reel la momentul sync-ului — nu views zilnice. Caruselele și postele sunt blocate de Instagram la scraping.

---

## Soluție: Delta Tracking + Sync în Două Trepte

### 1. Schema DB — migrare nouă

Adăugăm două coloane în `instagram_media`:

```sql
ALTER TABLE instagram_media
  ADD COLUMN IF NOT EXISTS views_previous integer,
  ADD COLUMN IF NOT EXISTS last_synced_at  timestamptz;
```

- `views_previous` — views stocate la sync-ul anterior (înainte de upsert)
- `last_synced_at` — timestamp-ul ultimei sincronizări per reel

### 2. Sync în două trepte

#### syncAllReels() — sync complet (manual, one-time + când vrei)
- Apify: `resultsLimit: 500` (toate reels-urile)
- Înainte de upsert: `views_previous = views` (din DB curent)
- Upsert cu noile valori + `last_synced_at = now()`
- Afișat în UI ca buton "Sync Complet"

#### syncRecentReels() — sync light (automat zilnic)
- Apify: `resultsLimit: 20` (ultimele reels)
- Același pattern: `views_previous = views` → upsert → `last_synced_at = now()`
- Costă ~4% din creditele unui sync complet
- Endpoint: `POST /api/cron/sync-reels`

### 3. Vercel Cron

```json
{
  "crons": [
    { "path": "/api/cron/sync-reels", "schedule": "0 7 * * *" }
  ]
}
```

Rulează zilnic la 07:00. Protejat cu `CRON_SECRET` header.

### 4. Dashboard — ce se schimbă în page.tsx

**Total Views KPI:**
- NU mai filtrăm după `posted_at`
- `totalViews` = suma `views` din TOATE reels-urile din DB
- Label: "La ultima sincronizare: [dată]"

**Views Câștigate KPI (nou):**
- `viewsGained` = suma `(views - views_previous)` pentru reels cu `last_synced_at` în ultimele 48h
- Label: "De la ultima sincronizare"
- Înlocuiește sau completează cardul de "% vs perioadă anterioară"

**Buton Sync vizibil în header:**
- "Sync acum" → apelează `syncRecentReels()` (20 reels, rapid)
- "Sync complet" → apelează `syncAllReels()` (500 reels, durează ~2 min)
- Loading state pe ambele

**Format Breakdown fix:**
- Filtrul actual elimină reels fără `posted_at` → schimbăm să includă TOATE
- `format_type` null → clasificat ca "REEL" (fallback)
- Valorile acceptate în check constraint: REEL, CAROUSEL, POST, TALKING HEAD, B-ROLL, TUTORIAL, TRANSFORMATION

### 5. Fișiere modificate

| Fișier | Modificare |
|---|---|
| `supabase/migrations/20260603_delta_views.sql` | Adaugă `views_previous`, `last_synced_at` |
| `src/lib/apify.ts` | Expune `scrapeInstagramReels(limit)` cu parametru explicit |
| `src/app/dashboard/analytics/actions.ts` | `syncAllReels()` + `syncRecentReels()` cu delta logic |
| `src/app/api/cron/sync-reels/route.ts` | Endpoint cron protejat cu secret |
| `src/app/dashboard/analytics/page.tsx` | Elimină filtru `posted_at` din KPI, adaugă `viewsGained`, fix format breakdown |
| `vercel.json` | Adaugă cron config |

---

## Ce NU se schimbă

- Actorul Apify rămâne `instagram-reel-scraper` (stabil 100%)
- Caruselele și postele rămân excluse (Instagram blochează scraping-ul)
- DB schema pentru restul tabelelor — neatinsă

---

## Limitări asumate

- `totalViews` = snapshot cumulativ, nu "views în ultimele 30 zile" exact
- `viewsGained` devine semnificativ abia după 2+ sincronizări
- Reels cu `views_previous = null` (primul sync) nu au delta — afișate cu "—"
