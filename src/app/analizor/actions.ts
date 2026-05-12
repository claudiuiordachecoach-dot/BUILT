"use server";

import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";

export interface ReelScore {
  overall: number;
  verdict: "Strong" | "Good" | "Weak" | "Poor";
  hook: { score: number; feedback: string };
  message: { score: number; feedback: string };
  cta: { score: number; feedback: string };
  voice: { score: number; feedback: string };
  suggested_hook: string;
  key_strengths: string[];
  key_fixes: string[];
  key_lessons: string[];
  adaptation_brief: string;
}

export type AnalyzeResult = { ok: true; score: ReelScore } | { ok: false; error: string };

export async function analyzeReel(transcript: string, context: string): Promise<AnalyzeResult> {
  const text = transcript.trim();
  if (text.length < 20) return { ok: false, error: "Scriptul trebuie să aibă cel puțin 20 caractere." };

  const task = `# TASK: Analizează Reel-ul — scor + brief de adaptare

## Reel de analizat
${context ? `Context: ${context}\n\n` : ""}Script/Transcript:
"${text}"

## Criteriile de evaluare BUILT
1. **HOOK** (0–25 pct): Oprești scrollul în primele 3 secunde? Declarație contraintuitivă, cifră, oglindire directă?
2. **MESAJ** (0–35 pct): Numești durerea exact? Explici mecanismul? Prezinți sistemul cu specificitate?
3. **CTA** (0–20 pct): Un singur CTA? Ton de diagnostic, nu de vânzare? Acționabil imediat?
4. **VOCE BUILT** (0–20 pct): Zero clișee? Vocabular BUILT (sistem, arhitectură, protocol)? Ton direct și matur?

## Verdict global
- 85-100: Strong
- 70-84: Good
- 50-69: Weak
- 0-49: Poor

## Format răspuns — JSON strict (fără markdown, fără text înainte/după):
{
  "overall": 76,
  "verdict": "Strong",
  "hook": { "score": 18, "feedback": "string — ce merge și ce nu, specific" },
  "message": { "score": 28, "feedback": "string" },
  "cta": { "score": 14, "feedback": "string" },
  "voice": { "score": 16, "feedback": "string" },
  "suggested_hook": "string — hook alternativ mai puternic în vocea BUILT, 1 propoziție",
  "key_strengths": ["string", "string"],
  "key_fixes": ["string — cea mai importantă problemă", "string — a doua problemă"],
  "key_lessons": [
    "string — lecție 1 extrasă din ce funcționează sau nu în reel",
    "string — lecție 2",
    "string — lecție 3"
  ],
  "adaptation_brief": "string — cum adaptezi EXACT mecanismul acestui reel în vocea BUILT și pentru ICP-ul tău (bărbat 28-42, profesionist cu burtă). 2-3 propoziții specifice, nu generice."
}`;

  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({ creierJson: JSON.stringify(creier, null, 2), taskContext: task });

    const message = await client.messages.create({
      model: MODELS.routine, max_tokens: 1200, system: systemBlocks,
      messages: [{ role: "user", content: "Analizează reel-ul. JSON strict." }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns AI fără text." };

    const trimmed = textBlock.text.trim();
    const start = trimmed.indexOf("{"), end = trimmed.lastIndexOf("}");
    if (start === -1) return { ok: false, error: "JSON invalid." };
    const score = JSON.parse(trimmed.slice(start, end + 1)) as ReelScore;
    return { ok: true, score };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}
