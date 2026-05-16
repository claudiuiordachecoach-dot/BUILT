"use server";

import { getAnthropicClient, MODELS } from "@/lib/anthropic";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAuth } from "@/lib/supabase/auth-server";
import { scrapeInstagramProfile } from "@/lib/apify";

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

export async function saveReelAnalysis(
  instagramId: string,
  analysis: ContentLibraryAnalysis
): Promise<void> {
  const supabase = getSupabaseServer({ useServiceRole: true });
  await supabase
    .from("instagram_media")
    .update({ ai_analysis: analysis })
    .eq("instagram_id", instagramId);
}

export async function getTopLearnings(limit = 5): Promise<ContentLibraryAnalysis[]> {
  const supabase = getSupabaseServer({ useServiceRole: true });
  const { data } = await supabase
    .from("instagram_media")
    .select("ai_analysis, views")
    .not("ai_analysis", "is", null)
    .order("views", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => r.ai_analysis as ContentLibraryAnalysis);
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

export async function listInstagramMedia(limit = 200) {
  const supabase = getSupabaseServer({ useServiceRole: true });
  const { data } = await supabase
    .from("instagram_media")
    .select("instagram_id, caption, views, likes, comments, saves, shares, posted_at, thumbnail_url, format_type")
    .order("posted_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((m) => ({
    instagram_id: m.instagram_id,
    caption: m.caption,
    views: m.views,
    likes: m.likes,
    comments: m.comments,
    saves: m.saves ?? null,
    shares: m.shares ?? null,
    posted_at: m.posted_at,
    thumbnail_url: m.thumbnail_url,
    format_type: m.format_type,
  }));
}

export async function getFollowersCount(): Promise<number | null> {
  const supabase = getSupabaseServer({ useServiceRole: true });
  const { data } = await supabase
    .from("creier_metadata")
    .select("value")
    .eq("key", "instagram_followers")
    .single();
  return data?.value?.count ?? null;
}

const FORMAT_TYPES = ["TALKING HEAD", "RANT", "TUTORIAL", "STORY TIME", "TREND", "LIST", "CLIENT PROOF", "BEHIND SCENES", "Q&A"] as const;
type FormatType = typeof FORMAT_TYPES[number];

async function classifyFormats(captions: { id: string; caption: string }[]): Promise<Record<string, FormatType>> {
  if (captions.length === 0) return {};
  const client = getAnthropicClient();

  const prompt = `Clasifică fiecare reel de Instagram după format. Răspunde STRICT cu un JSON obiect { "id": "FORMAT" }.

Formate valide: ${FORMAT_TYPES.join(", ")}

Reguli:
- TALKING HEAD: persoana vorbește direct la cameră, opinie/perspectivă personală
- RANT: critică directă, contradicție, provocare la status quo
- TUTORIAL: pași concreți, "cum să faci", instrucțiuni practice
- STORY TIME: narațiune personală, experiență, poveste
- TREND: audio/trend viral, remix, adaptare la tendință
- LIST: enumerare de sfaturi/elemente ("X motive pentru...", "Top 5...")
- CLIENT PROOF: rezultate client, testimonial, transformare
- BEHIND SCENES: culise, zi din viață, proces, setup
- Q&A: răspuns la întrebare, "m-ai întrebat...", feedback la comentarii

Reels de clasificat:
${captions.map(r => `ID: ${r.id}\nCaption: ${r.caption.slice(0, 200)}`).join("\n\n")}

Răspunde STRICT cu JSON (fără text în afară):`;

  try {
    const resp = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
    const text = resp.content[0].type === "text" ? resp.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return {};
    const raw = JSON.parse(match[0]) as Record<string, string>;
    const result: Record<string, FormatType> = {};
    for (const [id, fmt] of Object.entries(raw)) {
      const upper = (fmt as string).toUpperCase() as FormatType;
      result[id] = FORMAT_TYPES.includes(upper) ? upper : "TALKING HEAD";
    }
    return result;
  } catch {
    return {};
  }
}

export async function syncMyReels(): Promise<{ ok: true; synced: number; followers: number | null } | { ok: false; error: string }> {
  try {
    const { reels, followersCount } = await scrapeInstagramProfile("iordacheclaudiu_", 0);
    if (reels.length === 0) return { ok: false, error: "Apify a returnat 0 reels — verifică APIFY_API_KEY." };
    const supabase = getSupabaseServer({ useServiceRole: true });

    if (followersCount && followersCount > 0) {
      await supabase.from("creier_metadata").upsert({
        key: "instagram_followers",
        value: { count: followersCount, updated_at: new Date().toISOString() }
      });
    }

    // Clasifică formatele în batch (un singur call Claude Haiku)
    const toClassify = reels
      .filter(r => r.caption?.trim())
      .map(r => ({ id: r.id || "", caption: r.caption }));
    const formats = await classifyFormats(toClassify);

    let synced = 0;
    let lastError = "";
    for (const reel of reels) {
      const id = reel.id || `apify_${Date.now()}_${synced}`;
      const item = reel as typeof reel & { savesCount?: number; sharesCount?: number };
      const { error } = await supabase.from("instagram_media").upsert({
        instagram_id: id,
        thumbnail_url: reel.thumbnailUrl,
        caption: reel.caption,
        views: reel.viewsCount,
        likes: reel.likesCount,
        comments: reel.commentsCount,
        saves: item.savesCount ?? null,
        shares: item.sharesCount ?? null,
        posted_at: reel.timestamp || new Date().toISOString(),
        format_type: formats[reel.id || ""] ?? "TALKING HEAD",
      }, { onConflict: "instagram_id" });
      if (!error) synced++;
      else lastError = error.message;
    }
    if (synced === 0 && lastError) return { ok: false, error: `DB: ${lastError}` };
    return { ok: true, synced, followers: followersCount };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Eroare necunoscută" };
  }
}

// Reclasifică reels existente care nu au format_type setat
export async function classifyExistingReels(): Promise<{ ok: true; classified: number } | { ok: false; error: string }> {
  try {
    const supabase = getSupabaseServer({ useServiceRole: true });
    const { data } = await supabase
      .from("instagram_media")
      .select("instagram_id, caption")
      .or("format_type.is.null,format_type.eq.REEL,format_type.eq.reel")
      .not("caption", "is", null)
      .limit(100);

    if (!data || data.length === 0) return { ok: true, classified: 0 };

    const toClassify = data
      .filter(r => r.caption?.trim())
      .map(r => ({ id: r.instagram_id, caption: r.caption as string }));

    const formats = await classifyFormats(toClassify);

    let classified = 0;
    for (const row of data) {
      const fmt = formats[row.instagram_id];
      if (fmt) {
        await supabase
          .from("instagram_media")
          .update({ format_type: fmt })
          .eq("instagram_id", row.instagram_id);
        classified++;
      }
    }
    return { ok: true, classified };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Eroare" };
  }
}

export async function syncReelsFromApify(username: string) {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { reels } = await scrapeInstagramProfile(username, 30);
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
