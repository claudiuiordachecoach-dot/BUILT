# BUILT AI Command Center

Sistemul AI personal al lui Iordache Claudiu pentru BUILT — 12 module construite incremental, alimentate de "Creierul lui Claudiu" (single source of truth).

**Strategie de build**: Hibrid C — un modul complet, validare, apoi următorul.

---

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind 4**
- **Supabase** (Postgres + RLS) pentru persistență
- **Claude API** (Anthropic SDK) — Sonnet 4.6 pentru rutină, Opus 4.7 pentru analize profunde
- **Brand BUILT real**: negru `#0A0A0A` + roșu `#C0392B` + alb `#F5F5F5`, fonturi Bebas Neue + Barlow

---

## Cele 12 module

| ID  | Modul                  | Status            |
| --- | ---------------------- | ----------------- |
| M1  | Creierul lui Claudiu   | În construcție 🔨 |
| M2  | Generator Reels        | Planificat        |
| M3  | Generator Stories      | Planificat        |
| M4  | Generator Carusele     | Planificat        |
| M5  | Daily Brief & Calendar | Planificat        |
| M6  | Competitor Intelligence| Planificat        |
| M7  | Sistem DM              | Planificat        |
| M8  | Analizor Reel          | Planificat        |
| M9  | Knowledge Base         | Planificat        |
| M10 | Audit Profil Instagram | Planificat        |
| M11 | Analytics & Loop       | Planificat        |
| M12 | Clienți & Retenție     | Planificat        |

---

## Setup local

### 1. Instalează dependențele

```bash
cd built-ai-command-center
npm install
```

### 2. Configurează `.env.local`

```bash
cp .env.local.example .env.local
```

Editează `.env.local` și completează:

- **`NEXT_PUBLIC_SUPABASE_URL`** — deja completat (`https://kedfvtqbdlwhqmzggbls.supabase.co`)
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** — din Supabase: Project Settings → API → "anon / public" key
- **`SUPABASE_SERVICE_ROLE_KEY`** — din Supabase: Project Settings → API → "service_role" secret (NUMAI pentru migrare)
- **`ANTHROPIC_API_KEY`** — generează la <https://console.anthropic.com/settings/keys>

### 3. Rulează schema în Supabase

Deschide proiectul Supabase → SQL Editor → New query → copiază conținutul din `supabase/schema.sql` → Run.

Verifică: în Table Editor ar trebui să vezi `creier_sections`, `creier_metadata`, `generated_outputs`, `dm_conversations`, `dm_messages`.

### 4. Migrează creierul în Supabase

```bash
npm run migrate:creier
```

Citește `../CREIERUL_CLAUDIU/creierul-claudiu.json` și-l upload-ează în tabela `creier_sections`.

### 5. Pornește dev server

```bash
npm run dev
```

Deschide <http://localhost:3000>.

---

## Structura folderului

```
built-ai-command-center/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← root layout (sidebar + main)
│   │   ├── page.tsx                ← Daily Brief (M5 placeholder)
│   │   ├── creier/page.tsx         ← M1 — Onboarding Hub
│   │   └── globals.css             ← Tailwind 4 + paleta BUILT
│   ├── components/
│   │   ├── BrandLogo.tsx           ← logo BUILT (3 piloni)
│   │   ├── Sidebar.tsx             ← navigare M1-M12
│   │   └── CreierSectionCard.tsx   ← card secțiune creier
│   └── lib/
│       ├── modules.ts              ← catalog M1-M12
│       ├── creier.ts               ← citire creier (server)
│       ├── anthropic.ts            ← client Claude + prompt caching
│       └── supabase/
│           ├── client.ts           ← browser client
│           └── server.ts           ← server client
├── supabase/
│   └── schema.sql                  ← schema completă
├── scripts/
│   └── migrate-creier.ts           ← creier JSON → Supabase
└── .env.local.example
```

---

## Filosofia de design

1. **Vocea autentică > orice altceva** — un AI care produce conținut generic = zero valoare.
2. **Validare reală la fiecare modul** înainte să trecem la următorul. Nu skelete.
3. **Daily Brief vizibil mereu** — dimineața vezi ce ai de făcut azi.
4. **Performance loop integrat** — ce funcționează la tine reantrenează AI-ul automat.
5. **Editare cu învățare** — când modifici un script, AI-ul învață stilul tău de modificare.

Detalii complete: `../docs/superpowers/specs/2026-05-05-built-ai-command-center-design.md`.
