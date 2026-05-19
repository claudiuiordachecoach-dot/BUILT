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

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const freeDates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayOfWeek = new Date(dateStr).getDay();
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

export type HookResult =
  | { ok: true; hook: string }
  | { ok: false; error: string };

export async function generateHookForIdea(opts: {
  format: string;
  contentBrief: string;
  contentPillar: string;
}): Promise<HookResult> {
  try {
    const client = getAnthropicClient();

    let creierContext = "";
    try {
      const creier = await readCreierFromSupabase();
      if (creier) {
        creierContext = JSON.stringify(creier).slice(0, 800);
      }
    } catch {
      // merge fara context
    }

    const prompt = `Ești CMO pentru BUILT (fitness coaching arhitectural, 90 zile, bărbați 28-42 ani).${
      creierContext ? `\n\nContextul BUILT:\n${creierContext}` : ""
    }

Generează UN SINGUR hook pentru un reel Instagram BUILT.

Format video: ${opts.format}
Brief conținut: ${opts.contentBrief}
Pilon BUILT: ${opts.contentPillar}

Reguli pentru hook:
- Max 12 cuvinte
- Trebuie să oprească scrollul în 0-3 secunde
- Variantele bune: cifră specifică + durere, declarație contraintuitivă, oglindire directă a situației clientului
- Fără clișee fitness ("transformare", "journey", "secretul")
- Vocea lui Claudiu: direct, matur, specific

Returnează DOAR hook-ul, fără ghilimele, fără explicații.`;

    const response = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 60,
      messages: [{ role: "user", content: prompt }],
    });

    const hook =
      response.content[0]?.type === "text"
        ? response.content[0].text.trim()
        : "";
    return { ok: true, hook };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return { ok: false, error: message };
  }
}

export async function generateReelRecommendations(
  caption: string,
  views: number | null,
  likes: number | null,
  comments: number | null,
  postedAt: string | null
): Promise<{ ok: true; recommendations: string[] } | { ok: false; error: string }> {
  try {
    const client = getAnthropicClient();
    const creier = await readCreierFromSupabase().catch(() => null);
    const context = creier ? JSON.stringify(creier).slice(0, 1000) : "";

    const prompt = `Ești un expert în optimizarea conținutului Instagram pentru BUILT coaching.
${context ? `Context BUILT: ${context}` : ""}

Analizează acest reel postat și generează 5-7 recomandări concrete și acționabile pentru a-l îmbunătăți sau pentru a crea variante mai bune.

REEL:
- Caption: "${caption?.slice(0, 300) ?? "fără caption"}"
- Views: ${views ?? 0}
- Likes: ${likes ?? 0}
- Comments: ${comments ?? 0}
- Postat: ${postedAt?.slice(0, 10) ?? "necunoscut"}

Returnează STRICT un JSON array de strings (fără markdown):
["recomandare 1 specifică", "recomandare 2 specifică", "recomandare 3 specifică", "recomandare 4 specifică", "recomandare 5 specifică"]

Fiecare recomandare: acționabilă imediat, specifică, în vocea BUILT. Max 2 propoziții per recomandare.`;

    const response = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "[]";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return { ok: false, error: "JSON invalid" };
    const recs: string[] = JSON.parse(match[0]);
    return { ok: true, recommendations: recs };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Eroare" };
  }
}
