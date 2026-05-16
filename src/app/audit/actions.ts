"use server";

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
  // screenshot în base64 (opțional — dacă există, se trimite la Claude vision)
  screenshot_base64?: string;
  screenshot_media_type?: string;
  // câmpuri text fallback
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

## Format JSON strict (fără markdown, fără text înainte/după):
{
  "overall": 63,
  "elements": {
    "profile_picture": { "score": 7, "label": "Poză profil", "feedback": "string specific ce vezi/ce lipsește", "fix": "string — acțiunea exactă de implementat" },
    "name_username": { "score": 8, "label": "Nume & Username", "feedback": "string", "fix": "string" },
    "bio": { "score": 5, "label": "Bio", "feedback": "string — ce lipsește, ce e prea generic", "fix": "string — ce trebuie să includă" },
    "link_in_bio": { "score": 4, "label": "Link în Bio", "feedback": "string", "fix": "string" },
    "highlights": { "score": 6, "label": "Highlights", "feedback": "string", "fix": "string" },
    "pinned_posts": { "score": 3, "label": "Posturi Fixate", "feedback": "string", "fix": "string" }
  },
  "top_priority": "string — cel mai important lucru de schimbat AZI (1 frază, specifică)",
  "rewritten_bio": "string — bio-ul rescris COMPLET, gata de copy-paste, în vocea BUILT, cu CTA inclus. Ex: 'Reconstruiesc corpul bărbaților ocupați în 90 de zile. Fără dietă restrictivă. Fără ore la sală. → DM ARHITECTURĂ'",
  "quick_wins": [
    "string — schimbare implementabilă în sub 10 minute",
    "string",
    "string"
  ]
}`;

  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemPrompt = `Ești un expert în optimizarea profilurilor Instagram pentru coaching fitness.
Contextul creatorului: ${JSON.stringify(creier).slice(0, 1500)}

REGULA CRITICĂ: Răspunzi EXCLUSIV cu JSON valid. Nicio formatare markdown (fără **, fără _, fără rânduri noi brute în valorile string). Toate valorile text din JSON trebuie să fie pe un singur rând sau cu \\n escaped. Niciun text în afara JSON-ului.`;

    // Construiește mesajul — cu sau fără imagine
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

    userContent.push({ type: "text", text: "Auditează profilul. JSON strict." });

    const message = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns fără text." };

    const t = textBlock.text.trim();
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    if (a === -1) return { ok: false, error: "JSON invalid." };

    let jsonStr = t.slice(a, b + 1);
    let audit: InstagramAudit;
    try {
      audit = JSON.parse(jsonStr) as InstagramAudit;
    } catch {
      // Sanitize unescaped control characters inside string literals only
      let cleaned = "";
      let inString = false;
      let escape = false;
      for (let i = 0; i < jsonStr.length; i++) {
        const c = jsonStr[i];
        if (inString) {
          if (c === '\\') {
            cleaned += c;
            escape = !escape;
          } else if (c === '"' && !escape) {
            cleaned += c;
            inString = false;
            escape = false;
          } else {
            if (c === '\n') cleaned += "\\n";
            else if (c === '\r') cleaned += "\\r";
            else if (c === '\t') cleaned += "\\t";
            else if (c.charCodeAt(0) < 32) {} // ignore other control chars
            else cleaned += c;
            escape = false;
          }
        } else {
          if (c === '"') {
            cleaned += c;
            inString = true;
          } else {
            cleaned += c;
          }
        }
      }
      try {
        audit = JSON.parse(cleaned) as InstagramAudit;
      } catch (err) {
        return { ok: false, error: 'JSON malformat. Incearca din nou. Detalii: ' + (err instanceof Error ? err.message : '') };
      }
    }

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
