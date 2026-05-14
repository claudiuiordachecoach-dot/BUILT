# Agent Carusele BUILT — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adaugă tab "Agent" în modulul `/carusele` — flux conversațional în care Claudiu dă o idee brută, agentul propune 3 unghiuri, generează slide-urile, afișează preview vizual și exportă PNG-uri 1080×1350 gata de Instagram.

**Architecture:** Tab nou în pagina existentă `/carusele` — generatorul actual rămâne neatins. Agent tab = chat UI (stânga) + preview panel (dreapta). Server actions gestionează conversația cu Claude (multi-turn state transmis din client). Puppeteer rulează în API route pentru screenshot → Supabase Storage → ZIP download în browser.

**Tech Stack:** Next.js 16 App Router, React 19, Anthropic SDK 0.94, Supabase (DB + Storage), puppeteer-core + @sparticuz/chromium, jszip (client-side ZIP)

---

## File Map

| Fișier | Operație | Responsabilitate |
|---|---|---|
| `src/app/carusele/page.tsx` | Modificare | Adaugă tab state [Generator \| Agent], randează tab activ |
| `src/components/carusele/GeneratorTab.tsx` | Creare | Extrage conținutul existent din page.tsx |
| `src/components/carusele/AgentTab.tsx` | Creare | Container principal agent: chat + preview split |
| `src/components/carusele/AgentChat.tsx` | Creare | UI mesaje + input chat |
| `src/components/carusele/PreviewPanel.tsx` | Creare | Tabs: Mockup / Text / Canva export |
| `src/components/carusele/SlidesMockup.tsx` | Creare | Randare HTML slides în browser (preview) |
| `src/app/carusele/agent/actions.ts` | Creare | Server actions: proposeAngles, generateSlides, iterateSlide |
| `src/lib/carusele/slide-template.ts` | Creare | Template HTML/CSS per slide 1080×1350 |
| `src/lib/carusele/agent-types.ts` | Creare | Tipuri TypeScript shared: AgentMessage, Angle, AgentState |
| `src/app/api/carusele/render/route.ts` | Creare | POST handler: Puppeteer screenshot → Supabase Storage |

---

## Task 1: Instalare dependențe

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalează pachetele noi**

```bash
cd "built-ai-command-center"
npm install puppeteer-core @sparticuz/chromium jszip
npm install --save-dev @types/jszip
```

- [ ] **Step 2: Verifică instalarea**

```bash
node -e "require('puppeteer-core'); require('jszip'); console.log('OK')"
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add puppeteer-core, chromium, jszip deps for carousel agent"
```

---

## Task 2: Tipuri shared

**Files:**
- Create: `src/lib/carusele/agent-types.ts`

- [ ] **Step 1: Creează fișierul de tipuri**

```typescript
// src/lib/carusele/agent-types.ts

export type AgentPhase =
  | "idle"
  | "proposing_angles"
  | "awaiting_choice"
  | "generating_slides"
  | "preview"
  | "iterating"
  | "ready_to_export";

export interface Angle {
  id: "A" | "B" | "C";
  hook: string;
  direction: string;
}

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
  type: "text" | "angles" | "slides" | "slide_update";
  angles?: Angle[];
}

export interface AgentState {
  phase: AgentPhase;
  messages: AgentMessage[];
  caruselId: number | null;
  pngUrls: string[] | null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/carusele/agent-types.ts
git commit -m "feat: add agent types for carousel agent"
```

---

## Task 3: Extrage GeneratorTab

**Files:**
- Create: `src/components/carusele/GeneratorTab.tsx`
- Modify: `src/app/carusele/page.tsx`

- [ ] **Step 1: Creează GeneratorTab.tsx**

Mută tot conținutul din `src/app/carusele/page.tsx` (de la `const PILLARS` până la funcția `CaruselePage`) într-un component nou. Lasă în page.tsx doar shell-ul cu tab switching.

```typescript
// src/components/carusele/GeneratorTab.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { generateCarusel, listCarusele, type CaruselRecord } from "@/app/carusele/actions";
import type { Pillar } from "@/app/reels/actions";

const PILLARS: { id: Pillar; label: string }[] = [
  { id: "B", label: "B · Forță" }, { id: "U", label: "U · Cardio" },
  { id: "I", label: "I · Nutriție" }, { id: "L", label: "L · Lifestyle" },
  { id: "T", label: "T · Mindset" }, { id: "mix", label: "Mix" },
];

const THEMES = [
  "De ce nu slăbești deși faci sport",
  "Sistemul de 5 principii BUILT",
  "Cum arată o săptămână corectă de antrenament",
  "Nutriție fără cântar și fără obsesie",
  "Identitatea omului de sistem",
];

const STATUS_DOT: Record<string, string> = {
  draft: "bg-built-gray-text", edited: "bg-amber-500",
  posted: "bg-emerald-500", archived: "bg-built-gray-2",
};

function CaruselCard({ c }: { c: CaruselRecord }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-built-gray-1 border border-built-gray-2 rounded-sm overflow-hidden">
      <button type="button" onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-built-gray-2 transition-colors text-left">
        <div className="flex items-center gap-3">
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[c.status]}`} />
          <span className="font-condensed text-[10px] text-built-red">Pilon {c.pillar}</span>
          <span className="font-display text-base tracking-wider truncate max-w-xs">{c.hook}</span>
          <span className="font-condensed text-[10px] text-built-gray-text">{c.body?.slides?.length ?? 0} slide-uri</span>
        </div>
        <span className="text-built-gray-text text-sm">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="border-t border-built-gray-2 p-4 space-y-3">
          {(c.body?.slides ?? []).map((s) => (
            <div key={s.position} className="flex gap-4 p-3 bg-built-black border border-built-gray-2 rounded-sm">
              <span className="font-display text-2xl text-built-red/40 w-8 shrink-0">{s.position}</span>
              <div className="flex-1">
                <p className="font-display text-lg tracking-wider text-built-white mb-1">{s.title}</p>
                <p className="text-sm text-built-white/80 mb-2">{s.body}</p>
                <p className="font-condensed text-[10px] text-built-gray-text">Design: {s.design_brief}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GeneratorTab() {
  const [carusele, setCarusele] = useState<CaruselRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pillar, setPillar] = useState<Pillar>("mix");
  const [theme, setTheme] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    listCarusele().then((c) => { setCarusele(c); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  function handleGenerate() {
    const t = theme.trim() || "Sistemul bate voința";
    setError(null);
    startTransition(async () => {
      const result = await generateCarusel(pillar, t);
      if (result.ok) { setCarusele((prev) => [result.carusel, ...prev]); setTheme(""); }
      else setError(result.error);
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        {[["Total", carusele.length], ["Draft", carusele.filter(c => c.status === "draft").length], ["Postate", carusele.filter(c => c.status === "posted").length]].map(([l, v]) => (
          <div key={l as string} className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
            <p className="font-condensed text-[10px] text-built-gray-text uppercase">{l}</p>
            <p className="font-display text-3xl text-built-red mt-1">{v}</p>
          </div>
        ))}
      </div>

      <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm">
        <p className="font-condensed text-[10px] text-built-red uppercase tracking-wider mb-4">Generator</p>
        <h2 className="font-display text-2xl tracking-wider mb-6">Construiește un Carusel</h2>
        <div className="mb-5">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-2">Pilon</p>
          <div className="flex flex-wrap gap-2">
            {PILLARS.map((p) => (
              <button key={p.id} type="button" onClick={() => setPillar(p.id)}
                className={`px-3 py-1.5 border font-condensed text-xs transition-colors ${pillar === p.id ? "bg-built-red border-built-red text-built-white" : "border-built-gray-2 text-built-gray-text hover:border-built-red hover:text-built-white"}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-2">Temă</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {THEMES.map((t) => (
              <button key={t} type="button" onClick={() => setTheme(t)}
                className="px-2 py-1 border border-built-gray-2 text-built-gray-text font-condensed text-[10px] hover:border-built-red hover:text-built-white transition-colors">
                {t}
              </button>
            ))}
          </div>
          <textarea value={theme} onChange={(e) => setTheme(e.target.value)} rows={2}
            placeholder="Sau scrie tema ta..."
            className="w-full bg-built-black border border-built-gray-2 text-built-white text-sm p-3 resize-none focus:outline-none focus:border-built-red" />
        </div>
        {error && <p className="text-built-red font-condensed text-xs mb-3">{error}</p>}
        <button type="button" onClick={handleGenerate} disabled={isPending}
          className="px-6 py-3 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs disabled:opacity-50 transition-colors">
          {isPending ? "Generează... (~25s)" : "Generează Carusel →"}
        </button>
      </div>

      <div>
        <h3 className="font-condensed text-[11px] text-built-gray-text uppercase tracking-wider mb-3">Istoric ({carusele.length})</h3>
        {loading ? <p className="text-built-gray-text text-sm">Se încarcă...</p>
          : carusele.length === 0 ? <p className="text-built-gray-text text-sm">Niciun carusel generat încă.</p>
          : <div className="space-y-3">{carusele.map((c) => <CaruselCard key={c.id} c={c} />)}</div>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Rescrie page.tsx cu tab switching**

```typescript
// src/app/carusele/page.tsx
"use client";

import { useState } from "react";
import { GeneratorTab } from "@/components/carusele/GeneratorTab";
import { AgentTab } from "@/components/carusele/AgentTab";

type Tab = "generator" | "agent";

export default function CaruselePage() {
  const [activeTab, setActiveTab] = useState<Tab>("generator");

  return (
    <div className="p-8 max-w-6xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">M4 · Generator Carusele</p>
      <h1 className="font-display text-5xl tracking-[0.06em] text-built-white mb-2">CARUSELE BUILT</h1>
      <p className="text-built-gray-text mb-6">8–10 slide-uri cu text + brief de design. PNG-uri gata de Instagram.</p>

      <div className="flex gap-1 mb-8 border-b border-built-gray-2">
        {(["generator", "agent"] as Tab[]).map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 font-condensed text-xs uppercase tracking-wider transition-colors ${activeTab === tab ? "text-built-white border-b-2 border-built-red -mb-px" : "text-built-gray-text hover:text-built-white"}`}>
            {tab === "generator" ? "Generator" : "Agent ✦"}
          </button>
        ))}
      </div>

      {activeTab === "generator" ? <GeneratorTab /> : <AgentTab />}
    </div>
  );
}
```

- [ ] **Step 3: Creează placeholder AgentTab pentru că page.tsx îl importă**

```typescript
// src/components/carusele/AgentTab.tsx
"use client";

export function AgentTab() {
  return (
    <div className="text-built-gray-text text-sm">Agent în construcție...</div>
  );
}
```

- [ ] **Step 4: Verifică că pagina se încarcă fără erori**

```bash
cd "built-ai-command-center" && npm run build 2>&1 | tail -20
```
Expected: no TypeScript errors, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/carusele/page.tsx src/components/carusele/GeneratorTab.tsx src/components/carusele/AgentTab.tsx
git commit -m "feat: add tab switching to /carusele (Generator / Agent)"
```

---

## Task 4: Server actions — Agent conversație

**Files:**
- Create: `src/app/carusele/agent/actions.ts`

- [ ] **Step 1: Creează actions.ts pentru agent**

```typescript
// src/app/carusele/agent/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";
import type { Angle } from "@/lib/carusele/agent-types";
import type { CaruselSlide, CaruselBody, CaruselRecord } from "@/app/carusele/actions";
import type { Pillar } from "@/app/reels/actions";

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const fenced = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fenced) return JSON.parse(fenced[1]);
  const a = trimmed.indexOf("{"), b = trimmed.lastIndexOf("}");
  if (a !== -1 && b > a) return JSON.parse(trimmed.slice(a, b + 1));
  throw new Error("Nu am găsit JSON în răspuns.");
}

const AGENT_TASK_CONTEXT = `Ești agentul de carusele BUILT. Conduci o conversație structurată pentru a crea carusele Instagram de calitate.

IMPORTANT: Răspunde EXCLUSIV cu JSON valid. Niciun text în afara JSON-ului.

Când propui unghiuri (după o idee brută de la Claudiu):
{
  "type": "angles",
  "angles": [
    { "id": "A", "hook": "titlul propus pentru slide 1 (max 8 cuvinte)", "direction": "direcția caruselului în 1 frază" },
    { "id": "B", "hook": "...", "direction": "..." },
    { "id": "C", "hook": "...", "direction": "..." }
  ]
}

Când generezi slide-uri (după alegerea unghiului):
{
  "type": "slides",
  "pillar": "B|U|I|L|T|mix",
  "slides": [
    { "position": 1, "title": "max 6 cuvinte", "body": "1-3 propoziții cu valoare densă", "design_brief": "instrucțiuni Canva scurte" }
  ]
}

Slide 1 = HOOK (declarație contraintuitivă)
Slide 2 = PROBLEMĂ (validezi situația)
Slide 3-6 = SISTEM (pași sau principii BUILT, specificitate extremă)
Slide 7 = APLICARE (cum aplici azi, concret)
Slide 8 = REFRAME (credința falsă → adevărul BUILT)
Slide 9 = CTA (o singură acțiune, ton diagnostic)

Când iterezi un slide specific:
{
  "type": "slide_update",
  "position": <numărul slide-ului>,
  "slide": { "position": <nr>, "title": "...", "body": "...", "design_brief": "..." }
}

Culori design: fond #0A0A0A, accent #C0392B, text #F5F5F5. Font titlu: Bebas Neue. Font body: Barlow.
Zero clișee. Zero generic. Fiecare slide justifică că există.`;

export type ProposeAnglesResult =
  | { ok: true; angles: Angle[] }
  | { ok: false; error: string };

export async function proposeAngles(idea: string): Promise<ProposeAnglesResult> {
  if (idea.trim().length < 5) return { ok: false, error: "Ideea e prea scurtă. Descrie în cel puțin o propoziție." };

  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({
      creierJson: JSON.stringify(creier, null, 2),
      taskContext: AGENT_TASK_CONTEXT,
    });

    const message = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 800,
      system: systemBlocks,
      messages: [{ role: "user", content: `Ideea mea pentru un carusel: "${idea.trim()}"\n\nPropune 3 unghiuri. JSON strict.` }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns AI fără text." };

    const parsed = extractJson(textBlock.text) as { type: string; angles: Angle[] };
    if (parsed.type !== "angles" || !Array.isArray(parsed.angles)) return { ok: false, error: "Format invalid de la AI." };

    return { ok: true, angles: parsed.angles };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare necunoscută." };
  }
}

export type GenerateFromAngleResult =
  | { ok: true; carusel: CaruselRecord }
  | { ok: false; error: string };

export async function generateFromAngle(
  angle: Angle,
  originalIdea: string
): Promise<GenerateFromAngleResult> {
  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({
      creierJson: JSON.stringify(creier, null, 2),
      taskContext: AGENT_TASK_CONTEXT,
    });

    const message = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 2000,
      system: systemBlocks,
      messages: [
        { role: "user", content: `Ideea originală: "${originalIdea}"\n\nUnghiul ales: ${angle.id}) Hook: "${angle.hook}" — Direcție: "${angle.direction}"\n\nGenerează toate slide-urile (8-9). JSON strict.` },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns AI fără text." };

    const parsed = extractJson(textBlock.text) as { type: string; pillar: Pillar; slides: CaruselSlide[] };
    if (parsed.type !== "slides" || !Array.isArray(parsed.slides)) return { ok: false, error: "Format invalid de la AI." };

    const slides: CaruselSlide[] = parsed.slides.map((s, i) => ({
      position: typeof s.position === "number" ? s.position : i + 1,
      title: String(s.title ?? ""),
      body: String(s.body ?? ""),
      design_brief: String(s.design_brief ?? ""),
    }));

    const pillar: Pillar = (["B", "U", "I", "L", "T", "mix"] as Pillar[]).includes(parsed.pillar) ? parsed.pillar : "mix";

    const body: CaruselBody = {
      theme: originalIdea,
      pillar,
      slides,
      generated_at: new Date().toISOString(),
      model_used: MODELS.routine,
    };

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("generated_outputs")
      .insert({ module: "M4_carusel", pillar, hook: slides[0]?.title ?? "", body, status: "draft" })
      .select()
      .single();

    if (error) return { ok: false, error: `Supabase: ${error.message}` };

    revalidatePath("/carusele");
    return {
      ok: true,
      carusel: {
        id: data.id,
        pillar: data.pillar as Pillar,
        hook: data.hook,
        body: data.body as CaruselBody,
        status: data.status,
        scheduled_for: data.scheduled_for,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare necunoscută." };
  }
}

export type IterateSlideResult =
  | { ok: true; slide: CaruselSlide }
  | { ok: false; error: string };

export async function iterateSlide(
  caruselId: number,
  position: number,
  instruction: string,
  currentSlide: CaruselSlide
): Promise<IterateSlideResult> {
  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({
      creierJson: JSON.stringify(creier, null, 2),
      taskContext: AGENT_TASK_CONTEXT,
    });

    const message = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 400,
      system: systemBlocks,
      messages: [
        {
          role: "user",
          content: `Slide ${position} curent:\nTitlu: "${currentSlide.title}"\nBody: "${currentSlide.body}"\nDesign brief: "${currentSlide.design_brief}"\n\nModificare cerută: "${instruction}"\n\nRegenerează DOAR acest slide. JSON strict cu type="slide_update".`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns AI fără text." };

    const parsed = extractJson(textBlock.text) as { type: string; position: number; slide: CaruselSlide };
    if (parsed.type !== "slide_update" || !parsed.slide) return { ok: false, error: "Format invalid de la AI." };

    const updatedSlide: CaruselSlide = {
      position,
      title: String(parsed.slide.title ?? currentSlide.title),
      body: String(parsed.slide.body ?? currentSlide.body),
      design_brief: String(parsed.slide.design_brief ?? currentSlide.design_brief),
    };

    // Actualizează slide-ul în Supabase
    const supabase = getSupabaseServer();
    const { data: existing } = await supabase
      .from("generated_outputs")
      .select("body")
      .eq("id", caruselId)
      .single();

    if (existing) {
      const body = existing.body as CaruselBody;
      const updatedSlides = body.slides.map((s) => s.position === position ? updatedSlide : s);
      await supabase
        .from("generated_outputs")
        .update({ body: { ...body, slides: updatedSlides }, updated_at: new Date().toISOString() })
        .eq("id", caruselId);
    }

    return { ok: true, slide: updatedSlide };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare necunoscută." };
  }
}
```

- [ ] **Step 2: Verifică TypeScript**

```bash
cd "built-ai-command-center" && npx tsc --noEmit 2>&1 | grep -E "error|warning" | head -20
```
Expected: 0 erori TypeScript.

- [ ] **Step 3: Commit**

```bash
git add src/app/carusele/agent/actions.ts
git commit -m "feat: add agent server actions (proposeAngles, generateFromAngle, iterateSlide)"
```

---

## Task 5: HTML slide template

**Files:**
- Create: `src/lib/carusele/slide-template.ts`

- [ ] **Step 1: Creează template-ul HTML per slide**

```typescript
// src/lib/carusele/slide-template.ts

import type { CaruselSlide } from "@/app/carusele/actions";

export function buildSlideHtml(slide: CaruselSlide, totalSlides: number): string {
  const isCta = slide.position === totalSlides;
  const isHook = slide.position === 1;

  const bgColor = isCta ? "#C0392B" : "#0A0A0A";
  const titleColor = isCta ? "#F5F5F5" : (isHook ? "#C0392B" : "#F5F5F5");
  const bodyColor = isCta ? "rgba(245,245,245,0.9)" : "rgba(245,245,245,0.75)";
  const titleSize = isHook ? "96px" : "72px";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px;
    height: 1350px;
    background: ${bgColor};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 80px 90px;
    font-family: 'Barlow', sans-serif;
    overflow: hidden;
  }
  .top-bar {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    color: ${isCta ? "#F5F5F5" : "#C0392B"};
    letter-spacing: 4px;
  }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 40px;
  }
  .title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: ${titleSize};
    color: ${titleColor};
    line-height: 1.0;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .divider {
    width: 60px;
    height: 3px;
    background: ${isCta ? "#F5F5F5" : "#C0392B"};
  }
  .body-text {
    font-size: 38px;
    color: ${bodyColor};
    line-height: 1.5;
    font-weight: 400;
    max-width: 900px;
  }
  .bottom-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .slide-number {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    color: rgba(245,245,245,0.3);
    letter-spacing: 3px;
  }
  .handle {
    font-family: 'Barlow', sans-serif;
    font-size: 22px;
    color: rgba(245,245,245,0.4);
    font-weight: 500;
    letter-spacing: 1px;
  }
</style>
</head>
<body>
  <div class="top-bar">
    <span class="logo">BUILT</span>
  </div>
  <div class="content">
    <h1 class="title">${escapeHtml(slide.title)}</h1>
    <div class="divider"></div>
    <p class="body-text">${escapeHtml(slide.body).replace(/\n/g, "<br>")}</p>
  </div>
  <div class="bottom-bar">
    <span class="slide-number">${String(slide.position).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}</span>
    <span class="handle">@iordacheclaudiu_</span>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/carusele/slide-template.ts
git commit -m "feat: add HTML slide template 1080x1350 BUILT brand"
```

---

## Task 6: API route Puppeteer render

**Files:**
- Create: `src/app/api/carusele/render/route.ts`

- [ ] **Step 1: Creează API route-ul**

```typescript
// src/app/api/carusele/render/route.ts
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { getSupabaseServer } from "@/lib/supabase/server";
import { buildSlideHtml } from "@/lib/carusele/slide-template";
import type { CaruselBody, CaruselSlide } from "@/app/carusele/actions";

export async function POST(req: NextRequest) {
  let body: { caruselId: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body invalid." }, { status: 400 });
  }

  const { caruselId } = body;
  if (!caruselId || typeof caruselId !== "number") {
    return NextResponse.json({ error: "caruselId lipsește." }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  const { data: record, error: dbError } = await supabase
    .from("generated_outputs")
    .select("body")
    .eq("id", caruselId)
    .single();

  if (dbError || !record) {
    return NextResponse.json({ error: "Carusel negăsit." }, { status: 404 });
  }

  const caruselBody = record.body as CaruselBody;
  const slides: CaruselSlide[] = caruselBody.slides;

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1080, height: 1350 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const pngUrls: string[] = [];

    for (const slide of slides) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1350 });
      const html = buildSlideHtml(slide, slides.length);
      await page.setContent(html, { waitUntil: "networkidle0" });
      // Așteaptă font-urile să se încarce
      await page.waitForFunction(() => document.fonts.ready);
      const buffer = await page.screenshot({ type: "png" });
      await page.close();

      const fileName = `${caruselId}/slide_${String(slide.position).padStart(2, "0")}.png`;
      const { error: uploadError } = await supabase.storage
        .from("carusele-png")
        .upload(fileName, buffer, { contentType: "image/png", upsert: true });

      if (uploadError) {
        return NextResponse.json({ error: `Upload eșuat slide ${slide.position}: ${uploadError.message}` }, { status: 500 });
      }

      const { data: publicUrl } = supabase.storage
        .from("carusele-png")
        .getPublicUrl(fileName);

      pngUrls.push(publicUrl.publicUrl);
    }

    // Salvează URL-urile PNG în Supabase
    await supabase
      .from("generated_outputs")
      .update({ png_urls: pngUrls, updated_at: new Date().toISOString() })
      .eq("id", caruselId);

    return NextResponse.json({ ok: true, pngUrls });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Eroare Puppeteer." }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
```

- [ ] **Step 2: Adaugă coloana `png_urls` în Supabase**

Rulează în Supabase SQL Editor:
```sql
ALTER TABLE generated_outputs
ADD COLUMN IF NOT EXISTS png_urls jsonb DEFAULT NULL;
```

- [ ] **Step 3: Creează bucket Supabase Storage**

În Supabase Dashboard → Storage → New bucket:
- Name: `carusele-png`
- Public: `true`

- [ ] **Step 4: Verifică TypeScript**

```bash
cd "built-ai-command-center" && npx tsc --noEmit 2>&1 | grep "error" | head -10
```
Expected: 0 erori.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/carusele/render/route.ts
git commit -m "feat: add Puppeteer render API route for carousel PNG generation"
```

---

## Task 7: Preview Panel — Text + Canva export

**Files:**
- Create: `src/components/carusele/PreviewPanel.tsx`

- [ ] **Step 1: Creează PreviewPanel**

```typescript
// src/components/carusele/PreviewPanel.tsx
"use client";

import { useState } from "react";
import type { CaruselSlide } from "@/app/carusele/actions";

type PreviewMode = "text" | "mockup" | "canva";

interface PreviewPanelProps {
  slides: CaruselSlide[];
  caruselId: number | null;
  onPngGenerated: (urls: string[]) => void;
}

export function PreviewPanel({ slides, caruselId, onPngGenerated }: PreviewPanelProps) {
  const [mode, setMode] = useState<PreviewMode>("text");
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [pngUrls, setPngUrls] = useState<string[]>([]);

  async function handleGeneratePngs() {
    if (!caruselId) return;
    setIsRendering(true);
    setRenderError(null);
    try {
      const res = await fetch("/api/carusele/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caruselId }),
      });
      const data = await res.json();
      if (data.ok) {
        setPngUrls(data.pngUrls);
        onPngGenerated(data.pngUrls);
      } else {
        setRenderError(data.error ?? "Eroare necunoscută.");
      }
    } catch (e) {
      setRenderError(e instanceof Error ? e.message : "Eroare rețea.");
    } finally {
      setIsRendering(false);
    }
  }

  async function handleDownloadZip() {
    if (!pngUrls.length) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const folder = zip.folder("carusel-built") ?? zip;

    await Promise.all(
      pngUrls.map(async (url, i) => {
        const res = await fetch(url);
        const blob = await res.blob();
        folder.file(`slide_${String(i + 1).padStart(2, "0")}.png`, blob);
      })
    );

    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `carusel-built-${caruselId}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const canvaText = slides
    .map((s) => `SLIDE ${s.position}\nTitlu: ${s.title}\n${s.body}\n---`)
    .join("\n\n");

  if (!slides.length) {
    return (
      <div className="flex items-center justify-center h-full text-built-gray-text text-sm">
        Preview apare după generare.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Mode tabs */}
      <div className="flex gap-1 border-b border-built-gray-2">
        {(["text", "mockup", "canva"] as PreviewMode[]).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`px-4 py-2 font-condensed text-[10px] uppercase tracking-wider transition-colors ${mode === m ? "text-built-white border-b border-built-red -mb-px" : "text-built-gray-text hover:text-built-white"}`}>
            {m === "text" ? "Text" : m === "mockup" ? "Mockup" : "Canva Export"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {mode === "text" && (
          <div className="space-y-3">
            {slides.map((s) => (
              <div key={s.position} className="flex gap-4 p-3 bg-built-black border border-built-gray-2 rounded-sm">
                <span className="font-display text-2xl text-built-red/40 w-8 shrink-0">{s.position}</span>
                <div className="flex-1">
                  <p className="font-display text-lg tracking-wider text-built-white mb-1">{s.title}</p>
                  <p className="text-sm text-built-white/80 mb-2">{s.body}</p>
                  <p className="font-condensed text-[10px] text-built-gray-text">Design: {s.design_brief}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {mode === "mockup" && (
          <div className="space-y-4">
            {slides.map((s) => (
              <SlidePreviewCard key={s.position} slide={s} totalSlides={slides.length} />
            ))}
          </div>
        )}

        {mode === "canva" && (
          <div className="relative">
            <button type="button"
              onClick={() => navigator.clipboard.writeText(canvaText)}
              className="absolute top-2 right-2 px-3 py-1 bg-built-gray-2 text-built-gray-text font-condensed text-[10px] hover:text-built-white transition-colors">
              Copy All
            </button>
            <pre className="bg-built-black border border-built-gray-2 p-4 text-sm text-built-white/80 whitespace-pre-wrap font-mono text-xs leading-relaxed">
              {canvaText}
            </pre>
          </div>
        )}
      </div>

      {/* Export buttons */}
      <div className="border-t border-built-gray-2 pt-4 space-y-2">
        {renderError && <p className="text-built-red font-condensed text-[10px]">{renderError}</p>}
        {pngUrls.length > 0 ? (
          <button type="button" onClick={handleDownloadZip}
            className="w-full px-4 py-3 bg-emerald-700 hover:bg-emerald-600 text-built-white font-condensed text-xs transition-colors">
            ↓ Descarcă ZIP ({pngUrls.length} PNG-uri)
          </button>
        ) : (
          <button type="button" onClick={handleGeneratePngs}
            disabled={isRendering || !caruselId}
            className="w-full px-4 py-3 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs disabled:opacity-50 transition-colors">
            {isRendering ? "Generează PNG-uri... (~30s)" : "Generează PNG-uri gata de Instagram →"}
          </button>
        )}
      </div>
    </div>
  );
}

function SlidePreviewCard({ slide, totalSlides }: { slide: CaruselSlide; totalSlides: number }) {
  const isCta = slide.position === totalSlides;
  const isHook = slide.position === 1;

  return (
    <div
      className="w-full rounded-sm overflow-hidden"
      style={{
        aspectRatio: "1080/1350",
        background: isCta ? "#C0392B" : "#0A0A0A",
        border: "1px solid #2a2a2a",
        padding: "7% 8%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
      <span style={{ fontFamily: "monospace", fontSize: "clamp(10px, 1.5vw, 14px)", color: isCta ? "#F5F5F5" : "#C0392B", letterSpacing: "0.2em" }}>BUILT</span>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "5%" }}>
        <p style={{
          fontFamily: "Georgia, serif",
          fontSize: isHook ? "clamp(18px, 3.5vw, 32px)" : "clamp(14px, 2.8vw, 26px)",
          color: isCta ? "#F5F5F5" : (isHook ? "#C0392B" : "#F5F5F5"),
          lineHeight: 1.1,
          textTransform: "uppercase",
          fontWeight: "bold",
        }}>{slide.title}</p>
        <div style={{ width: "10%", height: "2px", background: isCta ? "#F5F5F5" : "#C0392B" }} />
        <p style={{ fontSize: "clamp(10px, 1.6vw, 14px)", color: isCta ? "rgba(245,245,245,0.9)" : "rgba(245,245,245,0.75)", lineHeight: 1.5 }}>{slide.body}</p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "clamp(8px, 1vw, 11px)", color: "rgba(245,245,245,0.3)" }}>
          {String(slide.position).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
        </span>
        <span style={{ fontSize: "clamp(8px, 1vw, 11px)", color: "rgba(245,245,245,0.4)" }}>@iordacheclaudiu_</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/carusele/PreviewPanel.tsx
git commit -m "feat: add PreviewPanel (text/mockup/canva) + PNG generation + ZIP download"
```

---

## Task 8: Chat UI component

**Files:**
- Create: `src/components/carusele/AgentChat.tsx`

- [ ] **Step 1: Creează AgentChat.tsx**

```typescript
// src/components/carusele/AgentChat.tsx
"use client";

import { useRef, useEffect } from "react";
import type { AgentMessage, Angle } from "@/lib/carusele/agent-types";

interface AgentChatProps {
  messages: AgentMessage[];
  onSend: (text: string) => void;
  onSelectAngle: (angle: Angle) => void;
  isLoading: boolean;
  inputValue: string;
  onInputChange: (v: string) => void;
  phase: string;
}

export function AgentChat({ messages, onSend, onSelectAngle, isLoading, inputValue, onInputChange, phase }: AgentChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isLoading) onSend(inputValue.trim());
    }
  }

  const placeholder =
    phase === "idle" ? "Descrie ideea ta pentru carusel..." :
    phase === "awaiting_choice" ? "Scrie A, B sau C (sau descrie ajustarea)..." :
    "Spune ce vrei să schimbi...";

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="text-built-gray-text text-sm">
            <p className="mb-2">Descrie ideea ta pentru carusel.</p>
            <p className="font-condensed text-[10px]">Exemplu: "vreau ceva despre cortizol și grăsime abdominală"</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.type === "angles" && msg.angles ? (
              <div className="bg-built-gray-1 border border-built-gray-2 rounded-sm p-4 max-w-full w-full space-y-3">
                <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider">3 unghiuri propuse — alege unul:</p>
                {msg.angles.map((angle) => (
                  <button key={angle.id} type="button" onClick={() => onSelectAngle(angle)}
                    className="w-full text-left p-3 border border-built-gray-2 hover:border-built-red transition-colors group">
                    <span className="font-display text-built-red text-lg mr-2">{angle.id}</span>
                    <span className="font-display text-base tracking-wider text-built-white group-hover:text-built-white">{angle.hook}</span>
                    <p className="font-condensed text-[10px] text-built-gray-text mt-1">{angle.direction}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className={`max-w-[85%] px-4 py-3 rounded-sm text-sm ${msg.role === "user" ? "bg-built-red text-built-white" : "bg-built-gray-1 border border-built-gray-2 text-built-white/90"}`}>
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-built-gray-1 border border-built-gray-2 px-4 py-3 rounded-sm">
              <span className="font-condensed text-[10px] text-built-gray-text">Generează...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-built-gray-2 pt-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-built-black border border-built-gray-2 text-built-white text-sm p-3 resize-none focus:outline-none focus:border-built-red disabled:opacity-50"
          />
          <button type="button"
            onClick={() => { if (inputValue.trim() && !isLoading) onSend(inputValue.trim()); }}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs disabled:opacity-50 transition-colors self-end">
            →
          </button>
        </div>
        <p className="font-condensed text-[9px] text-built-gray-text mt-1">Enter = trimite · Shift+Enter = linie nouă</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/carusele/AgentChat.tsx
git commit -m "feat: add AgentChat component"
```

---

## Task 9: AgentTab — conectare completă

**Files:**
- Modify: `src/components/carusele/AgentTab.tsx`

- [ ] **Step 1: Înlocuiește placeholder-ul cu AgentTab complet**

```typescript
// src/components/carusele/AgentTab.tsx
"use client";

import { useState, useTransition } from "react";
import { AgentChat } from "@/components/carusele/AgentChat";
import { PreviewPanel } from "@/components/carusele/PreviewPanel";
import { proposeAngles, generateFromAngle, iterateSlide } from "@/app/carusele/agent/actions";
import type { AgentMessage, AgentPhase, AgentState, Angle } from "@/lib/carusele/agent-types";
import type { CaruselSlide } from "@/app/carusele/actions";

const INITIAL_STATE: AgentState = {
  phase: "idle",
  messages: [],
  caruselId: null,
  pngUrls: null,
};

export function AgentTab() {
  const [state, setState] = useState<AgentState>(INITIAL_STATE);
  const [slides, setSlides] = useState<CaruselSlide[]>([]);
  const [originalIdea, setOriginalIdea] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();

  function addMessage(msg: AgentMessage) {
    setState((prev) => ({ ...prev, messages: [...prev.messages, msg] }));
  }

  function setPhase(phase: AgentPhase) {
    setState((prev) => ({ ...prev, phase }));
  }

  function handleSend(text: string) {
    setInputValue("");
    addMessage({ role: "user", content: text, type: "text" });

    const { phase } = state;

    if (phase === "idle") {
      setOriginalIdea(text);
      setPhase("proposing_angles");
      startTransition(async () => {
        const result = await proposeAngles(text);
        if (result.ok) {
          addMessage({ role: "assistant", content: "", type: "angles", angles: result.angles });
          setPhase("awaiting_choice");
        } else {
          addMessage({ role: "assistant", content: `Eroare: ${result.error}`, type: "text" });
          setPhase("idle");
        }
      });
    } else if (phase === "preview" || phase === "iterating") {
      // Extrage numărul slide-ului din instrucțiune dacă menționat
      const match = text.match(/slide\s*(\d+)/i);
      const position = match ? parseInt(match[1]) : null;
      const targetSlide = position ? slides.find((s) => s.position === position) : null;

      if (targetSlide && state.caruselId) {
        setPhase("iterating");
        startTransition(async () => {
          const result = await iterateSlide(state.caruselId!, targetSlide.position, text, targetSlide);
          if (result.ok) {
            setSlides((prev) => prev.map((s) => s.position === result.slide.position ? result.slide : s));
            addMessage({ role: "assistant", content: `Slide ${result.slide.position} actualizat. Preview la dreapta.`, type: "text" });
            setPhase("preview");
          } else {
            addMessage({ role: "assistant", content: `Eroare: ${result.error}`, type: "text" });
            setPhase("preview");
          }
        });
      } else {
        addMessage({ role: "assistant", content: "Specifică numărul slide-ului. Ex: 'slide 3 e prea lung'", type: "text" });
      }
    }
  }

  function handleSelectAngle(angle: Angle) {
    addMessage({ role: "user", content: `Am ales: ${angle.id}) ${angle.hook}`, type: "text" });
    setPhase("generating_slides");

    startTransition(async () => {
      const result = await generateFromAngle(angle, originalIdea);
      if (result.ok) {
        setSlides(result.carusel.body.slides);
        setState((prev) => ({ ...prev, caruselId: result.carusel.id, phase: "preview" }));
        addMessage({
          role: "assistant",
          content: `${result.carusel.body.slides.length} slide-uri generate. Vezi preview la dreapta. Dacă vrei să schimbi ceva, scrie ex: "slide 3 e prea lung".`,
          type: "text",
        });
      } else {
        addMessage({ role: "assistant", content: `Eroare: ${result.error}`, type: "text" });
        setPhase("awaiting_choice");
      }
    });
  }

  function handleReset() {
    setState(INITIAL_STATE);
    setSlides([]);
    setOriginalIdea("");
    setInputValue("");
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Chat — stânga */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <p className="font-condensed text-[10px] text-built-red uppercase tracking-wider">Agent Carusel</p>
          {state.phase !== "idle" && (
            <button type="button" onClick={handleReset}
              className="font-condensed text-[10px] text-built-gray-text hover:text-built-white transition-colors">
              ↺ Carusel nou
            </button>
          )}
        </div>
        <AgentChat
          messages={state.messages}
          onSend={handleSend}
          onSelectAngle={handleSelectAngle}
          isLoading={isPending}
          inputValue={inputValue}
          onInputChange={setInputValue}
          phase={state.phase}
        />
      </div>

      {/* Preview — dreapta */}
      <div className="w-[420px] flex-shrink-0 flex flex-col">
        <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-4">Preview</p>
        <div className="flex-1 min-h-0">
          <PreviewPanel
            slides={slides}
            caruselId={state.caruselId}
            onPngGenerated={(urls) => setState((prev) => ({ ...prev, pngUrls: urls }))}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verifică TypeScript**

```bash
cd "built-ai-command-center" && npx tsc --noEmit 2>&1 | grep "error" | head -20
```
Expected: 0 erori.

- [ ] **Step 3: Commit**

```bash
git add src/components/carusele/AgentTab.tsx
git commit -m "feat: complete AgentTab with full conversational flow"
```

---

## Task 10: Verificare finală + build

**Files:** —

- [ ] **Step 1: Build complet**

```bash
cd "built-ai-command-center" && npm run build 2>&1 | tail -30
```
Expected: `✓ Compiled successfully`

- [ ] **Step 2: Verifică că `/carusele` se încarcă în browser**

```bash
cd "built-ai-command-center" && npm run dev &
sleep 5 && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/carusele
```
Expected: `200`

- [ ] **Step 3: Testează fluxul complet manual**
1. Deschide `http://localhost:3000/carusele`
2. Click tab "Agent ✦"
3. Scrie o idee (ex: "cortizol și grăsime abdominală")
4. Verifică că apar 3 unghiuri
5. Click pe un unghi
6. Verifică că apar slide-urile în preview Text
7. Click Mockup → verifică că slide-urile se randează vizual
8. Click Canva Export → verifică că textul e copiat corect
9. Click "Generează PNG-uri" → verifică că Puppeteer rulează
10. Verifică download ZIP

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "feat: carousel agent complete — conversational flow + preview + PNG export"
```

---

## Posibile probleme și soluții

| Problemă | Soluție |
|---|---|
| `@sparticuz/chromium` nu găsește binar pe macOS local | Folosește `puppeteer` în loc de `puppeteer-core` în development. Adaugă flag: `executablePath: process.env.NODE_ENV === "production" ? await chromium.executablePath() : undefined` |
| Font-urile Google Fonts nu se încarcă în Puppeteer (offline) | Adaugă fonturile ca base64 în HTML template sau folosește system fonts ca fallback |
| Timeout Puppeteer pe slide-uri multe | Mărește timeout: `page.setDefaultTimeout(30000)` |
| `png_urls` coloană lipsă din Supabase | Rulează SQL din Task 6 Step 2 |
| Build eșuează din cauza `puppeteer-core` (server-only) | Asigură-te că `route.ts` nu e importat în client components |
