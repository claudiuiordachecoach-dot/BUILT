# Agent Carusele BUILT — Design Spec
_2026-05-14_

## Obiectiv

Adaugă un tab "Agent" în modulul `/carusele` existent. Fluxul: Claudiu furnizează o idee brută → agentul propune 3 unghiuri → Claudiu alege → agentul generează 8-9 slide-uri cu text → preview vizual în pagină → iterație prin chat → download ZIP cu PNG-uri 1080×1350 gata de Instagram.

Generatorul rapid existent rămâne neatins ca tab separat.

---

## Arhitectură

### Tab-uri modul `/carusele`
- **Generator** — pagina actuală, nicio modificare
- **Agent** — UI nou, flux conversațional

### Componente noi

| Fișier | Responsabilitate |
|---|---|
| `src/app/carusele/agent/page.tsx` | UI agent — chat + preview panel |
| `src/app/carusele/agent/actions.ts` | Server actions: conversație AI + orchestrare |
| `src/app/api/carusele/render/route.ts` | API route Puppeteer → PNG-uri |
| `src/lib/carusele/slide-renderer.ts` | Template HTML/CSS per slide |
| `src/lib/carusele/agent-conversation.ts` | Logica conversației cu Claude (state machine) |

---

## Fluxul conversațional — State Machine

```
IDLE → COLLECTING_IDEA → PROPOSING_ANGLES → AWAITING_CHOICE
     → GENERATING_SLIDES → PREVIEW → ITERATING → READY_TO_EXPORT
```

### Stările în detaliu

**COLLECTING_IDEA**: Agentul primește ideea brută de la Claudiu. Dacă ideea e prea vagă (sub 5 cuvinte), cere o propoziție completă.

**PROPOSING_ANGLES**: Claude generează 3 unghiuri de abordare. Fiecare unghi = titlu propus pentru hook (slide 1) + 1 frază despre direcție. Claudiu alege A/B/C sau descrie ajustarea.

**GENERATING_SLIDES**: Claude generează toate slide-urile (JSON, același format ca actions.ts existent). Salvează în Supabase ca `status: "draft"`.

**PREVIEW**: UI afișează slide-urile în cele 3 moduri (Mockup / Text / Canva export). Claudiu poate continua conversația pentru modificări.

**ITERATING**: Claudiu cere ajustări specifice ("slide 3 e prea lung", "hook mai tăios"). Agentul regenerează doar slide-ul indicat sau tot caruselul dacă e nevoie.

**READY_TO_EXPORT**: Claudiu apasă "Generează PNG-uri" → Puppeteer rulează → ZIP disponibil pentru download.

---

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│ CARUSELE BUILT          [Generator] [Agent ●]       │
├──────────────────────────┬──────────────────────────┤
│  CHAT                    │  PREVIEW                  │
│                          │  [Mockup] [Text] [Canva]  │
│  [Mesaj agent...]        │                           │
│  [Mesaj Claudiu...]      │  Slide 1: ████████        │
│  [Mesaj agent...]        │  Slide 2: ████████        │
│                          │  Slide 3: ████████        │
│                          │  ...                      │
│  ┌────────────────────┐  │                           │
│  │ Scrie ideea ta...  │  │  [Generează PNG-uri →]   │
│  └────────────────────┘  │                           │
└──────────────────────────┴──────────────────────────┘
```

Layout split 50/50 pe desktop. Pe mobile: chat deasupra, preview dedesubt.

---

## Generarea PNG-urilor (Puppeteer)

### Trigger
Buton explicit "Generează PNG-uri" — NU la fiecare iterație. Puppeteer e costisitor.

### API Route: `POST /api/carusele/render`
Input: `{ caruselId: number }`
Output: URL-uri Supabase Storage pentru fiecare PNG

### Flow intern
1. Citește slide-urile din Supabase după `caruselId`
2. Pentru fiecare slide: renderează HTML template → Puppeteer screenshot 1080×1350
3. Uploadează PNG în Supabase Storage bucket `carusele-png`
4. Returnează array de URL-uri
5. UI generează ZIP din URL-uri → download

### HTML Template per slide
- Dimensiune: 1080×1350px
- Font: Bebas Neue (titlu), Barlow (body)
- Culori: `#0A0A0A` fond, `#C0392B` accent, `#F5F5F5` text
- Layout: titlu mare sus, body mijloc, număr slide + branding jos
- Slide 1 (hook): layout special — titlu mai mare, fără număr
- Slide final (CTA): fundal roșu `#C0392B`, text alb

### Dependență nouă
`puppeteer` sau `puppeteer-core` + `@sparticuz/chromium` (compatibil cu deployment serverless dacă e nevoie).

---

## Conversația cu Claude — Prompt Design

### System prompt pentru agent
Folosește `buildSystemBlocks` existent (creier + context BUILT). Task context specific:

```
Ești agentul de carusele BUILT. Conduci o conversație în maxim 3 runde înainte de generare.
Runda 1: Primești ideea. Propui 3 unghiuri (A/B/C) — fiecare cu hook propus + direcție în 1 frază.
Runda 2: Claudiu alege. Confirmi alegerea și generezi slide-urile (JSON strict).
Runda 3+: Iterații specifice pe slide-uri individuale.
Nu explica ce faci. Acționează direct.
```

### Format răspuns agent (runda 1 — unghiuri)
```json
{
  "type": "angles",
  "angles": [
    { "id": "A", "hook": "string", "direction": "string" },
    { "id": "B", "hook": "string", "direction": "string" },
    { "id": "C", "hook": "string", "direction": "string" }
  ]
}
```

### Format răspuns agent (runda 2 — slide-uri)
Același format JSON ca `CaruselBody` din `actions.ts` existent.

### Format răspuns agent (iterație)
```json
{
  "type": "slide_update",
  "position": 3,
  "slide": { "position": 3, "title": "...", "body": "...", "design_brief": "..." }
}
```

---

## Persistență

- Conversația: state local în React (nu e salvată în Supabase — e efemeră)
- Caruselul generat: salvat în `generated_outputs` cu `module: "M4_carusel"` — același tabel existent
- PNG-urile: Supabase Storage bucket `carusele-png`, path `{carusel_id}/slide_{position}.png`
- Referință PNG în Supabase: coloană nouă `png_urls jsonb` în `generated_outputs` sau tabel separat

---

## Preview Modes

### Mockup BUILT
HTML/CSS rendered în `<iframe>` sau `<div>` cu scale transform. Afișează slide-urile la ~30% din dimensiunea reală (preview). Același template ca Puppeteer.

### Text structurat
Card per slide: număr roșu + titlu bold + body + design brief în italic. Ușor de scanat.

### Export Canva
Text formatat per slide, buton "Copy all" — paste în notes sau template Canva.

---

## Supabase Storage

Bucket nou: `carusele-png` (public read, authenticated write).
RLS: user autentificat poate scrie, oricine poate citi (URL-urile sunt unice per carusel).

---

## Out of scope

- Postare automată pe Instagram (API Instagram necesită aprobare Meta — complexitate mare)
- Scheduling automat din agent (există deja câmpul `scheduled_for` în tabel, se poate adăuga ulterior)
- Animații între slide-uri
- Template-uri multiple (un singur template BUILT acum)

---

## Dependențe noi

| Pachet | Scop |
|---|---|
| `puppeteer-core` | Screenshot HTML → PNG |
| `@sparticuz/chromium` | Chromium binar compatibil serverless |
| `jszip` | Generare ZIP în browser pentru download |

---

## Ordinea de implementare

1. Tab switching în `/carusele` (UI only, fără logică)
2. Chat UI de bază (mesaje, input, afișare)
3. Server action conversație — runda 1 (unghiuri) + runda 2 (slide-uri)
4. Preview text structurat
5. Preview mockup HTML (template slide + iframe)
6. Iterații în chat (runda 3+)
7. Puppeteer setup + API route render
8. Supabase Storage upload
9. Download ZIP
10. Export Canva text
