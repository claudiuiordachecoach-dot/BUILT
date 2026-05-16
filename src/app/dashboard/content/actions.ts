"use server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAuth } from "@/lib/supabase/auth-server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { scrapeInstagramReels, scrapeReelComments, type ApifyComment } from "@/lib/apify";
import { getAnthropicClient, buildSystemBlocks, MODELS } from "@/lib/anthropic";
import { readCreierFromFile } from "@/lib/creier";

const anthropic = new Anthropic();

export async function listCompetitors() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("competitors")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function addCompetitor(handle: string) {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("competitors").insert({ handle: handle.replace("@", "") });
  return { error: error?.message };
}

export async function removeCompetitor(id: number) {
  const supabase = getSupabaseServer();
  await supabase.from("competitors").delete().eq("id", id);
}

export async function scrapeCompetitors() {
  const supabase = getSupabaseServer();
  const { data: competitors } = await supabase.from("competitors").select("handle");
  if (!competitors?.length) return { scraped: 0 };

  const { transcribeVideoUrl } = await import("@/lib/assemblyai");

  let total = 0;
  for (const comp of competitors) {
    try {
      const reels = await scrapeInstagramReels(comp.handle, 10);

      // Sortează după views și ia top 3 pentru comentarii
      const sorted = [...reels].sort((a, b) => b.viewsCount - a.viewsCount);
      const topReelUrls = new Set(sorted.slice(0, 3).map(r => r.url));

      for (const reel of reels) {
        let transcript: string | null = null;
        if (reel.videoUrl) {
          try {
            transcript = await transcribeVideoUrl(reel.videoUrl);
          } catch {
            transcript = null;
          }
        }

        // Comentarii doar pentru top 3 reeluri (economie de API calls)
        let comments: ApifyComment[] = [];
        if (topReelUrls.has(reel.url) && reel.url) {
          try {
            comments = await scrapeReelComments(reel.url, 30);
          } catch {
            comments = [];
          }
        }

        await supabase.from("competitor_reels").upsert({
          competitor_handle: comp.handle,
          instagram_id: reel.id,
          thumbnail_url: reel.thumbnailUrl,
          caption: reel.caption,
          views: reel.viewsCount,
          likes: reel.likesCount,
          posted_at: reel.timestamp,
          transcript,
          comments,
        }, { onConflict: "instagram_id" });
      }
      total += reels.length;
    } catch (e) {
      console.error(`Failed scraping ${comp.handle}:`, e);
    }
  }
  return { scraped: total };
}

export async function getLatestWeeklyPackage(): Promise<WeeklyPackage | null> {
  try {
    const supabase = getSupabaseServer({ useServiceRole: true });
    const { data } = await supabase
      .from("weekly_packages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!data) return null;

    if (data.package_json) {
      try {
        return JSON.parse(data.package_json) as WeeklyPackage;
      } catch {}
    }

    return {
      week_of: data.week_of || data.week_start || new Date().toISOString().slice(0, 10),
      generated_at: data.generated_at || data.created_at || new Date().toISOString(),
      intelligence_report: data.intelligence_report || { whats_popping: [], performance_last_week: [], accounts_to_watch: [] },
      scripts: data.scripts || [],
    };
  } catch {
    return null;
  }
}

export async function generateWeeklyPackage() {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const db = getSupabaseServer();

  const { data: creierSections } = await db
    .from("creier_sections").select("title, content").eq("status", "completed").order("order_index");
  const { data: competitorReels } = await db
    .from("competitor_reels").select("caption, views, competitor_handle")
    .order("views", { ascending: false }).limit(20);
  const { data: myReels } = await supabase
    .from("instagram_media").select("caption, views, format_type")
    .eq("user_id", user.id).order("posted_at", { ascending: false }).limit(10);

  const creierContext = creierSections?.map(s => `## ${s.title}\n${JSON.stringify(s.content)}`).join('\n\n') ?? "";
  const competitorContext = competitorReels?.map(r => `@${r.competitor_handle}: ${r.views} views — "${r.caption?.slice(0, 100)}"`).join('\n') ?? "Nu există date competitor";
  const myContext = myReels?.map(r => `${r.format_type}: ${r.views} views — "${r.caption?.slice(0, 80)}"`).join('\n') ?? "Nu există date proprii";

  const prompt = `Ești strategul de content al lui Iordache Claudiu (BUILT — Arhitectura Corpului pe 90 de zile).

PROFILUL LUI CLAUDIU:
${creierContext}

TOP REELS COMPETITORI (această săptămână):
${competitorContext}

REELS PROPRII RECENTE:
${myContext}

Generează un pachet săptămânal COMPLET în format JSON cu această structură exactă:
{
  "intelligence_report": {
    "whats_popping": ["insight1", "insight2", "insight3"],
    "performance_insights": ["format_insight1", "format_insight2"],
    "accounts_to_watch": ["@handle1 — de ce", "@handle2 — de ce"]
  },
  "scripts": [
    {
      "day": "Luni",
      "hook": "hook-ul bold",
      "script": "scriptul complet",
      "caption": "caption-ul cu CTA DM ARHITECTURĂ"
    }
  ]
}

Generează 6 scripturi (Luni-Sâmbătă). Fiecare script trebuie să fie în vocea lui Claudiu, bazat pe pilonii BUILT, cu hook contraintuativ, mecanism fiziologic/psihologic, sistem BUILT ca soluție, CTA discret.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { intelligence_report: {}, scripts: [] };

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from("weekly_packages")
    .select("id")
    .eq("user_id", user.id)
    .eq("week_start", weekStartStr)
    .single();

  if (existing?.id) {
    await supabase.from("weekly_packages").update({
      intelligence_report: parsed.intelligence_report,
      scripts: parsed.scripts,
      generated_at: new Date().toISOString(),
    }).eq("id", existing.id);
  } else {
    await supabase.from("weekly_packages").insert({
      user_id: user.id,
      week_start: weekStartStr,
      intelligence_report: parsed.intelligence_report,
      scripts: parsed.scripts,
      generated_at: new Date().toISOString(),
    });
  }

  return parsed;
}

export interface WeeklyScript {
  day: string;
  type: string;
  hook: string;
  full_script: string;
  caption: string;
  cta: string;
}

export interface WeeklyIntelligenceReport {
  whats_popping: string[];
  performance_last_week: string[];
  accounts_to_watch: string[];
}

export interface WeeklyPackage {
  week_of: string;
  generated_at: string;
  intelligence_report: WeeklyIntelligenceReport;
  scripts: WeeklyScript[];
}

export async function generateWeeklyPackageAI(): Promise<{ ok: true; pkg: WeeklyPackage } | { ok: false; error: string }> {
  try {
    const supabase = getSupabaseServer();

    // Ia reels competitori din ultimele 7 zile
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: competitorReels } = await supabase
      .from("competitor_reels")
      .select("competitor_handle, caption, views, likes, transcript, comments")
      .gte("posted_at", weekAgo)
      .order("views", { ascending: false })
      .limit(20);

    const creier = await readCreierFromFile();
    const creierJson = JSON.stringify(creier, null, 2);
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({ creierJson });

    const competitorContext = competitorReels?.length
      ? `REELS COMPETITORI (ultimele 7 zile, ordonate după views):\n${competitorReels.map((r, i) => {
          const comments = Array.isArray(r.comments) ? r.comments as ApifyComment[] : [];
          const topComments = comments.slice(0, 5).map((c: ApifyComment) => `  - "${c.text.slice(0, 120)}"`).join("\n");
          return `${i + 1}. @${r.competitor_handle} — ${r.views} views\nCaption: ${r.caption?.slice(0, 200)}\nTranscript: ${r.transcript?.slice(0, 300) ?? "N/A"}${topComments ? `\nTop comentarii audiență:\n${topComments}` : ""}`;
        }).join("\n\n")}`
      : "Nu există date de la competitori pentru această săptămână. Generează pe baza creierului BUILT.";

    // Feedback loop: top learnings din reels-urile proprii analizate
    const { data: analysedReels } = await supabase
      .from("instagram_media")
      .select("ai_analysis, views, caption")
      .not("ai_analysis", "is", null)
      .order("views", { ascending: false })
      .limit(5);

    const learningsContext = analysedReels?.length
      ? `\n\nLEARNINGS DIN PROPRIILE REELS (ce a mers cel mai bine la @iordacheclaudiu_):\n${analysedReels.map((r, i) => {
          const a = r.ai_analysis as { what_worked?: string[]; stronger_hook?: string; hook_score?: number } | null;
          return `${i + 1}. ${r.views} views — Hook score: ${a?.hook_score ?? "N/A"}\nCe a funcționat: ${(a?.what_worked ?? []).join(", ")}\nHook câștigător: ${a?.stronger_hook ?? "N/A"}`;
        }).join("\n\n")}\n\nFolosește aceste patterns dovedite ca inspirație directă pentru hook-urile din săptămâna aceasta.`
      : "";

    const prompt = `${competitorContext}${learningsContext}

Ești CMO pentru BUILT — metoda Iordache Claudiu. Generează pachetul săptămânal complet.

Returnează STRICT un JSON cu această structură exactă (fără text în afara JSON-ului):

{
  "intelligence_report": {
    "whats_popping": ["observație1", "observație2", "observație3", "observație4"],
    "performance_last_week": ["format1 — analiză", "format2 — analiză", "format3 — analiză", "format4 — analiză", "format5 — analiză"],
    "accounts_to_watch": ["@handle — motiv", "@handle — motiv", "@handle — motiv", "@handle — motiv", "@handle — motiv", "@handle — motiv"]
  },
  "scripts": [
    {
      "day": "Luni",
      "type": "Talking Head",
      "hook": "Hook-ul de deschidere — max 12 cuvinte, oprește scrollul",
      "full_script": "Scriptul complet, 150-250 cuvinte, gata de filmat. Paragrafe scurte. Specific.",
      "caption": "Caption-ul pentru Instagram, 2-3 propoziții, CTA inclus",
      "cta": "Acțiunea exactă — ex: Scrie-mi ARHITECTURĂ în DM"
    },
    { "day": "Marți", "type": "Comparație", "hook": "...", "full_script": "...", "caption": "...", "cta": "..." },
    { "day": "Miercuri", "type": "Client Proof", "hook": "...", "full_script": "...", "caption": "...", "cta": "..." },
    { "day": "Joi", "type": "Lead Magnet", "hook": "...", "full_script": "...", "caption": "...", "cta": "..." },
    { "day": "Vineri", "type": "Controversă", "hook": "...", "full_script": "...", "caption": "...", "cta": "..." },
    { "day": "Sâmbătă", "type": "Question Hook", "hook": "...", "full_script": "...", "caption": "...", "cta": "..." },
    { "day": "Duminică", "type": "Story Time", "hook": "...", "full_script": "...", "caption": "...", "cta": "..." }
  ]
}

Reguli:
- Vocea lui Claudiu: direct, matur, fără clișee fitness, vocabular BUILT
- Fiecare script adresează un pilon BUILT
- Hook: cifră specifică, declarație contraintuitivă sau oglindire directă a durerii
- Full script: paragrafe scurte, propoziții scurte, specific, fără intro lungi
- CTA: discret, ca un diagnostic nu ca o vânzare`;

    const response = await client.messages.create({
      model: MODELS.deep,
      max_tokens: 4096,
      system: systemBlocks,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON invalid în răspuns AI");

    const parsed = JSON.parse(jsonMatch[0]);
    const weekOf = new Date().toISOString().slice(0, 10);

    const pkg: WeeklyPackage = {
      week_of: weekOf,
      generated_at: new Date().toISOString(),
      intelligence_report: parsed.intelligence_report,
      scripts: parsed.scripts,
    };

    // Salvează în Supabase (best effort)
    try {
      const adminDb = getSupabaseServer({ useServiceRole: true });
      await adminDb.from("weekly_packages").upsert({
        week_of: weekOf,
        package_json: JSON.stringify(pkg),
        created_at: new Date().toISOString(),
      }, { onConflict: "week_of" });
    } catch {
      // Ignorăm eroarea de save — pachetul e valid chiar dacă salvarea eșuează
    }

    return { ok: true, pkg };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return { ok: false, error: message };
  }
}

export async function generateSingleScript(
  format: string,
  pilon: string
): Promise<{ ok: true; script: WeeklyScript } | { ok: false; error: string }> {
  try {
    const supabase = getSupabaseServer();
    const { data: creierSections } = await supabase
      .from("creier_sections")
      .select("title, content")
      .eq("status", "completed")
      .order("order_index");
    const creierContext = creierSections?.map((s: { title: string; content: unknown }) => `## ${s.title}\n${JSON.stringify(s.content)}`).join("\n\n") ?? "";

    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({ creierJson: creierContext });

    const prompt = `Generează un script complet pentru un Reel BUILT.

FORMAT: ${format}
PILON: ${pilon}

Returnează STRICT un JSON (fără text în afara JSON):
{
  "day": "${format}",
  "type": "${format}",
  "hook": "Hook-ul de deschidere — max 12 cuvinte, oprește scrollul",
  "full_script": "Scriptul complet, 150-250 cuvinte, gata de filmat. Paragrafe scurte. Specific.",
  "caption": "Caption-ul pentru Instagram, 2-3 propoziții, CTA inclus",
  "cta": "Acțiunea exactă — ex: Scrie-mi ARHITECTURĂ în DM"
}

Vocea lui Claudiu: direct, matur, fără clișee fitness, vocabular BUILT. Hook: cifră specifică, declarație contraintuitivă sau oglindire durere. Script: paragrafe scurte, propoziții scurte.`;

    const response = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 1500,
      system: systemBlocks,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON invalid în răspuns AI");

    const parsed = JSON.parse(jsonMatch[0]) as WeeklyScript;
    return { ok: true, script: parsed };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Eroare" };
  }
}
