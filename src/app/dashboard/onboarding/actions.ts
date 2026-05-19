"use server";

import { getAnthropicClient, buildSystemBlocks, MODELS } from "@/lib/anthropic";
import { readCreierFromFile } from "@/lib/creier";
import { getSupabaseServer } from "@/lib/supabase/server";

export type OnboardingData = {
  full_name: string; age: string; location: string; experience_years: string;
  coaching_since: string; instagram_handle: string; current_monthly_revenue: string;
  revenue_goal_90_days: string; revenue_goal_12_months: string; followers_now: string;
  followers_goal_90_days: string; niche: string; transformation_promise: string;
  content_formats: string; posting_frequency: string; best_performing_content: string;
  content_topics: string; tone_of_voice: string; content_that_failed: string;
  biggest_challenge: string; what_tried: string; bottleneck: string;
  fear_about_content: string; why_not_growing: string; biggest_frustration: string;
  ideal_outcome_90_days: string; ideal_client: string; dream_day: string;
  income_goal_why: string; what_success_looks_like: string;
  philosophy: string; differentiator: string; things_disagree_with: string; controversial_take: string;
  origin_story: string; biggest_transformation: string; credibility: string;
  defining_moment: string; failure_story: string; why_this_niche: string;
};

export type AiSummary = { niche: string; ideal_client: string };

export type AiSummaryResult =
  | { ok: true; summary: AiSummary }
  | { ok: false; error: string };

export async function generateAiSummary(
  data: Partial<OnboardingData>
): Promise<AiSummaryResult> {
  try {
    const client = getAnthropicClient();
    const creier = await readCreierFromFile();
    const creierJson = JSON.stringify(creier, null, 2);

    const systemBlocks = buildSystemBlocks({
      creierJson,
      taskContext: "Ești un copywriter expert care generează descrieri concise și precise.",
    });

    const prompt = `Pe baza acestor date despre creator, generează 2 paragrafe scurte (max 3 propoziții fiecare):

DATE CREATOR:
${JSON.stringify(data, null, 2)}

Returnează STRICT un JSON cu structura:
{
  "niche": "Descriere concisă a nișei și a ce face creatorul (max 3 propoziții)",
  "ideal_client": "Descriere precisă a clientului ideal — cine e, ce durere are, unde e blocat (max 3 propoziții)"
}

Fii specific. Nu fi generic. Folosește detaliile exacte din date.`;

    const response = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 512,
      system: systemBlocks,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON invalid în răspuns");
    const summary: AiSummary = JSON.parse(jsonMatch[0]);
    return { ok: true, summary };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return { ok: false, error: message };
  }
}

export async function saveOnboarding(data: Partial<OnboardingData>) {
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("onboarding")
    .upsert({ id: 1, ...data, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };

  // Sincronizează datele relevante în creier_sections — asta e "Update My AI"
  const mappings: Array<{ key: string; order_index: number; title: string; content: Record<string, unknown> }> = [
    {
      key: "section_1_cine_esti", order_index: 1, title: "Cine ești",
      content: { full_name: data.full_name, age: data.age, location: data.location, experience_years: data.experience_years, coaching_since: data.coaching_since, instagram_handle: data.instagram_handle },
    },
    {
      key: "section_7_obiective", order_index: 7, title: "Obiective",
      content: { revenue_goal_90_days: data.revenue_goal_90_days, revenue_goal_12_months: data.revenue_goal_12_months, followers_goal_90_days: data.followers_goal_90_days, ideal_outcome_90_days: data.ideal_outcome_90_days, what_success_looks_like: data.what_success_looks_like },
    },
    {
      key: "section_4_clientul_ideal", order_index: 4, title: "Clientul ideal",
      content: { ideal_client: data.ideal_client, dream_day: data.dream_day, niche: data.niche, transformation_promise: data.transformation_promise },
    },
    {
      key: "section_3_filosofia_built", order_index: 3, title: "Filosofia BUILT",
      content: { philosophy: data.philosophy, differentiator: data.differentiator, things_disagree_with: data.things_disagree_with, controversial_take: data.controversial_take },
    },
    {
      key: "section_2_povestea_ta", order_index: 2, title: "Povestea ta",
      content: { origin_story: data.origin_story, biggest_transformation: data.biggest_transformation, defining_moment: data.defining_moment, failure_story: data.failure_story, why_this_niche: data.why_this_niche },
    },
    {
      key: "section_5_vocea_ta", order_index: 5, title: "Vocea ta",
      content: { tone_of_voice: data.tone_of_voice, content_formats: data.content_formats, best_performing_content: data.best_performing_content, content_that_failed: data.content_that_failed },
    },
  ];

  // Upsert fiecare secțiune (best effort — nu blocăm dacă eșuează)
  const adminDb = getSupabaseServer({ useServiceRole: true });
  for (const m of mappings) {
    const filled = Object.values(m.content).filter(Boolean);
    if (filled.length === 0) continue;
    try {
      await adminDb.from("creier_sections").upsert({
        key: m.key,
        order_index: m.order_index,
        title: m.title,
        content: m.content,
        status: "completed",
        updated_at: new Date().toISOString(),
      }, { onConflict: "key" });
    } catch { /* ignorăm — nu blocăm dacă coloana lipsește */ }
  }

  return { error: undefined };
}

export async function loadOnboarding(): Promise<Partial<OnboardingData>> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("onboarding")
    .select("*")
    .eq("id", 1)
    .single();
  return (data as Partial<OnboardingData>) ?? {};
}
