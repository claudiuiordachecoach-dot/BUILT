"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { getAnthropicClient, MODELS } from "@/lib/anthropic";
import { PRESENTATION_TEMPLATE } from "./template";

interface ExtractedData {
  prenume: string;
  situatie_actuala: string;
  obstacole: string[];
  obiectiv_90_zile: string;
  motiv_esec: string;
}

async function extractFromTranscript(transcript: string): Promise<ExtractedData> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: MODELS.routine,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: `Ești un asistent care analizează transcripturi de discovery call-uri pentru coaching fitness BUILT.
Extrage câmpurile cerute direct din transcript. Scrie în română, concret, folosind cuvintele reale ale persoanei.
Dacă un câmp nu e clar în transcript, formulează ceva credibil pe baza contextului.
Returnează DOAR JSON valid, fără alte explicații sau markdown.`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Transcript:\n${transcript}\n\nReturnează JSON cu exact această structură:\n{"prenume":"prenumele prospectului","situatie_actuala":"situația lui acum în 2-3 propoziții, în cuvintele lui","obstacole":["obstacol 1","obstacol 2","obstacol 3"],"obiectiv_90_zile":"ce vrea să obțină în 90 de zile, 1-2 propoziții","motiv_esec":"de ce n-a mers înainte, reîncadrat ca problemă de sistem, 1-2 propoziții"}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Răspuns AI fără text.");
  }

  const text = textBlock.text.trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("JSON invalid în răspunsul AI.");

  return JSON.parse(text.slice(start, end + 1)) as ExtractedData;
}

function populateTemplate(data: ExtractedData): string {
  const dataRo = new Date().toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const obstacoleList = data.obstacole
    .map((o) => `<li>${o}</li>`)
    .join("");

  return PRESENTATION_TEMPLATE
    .replace(/{{prenume}}/g, data.prenume)
    .replace(/{{situatie_actuala}}/g, data.situatie_actuala)
    .replace(/{{obstacole_list}}/g, obstacoleList)
    .replace(/{{obiectiv_90_zile}}/g, data.obiectiv_90_zile)
    .replace(/{{motiv_esec}}/g, data.motiv_esec)
    .replace(/{{data_generare}}/g, dataRo);
}

function generateSlug(): string {
  return Math.random().toString(36).substring(2, 10);
}

export type GenerateResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

export async function generatePresentation(
  transcript: string
): Promise<GenerateResult> {
  const trimmed = transcript.trim();
  if (!trimmed) return { ok: false, error: "Transcriptul este gol." };

  try {
    const extracted = await extractFromTranscript(trimmed);
    const html = populateTemplate(extracted);
    const slug = generateSlug();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const supabase = getSupabaseServer();
    const { error } = await supabase.from("presentations").insert({
      slug,
      prospect_name: extracted.prenume,
      html_content: html,
      expires_at: expiresAt,
    });

    if (error) throw new Error(error.message);

    return { ok: true, slug };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return { ok: false, error: message };
  }
}
