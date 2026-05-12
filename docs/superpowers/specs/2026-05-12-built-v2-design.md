# BUILT AI Command Center v2 — Design Spec
_Data: 2026-05-12_

## Context
Replicăm funcționalitățile complete ale Cult Dashboard (William Scott) și adăugăm:
- Auth system cu roluri (admin / client)
- Portal clienți (antrenamente, nutriție, check-in, mesaje)
- Salvare conversații AI (pe site + import Claude/Gemini)

Instagram: Meta Developer account indisponibil → folosim **Apify** pentru scraping competitors + reels proprii, și **CSV import** pentru date proprii.

---

## M1 — AUTH SYSTEM

**Stack**: Supabase Auth (email + password)

### Flux
- `/login` → pagină de login BUILT branded (email + parolă)
- Nu există register public; Claudiu adaugă clienți din `/clienti`
- La adăugare client → Supabase trimite invite email → clientul setează parola
- Middleware Next.js (`middleware.ts`) verifică sesiunea pe toate rutele
- Redirect: neautentificat → `/login`; client → `/client/dashboard`; admin → `/dashboard/analytics`

### Roluri
- `admin`: acces la tot (dashboard-ul actual + tot ce adăugăm)
- `client`: acces exclusiv la `/client/*`

### Schema DB (adăugări)
```sql
-- profiles (legat de auth.users prin trigger)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('admin', 'client')),
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);
-- trigger auto-create profile la signup
```

### UI
- Sidebar: avatar real + nume + rol + buton Sign Out funcțional
- `/login`: logo BUILT, câmpuri email/parolă, buton roșu, fără register

---

## M2 — CONVERSATION SAVING

**Principiu**: orice interacțiune cu AI pe site se salvează automat; conversațiile externe (Claude Code, Gemini) se pot importa manual.

### Schema DB
```sql
create table public.ai_conversations (
  id bigserial primary key,
  user_id uuid references auth.users(id),
  source text not null check (source in ('ask_built_ai','dm_coach','reels','stories','carusele','claude_import','gemini_import')),
  title text,                    -- generat de AI din primul mesaj
  messages jsonb not null,       -- [{role, content, created_at}]
  summary text,                  -- rezumat AI generat automat
  tags text[],                   -- teme detectate pentru search
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Comportament
- **Pe site**: fiecare chat nou → conversație nouă în DB; mesajele se adaugă în timp real
- **Context AI**: la orice call Anthropic, injectăm ultimele 5 conversații relevante ca context (selectate după tags)
- **Import extern**: buton în `/knowledge` → textarea → paste conversație → AI parsează + salvează cu `source = 'claude_import'`
- **Sidebar conversații** în Ask BUILT AI: lista ultimelor 20 conversații, click → reload

---

## M3 — DASHBOARD UPGRADE (`/dashboard/analytics`)

### Adăugări față de ce există
1. **Tip of the Week** — card în dreapta sus; generat de AI luni dimineața bazat pe performanța săptămânii trecute; stocat în `creier_metadata` cu key `tip_of_week`
2. **Format Performance** — bar chart orizontal; calculat din `instagram_media` (views medii per format_type)
3. **Content Library grid** — grid de carduri cu: thumbnail, format tag, dată, views, likes, saves, buton „Analizează"
4. **Reel Analysis Modal** — declanșat din butonul Analizează; apelează Claude cu transcriptul + metadata; returnează scor, ce a funcționat, adaptare BUILT

### Sursa datelor
- Date proprii: `instagram_media` table (populat via Apify sau CSV import)
- Buton „Sync" în header → trigger Apify sau upload CSV

---

## M4 — CONTENT STUDIO UPGRADE (`/dashboard/content`)

### Structură pagină
```
YOUR REELS (grid) ← din instagram_media
  ↓ Load more

MY COMPETITORS
  Input add handle → Add → stocat în competitors table
  Lista handles tracked
  Buton "Scrape Now" → trigger Apify

THIS WEEK'S SCRIPTS
  Past packages navigation (săptămâni)
  Buton "Regenerate This Week"
  
  Weekly Intelligence Report (expandabil):
    - WHAT'S POPPING THIS WEEK
    - PERFORMANCE LAST WEEK (format breakdown)
    - 5 ACCOUNTS TO WATCH
  
  7 scripturi zilnice (Luni-Sâmbătă):
    - Hook (bold)
    - Full script
    - Caption cu CTA "DM ARHITECTURĂ"
    - Copy button
```

### Schema DB (adăugări)
```sql
create table public.weekly_packages (
  id bigserial primary key,
  week_start date not null,
  intelligence_report jsonb,     -- ce a performat, insights
  scripts jsonb,                 -- array de 7 scripturi
  generated_at timestamptz default now()
);
```

### Generare
- Trigger manual (buton) sau Vercel Cron (luni 07:00)
- Input: ultimele reels competitori (scrape Apify) + performanța ta săptămâna trecută + profilul tău din Onboarding Hub + Creierul lui Claudiu
- Output: rapport + 7 scripturi salvate în `weekly_packages`

---

## M5 — ASK BUILT AI UPGRADE (`/knowledge`)

### UI
- Sidebar stânga: Quick Questions (5-6 predefinite) + lista conversații recente
- Main: chat complet cu bule mesaje (tu = dreapta, AI = stânga)
- Input cu Enter to send / Shift+Enter new line
- Fiecare conversație nouă → salvată automat în `ai_conversations`

### Context AI
System prompt include:
- Creierul lui Claudiu (toate secțiunile completate)
- Ultimele 5 conversații relevante din DB
- Performanța recentă (dacă există)

---

## M6 — AI REPLY GENERATOR (`/dashboard/outreach`)

### Tabs
1. **Daily Log** — tabel cu DMs logați (date, handle, stage, response)
2. **Templates** — DM templates salvate
3. **AI Reply Generator**:
   - Textarea „Mesajul lor"
   - Dropdown stage: Contact inițial / Follow-up / Rezervare apel / Obiecție / Închidere / Post-apel
   - Input „Context extra" (opțional)
   - Buton „Generează răspuns"
   - Output card: răspuns generat + Copy + Save as Template + Regenerate

### Stats header
DMs Trimise (YTD) | Răspunsuri | Lead-uri Calificate | Rată Răspuns (7 zile)

---

## M7 — ONBOARDING HUB UPGRADE (`/dashboard/onboarding`)

### Adăugări
- **Progress bar** cu % (câmpuri completate / total câmpuri)
- **Save & Update My AI** — buton care: salvează în DB + regenerează system prompt stocat + afișează preview „Cum te vede AI-ul acum"
- Indicator per secțiune: completat (verde) / incomplet (gri)

### Secțiuni (identic cu William)
1. Cine ești (nume, vârstă, locație)
2. Obiective venit (90 zile, 12 luni)
3. Obiectiv followeri (90 zile)
4. Contentul tău (nișă, formate, subiecte, povești)
5. Unde ești blocat
6. Ce vrei
7. Mindset & Opinii
8. Povestea ta

---

## M8 — CONTENT CALENDAR UPGRADE (`/dashboard/calendar`)

### Adăugări față de ce există
- Grid Luni-Duminică (nu Duminică-Sâmbătă)
- Celulele cu conținut postat: thumbnail real (din `instagram_media`) + views
- Click pe reel postat → expandat cu caption + comentarii reprezentative
- Buton „Plan this month" → generează sugestii de conținut pentru zilele goale
- „Add Idea" modal: Hook / Format (Raw Story | Arhitectură | Trend) / Content Brief / Pillar BUILT
- Legend: Postat (albastru) | Planificat (violet) | Ideea ta (gri)

---

## M9 — REEL ANALYSER UPGRADE (`/dashboard/reel-copy`)

### Adăugări față de ce există
- **Suggested Hook for Your Business** — secțiune nouă în output: AI rescrie hook-ul adaptat la BUILT + audiența Claudiu + Copy button
- **Save to Book** — salvează analiza în DB pentru referință viitoare

---

## M10 — PORTAL CLIENȚI (`/client/*`)

### Rute
```
/client/dashboard      → săptămâna curentă, next workout, summary check-in
/client/antrenamente   → plan săptămânal (creat de Claudiu)
/client/nutritie       → plan nutrițional + macros zilnice
/client/checkin        → formular check-in săptămânal
/client/mesaje         → chat intern cu Claudiu
```

### Schema DB (adăugări)
```sql
create table public.workout_plans (
  id bigserial primary key,
  client_id bigint references public.clients(id),
  week_start date,
  days jsonb,    -- {monday: [{exercise, sets, reps, note}], ...}
  created_at timestamptz default now()
);

create table public.nutrition_plans (
  id bigserial primary key,
  client_id bigint references public.clients(id),
  calories int,
  protein_g int,
  carbs_g int,
  fat_g int,
  meals jsonb,   -- [{name, foods, macros}]
  notes text,
  created_at timestamptz default now()
);

create table public.client_messages (
  id bigserial primary key,
  client_id bigint references public.clients(id),
  sender text not null check (sender in ('admin','client')),
  content text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);
```

### Ce vede clientul
- Dashboard: săptămâna curentă + next workout + ultimul check-in + mesaje necitite
- Antrenamente: tabel/card cu zilele săptămânii, exerciții, seturi, rep-uri
- Nutriție: plan zilnic cu mese + macros
- Check-in: formular (aderență antrenament %, aderență nutriție %, nivel energie 1-10, dispoziție 1-10, note) → trimis la Claudiu
- Mesaje: chat simplu cu Claudiu

### Ce vede Claudiu (în `/clienti/[id]`)
- Tab „Plan Antrenament" → editor plan săptămânal
- Tab „Plan Nutrițional" → editor macros + mese
- Tab „Check-in-uri" → lista check-in-urilor trimise
- Tab „Mesaje" → chat cu clientul respectiv

---

## Dependențe externe noi

| Serviciu | Scop | Integrare |
|---|---|---|
| Supabase Auth | Login, sesiuni, roluri | `@supabase/ssr` |
| Apify | Scraping Instagram reels + competitors | HTTP API cu `APIFY_API_KEY` |
| Vercel Cron | Weekly script generation (luni 07:00) | `vercel.json` crons |

---

## Ordinea de build (Approach A — tot dintr-o dată)

1. Auth system + middleware + schema DB
2. Conversation saving + Ask BUILT AI cu istoric
3. Dashboard upgrades (Tip of Week + Format Performance + Content Library)
4. Content Studio (Competitors + Weekly Report + 7 Scripts)
5. AI Reply Generator în Outreach
6. Onboarding Hub upgrade
7. Content Calendar upgrade
8. Reel Analyser upgrade
9. Portal clienți (schema + UI toate rutele)
10. Apify integration + CSV import
