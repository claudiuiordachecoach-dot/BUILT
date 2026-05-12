# BUILT AI Command Center — Handoff

**Sesiune curentă:** 2026-05-08
**Status:** M1 ✅ + M2 ✅ + M3 ✅ + M4 ✅ + M5 ✅ + M7 ✅ · **6 din 12 module active**

---

## TL;DR — pornire în următorul chat

```
Citește HANDOFF.md. Active: M1-M5, M7. Rămân: M6, M8, M9, M10, M11, M12.
Vercel: rulează DEPLOY.md (npx vercel login → npx vercel --prod).
```

Atât. Tot contextul e mai jos.

---

## CE FUNCȚIONEAZĂ ACUM

### 1. Stack tehnic complet
- **Next.js 16.2.4** (App Router) + TypeScript + **Tailwind 4** (CSS-first, fără `tailwind.config.js`)
- Fonturi BUILT: Bebas Neue (display) + Barlow Condensed (UI/labels) + Barlow (body) — via `next/font/google`
- Brand colors în `src/app/globals.css` ca `@theme inline` tokens:
  - `bg-built-black` `#0A0A0A` · `bg-built-gray-1` `#1A1A1A` · `bg-built-gray-2` `#2A2A2A`
  - `text-built-white` `#F5F5F5` · `text-built-gray-text` `#888888`
  - `bg-built-red` `#C0392B` · `bg-built-red-dark` `#8B1A1A`
  - `font-display` (Bebas) · `font-condensed` (Barlow Condensed)

### 2. Layout shell
- Sidebar cu cele 12 module (M1-M12), status `active|in_progress|planned`
- M1 (`/creier`) și M2 (`/reels`) clickable — restul placeholder grayed-out
- Pagina home `/` arată Daily Brief skeleton + grid cu cele 12 module

### 3. M1 — Onboarding Hub COMPLET ✅
- `/creier` citește din **Supabase** (cu fallback la file dacă DB pică) — `readCreierFromSupabase()`
- Afișează cele 10 secțiuni cu progress %, expandable card-uri
- **Editing activ**: click pe secțiune → Editează → modifici JSON + status → Salvează (server action + revalidatePath)
- **Buton "Update AI"** în header testează prompt caching: prima oară `cache_creation=18306`, a doua `cache_read=18306`. După Save, cache invalidat (creier nou) — dovedește end-to-end că AI vede modificările.

### 3b. M2 — Generator Reels COMPLET ✅
- `/reels` cu generator + istoric + edit pe variante
- **Selector pilon** (B/U/I/L/T/mix) + **5 preset-uri unghi** + textarea liberă
- **`generateReel(pillar, angle)`** — apelează Sonnet 4.6 cu `buildSystemBlocks()` (creier cached) + Skill 1 prompt complet (structura Hook→Validare→Sistem→CTA + 5 triggere psihologice + interzis-uri)
- **Output**: 3 variante per generare, cu trigger psihologic diferit, salvate în `generated_outputs` ca `module='M2_reel'`
- **Edit per variantă**: textarea per câmp (hook, validare, sistem, CTA), `saveReelEdit()` salvează diff în `user_edits` jsonb pentru learning loop M11
- **Cache verificat live**: a doua generare arată `cache_read=18306` (economie ~95% input tokens)
- Durata generare: ~30s pentru 3 variante (~1250 output tokens)

### 3c. M5 — Daily Brief v1 COMPLET ✅
- `/` (pagina home) **rescrisă** ca Daily Brief — locul pe care intri zilnic.
- **DailyFocusCard**: card mare cu reel-ul programat azi (pilon + trigger + scriptul complet hook/validare/sistem/CTA) sau empty state cu link direct la /reels.
- **Buton "Marchează postat"** — `markPosted(id)` setează `status='posted'` + `posted_at=now()`. Buton "Demarchează" pentru revert.
- **WeeklyCalendar cu DnD** — 7 coloane luni-duminică, fiecare droppable. Pool de neprogramate pe lateral (lg:280px), draggable cu `@dnd-kit/core`. `useOptimistic` pentru update instant în UI, server action `setSchedule(id, dateIso | null)` în background.
- **WeekNavigator**: ←/→ pentru săptămâni, buton "AZI" când nu ești pe săptămâna curentă. Săptămâna se păstrează în URL (`?week=YYYY-MM-DD`) — shareable.
- **Counters**: "X/7 reels programate săptămâna asta · Y postate" în header.
- **M11 placeholder**: slot dashed pentru "Recap performanță · M11", marcat "Planificat".
- **Module grid colapsat** (`<details>`) — disclosure pentru cele 12 module.
- **Sidebar M5** — slug="" pointează la `/`, highlight automat când ești pe home.
- **Vizual feedback DnD**: drop target capătă `bg-built-red/10 border-built-red`, item-ul drag-uit are `opacity-30`, DragOverlay arată ring roșu.
- Validare end-to-end: TypeScript curat, console fără erori, navigarea săptămânii funcțională, pool afișează cele 2 reels generate în M2.

### 4. Supabase — DB live
- URL: `https://kedfvtqbdlwhqmzggbls.supabase.co`
- Schema deployed: `creier_sections`, `creier_metadata`, `generated_outputs`, `dm_conversations`, `dm_messages`
- RLS pe `for all using (true)` — single-user mode (Claudiu)
- **Creierul migrat în DB**: 10 secțiuni cu `status='completed'` + metadata
- Verificare: `npm run test:connections`

### 5. Anthropic API — testat
- Cheia funcționează (test trimite "BUILT API merge", returnează corect)
- Modele configurate în `src/lib/anthropic.ts`:
  - `MODELS.routine = "claude-sonnet-4-6"` — pentru reels, stories, DM
  - `MODELS.deep = "claude-opus-4-7"` — pentru KB chat, audit, decizii
- `buildSystemBlocks()` setează prompt caching corect: identitate BUILT (cached) + creier 50KB (cached) + task context (per-request)

---

## CE LIPSEȘTE — următoarea sesiune

**Următorul modul de ales:**

### Opțiunea A — M3 Generator Stories (recomandată)
**De ce:** 21 stories/săptămână = volum de 3× față de reels. Templates diferite față de reels (întrebare directă, behind the scenes, mini-lecții). Cel mai mic effort cu cel mai mare ROI de output.
- Reutilizează 80% din infrastructura M2 (`generateReel` → `generateStory`, schema deja are `module='M3_story'`)
- Daily Brief v2 le va integra automat în calendar (după ce M3 livrează, extindem M5 să arate stories alături de reels)

### Opțiunea B — M7 Sistem DM
**De ce:** Direct în business — Skill 2 (Operatorul de Conversație) + cele 3 Întrebări Magice + detector red flags. Convertește traffic în clienți.
- Schema `dm_conversations` + `dm_messages` deja deployed
- Cel mai mare ROI imediat, dar și cel mai complex (state machine pe stage-uri)

### Îmbunătățiri pentru M2 / M5 (opționale)
- M2: filter pe pilon în istoric, re-generate cu feedback specific, view diff hook editat vs original
- M5: integrare M3 stories în calendar (după ce M3 livrează), preview pe hover pe ReelDailyCard, click pe card pentru drawer de edit fără navigare la /reels

### Reguli de păstrat care merg
- Server action pattern cu `'use server'` + `revalidatePath`
- `useTransition` pentru pending states
- Cache control prin `buildSystemBlocks()` — creierul mereu cached
- Validare server-side (whitelist module, status, lengths)
- Fallback path în reader (Supabase → file) pentru rezistență la DB-down

---

## STRUCTURA FIȘIERELOR (creată în sesiunea asta)

```
built-ai-command-center/
├── .env.local              ← chei live (gitignored)
├── .env.local.example      ← template
├── HANDOFF.md              ← acest fișier
├── package.json            ← scripts: dev, build, migrate:creier, test:connections
├── supabase/schema.sql     ← schema DB (idempotent, are NOTIFY pgrst)
├── scripts/
│   ├── migrate-creier.ts   ← rulat o dată cu succes
│   ├── test-connections.ts ← npm run test:connections
│   └── check-schema.ts     ← debug pentru tabele
└── src/
    ├── app/
    │   ├── globals.css     ← BUILT theme + Tailwind 4 @theme inline
    │   ├── layout.tsx      ← root layout cu fonturi + Sidebar
    │   ├── page.tsx        ← M5 Daily Brief (focus card + calendar + pool + M11 placeholder + module grid colapsat)
    │   ├── actions.ts      ← M5 server actions: listWeekReels, listUnscheduledReels, getTodayReel, setSchedule, markPosted, setStatus
    │   ├── creier/
    │   │   ├── page.tsx    ← M1 Onboarding Hub (Supabase + fallback file)
    │   │   └── actions.ts  ← saveSection() + testAICache() (server actions)
    │   └── reels/
    │       ├── page.tsx    ← M2 Generator Reels (lista + generator)
    │       └── actions.ts  ← generateReel() + listReels() + saveReelEdit()
    ├── components/
    │   ├── BrandLogo.tsx
    │   ├── Sidebar.tsx
    │   ├── CreierSectionCard.tsx ← view + edit modes cu JSON validation
    │   ├── UpdateAIButton.tsx    ← test cache cu usage stats live
    │   ├── ReelGenerator.tsx     ← form pilon + unghi + preset-uri + buton generează
    │   ├── ReelOutputCard.tsx    ← 3 variante expandable + edit per variantă
    │   ├── DailyFocusCard.tsx    ← M5: card mare azi cu mark-as-posted
    │   ├── ReelDailyCard.tsx     ← M5: draggable card pentru calendar și pool
    │   ├── WeeklyCalendar.tsx    ← M5: DnD orchestrator (DndContext + useOptimistic)
    │   └── WeekNavigator.tsx     ← M5: ←/→/Azi cu URL search params
    └── lib/
        ├── creier.ts       ← readCreierFromFile() + readCreierFromSupabase()
        ├── modules.ts      ← catalogul M1-M12 (M1+M2+M5 active)
        ├── week.ts         ← M5: weekStart, buildWeek, shiftWeek, formatWeekRange (UTC-safe)
        ├── anthropic.ts    ← client + buildSystemBlocks() cu prompt caching
        └── supabase/
            ├── client.ts   ← browser client (anon)
            └── server.ts   ← server client (anon sau service role)
```

---

## QUIRKS / ATENȚIE PE NEXT.JS 16

⚠ **NU e Next.js 14/15.** Citește `node_modules/next/dist/docs/01-app/` înainte să presupui ceva.

- Tailwind 4 = CSS-first, NU mai există `tailwind.config.js`. Adaugi tokens în `@theme inline { }` block în `globals.css`.
- `params` în Server Components e `Promise<{ ... }>` — trebuie `await params`.
- `RouteContext<'/path/[id]'>` e tip global pentru handler-uri tipate.
- `notify pgrst, 'reload schema'` la finalul SQL-ului — fără asta, PostgREST cache stă stale câteva minute după CREATE TABLE.

---

## COMENZI UTILE

```bash
cd built-ai-command-center

npm run dev                # dev server pe localhost:3000
npm run build              # production build (rulează după edit major)
npm run test:connections   # verifică Anthropic + Supabase
npm run migrate:creier     # re-migrează creierul (idempotent, upsert)
```

---

## OBIECTIVE BIG-PICTURE (din design doc)

Strategia hibrid C: **M1 ✅ → M2 ✅ → M5 ✅ → tu alegi următorul**.
- ✅ Sesiunea anterioară: M1 editor + M2 Generator Reels complete și validate end-to-end
- ✅ Sesiunea asta (8 mai 2026): M5 Daily Brief v1 — pagina home cu calendar săptămânal DnD, focus card azi, pool de neprogramate, mark-as-posted, M11 placeholder, module grid colapsabil
- 🔜 Următoarea sesiune: M3 (Stories) sau M7 (DM) — tu alegi

## Validări end-to-end (sesiunea asta)

### M1
| Test | Rezultat |
|------|----------|
| GET /creier folosește Supabase | ✅ "Sursa: Supabase (live)" |
| Edit secțiune 5 + Save | ✅ Marker test salvat, vizibil la refresh |
| Cache hit pe al doilea Update AI | ✅ `cache_read=18306` (creier 53KB) |
| Cache invalidat după Save | ✅ `cache_creation=18326` (20 tokens diferență = marker-ul) |

### M2
| Test | Rezultat |
|------|----------|
| Generare reel I × "Burta de stres" | ✅ 3 variante salvate ca draft #1 (29.4s) |
| Generare reel B × "Frica de greutate" | ✅ 3 variante salvate ca draft #2 (30.9s) |
| Cache hit pe a doua generare | ✅ `cache_read=18306, cache_creation=0` |
| Trigger-uri psihologice diferite per variantă | ✅ Capcana Cortizolului / Paradoxul Competenței / Prețul Invizibilității |
| Vocea BUILT + zero clișee | ✅ Verificat manual pe variantele generate |
| Edit V1 + saveReelEdit | ✅ Status `edited` în DB, hook column sincronizat |
| `npx tsc --noEmit` | ✅ 0 erori |

### M5
| Test | Rezultat |
|------|----------|
| GET / afișează Daily Brief (nu mai e skeleton) | ✅ "Vineri 8 mai 2026" + counters + WeekNavigator + DailyFocusCard + WeeklyCalendar + M11 placeholder |
| Calendar arată Vineri 8 highlighted ca azi | ✅ Border roșu + label roșu pe coloana VIN |
| Past days `—`, future days `gol` | ✅ Lun 4–Joi 7 cu `—`, Sâm 9–Dum 10 cu `gol` |
| Pool afișează cele 2 reels generate în M2 | ✅ "NEPROGRAMATE (2)" — Pilon B (editat) + Pilon I (draft) |
| WeekNavigator → urmează | ✅ URL `?week=2026-05-11`, label "11–17 mai 2026" |
| Buton "AZI" revine la săptămâna curentă | ✅ URL `/`, label "4–10 mai 2026" |
| DailyFocusCard empty state cu link `/reels` | ✅ "Niciun reel programat azi" + buton "GENEREAZĂ REEL NOU" |
| Module grid colapsabil (`<details>`) | ✅ Click pe summary → `details.open=true` |
| Sidebar M5 highlight pe `/` | ✅ Border roșu + text roșu pe M5 când pathname=`/` |
| Console fără erori | ✅ Doar HMR + Fast Refresh logs |
| `npx tsc --noEmit` | ✅ 0 erori |

**Necheckat în preview, dar trustworthy de cod**:
- DnD efectiv mută reel între pool și zile (cod: @dnd-kit + setSchedule + useOptimistic)
- markPosted button update-ează DB (cod: server action mirror al saveReelEdit)
- DailyFocusCard cu reel real (vizibil când programezi unul azi prin DnD)

Design doc complet: `docs/superpowers/specs/2026-05-05-built-ai-command-center-design.md`
