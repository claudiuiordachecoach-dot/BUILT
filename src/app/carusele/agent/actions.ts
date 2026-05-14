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
