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
