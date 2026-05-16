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

export async function fetchReelByUrl(
  url: string
): Promise<{ ok: true; caption: string; views: number; likes: number } | { ok: false; error: string }> {
  const apiKey = process.env.APIFY_API_KEY;
  if (!apiKey) return { ok: false, error: "APIFY_API_KEY lipsă." };

  // Extract shortcode from URL
  const match = url.match(/\/(reel|p)\/([A-Za-z0-9_-]+)/);
  const shortcode = match?.[2];
  if (!shortcode) return { ok: false, error: "URL invalid. Exemplu: https://www.instagram.com/reel/ABC123/" };

  try {
    // Start Apify run
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-reel-scraper/runs?token=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directUrls: [url], resultsLimit: 1 }),
      }
    );
    if (!runRes.ok) throw new Error(`Apify error: ${runRes.status}`);
    const run = await runRes.json();
    const runId = run.data?.id;
    if (!runId) throw new Error("Nu s-a obținut run ID de la Apify.");

    // Poll until done (max 90s)
    let datasetId = "";
    for (let i = 0; i < 18; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`);
      const status = await statusRes.json();
      if (status.data?.status === "SUCCEEDED") {
        datasetId = status.data.defaultDatasetId;
        break;
      }
      if (status.data?.status === "FAILED") throw new Error("Apify run eșuat.");
    }
    if (!datasetId) throw new Error("Timeout — Apify nu a terminat în 90s. Încearcă Paste Transcript.");

    const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiKey}&limit=1`);
    const items = await itemsRes.json();
    const item = Array.isArray(items) ? items[0] : null;
    if (!item) throw new Error("Apify nu a returnat date pentru acest URL.");

    const caption = String(item.caption ?? item.description ?? "").slice(0, 3000);
    const views = Number(item.videoViewCount ?? item.viewsCount ?? 0);
    const likes = Number(item.likesCount ?? 0);

    return { ok: true, caption, views, likes };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Eroare necunoscută." };
  }
}
