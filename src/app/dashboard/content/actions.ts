"use server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAuth } from "@/lib/supabase/auth-server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { scrapeInstagramReels } from "@/lib/apify";

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

  let total = 0;
  for (const comp of competitors) {
    try {
      const reels = await scrapeInstagramReels(comp.handle, 10);
      for (const reel of reels) {
        await supabase.from("competitor_reels").upsert({
          competitor_handle: comp.handle,
          instagram_id: reel.id,
          thumbnail_url: reel.thumbnailUrl,
          caption: reel.caption,
          views: reel.viewsCount,
          likes: reel.likesCount,
          posted_at: reel.timestamp,
          transcript: null,
        }, { onConflict: "instagram_id" });
      }
      total += reels.length;
    } catch (e) {
      console.error(`Failed scraping ${comp.handle}:`, e);
    }
  }
  return { scraped: total };
}

export async function getLatestWeeklyPackage() {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("weekly_packages")
    .select("*")
    .eq("user_id", user.id)
    .order("week_start", { ascending: false })
    .limit(1)
    .single();
  return data;
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
