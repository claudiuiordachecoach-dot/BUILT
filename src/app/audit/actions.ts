"use server";

import { getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface AuditElement {
  score: number;
  label: string;
  feedback_good: string;
  feedback_bad: string;
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
  new_bio_explanation: string;
  suggested_highlights: string[];
  priority_fixes: string[];
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

## Returnează DOAR JSON STRICT (fără markdown, fără text înainte/după), exact această structură:
{"overall":6.3,"elements":{"profile_picture":{"score":0,"label":"Profile Picture","feedback_good":"...","feedback_bad":"...","fix":"..."},"name_username":{"score":0,"label":"Name & Username","feedback_good":"...","feedback_bad":"...","fix":"..."},"bio":{"score":0,"label":"Bio","feedback_good":"...","feedback_bad":"...","fix":"..."},"link_in_bio":{"score":0,"label":"Link in Bio","feedback_good":"...","feedback_bad":"...","fix":"..."},"highlights":{"score":0,"label":"Highlights","feedback_good":"...","feedback_bad":"...","fix":"..."},"pinned_posts":{"score":0,"label":"Pinned Posts","feedback_good":"...","feedback_bad":"...","fix":"..."}},"top_priority":"cel mai important fix de azi","rewritten_bio":"bio complet rescris, gata de copiat, cu CTA","new_bio_explanation":"2-3 propoziții de ce bio-ul actual eșuează și ce repară rescrierea","suggested_highlights":["5 nume de highlights"],"priority_fixes":["3 fix-uri implementabile azi"]}
Fiecare element: score 0-10. Răspunde în română.`;

  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemPrompt = `Ești un expert în optimizarea profilurilor Instagram pentru coaching fitness.
Contextul creatorului: ${JSON.stringify(creier).slice(0, 1500)}

REGULA CRITICĂ: Analizează profilul și răspunde DOAR cu JSON valid în structura cerută. Niciun text suplimentar înainte sau după JSON.`;

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
      model: MODELS.deep,
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { ok: false, error: "AI nu a returnat structura de audit." };
    }
    const t = textBlock.text.trim();
    const a = t.indexOf("{");
    const b = t.lastIndexOf("}");
    if (a === -1 || b <= a) return { ok: false, error: "JSON invalid de la AI." };
    const audit = JSON.parse(t.slice(a, b + 1)) as InstagramAudit;

    // Salvează în DB (best effort)
    try {
      const supabase = getSupabaseServer({ useServiceRole: true });
      await supabase.from("profile_audits").insert({
        score: audit.overall,
        recommendations: { priority_fixes: audit.priority_fixes, top_priority: audit.top_priority, elements: audit.elements },
        new_bio: audit.rewritten_bio,
      });
    } catch { /* ignorăm — audit-ul e valid */ }

    return { ok: true, audit };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}
