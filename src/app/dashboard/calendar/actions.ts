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
