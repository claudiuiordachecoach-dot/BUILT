"use server";

import { getAnthropicClient, MODELS } from "@/lib/anthropic";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAuth } from "@/lib/supabase/auth-server";
import { scrapeInstagramReels } from "@/lib/apify";

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

export async function getTipOfWeek(): Promise<string> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("creier_metadata")
    .select("value")
    .eq("key", "tip_of_week")
    .single();

  if (data?.value) {
    const val = data.value as { text: string; generated_at: string };
    const age = Date.now() - new Date(val.generated_at).getTime();
    if (age < 7 * 24 * 60 * 60 * 1000) return val.text;
  }

  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const anthropic = new Anthropic();
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [{
      role: "user",
      content: "Generează un sfat acționabil de 2-3 propoziții pentru Iordache Claudiu (@iordacheclaudiu_) legat de content pe Instagram sau vânzarea serviciilor BUILT în această săptămână. Direct, specific, fără clișee. În română."
    }]
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  await supabase.from("creier_metadata").upsert({ key: "tip_of_week", value: { text, generated_at: new Date().toISOString() } });
  return text;
}

export async function listInstagramMedia(limit = 24) {
  const supabase = getSupabaseServer({ useServiceRole: true });
  const { data } = await supabase
    .from("instagram_media")
    .select("instagram_id, caption, views, likes, comments, posted_at, thumbnail_url, format_type")
    .order("posted_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((m) => ({
    instagram_id: m.instagram_id,
    caption: m.caption,
    views: m.views,
    likes: m.likes,
    comments: m.comments,
    posted_at: m.posted_at,
    thumbnail_url: m.thumbnail_url,
    format_type: m.format_type,
  }));
}

export async function syncMyReels(): Promise<{ ok: true; synced: number } | { ok: false; error: string }> {
  try {
    const reels = await scrapeInstagramReels("iordacheclaudiu_", 30);
    if (reels.length === 0) return { ok: false, error: "Apify a returnat 0 reels — verifică APIFY_API_KEY." };
    // Service role bypass-ează RLS — necesar pentru writes fără auth.uid()
    const supabase = getSupabaseServer({ useServiceRole: true });
    let synced = 0;
    let lastError = "";
    for (const reel of reels) {
      const { error } = await supabase.from("instagram_media").upsert({
        instagram_id: reel.id || `apify_${Date.now()}_${synced}`,
        thumbnail_url: reel.thumbnailUrl,
        caption: reel.caption,
        views: reel.viewsCount,
        likes: reel.likesCount,
        comments: reel.commentsCount,
        posted_at: reel.timestamp || new Date().toISOString(),
      }, { onConflict: "instagram_id" });
      if (!error) synced++;
      else lastError = error.message;
    }
    if (synced === 0 && lastError) return { ok: false, error: `DB: ${lastError}` };
    return { ok: true, synced };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Eroare necunoscută" };
  }
}

export async function syncReelsFromApify(username: string) {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const reels = await scrapeInstagramReels(username, 30);
  for (const reel of reels) {
    await supabase.from("instagram_media").upsert({
      user_id: user.id,
      instagram_id: reel.id,
      thumbnail_url: reel.thumbnailUrl,
      caption: reel.caption,
      views: reel.viewsCount,
      likes: reel.likesCount,
      comments: reel.commentsCount,
      posted_at: reel.timestamp,
    }, { onConflict: "instagram_id" });
  }
  return { synced: reels.length };
}
