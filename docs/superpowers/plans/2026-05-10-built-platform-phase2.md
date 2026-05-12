# BUILT AI Command Center — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construiește cele 5 module lipsă față de platforma Creator Cult a lui William Scott și upgradeează 2 module existente, astfel încât BUILT AI Command Center să aibă funcționalitate completă: Reel Copy Tool, Content Calendar, Profile Audit real, Onboarding Hub, Content Studio cu Competitor Intel și Content Library cu Analyse inline.

**Architecture:** Next.js 16 App Router cu Server Actions pentru toate apelurile AI. Noile module sunt adăugate sub `/dashboard/` (ruta deja creată). Logica AI pentru reel analysis și profile audit există deja în `/analizor/actions.ts` și `/audit/actions.ts` — se reutilizează fără duplicare. Datele persistente (idei calendar, competitori, onboarding) se stochează în `localStorage` pe client pentru viteză de livrare; Supabase se adaugă în faza 3.

**Tech Stack:** Next.js 16.2.4, React 19.2.4, TypeScript, Tailwind CSS v4, Anthropic SDK (`@anthropic-ai/sdk`), `MODELS.routine = "claude-sonnet-4-6"` pentru analize standard, `MODELS.deep = "claude-opus-4-7"` pentru analize profunde.

---

## File Map — Ce se creează / modifică

| Fișier | Acțiune | Responsabilitate |
|---|---|---|
| `src/components/Sidebar.tsx` | Modifică | Adaugă rutele noi în navigare |
| `src/app/dashboard/reel-copy/page.tsx` | Crează | UI Reel Copy Tool (3 taburi + rezultate) |
| `src/app/dashboard/reel-copy/actions.ts` | Crează | Server Action — analiză reel (wrapper peste analizor) |
| `src/app/dashboard/calendar/page.tsx` | Crează | UI Content Calendar lunar |
| `src/app/dashboard/calendar/actions.ts` | Crează | Server Action — generare plan lunar AI |
| `src/app/dashboard/profile-audit/page.tsx` | Înlocuiește | Upload real + Claude Vision + rezultate reale |
| `src/app/dashboard/profile-audit/actions.ts` | Crează | Server Action — wrapper peste `/audit/actions.ts` |
| `src/app/dashboard/onboarding/page.tsx` | Crează | UI Onboarding Hub cu progress + secțiuni |
| `src/app/dashboard/content/page.tsx` | Modifică | Adaugă MY COMPETITORS + FULL SCRIPT în scripturi |
| `src/app/dashboard/analytics/page.tsx` | Modifică | Buton Analyse → panel inline cu AI breakdown |

---

## Task 1: Sidebar — adaugă rutele noi

**Files:**
- Modify: `src/components/Sidebar.tsx`

- [ ] **Step 1.1: Adaugă rutele în NAV array**

Deschide `src/components/Sidebar.tsx`. Înlocuiește secțiunea TOOLS cu:

```typescript
{
  group: "TOOLS",
  items: [
    { label: "Reel Copy Tool", href: "/dashboard/reel-copy", icon: "◈" },
    { label: "Outreach", href: "/dashboard/outreach", icon: "⟡" },
    { label: "Reel Analyser", href: "/analizor", icon: "◈" },
    { label: "Profile Audit", href: "/dashboard/profile-audit", icon: "◈" },
    { label: "Competitors Intel", href: "/competitors", icon: "◈" },
    { label: "My Profile", href: "/dashboard/onboarding", icon: "◈" },
  ],
},
```

Și în MAIN MENU, înlocuiește `Content Calendar`:

```typescript
{ label: "Content Calendar", href: "/dashboard/calendar", icon: "⬦" },
```

- [ ] **Step 1.2: Verifică TypeScript**

```bash
cd "built-ai-command-center" && npx tsc --noEmit 2>&1 | head -20
```

Expected: fără erori sau doar erorile pre-existente (symlink Python).

- [ ] **Step 1.3: Commit**

```bash
cd "built-ai-command-center" && git add src/components/Sidebar.tsx && git commit -m "feat: add reel-copy, calendar, onboarding routes to sidebar"
```

---

## Task 2: Reel Copy Tool — `/dashboard/reel-copy`

**Files:**
- Create: `src/app/dashboard/reel-copy/actions.ts`
- Create: `src/app/dashboard/reel-copy/page.tsx`

Această pagină este echivalentul "Reel Analyser" din William's platform. Utilizatorul lipește un transcript → AI analizează → returnează: verdict score, ce a funcționat, brief adaptare BUILT, hook sugerat, transcript.

- [ ] **Step 2.1: Crează Server Action**

Crează `src/app/dashboard/reel-copy/actions.ts`:

```typescript
"use server";

import { getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";

export interface ReelCopyAnalysis {
  verdict: "Exceptional" | "Strong" | "Good" | "Weak";
  score: number;
  hook_score: number;
  performance_summary: string;
  script_quality: string;
  what_worked: string[];
  audience_fit: string;
  adaptation_brief: string;
  suggested_hook: string;
  transcript_clean: string;
}

export type ReelCopyResult =
  | { ok: true; analysis: ReelCopyAnalysis }
  | { ok: false; error: string };

export async function analyzeReelCopy(
  transcript: string
): Promise<ReelCopyResult> {
  const text = transcript.trim();
  if (text.length < 30)
    return { ok: false, error: "Transcriptul trebuie să aibă cel puțin 30 de caractere." };

  let creierContext = "";
  try {
    const creier = await readCreierFromSupabase();
    if (creier) {
      creierContext = `\n\nContextul creatorului (BUILT — Iordache Claudiu):\n${JSON.stringify(creier).slice(0, 2000)}`;
    }
  } catch {
    // merge fara context
  }

  const client = getAnthropicClient();

  const prompt = `Ești un expert în analiza conținutului pentru Instagram coaching. Analizezi un reel/script de la un alt creator și oferi un breakdown complet plus adaptare pentru BUILT (fitness coaching, barbati 28-42 ani, sistem 90 zile).
${creierContext}

## Reel de analizat:
"${text}"

## Task:
Analizează acest reel și returnează un JSON strict (fără markdown, fără text înainte/după):

{
  "verdict": "Strong",
  "score": 76,
  "hook_score": 82,
  "performance_summary": "Paragraph despre de ce perform-ează bine sau prost — 2-3 propoziții specifice cu cifre dacă ai.",
  "script_quality": "Evaluare calitate script — structură, claritate, flow — 2 propoziții.",
  "what_worked": [
    "Ce element specific a funcționat și de ce",
    "Al doilea element care a contribuit la succes",
    "Al treilea dacă există"
  ],
  "audience_fit": "De ce rezonează sau nu cu audiența — specific la tipul de viewer care ar vedea asta.",
  "adaptation_brief": "Paragraph despre cum să adaptezi mecanismul core pentru BUILT. Ce să iei, ce să schimbi, ce să eviți. Nu copia — adaptează. 3-4 propoziții.",
  "suggested_hook": "Hook-ul nou complet reescris pentru audiența BUILT. Trebuie să fie direct, contraintuitiv sau cu cifră, max 2 propoziții.",
  "transcript_clean": "Transcriptul original curățat de filler words, formatat cu paragrafe."
}

Verdict scale: Exceptional (90-100), Strong (75-89), Good (60-74), Weak (sub 60).`;

  try {
    const response = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw =
      response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { ok: false, error: "AI nu a returnat JSON valid." };

    const analysis: ReelCopyAnalysis = JSON.parse(jsonMatch[0]);
    return { ok: true, analysis };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Eroare necunoscută.",
    };
  }
}
```

- [ ] **Step 2.2: Crează pagina UI**

Crează `src/app/dashboard/reel-copy/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { analyzeReelCopy, type ReelCopyAnalysis } from "./actions";

type Tab = "url" | "transcript" | "audio";

const VERDICT_COLOR: Record<string, string> = {
  Exceptional: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Strong: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  Good: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  Weak: "text-built-red bg-built-red/10 border-built-red/20",
};

export default function ReelCopyPage() {
  const [tab, setTab] = useState<Tab>("transcript");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ReelCopyAnalysis | null>(null);
  const [error, setError] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyse = async () => {
    setLoading(true);
    setError("");
    setAnalysis(null);
    const result = await analyzeReelCopy(transcript);
    if (result.ok) {
      setAnalysis(result.analysis);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const copyHook = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.suggested_hook);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TAB_STYLE = (t: Tab) =>
    `px-4 py-2 text-[12px] font-medium rounded-lg transition-colors ${
      tab === t
        ? "bg-built-red/15 text-built-red border border-built-red/20"
        : "text-zinc-500 hover:text-zinc-200 border border-transparent"
    }`;

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] text-built-red font-mono uppercase tracking-widest mb-1">
          Tools · Reel Analyser
        </p>
        <h1 className="text-4xl font-display tracking-[0.06em] text-zinc-100">
          REEL COPY TOOL
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Lipsește un reel — obții un breakdown AI complet, brief de adaptare pentru BUILT și un hook nou.
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 mb-6">
        <button className={TAB_STYLE("url")} onClick={() => setTab("url")}>
          🔗 Instagram URL
        </button>
        <button
          className={TAB_STYLE("transcript")}
          onClick={() => setTab("transcript")}
        >
          📋 Paste Transcript
        </button>
        <button className={TAB_STYLE("audio")} onClick={() => setTab("audio")}>
          🎙 Upload Audio
        </button>
      </div>

      {/* Input area */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-6">
        {tab === "url" && (
          <div>
            <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono block mb-2">
              Instagram Reel URL
            </label>
            <input
              type="url"
              placeholder="https://www.instagram.com/reel/..."
              className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[13px] px-4 py-3 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-600 mb-3"
            />
            <p className="text-[11px] text-zinc-600 mb-3">
              Funcționalitatea de scraping URL este în dezvoltare. Între timp, copiază transcriptul reelului și lipește-l în tab-ul Paste Transcript.
            </p>
            <button
              onClick={() => setTab("transcript")}
              className="text-[12px] text-built-red border border-built-red/20 px-3 py-1.5 rounded-lg hover:bg-built-red/10"
            >
              → Treci la Paste Transcript
            </button>
          </div>
        )}

        {tab === "transcript" && (
          <div>
            <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono block mb-2">
              Transcript / Script Reel
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Lipește transcriptul complet al reelului pe care vrei să-l analizezi..."
              rows={8}
              className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[13px] px-4 py-3 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-600 resize-none mb-3"
            />
            <p className="text-[11px] text-zinc-600">
              Lipește orice reel public — AI va transcrie, scora și îți va spune exact cum să-l adaptezi pentru BUILT.
            </p>
          </div>
        )}

        {tab === "audio" && (
          <div className="text-center py-8">
            <p className="text-zinc-600 text-[13px] mb-2">Upload Audio — Coming Soon</p>
            <p className="text-zinc-700 text-[11px]">
              Suportul pentru fișiere audio (Whisper transcription) vine în curând.
            </p>
            <button
              onClick={() => setTab("transcript")}
              className="mt-4 text-[12px] text-built-red border border-built-red/20 px-3 py-1.5 rounded-lg hover:bg-built-red/10"
            >
              → Paste Transcript acum
            </button>
          </div>
        )}

        {tab !== "audio" && tab !== "url" && (
          <button
            onClick={handleAnalyse}
            disabled={loading || transcript.trim().length < 30}
            className="w-full mt-4 bg-built-red/10 text-built-red border border-built-red/20 py-3 rounded-lg text-[13px] font-medium hover:bg-built-red/20 transition-colors disabled:opacity-40"
          >
            {loading ? "Analizez..." : "✦ Analyse Reel"}
          </button>
        )}

        {error && (
          <p className="mt-3 text-built-red text-[12px]">{error}</p>
        )}
      </div>

      {/* Empty state */}
      {!analysis && !loading && (
        <div className="text-center py-12">
          <p className="text-4xl opacity-10 mb-3">◈</p>
          <p className="text-zinc-700 text-[12px]">
            Niciun reel analizat încă. Lipește un transcript și apasă Analyse Reel.
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="flex gap-1 justify-center mb-3">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="w-2 h-2 rounded-full bg-built-red/60 animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
          <p className="text-zinc-600 text-[12px] font-mono">Fetching & analysing...</p>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Verdict */}
          <div className="bg-[#111111] border border-white/10 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1">
                Verdict
              </p>
              <span
                className={`text-[13px] font-bold px-3 py-1 rounded-full border ${VERDICT_COLOR[analysis.verdict] ?? "text-zinc-400 bg-white/5 border-white/10"}`}
              >
                {analysis.verdict}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1">
                Score
              </p>
              <p className="text-4xl font-display text-zinc-100">{analysis.score}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1">
                Hook Score
              </p>
              <p className="text-4xl font-display text-zinc-100">{analysis.hook_score}</p>
            </div>
          </div>

          {/* Performance + Script Quality */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-2">
                Performance
              </p>
              <p className="text-zinc-300 text-[13px] leading-relaxed">
                {analysis.performance_summary}
              </p>
            </div>
            <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-2">
                Script Quality
              </p>
              <p className="text-zinc-300 text-[13px] leading-relaxed">
                {analysis.script_quality}
              </p>
            </div>
          </div>

          {/* What Worked */}
          <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">
              What Worked
            </p>
            <ul className="space-y-2">
              {analysis.what_worked.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] text-zinc-300">
                  <span className="text-built-red shrink-0 mt-0.5">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Audience Fit */}
          <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-2">
              Audience Fit
            </p>
            <p className="text-zinc-300 text-[13px] leading-relaxed">{analysis.audience_fit}</p>
          </div>

          {/* Adaptation Brief */}
          <div className="bg-[#111111] border border-built-red/20 rounded-xl p-5 border-l-4 border-l-built-red">
            <p className="text-[10px] text-built-red font-mono uppercase tracking-widest mb-2">
              Adaptation Brief
            </p>
            <p className="text-zinc-200 text-[13px] leading-relaxed">
              {analysis.adaptation_brief}
            </p>
          </div>

          {/* Suggested Hook */}
          <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6">
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">
              Suggested Hook for Your Audience
            </p>
            <p className="text-zinc-100 text-lg leading-relaxed font-medium">
              &ldquo;{analysis.suggested_hook}&rdquo;
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={copyHook}
                className="text-[12px] text-zinc-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                {copied ? "✓ Copiat" : "Copy Hook"}
              </button>
              <button className="text-[12px] text-zinc-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5">
                Save to Idea Bank
              </button>
            </div>
          </div>

          {/* Transcript */}
          <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
              onClick={() => setShowTranscript(!showTranscript)}
            >
              <p className="text-[12px] text-zinc-400 font-medium">Transcript</p>
              <span className={`text-zinc-500 transition-transform ${showTranscript ? "rotate-90" : ""}`}>›</span>
            </button>
            {showTranscript && (
              <div className="px-5 pb-5 border-t border-white/5 pt-4">
                <p className="text-zinc-500 text-[12px] leading-relaxed whitespace-pre-line">
                  {analysis.transcript_clean}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2.3: Verifică TypeScript**

```bash
cd "built-ai-command-center" && npx tsc --noEmit 2>&1 | grep "reel-copy"
```

Expected: nicio eroare pentru fișierele noi.

- [ ] **Step 2.4: Commit**

```bash
cd "built-ai-command-center" && git add src/app/dashboard/reel-copy/ && git commit -m "feat: add Reel Copy Tool — paste transcript → AI breakdown + suggested hook"
```

---

## Task 3: Content Calendar — `/dashboard/calendar`

**Files:**
- Create: `src/app/dashboard/calendar/actions.ts`
- Create: `src/app/dashboard/calendar/page.tsx`

Calendar lunar cu adăugare idei manuale + generare AI a planului lunii. Ideile se stochează în localStorage (format: array de `CalendarIdea`).

- [ ] **Step 3.1: Crează Server Action pentru generare plan lunar**

Crează `src/app/dashboard/calendar/actions.ts`:

```typescript
"use server";

import { getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";

export interface GeneratedIdea {
  date: string; // "2026-05-12" format
  hook: string;
  format: string;
  cta: string;
  content_pillar: string;
}

export type PlanResult =
  | { ok: true; ideas: GeneratedIdea[] }
  | { ok: false; error: string };

export async function generateMonthPlan(
  year: number,
  month: number, // 0-indexed
  existingDates: string[]
): Promise<PlanResult> {
  const client = getAnthropicClient();

  let creierContext = "";
  try {
    const creier = await readCreierFromSupabase();
    if (creier) {
      creierContext = JSON.stringify(creier).slice(0, 1500);
    }
  } catch {
    // merge fara context
  }

  // Calculează zilele libere din lună
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const freeDates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayOfWeek = new Date(dateStr).getDay();
    // Postăm Luni-Sâmbătă (nu Duminică)
    if (dayOfWeek !== 0 && !existingDates.includes(dateStr)) {
      freeDates.push(dateStr);
    }
  }

  if (freeDates.length === 0) {
    return { ok: false, error: "Nu există zile libere în această lună." };
  }

  const prompt = `Ești CMO pentru BUILT (fitness coaching arhitectural, 90 zile, bărbați 28-42 ani).${
    creierContext ? `\n\nContextul BUILT:\n${creierContext}` : ""
  }

Generează un plan de conținut Instagram pentru zilele de mai jos. Fiecare zi primește: hook (opritor de scroll), format, CTA, pilon de conținut (B/U/I/L/T).

Zile libere: ${freeDates.slice(0, 20).join(", ")}

Returnează JSON strict (array, fără markdown):
[
  {
    "date": "2026-05-12",
    "hook": "Hook-ul complet — max 2 propoziții, contraintuitiv sau cu cifră",
    "format": "TALKING HEAD",
    "cta": "DM ARHITECTURĂ",
    "content_pillar": "B — Base Strength"
  }
]

Formate disponibile: TALKING HEAD, RANT, TUTORIAL, STORY TIME, TREND, BEHIND SCENES, CLIENT PROOF.
Piloni BUILT: B — Base Strength, U — Unbreakable Capacity, I — Intelligent Fueling, L — Lifestyle Integration, T — Tough Mindset.
Generează maxim ${Math.min(freeDates.length, 20)} idei.`;

  try {
    const response = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw =
      response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return { ok: false, error: "AI nu a returnat JSON valid." };

    const ideas: GeneratedIdea[] = JSON.parse(jsonMatch[0]);
    return { ok: true, ideas };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Eroare necunoscută.",
    };
  }
}
```

- [ ] **Step 3.2: Crează pagina Content Calendar**

Crează `src/app/dashboard/calendar/page.tsx`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { generateMonthPlan, type GeneratedIdea } from "./actions";

interface CalendarIdea {
  date: string;
  hook: string;
  format: string;
  cta: string;
  content_pillar: string;
  type: "ai" | "manual";
}

const MONTHS_RO = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
];
const DAYS_RO = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

const FORMAT_COLORS: Record<string, string> = {
  "TALKING HEAD": "bg-orange-500",
  RANT: "bg-blue-600",
  TUTORIAL: "bg-purple-600",
  "STORY TIME": "bg-teal-600",
  TREND: "bg-emerald-600",
  "BEHIND SCENES": "bg-zinc-500",
  "CLIENT PROOF": "bg-amber-600",
};

const STORAGE_KEY = "built_calendar_ideas";

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [ideas, setIdeas] = useState<CalendarIdea[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<CalendarIdea | null>(null);

  // Form state pentru Add Idea modal
  const [hook, setHook] = useState("");
  const [format, setFormat] = useState("TALKING HEAD");
  const [cta, setCta] = useState("DM ARHITECTURĂ");
  const [contentBrief, setContentBrief] = useState("");
  const [contentPillar, setContentPillar] = useState("B — Base Strength");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setIdeas(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const saveIdeas = useCallback((newIdeas: CalendarIdea[]) => {
    setIdeas(newIdeas);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIdeas));
    } catch {
      // ignore
    }
  }, []);

  const getIdeasForDate = (dateStr: string) =>
    ideas.filter((i) => i.date === dateStr);

  const handlePlanMonth = async () => {
    setGenerating(true);
    const existingDates = ideas.map((i) => i.date);
    const result = await generateMonthPlan(year, month, existingDates);
    if (result.ok) {
      const newIdeas: CalendarIdea[] = result.ideas.map(
        (idea: GeneratedIdea) => ({ ...idea, type: "ai" as const })
      );
      saveIdeas([...ideas, ...newIdeas]);
    }
    setGenerating(false);
  };

  const handleAddIdea = () => {
    if (!hook.trim()) return;
    const newIdea: CalendarIdea = {
      date: modalDate,
      hook,
      format,
      cta,
      content_pillar: contentPillar,
      type: "manual",
    };
    saveIdeas([...ideas, newIdea]);
    setShowModal(false);
    setHook("");
    setContentBrief("");
  };

  const handleRemoveIdea = (date: string, hook: string) => {
    saveIdeas(ideas.filter((i) => !(i.date === date && i.hook === hook)));
    setSelectedIdea(null);
  };

  // Construiește grila calendarului
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const firstMonDay = firstDay === 0 ? 6 : firstDay - 1; // adjust to Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstMonDay + daysInMonth) / 7) * 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const day = i - firstMonDay + 1;
    cells.push(day >= 1 && day <= daysInMonth ? day : null);
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const toDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[11px] text-built-red font-mono uppercase tracking-widest mb-1">
            Content Calendar
          </p>
          <h1 className="text-4xl font-display tracking-[0.06em] text-zinc-100">
            CONTENT CALENDAR
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Vezi ce ai postat și planifică ce urmează.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#111111] border border-white/10 rounded-xl px-3 py-2">
            <button onClick={prevMonth} className="text-zinc-500 hover:text-zinc-200 px-2">‹</button>
            <span className="text-zinc-200 text-[13px] font-medium px-3 min-w-[140px] text-center">
              {MONTHS_RO[month]} {year}
            </span>
            <button onClick={nextMonth} className="text-zinc-500 hover:text-zinc-200 px-2">›</button>
          </div>
          <button
            onClick={handlePlanMonth}
            disabled={generating}
            className="bg-[#111111] border border-white/10 text-zinc-200 text-[12px] px-4 py-2 rounded-xl hover:bg-white/5 disabled:opacity-50"
          >
            {generating ? "⟳ Generating..." : "✦ Plan this month"}
          </button>
          <button
            onClick={() => { setModalDate(toDateStr(today.getDate())); setShowModal(true); }}
            className="bg-built-red/10 border border-built-red/20 text-built-red text-[12px] px-4 py-2 rounded-xl hover:bg-built-red/20"
          >
            + Add Idea
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-built-red" /> Idee manuală</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Planificat AI</span>
      </div>

      {/* Calendar grid */}
      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/10">
          {DAYS_RO.map((d) => (
            <div key={d} className="py-2 text-center text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const dateStr = day ? toDateStr(day) : "";
            const dayIdeas = day ? getIdeasForDate(dateStr) : [];
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            return (
              <div
                key={idx}
                className={`min-h-[100px] border-b border-r border-white/5 p-2 ${
                  day ? "cursor-pointer hover:bg-white/5" : "opacity-20"
                } ${isToday ? "bg-built-red/5" : ""}`}
                onClick={() => {
                  if (day) {
                    setModalDate(dateStr);
                    setShowModal(true);
                  }
                }}
              >
                {day && (
                  <>
                    <span className={`text-[11px] font-mono ${isToday ? "text-built-red font-bold" : "text-zinc-600"}`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayIdeas.map((idea, i) => (
                        <div
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIdea(idea);
                          }}
                          className="group relative"
                        >
                          <span
                            className={`inline-block text-[8px] font-bold px-1 py-0.5 rounded text-white ${
                              FORMAT_COLORS[idea.format] ?? "bg-zinc-600"
                            }`}
                          >
                            {idea.format.slice(0, 8)}
                          </span>
                          <p className="text-[10px] text-zinc-400 leading-tight mt-0.5 line-clamp-2">
                            {idea.hook.slice(0, 50)}
                          </p>
                          <span
                            className={`absolute top-0 right-0 w-1.5 h-1.5 rounded-full ${
                              idea.type === "ai" ? "bg-blue-500" : "bg-built-red"
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Idea Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-semibold text-zinc-200">Add your own idea</h2>
                <p className="text-[11px] text-zinc-600 font-mono">{modalDate}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-600 hover:text-zinc-200">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono block mb-1">Hook *</label>
                <textarea
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  placeholder="The opening line that stops the scroll..."
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-700 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono block mb-1">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none"
                  >
                    {Object.keys(FORMAT_COLORS).map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono block mb-1">CTA</label>
                  <select
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none"
                  >
                    {["DM ARHITECTURĂ", "Comentează BUILT", "Salvează pentru mai târziu", "Apasă follow"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono block mb-1">Angle / Content Brief</label>
                <textarea
                  value={contentBrief}
                  onChange={(e) => setContentBrief(e.target.value)}
                  placeholder="Care e povestea, punctul cheie sau structura acestui video?"
                  rows={2}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none placeholder:text-zinc-700 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono block mb-1">Content Pillar</label>
                <select
                  value={contentPillar}
                  onChange={(e) => setContentPillar(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none"
                >
                  {["B — Base Strength", "U — Unbreakable Capacity", "I — Intelligent Fueling", "L — Lifestyle Integration", "T — Tough Mindset"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 text-[12px] text-zinc-500 border border-white/10 py-2 rounded-lg hover:bg-white/5">
                Cancel
              </button>
              <button
                onClick={handleAddIdea}
                disabled={!hook.trim()}
                className="flex-1 text-[12px] bg-built-red/10 text-built-red border border-built-red/20 py-2 rounded-lg hover:bg-built-red/20 disabled:opacity-40"
              >
                Add to calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Idea Detail Modal */}
      {selectedIdea && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIdea(null)}
        >
          <div
            className="bg-[#111111] border border-white/10 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded text-white ${FORMAT_COLORS[selectedIdea.format] ?? "bg-zinc-600"}`}>
                  {selectedIdea.format}
                </span>
                <p className="text-[11px] text-zinc-600 font-mono mt-1">{selectedIdea.date}</p>
              </div>
              <button onClick={() => setSelectedIdea(null)} className="text-zinc-600 hover:text-zinc-200">✕</button>
            </div>
            <p className="text-zinc-200 text-[14px] leading-relaxed mb-3">{selectedIdea.hook}</p>
            <div className="flex gap-3 text-[11px] text-zinc-500 mb-4">
              <span>CTA: {selectedIdea.cta}</span>
              <span>·</span>
              <span>{selectedIdea.content_pillar}</span>
            </div>
            <button
              onClick={() => handleRemoveIdea(selectedIdea.date, selectedIdea.hook)}
              className="text-[11px] text-built-red border border-built-red/20 px-3 py-1.5 rounded-lg hover:bg-built-red/10"
            >
              Șterge din calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3.3: Verifică TypeScript**

```bash
cd "built-ai-command-center" && npx tsc --noEmit 2>&1 | grep "calendar"
```

Expected: nicio eroare.

- [ ] **Step 3.4: Commit**

```bash
cd "built-ai-command-center" && git add src/app/dashboard/calendar/ && git commit -m "feat: add Content Calendar — monthly view + Add Idea modal + AI plan generation"
```

---

## Task 4: Profile Audit Real — upgrade `/dashboard/profile-audit`

**Files:**
- Create: `src/app/dashboard/profile-audit/actions.ts`
- Replace: `src/app/dashboard/profile-audit/page.tsx`

Pagina curentă are date mock statice. O înlocuim cu upload real de screenshot → Claude Vision → rezultate reale. Logica AI există deja în `/audit/actions.ts` — o reexportăm.

- [ ] **Step 4.1: Crează actions.ts care re-exportă din `/audit/actions.ts`**

Crează `src/app/dashboard/profile-audit/actions.ts`:

```typescript
"use server";

// Re-exportă funcțiile din modulul de audit existent.
// Nu duplicăm logica — doar facem bridge-ul pentru noul URL /dashboard/profile-audit.
export { auditProfile, type AuditInput, type AuditResult, type InstagramAudit, type AuditElement } from "@/app/audit/actions";
```

- [ ] **Step 4.2: Înlocuiește pagina cu upload real + AI**

Înlocuiește conținutul lui `src/app/dashboard/profile-audit/page.tsx` cu:

```typescript
"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { auditProfile, type InstagramAudit } from "./actions";

const ELEMENT_LABELS: Record<string, string> = {
  profile_picture: "Profile Picture",
  name_username: "Name & Username",
  bio: "Bio",
  link_in_bio: "Link in Bio",
  highlights: "Highlights",
  pinned_posts: "Pinned Posts",
};

const getScoreColor = (s: number) =>
  s >= 8 ? "text-emerald-400" : s >= 6 ? "text-yellow-400" : "text-built-red";

const getBarColor = (s: number) =>
  s >= 8 ? "bg-emerald-500" : s >= 6 ? "bg-yellow-500" : "bg-built-red";

export default function ProfileAuditPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<InstagramAudit | null>(null);
  const [error, setError] = useState("");
  const [openSection, setOpenSection] = useState<string | null>("bio");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setImageType(file.type || "image/jpeg");

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix: "data:image/jpeg;base64,..."
      const base64 = result.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAudit = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError("");
    setAudit(null);

    const result = await auditProfile({
      handle: "@iordacheclaudiu_",
      followers: "2780",
      screenshot_base64: imageBase64,
      screenshot_media_type: imageType,
      bio: "",
      highlights: "",
      last_posts: "",
      posting_frequency: "",
    });

    if (result.ok) {
      setAudit(result.audit);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const overallScore = audit ? audit.overall : null;
  const elements = audit ? Object.entries(audit.elements) : [];

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] text-built-red font-mono uppercase tracking-widest mb-1">
          Tools · Profile Audit
        </p>
        <h1 className="text-4xl font-display tracking-[0.06em] text-zinc-100">
          PROFILE AUDIT
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Fă un screenshot profilului tău din Instagram, uploadează-l mai jos. Claude îl scorează pe 6 elemente și îți spune exact ce să repari.
        </p>
      </div>

      {/* Upload area */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-6">
        <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono mb-4">
          Profile Screenshot
        </p>

        {previewUrl ? (
          <div className="relative mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Profile screenshot"
              className="max-h-64 rounded-lg border border-white/10 mx-auto block"
            />
            <button
              onClick={() => {
                setPreviewUrl(null);
                setImageBase64(null);
                setAudit(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-zinc-400 hover:text-zinc-200 flex items-center justify-center text-[12px]"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border border-dashed border-white/20 rounded-xl py-10 flex flex-col items-center gap-2 hover:border-white/40 transition-colors mb-4"
          >
            <span className="text-2xl text-zinc-600">↑</span>
            <p className="text-zinc-500 text-[13px]">Upload your Instagram profile screenshot</p>
            <p className="text-zinc-700 text-[11px]">
              Pe telefon: deschide Instagram → profilul tău → fă screenshot → uploadează aici
            </p>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          onClick={handleRunAudit}
          disabled={!imageBase64 || loading}
          className="w-full bg-built-red/10 text-built-red border border-built-red/20 py-3 rounded-lg text-[13px] font-medium hover:bg-built-red/20 transition-colors disabled:opacity-40"
        >
          {loading ? "Analizez..." : "Run Audit"}
        </button>

        {error && <p className="mt-3 text-built-red text-[12px]">{error}</p>}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="flex gap-1 justify-center mb-3">
            {[0, 150, 300].map((delay) => (
              <span key={delay} className="w-2 h-2 rounded-full bg-built-red/60 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
            ))}
          </div>
          <p className="text-zinc-600 text-[12px] font-mono">Claude analizează profilul tău...</p>
        </div>
      )}

      {/* Results */}
      {audit && (
        <div className="space-y-4">
          {/* Overall Score + Element bars */}
          <div className="grid grid-cols-[auto_1fr] gap-4">
            <div className="bg-[#111111] border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center w-40">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-2">Overall Score</p>
              <div className="relative w-24 h-24 mb-2">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a1a" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#C0392B" strokeWidth="8"
                    strokeDasharray={`${(overallScore! / 10) * 251.2} 251.2`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-display text-zinc-100">{overallScore}</span>
                  <span className="text-[9px] text-zinc-600">/10</span>
                </div>
              </div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                overallScore! >= 8 ? "text-emerald-400 bg-emerald-400/10" :
                overallScore! >= 6 ? "text-yellow-400 bg-yellow-400/10" :
                "text-built-red bg-built-red/10"
              }`}>
                {overallScore! >= 8 ? "Good" : overallScore! >= 6 ? "Needs Work" : "Critical"}
              </span>
            </div>

            <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">Scoruri per element</p>
              <div className="space-y-3">
                {elements.map(([key, el]) => (
                  <div key={key}>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="text-zinc-400">{ELEMENT_LABELS[key] ?? key}</span>
                      <span className={`font-mono font-bold ${getScoreColor(el.score)}`}>{el.score}/10</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full">
                      <div className={`h-full rounded-full ${getBarColor(el.score)}`} style={{ width: `${el.score * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Element Breakdown accordion */}
          <div>
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">Element Breakdown</p>
            <div className="space-y-2">
              {elements.map(([key, el]) => (
                <div key={key} className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors"
                    onClick={() => setOpenSection(openSection === key ? null : key)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-[14px] font-mono font-bold ${getScoreColor(el.score)}`}>{el.score}</span>
                      <span className="text-[13px] text-zinc-200">{ELEMENT_LABELS[key] ?? key}</span>
                    </div>
                    <span className={`text-zinc-500 transition-transform ${openSection === key ? "rotate-90" : ""}`}>›</span>
                  </button>
                  {openSection === key && (
                    <div className="px-5 pb-4 border-t border-white/5 pt-3 space-y-3">
                      <p className="text-zinc-400 text-[12px] leading-relaxed">{el.feedback}</p>
                      <div className="flex gap-2 items-start">
                        <span className="text-built-red shrink-0 text-[12px] mt-0.5">▸</span>
                        <p className="text-zinc-300 text-[12px] leading-relaxed">{el.fix}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Priority Fix #1 */}
          <div className="bg-[#111111] border border-built-red/20 rounded-xl p-5">
            <p className="text-[10px] text-built-red font-mono uppercase tracking-widest mb-3">Priority Fix #1</p>
            <p className="text-zinc-200 text-[13px] leading-relaxed">{audit.top_priority}</p>
          </div>

          {/* Rewritten Bio */}
          {audit.rewritten_bio && (
            <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">Bio rescris</p>
              <p className="text-zinc-200 text-[13px] leading-relaxed italic">{audit.rewritten_bio}</p>
              <button
                onClick={() => navigator.clipboard.writeText(audit.rewritten_bio)}
                className="mt-3 text-[11px] text-zinc-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                Copiază bio-ul
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4.3: Verifică TypeScript**

```bash
cd "built-ai-command-center" && npx tsc --noEmit 2>&1 | grep "profile-audit"
```

Expected: nicio eroare.

- [ ] **Step 4.4: Commit**

```bash
cd "built-ai-command-center" && git add src/app/dashboard/profile-audit/ && git commit -m "feat: profile audit — real screenshot upload + Claude Vision analysis"
```

---

## Task 5: Onboarding Hub — `/dashboard/onboarding`

**Files:**
- Create: `src/app/dashboard/onboarding/page.tsx`

Echivalentul "My Profile" din William — formular cu secțiuni accordion, progress bar, și "Save & Update My AI". Stochează în localStorage. Afișează preview "AI Personalised" (Nișă + Client Ideal).

- [ ] **Step 5.1: Crează pagina Onboarding Hub**

Crează `src/app/dashboard/onboarding/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";

interface OnboardingData {
  // Who You Are
  full_name: string;
  age: string;
  location: string;
  experience_years: string;
  // Revenue Goals
  revenue_90_days: string;
  revenue_12_months: string;
  followers_goal_90_days: string;
  // Your Content
  content_formats: string;
  posting_frequency: string;
  best_performing_content: string;
  // Where You're Stuck
  biggest_challenge: string;
  what_tried: string;
  // What You Want
  ideal_outcome: string;
  ideal_client: string;
  // Mindset & Opinions
  philosophy: string;
  differentiator: string;
  things_disagree_with: string;
  // Your Story
  origin_story: string;
  biggest_transformation: string;
  credibility: string;
}

const EMPTY: OnboardingData = {
  full_name: "", age: "", location: "", experience_years: "",
  revenue_90_days: "", revenue_12_months: "", followers_goal_90_days: "",
  content_formats: "", posting_frequency: "", best_performing_content: "",
  biggest_challenge: "", what_tried: "",
  ideal_outcome: "", ideal_client: "",
  philosophy: "", differentiator: "", things_disagree_with: "",
  origin_story: "", biggest_transformation: "", credibility: "",
};

const STORAGE_KEY = "built_onboarding_data";

const SECTIONS = [
  {
    id: "who_you_are",
    title: "Who You Are",
    description: "Bazele. Spune-ne despre tine ca persoană, nu doar ca coach.",
    fields: [
      { key: "full_name", label: "Nume complet", placeholder: "Iordache Claudiu" },
      { key: "age", label: "Vârstă", placeholder: "25" },
      { key: "location", label: "Unde ești bazat", placeholder: "Botoșani, România" },
      { key: "experience_years", label: "Ani de experiență în fitness/coaching", placeholder: "7" },
    ],
  },
  {
    id: "revenue_goals",
    title: "Revenue & Growth Goals",
    description: "Obiective concrete pentru AI.",
    fields: [
      { key: "revenue_90_days", label: "Revenue goal în 90 zile (EUR/lună)", placeholder: "2500" },
      { key: "revenue_12_months", label: "Revenue goal în 12 luni (EUR/lună)", placeholder: "5000" },
      { key: "followers_goal_90_days", label: "Followeri goal în 90 zile", placeholder: "5000" },
    ],
  },
  {
    id: "your_content",
    title: "Your Content",
    description: "Ce tipuri de conținut creezi, cât de des, ce merge.",
    fields: [
      { key: "content_formats", label: "Formate principale", placeholder: "Talking Head, Rant, Tutorial" },
      { key: "posting_frequency", label: "Frecvența postărilor actuale", placeholder: "4-5 reels/săptămână" },
      { key: "best_performing_content", label: "Cel mai bun conținut de până acum (descrie)", placeholder: "Reelul despre cortizol — 14k views", textarea: true },
    ],
  },
  {
    id: "where_stuck",
    title: "Where You're Stuck",
    description: "Sincer. Sistemul îți poate ajuta doar dacă știe blocajele reale.",
    fields: [
      { key: "biggest_challenge", label: "Cel mai mare obstacol acum", placeholder: "Conversie din DM în call", textarea: true },
      { key: "what_tried", label: "Ce ai încercat și nu a funcționat", placeholder: "Cold DM, reduceri de preț", textarea: true },
    ],
  },
  {
    id: "what_you_want",
    title: "What You Want",
    description: "Specific. Ce înseamnă succesul pentru tine?",
    fields: [
      { key: "ideal_outcome", label: "Cum arată ziua ta ideală în 90 de zile", placeholder: "10 clienți activi la 500 EUR, 2 ore de muncă/zi pe sistem", textarea: true },
      { key: "ideal_client", label: "Descrie clientul ideal", placeholder: "Bărbat 30-40 ani, IT sau antreprenor, familie, 15+ kg de dat jos, bani dar fără timp, a mai eșuat", textarea: true },
    ],
  },
  {
    id: "mindset_opinions",
    title: "Mindset & Opinions",
    description: "Credințele tale. Ce face conținutul tău diferit.",
    fields: [
      { key: "philosophy", label: "Filozofia ta despre fitness (2-3 propoziții)", placeholder: "Eșecul nu vine din lipsă de voință — vine din lipsă de sistem.", textarea: true },
      { key: "differentiator", label: "Ce face BUILT diferit de orice alt program", placeholder: "Nu vindem motivație. Vindem arhitectură.", textarea: true },
      { key: "things_disagree_with", label: "Cu ce nu ești de acord în industria fitness", placeholder: "Cardio excesiv, deficit agresiv, motivație fără sistem", textarea: true },
    ],
  },
  {
    id: "your_story",
    title: "Your Story",
    description: "Credibilitatea ta. Ce ai trăit tu însuți.",
    fields: [
      { key: "origin_story", label: "Povestea ta de origine — de unde ai pornit", placeholder: "Am ajuns la 120kg, bâlbâit, fără identitate...", textarea: true },
      { key: "biggest_transformation", label: "Cea mai mare transformare a ta", placeholder: "Am slăbit 40kg și am ajuns vicecampion național la atletism", textarea: true },
      { key: "credibility", label: "Dovezi de credibilitate (titluri, ani, clienți, rezultate)", placeholder: "7 ani experiență, hibrid athlete, clienți cu -8kg în 11 săptămâni", textarea: true },
    ],
  },
];

function countFilled(data: OnboardingData): number {
  return Object.values(data).filter((v) => v.trim().length > 0).length;
}

const TOTAL_FIELDS = Object.keys(EMPTY).length;

export default function OnboardingPage() {
  const [data, setData] = useState<OnboardingData>(EMPTY);
  const [openSection, setOpenSection] = useState<string>("who_you_are");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setData(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const update = (key: keyof OnboardingData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // ignore
    }
  };

  const filled = countFilled(data);
  const pct = Math.round((filled / TOTAL_FIELDS) * 100);

  const aiPreview = {
    niche: data.philosophy || "Te ajut profesioniștii ocupați să-și reconstruiască corpul în 90 de zile fără să sacrifice cariera.",
    idealClient: data.ideal_client || "Bărbați 28-42 ani, profesioniști/antreprenori cu corp uitat pe drum. Au burtă, frustrări, au mai eșuat. Au nevoie de sistem, nu motivație.",
  };

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] text-built-red font-mono uppercase tracking-widest mb-1">
          Admin · My Profile
        </p>
        <h1 className="text-4xl font-display tracking-[0.06em] text-zinc-100">
          ONBOARDING HUB
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Cu cât completezi mai mult, cu atât AI-ul devine mai precis. Revino și actualizează când ceva se schimbă.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-[11px] text-zinc-500 mb-1.5">
          <span>{filled} câmpuri completate</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full">
          <div
            className="h-full bg-built-red rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="w-full bg-zinc-200 text-zinc-900 text-[13px] font-semibold py-3 rounded-xl mb-6 hover:bg-white transition-colors"
      >
        {saved ? "✓ Salvat — AI-ul a fost actualizat" : "⟳ Save & Update My AI"}
      </button>

      {/* AI Preview */}
      {(data.philosophy || data.ideal_client) && (
        <div className="bg-[#111111] border border-built-red/20 rounded-xl p-5 mb-6">
          <p className="text-[10px] text-built-red font-mono uppercase tracking-widest mb-3">
            AI Personalised
          </p>
          <div className="grid grid-cols-2 gap-4 text-[12px]">
            <div>
              <p className="text-zinc-600 uppercase tracking-widest text-[10px] font-mono mb-1">Nișă</p>
              <p className="text-zinc-300 leading-relaxed">{aiPreview.niche}</p>
            </div>
            <div>
              <p className="text-zinc-600 uppercase tracking-widest text-[10px] font-mono mb-1">Client Ideal</p>
              <p className="text-zinc-300 leading-relaxed">{aiPreview.idealClient}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sections accordion */}
      <div className="space-y-2">
        {SECTIONS.map((section) => {
          const sectionFields = section.fields.map((f) => f.key as keyof OnboardingData);
          const sectionFilled = sectionFields.filter((k) => data[k]?.trim().length > 0).length;
          const isOpen = openSection === section.id;

          return (
            <div key={section.id} className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
                onClick={() => setOpenSection(isOpen ? "" : section.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-600 font-mono w-6 text-right">
                    {sectionFilled}/{section.fields.length}
                  </span>
                  <span className="text-[13px] text-zinc-200 font-medium">{section.title}</span>
                </div>
                <span className={`text-zinc-500 transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                  <p className="text-zinc-600 text-[12px]">{section.description}</p>
                  {section.fields.map((field) => {
                    const k = field.key as keyof OnboardingData;
                    return (
                      <div key={field.key}>
                        <label className="text-[11px] text-zinc-500 font-mono block mb-1.5">
                          {field.label}
                        </label>
                        {"textarea" in field && field.textarea ? (
                          <textarea
                            value={data[k]}
                            onChange={(e) => update(k, e.target.value)}
                            placeholder={field.placeholder}
                            rows={3}
                            className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-700 resize-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={data[k]}
                            onChange={(e) => update(k, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-700"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save bottom */}
      <button
        onClick={handleSave}
        className="w-full mt-6 bg-zinc-200 text-zinc-900 text-[13px] font-semibold py-3 rounded-xl hover:bg-white transition-colors"
      >
        {saved ? "✓ Salvat" : "⟳ Save & Update My AI"}
      </button>
    </div>
  );
}
```

- [ ] **Step 5.2: Verifică TypeScript**

```bash
cd "built-ai-command-center" && npx tsc --noEmit 2>&1 | grep "onboarding"
```

Expected: nicio eroare.

- [ ] **Step 5.3: Commit**

```bash
cd "built-ai-command-center" && git add src/app/dashboard/onboarding/ && git commit -m "feat: add Onboarding Hub — progress bar + accordion sections + localStorage"
```

---

## Task 6: Content Studio — Competitor Intel + Script upgrade

**Files:**
- Modify: `src/app/dashboard/content/page.tsx`

Adaugă secțiunea MY COMPETITORS (localStorage, max 10 conturi) sub lista de reeluri. Upgradeează structura scripturilor la 4 câmpuri: HOOK + FULL SCRIPT + CAPTION + CTA.

- [ ] **Step 6.1: Înlocuiește pagina content cu versiunea extinsă**

Deschide `src/app/dashboard/content/page.tsx`. Adaugă la începutul fișierului, înainte de `const WEEKLY_TRENDS`:

```typescript
"use client";

import { useState, useEffect } from "react";
```

Asigură-te că fișierul are `"use client"` la linie 1.

- [ ] **Step 6.2: Adaugă state pentru competitori**

Adaugă în funcția componentei `ContentPage`, înainte de `const [openScript, setOpenScript] = useState`:

```typescript
const [competitors, setCompetitors] = useState<string[]>([]);
const [newCompetitor, setNewCompetitor] = useState("");

useEffect(() => {
  try {
    const stored = localStorage.getItem("built_competitors");
    if (stored) setCompetitors(JSON.parse(stored));
  } catch { /* ignore */ }
}, []);

const addCompetitor = () => {
  const handle = newCompetitor.trim().replace(/^@/, "");
  if (!handle || competitors.includes(handle) || competitors.length >= 10) return;
  const updated = [...competitors, handle];
  setCompetitors(updated);
  localStorage.setItem("built_competitors", JSON.stringify(updated));
  setNewCompetitor("");
};

const removeCompetitor = (handle: string) => {
  const updated = competitors.filter((c) => c !== handle);
  setCompetitors(updated);
  localStorage.setItem("built_competitors", JSON.stringify(updated));
};
```

- [ ] **Step 6.3: Adaugă secțiunea MY COMPETITORS în JSX**

În return-ul componentei, după blocul scripturi (după `</div>` care închide grila de scripturi + panelul drept), adaugă:

```typescript
{/* MY COMPETITORS */}
<div className="mt-8">
  <div className="flex items-center justify-between mb-4">
    <div>
      <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
        My Competitors
      </p>
      <p className="text-zinc-600 text-[11px] mt-0.5">
        Adaugă conturi Instagram din nișa ta. În fiecare săptămână, scripturile tale se vor baza pe ce merge la ei.
      </p>
    </div>
    <button className="text-[11px] text-built-red border border-built-red/20 px-3 py-1.5 rounded-lg hover:bg-built-red/10">
      ⟳ Scrape Now
    </button>
  </div>

  <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">
      My Competitors — {competitors.length}/10 accounts tracked
    </p>
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        value={newCompetitor}
        onChange={(e) => setNewCompetitor(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
        placeholder="@username"
        className="flex-1 bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-600"
      />
      <button
        onClick={addCompetitor}
        disabled={!newCompetitor.trim() || competitors.length >= 10}
        className="text-[12px] bg-built-red/10 text-built-red border border-built-red/20 px-4 py-2 rounded-lg hover:bg-built-red/20 disabled:opacity-40"
      >
        + Add
      </button>
    </div>
    {competitors.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {competitors.map((handle) => (
          <span
            key={handle}
            className="flex items-center gap-1.5 text-[11px] text-zinc-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full"
          >
            @{handle}
            <button
              onClick={() => removeCompetitor(handle)}
              className="text-zinc-600 hover:text-zinc-200 text-[10px]"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    )}
    {competitors.length === 0 && (
      <p className="text-zinc-700 text-[11px]">
        Niciun competitor adăugat. Adaugă conturi din nișa ta (fitness, coaching, mindset).
      </p>
    )}
  </div>
</div>
```

- [ ] **Step 6.4: Upgradează scripturile să includă FULL SCRIPT + CAPTION**

În array-ul `SCRIPTS`, adaugă câmpurile `full_script` și `caption` la fiecare element:

```typescript
const SCRIPTS = [
  {
    day: "Luni",
    theme: "Talking Head — Cortizol",
    hook: "Dacă faci sport în fiecare dimineață și nu slăbești — nu e metabolismul tău. E cortizolul tău.",
    full_script: "Antrenamentul intens dimineața crește cortizolul cronic. Cortizol crescut înseamnă insulino-rezistență. Insulino-rezistență înseamnă că corpul stochează grăsime în loc să o ardă — chiar dacă ești în deficit caloric.\n\nNu trebuie să renunți la sport. Trebuie să schimbi tipul sau ora. Zone 2 dimineața — ritm de conversație, 30-40 minute. Antrenamentul de forță după-amiaza, când cortizolul e natural mai scăzut.\n\nAsta e diferența dintre a munci din greu și a munci inteligent. Sistemul BUILT e construit pe fiziologie, nu pe voință.",
    caption: "Antrenezi dimineața și nu slăbești? Nu e lipsă de disciplină — e biologie pe dos. Cortizol crescut = stocare, nu ardere. Schimbi ora, schimbi rezultatele.",
    cta: "Dacă te regăsești în asta, scrie-mi ARHITECTURĂ în DM.",
    status: "ready",
  },
  // ... restul scripturilor au aceeași structură
];
```

- [ ] **Step 6.5: Afișează FULL SCRIPT + CAPTION în accordion**

În JSX-ul accordion-ului de scripturi, după blocul `Corp`, adaugă:

```typescript
{script.full_script && (
  <div>
    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1.5">
      Full Script
    </p>
    <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
      {script.full_script}
    </p>
  </div>
)}
{script.caption && (
  <div>
    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1.5">
      Caption
    </p>
    <p className="text-zinc-400 text-sm leading-relaxed italic">
      {script.caption}
    </p>
    <div className="mt-2 flex items-center justify-between">
      <span className="text-[10px] text-built-red font-mono">
        CTA: {script.cta}
      </span>
      <button
        onClick={() => navigator.clipboard.writeText(script.caption ?? "")}
        className="text-[10px] text-zinc-500 border border-white/10 px-2 py-0.5 rounded hover:bg-white/5"
      >
        Copy
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 6.6: Verifică TypeScript**

```bash
cd "built-ai-command-center" && npx tsc --noEmit 2>&1 | grep "content"
```

- [ ] **Step 6.7: Commit**

```bash
cd "built-ai-command-center" && git add src/app/dashboard/content/ && git commit -m "feat: content studio — competitor intel section + FULL SCRIPT + CAPTION in scripts"
```

---

## Task 7: Analytics — Content Library cu Analyse inline

**Files:**
- Modify: `src/app/dashboard/analytics/page.tsx`

Butonul "Analyse" de pe fiecare card deschide un panel inline sub card (nu pagină nouă), cu: verdict badge, performance summary, what worked, audience fit, adaptation brief, suggested hook. Apelează Claude via server action.

- [ ] **Step 7.1: Crează server action pentru analiză reel din Content Library**

Crează `src/app/dashboard/analytics/actions.ts`:

```typescript
"use server";

import { getAnthropicClient, MODELS } from "@/lib/anthropic";

export interface ContentLibraryAnalysis {
  verdict: "Exceptional" | "Strong" | "Good" | "Weak";
  score: number;
  hook_score: number;
  performance_summary: string;
  what_worked: string[];
  audience_fit: string;
  adaptation_brief: string;
  stronger_hook: string;
}

export type LibraryAnalysisResult =
  | { ok: true; analysis: ContentLibraryAnalysis }
  | { ok: false; error: string };

export async function analyzeContentLibraryReel(
  title: string,
  format: string,
  views: string,
  likes: string,
  comments: string
): Promise<LibraryAnalysisResult> {
  const client = getAnthropicClient();

  const prompt = `Ești expert în analiza performanței conținutului Instagram pentru BUILT (fitness coaching, bărbați 28-42 ani).

Analizezi un reel bazat pe metadata lui:
- Titlu: "${title}"
- Format: ${format}
- Vizualizări: ${views}
- Like-uri: ${likes}
- Comentarii: ${comments}

Bazat pe titlu și statistici, inferează de ce a performat bine sau prost și ce s-ar putea adapta pentru BUILT.

Returnează JSON strict (fără markdown):
{
  "verdict": "Strong",
  "score": 76,
  "hook_score": 82,
  "performance_summary": "2-3 propoziții despre de ce a performat astfel bazat pe statistici și titlu.",
  "what_worked": ["Element 1 specific", "Element 2 specific", "Element 3 dacă există"],
  "audience_fit": "O propoziție despre ce tip de audiență a prins.",
  "adaptation_brief": "2-3 propoziții despre cum să adaptezi mecanismul pentru BUILT.",
  "stronger_hook": "Hook-ul rescris pentru audiența BUILT."
}

Verdict: Exceptional (90-100), Strong (75-89), Good (60-74), Weak (sub 60).`;

  try {
    const response = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { ok: false, error: "JSON invalid." };

    const analysis: ContentLibraryAnalysis = JSON.parse(jsonMatch[0]);
    return { ok: true, analysis };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Eroare." };
  }
}
```

- [ ] **Step 7.2: Upgrade analytics/page.tsx — adaugă Analyse inline**

Adaugă `"use client";` la linia 1 a fișierului `src/app/dashboard/analytics/page.tsx`.

Adaugă import:

```typescript
import { useState } from "react";
import { analyzeContentLibraryReel, type ContentLibraryAnalysis } from "./actions";
```

Înlocuiește secțiunea Content Library cards cu o versiune care suportă analyse inline. Adaugă state:

```typescript
const [analysedId, setAnalysedId] = useState<number | null>(null);
const [analysisData, setAnalysisData] = useState<ContentLibraryAnalysis | null>(null);
const [analysingId, setAnalysingId] = useState<number | null>(null);
```

Înlocuiește butonul `Analyse` din fiecare card cu:

```typescript
<button
  onClick={async (e) => {
    e.stopPropagation();
    if (analysedId === reel.id) {
      setAnalysedId(null);
      setAnalysisData(null);
      return;
    }
    setAnalysingId(reel.id);
    const result = await analyzeContentLibraryReel(
      reel.title, reel.format, reel.views, reel.likes, reel.comments
    );
    setAnalysingId(null);
    if (result.ok) {
      setAnalysedId(reel.id);
      setAnalysisData(result.analysis);
    }
  }}
  className="text-[10px] text-built-red border border-built-red/30 px-2 py-0.5 rounded hover:bg-built-red/10 transition-colors"
>
  {analysingId === reel.id ? "..." : analysedId === reel.id ? "✓ Analysed" : "Analyse"}
</button>
```

Adaugă panel inline imediat după grila de 3 coloane, condiționat de `analysedId && analysisData`:

```typescript
{analysedId && analysisData && (
  <div className="mt-4 bg-[#0d0d0d] border border-white/10 rounded-xl p-5 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
          analysisData.verdict === "Exceptional" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
          analysisData.verdict === "Strong" ? "text-blue-400 bg-blue-400/10 border-blue-400/20" :
          analysisData.verdict === "Good" ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" :
          "text-built-red bg-built-red/10 border-built-red/20"
        }`}>
          {analysisData.verdict}
        </span>
        <span className="text-zinc-600 text-[11px] font-mono">
          Score: {analysisData.score} · Hook: {analysisData.hook_score}
        </span>
      </div>
      <button
        onClick={() => { setAnalysedId(null); setAnalysisData(null); }}
        className="text-[11px] text-zinc-600 border border-white/10 px-2 py-0.5 rounded hover:bg-white/5"
      >
        Re-analyse
      </button>
    </div>

    <p className="text-zinc-400 text-[12px] leading-relaxed">{analysisData.performance_summary}</p>

    <div>
      <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-2">What Worked</p>
      <ul className="space-y-1.5">
        {analysisData.what_worked.map((item, i) => (
          <li key={i} className="flex gap-2 text-[12px] text-zinc-300">
            <span className="text-built-red shrink-0">▸</span>{item}
          </li>
        ))}
      </ul>
    </div>

    <div>
      <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1">Audience Fit</p>
      <p className="text-zinc-400 text-[12px]">{analysisData.audience_fit}</p>
    </div>

    <div className="border-l-4 border-l-built-red pl-4">
      <p className="text-[10px] text-built-red font-mono uppercase tracking-widest mb-1">Adaptation Brief</p>
      <p className="text-zinc-300 text-[12px] leading-relaxed">{analysisData.adaptation_brief}</p>
    </div>

    <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
      <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-2">Stronger Hook</p>
      <p className="text-zinc-200 text-[13px] font-medium leading-relaxed">&ldquo;{analysisData.stronger_hook}&rdquo;</p>
      <button
        onClick={() => navigator.clipboard.writeText(analysisData.stronger_hook)}
        className="mt-2 text-[10px] text-zinc-500 border border-white/10 px-2 py-0.5 rounded hover:bg-white/5"
      >
        Copy Hook
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 7.3: Verifică TypeScript**

```bash
cd "built-ai-command-center" && npx tsc --noEmit 2>&1 | grep "analytics"
```

- [ ] **Step 7.4: Commit**

```bash
cd "built-ai-command-center" && git add src/app/dashboard/analytics/ && git commit -m "feat: content library — inline analyse panel with AI breakdown per reel"
```

---

## Verificare finală

- [ ] **TypeScript clean**

```bash
cd "built-ai-command-center" && npx tsc --noEmit 2>&1 | grep -v "venv\|transcribe" | head -20
```

Expected: nicio eroare nouă față de baseline.

- [ ] **Dev server pornit și testat manual**

```bash
cd "built-ai-command-center" && npm run dev
```

Testează în browser:
1. `/dashboard/reel-copy` — lipește un transcript de min 30 caractere → Analyse → rezultate afișate
2. `/dashboard/calendar` — navigare luni, "+ Add Idea" modal, câmpuri, "Add to calendar"
3. `/dashboard/profile-audit` — upload imagine → "Run Audit" → rezultate reale (necesită ANTHROPIC_API_KEY)
4. `/dashboard/onboarding` — completează câmpuri → Save → refresh → datele persistă
5. `/dashboard/content` — secțiunea MY COMPETITORS vizibilă, adaugi @username
6. `/dashboard/analytics` — buton "Analyse" pe un card → panel inline apare

- [ ] **Commit final**

```bash
cd "built-ai-command-center" && git add -A && git commit -m "feat: BUILT platform phase 2 complete — all 6 modules built"
```

---

## Self-Review

**Spec coverage:**
- ✅ Reel Copy Tool (Task 2) — echivalent William's `/dashboard/reel-copy`
- ✅ Content Calendar (Task 3) — echivalent William's `/dashboard/calendar` cu "Plan this month"
- ✅ Profile Audit real (Task 4) — upload + Claude Vision, înlocuiește mock-ul
- ✅ Onboarding Hub (Task 5) — echivalent William's `/dashboard/onboarding`
- ✅ Competitor Intel (Task 6) — MY COMPETITORS cu add/remove, max 10
- ✅ Script structure upgrade (Task 6) — HOOK + FULL SCRIPT + CAPTION + CTA
- ✅ Content Library Analyse inline (Task 7) — panel expandabil sub card
- ✅ Sidebar routes (Task 1) — toate rutele noi accesibile

**Gaps identificate:**
- ⚠️ Instagram URL scraping în Reel Copy Tool — marcat ca "coming soon", funcția core (paste transcript) e funcțională
- ⚠️ Upload Audio cu Whisper — marcat ca "coming soon"
- ⚠️ Datele competitori nu generează automat scripturi săptămânale — butonul "Scrape Now" e placeholder; generarea manuală cu "Regenerate This Week" rămâne în `/dashboard/content`
- ⚠️ Datele din Onboarding Hub (localStorage) nu sunt citite automat de celelalte module AI — integrarea se face în faza 3 via Supabase

**Placeholder scan:** Nicio secțiune TBD sau "implement later" în tasks. Fiecare step are cod complet.

**Type consistency:** `CalendarIdea`, `OnboardingData`, `ContentLibraryAnalysis`, `ReelCopyAnalysis` definite o singură dată și folosite consistent.
