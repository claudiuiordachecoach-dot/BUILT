"use server";

import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface AuditElement {
  score: number;
  label: string;
  feedback: string;
  fix: string;
}

export interface InstagramAudit {
  overall: number;
  elements: {
    profile_picture: AuditElement;
    name_username: AuditElement;
    bio: AuditElement;
    link_in_bio: AuditElement;
    highlights: AuditElement;
    pinned_posts: AuditElement;
  };
  top_priority: string;
  rewritten_bio: string;
  quick_wins: string[];
}

export type AuditResult = { ok: true; audit: InstagramAudit } | { ok: false; error: string };

export interface AuditInput {
  handle: string;
  followers: string;
  screenshot_base64?: string;
  screenshot_media_type?: string;
  bio: string;
  highlights: string;
  last_posts: string;
  posting_frequency: string;
}

const auditTool: Anthropic.Tool = {
  name: "submit_instagram_audit",
  description: "Submit the calculated Instagram profile audit scores and recommendations.",
  input_schema: {
    type: "object",
    properties: {
      overall: { type: "number", description: "Overall weighted score out of 100 (e.g. 65)" },
      elements: {
        type: "object",
        properties: {
          profile_picture: {
            type: "object",
            properties: {
              score: { type: "number", description: "Score 0-10" },
              label: { type: "string", description: "Label e.g. 'Poză profil'" },
              feedback: { type: "string", description: "Specific critique of the profile picture" },
              fix: { type: "string", description: "Exact action to fix it" }
            },
            required: ["score", "label", "feedback", "fix"]
          },
          name_username: {
            type: "object",
            properties: {
              score: { type: "number", description: "Score 0-10" },
              label: { type: "string", description: "Label e.g. 'Nume & Username'" },
              feedback: { type: "string", description: "Specific critique of handle and name" },
              fix: { type: "string", description: "Exact action to fix it" }
            },
            required: ["score", "label", "feedback", "fix"]
          },
          bio: {
            type: "object",
            properties: {
              score: { type: "number", description: "Score 0-10" },
              label: { type: "string", description: "Label e.g. 'Bio'" },
              feedback: { type: "string", description: "Specific critique of the bio clarity and value" },
              fix: { type: "string", description: "Exact action to fix it" }
            },
            required: ["score", "label", "feedback", "fix"]
          },
          link_in_bio: {
            type: "object",
            properties: {
              score: { type: "number", description: "Score 0-10" },
              label: { type: "string", description: "Label e.g. 'Link în Bio'" },
              feedback: { type: "string", description: "Specific critique of the CTA and link destination" },
              fix: { type: "string", description: "Exact action to fix it" }
            },
            required: ["score", "label", "feedback", "fix"]
          },
          highlights: {
            type: "object",
            properties: {
              score: { type: "number", description: "Score 0-10" },
              label: { type: "string", description: "Label e.g. 'Highlights'" },
              feedback: { type: "string", description: "Specific critique of story highlights strategy" },
              fix: { type: "string", description: "Exact action to fix it" }
            },
            required: ["score", "label", "feedback", "fix"]
          },
          pinned_posts: {
            type: "object",
            properties: {
              score: { type: "number", description: "Score 0-10" },
              label: { type: "string", description: "Label e.g. 'Posturi Fixate'" },
              feedback: { type: "string", description: "Specific critique of pinned reels/posts" },
              fix: { type: "string", description: "Exact action to fix it" }
            },
            required: ["score", "label", "feedback", "fix"]
          }
        },
        required: ["profile_picture", "name_username", "bio", "link_in_bio", "highlights", "pinned_posts"]
      },
      top_priority: { type: "string", description: "The single most important fix to make today (1 specific sentence)" },
      rewritten_bio: { type: "string", description: "The complete rewritten bio ready for copy-paste, in BUILT voice with CTA. Ex: 'Reconstruiesc corpul bărbaților ocupați în 90 de zile. Fără dietă restrictivă. Fără ore la sală. → DM ARHITECTURĂ'" },
      quick_wins: {
        type: "array",
        items: { type: "string" },
        description: "List of 3 quick wins implementable in under 10 minutes"
      }
    },
    required: ["overall", "elements", "top_priority", "rewritten_bio", "quick_wins"]
  }
};

export async function auditProfile(input: AuditInput): Promise<AuditResult> {
  const hasScreenshot = !!input.screenshot_base64;
  const hasText = !!(input.bio.trim() || input.last_posts.trim());

  if (!hasScreenshot && !hasText) {
    return { ok: false, error: "Încarcă un screenshot sau completează bio-ul + postările." };
  }

  const textContext = `
Handle: @${input.handle || "necunoscut"}
Followeri: ${input.followers || "necunoscut"}
${input.bio ? `Bio: "${input.bio}"` : ""}
${input.highlights ? `Highlights: ${input.highlights}` : ""}
${input.last_posts ? `Ultimele posturi: ${input.last_posts}` : ""}
${input.posting_frequency ? `Frecvență postări: ${input.posting_frequency}` : ""}`.trim();

  const task = `# TASK: Audit Profil Instagram complet — 6 elemente + bio rescris

${hasScreenshot ? "## Screenshot profil atașat\nAnalizează vizual screenshot-ul. Descrie ce vezi pentru fiecare element.\n\n" : ""}## Date profil
${textContext}

## Cele 6 elemente de auditat (fiecare 0-10 pct) — exact ca un expert de brand personal
1. **profile_picture** — Calitate, profesionalism, face vizibil, fundal? Transmite autoritate?
2. **name_username** — Handle memorabil, searchable, consistent cu brandul?
3. **bio** — Clarifică cine ești, pentru cine, ce câștigă. CTA prezent? Specific sau generic?
4. **link_in_bio** — Există? Duce undeva relevant? E clar ce se întâmplă după click?
5. **highlights** — Organizate strategic? Dovadă socială? Onboarding pentru nou-veniți? Iau conținut bun?
6. **pinned_posts** — Sunt cel mai bun conținut? Convertesc un vizitator nou?

## Verdict global: media ponderată a celor 6 elemente × 10

Apelează instrumentul submit_instagram_audit cu rezultatele exacte.`;

  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemPrompt = `Ești un expert în optimizarea profilurilor Instagram pentru coaching fitness.
Contextul creatorului: ${JSON.stringify(creier).slice(0, 1500)}

REGULA CRITICĂ: Analizează profilul și apelează instrumentul submit_instagram_audit cu structura completă. Niciun text suplimentar.`;

    type AllowedMime = "image/png" | "image/jpeg" | "image/gif" | "image/webp";
    const ALLOWED_MIMES = new Set<string>(["image/png", "image/jpeg", "image/gif", "image/webp"]);

    type ContentBlock =
      | { type: "text"; text: string }
      | { type: "image"; source: { type: "base64"; media_type: AllowedMime; data: string } };

    const userContent: ContentBlock[] = [];

    if (hasScreenshot && input.screenshot_base64) {
      const raw = input.screenshot_media_type ?? "image/png";
      const mime: AllowedMime = ALLOWED_MIMES.has(raw) ? (raw as AllowedMime) : "image/png";
      userContent.push({
        type: "image",
        source: { type: "base64", media_type: mime, data: input.screenshot_base64 },
      });
    }

    userContent.push({ type: "text", text: task });

    const message = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
      tools: [auditTool],
      tool_choice: { type: "tool", name: "submit_instagram_audit" },
    });

    const toolBlock = message.content.find((b) => b.type === "tool_use");
    if (!toolBlock || toolBlock.type !== "tool_use") {
      return { ok: false, error: "AI nu a returnat structura de audit." };
    }

    const audit = toolBlock.input as unknown as InstagramAudit;

    // Salvează în DB (best effort)
    try {
      const supabase = getSupabaseServer({ useServiceRole: true });
      await supabase.from("profile_audits").insert({
        score: audit.overall,
        recommendations: { quick_wins: audit.quick_wins, top_priority: audit.top_priority, elements: audit.elements },
        new_bio: audit.rewritten_bio,
      });
    } catch { /* ignorăm — audit-ul e valid */ }

    return { ok: true, audit };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}
