"use server";

import { getAnthropicClient, buildSystemBlocks, MODELS } from "@/lib/anthropic";
import { readCreierFromFile } from "@/lib/creier";
import { getSupabaseServer } from "@/lib/supabase/server";

export type OnboardingData = {
  // Cine Ești
  full_name: string; age: string; location: string; experience_years: string;
  coaching_since: string; instagram_handle: string; current_monthly_revenue: string;
  revenue_goal_90_days: string; revenue_goal_12_months: string; followers_now: string;
  followers_goal_90_days: string; niche: string; transformation_promise: string;
  three_words: string; built_personal_meaning: string; life_outside_fitness: string;
  typical_day_now: string; proudest_achievement: string; biggest_personal_weakness: string;
  how_people_describe_you: string;
  // Conținutul Tău
  content_formats: string; posting_frequency: string; best_performing_content: string;
  content_topics: string; tone_of_voice: string; content_that_failed: string;
  best_hook_ever: string; favourite_topic: string; avoided_topic: string;
  content_inspiration_source: string; creator_you_admire: string;
  content_creation_process: string; biggest_content_win: string; content_goal_next_90_days: string;
  // Clientul Ideal
  client_pain_1: string; client_pain_2: string; client_pain_3: string;
  client_tried_before: string; client_objection_1: string; client_objection_2: string;
  client_objection_3: string; why_client_stays: string; why_client_quits: string;
  client_transformation_story: string; client_age_range: string; client_income_level: string;
  client_daily_struggle: string; client_secret_desire: string; client_before_after: string;
  // Oferta & Vânzare
  offer_30_sec_pitch: string; why_500_eur: string; offer_what_included: string;
  offer_what_not_included: string; hardest_part_of_call: string; price_objection_response: string;
  best_dm_opener: string; qualify_or_disqualify: string; follow_up_strategy: string;
  close_rate_estimate: string; what_makes_client_say_yes: string; what_makes_client_say_no: string;
  // Unde Te Blochezi
  biggest_challenge: string; what_tried: string; bottleneck: string;
  fear_about_content: string; why_not_growing: string; biggest_frustration: string;
  biggest_time_waster: string; task_you_hate: string; last_major_doubt: string;
  recurring_negative_thought: string; imposter_syndrome_trigger: string; comparison_trap: string;
  // Ce Vrei
  ideal_outcome_90_days: string; ideal_client: string; dream_day: string;
  income_goal_why: string; what_success_looks_like: string;
  // Mindset & Opinii
  philosophy: string; differentiator: string; things_disagree_with: string; controversial_take: string;
  morning_routine: string; how_handle_failure: string; motivation_vs_discipline: string;
  biggest_mindset_shift: string; book_that_changed_you: string; mentor_or_model: string;
  // Viziune & Misiune
  built_in_3_years: string; impact_on_romanian_fitness: string; legacy_you_want: string;
  if_money_not_issue: string; why_this_work_matters: string; world_without_built: string;
  values_non_negotiable: string; what_would_stop_you: string;
  // Povestea Ta
  origin_story: string; biggest_transformation: string; credibility: string;
  defining_moment: string; failure_story: string; why_this_niche: string;
  darkest_moment: string; turning_point: string; first_client_story: string;
  moment_you_almost_quit: string; unexpected_lesson: string;
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

  // Sincronizează TOATE cele 107 răspunsuri în creier_sections — asta e "Update My AI".
  // Cheile onboarding sunt distincte de cheile narative din Creierul vocal, deci merge-ul
  // adaugă fără să suprascrie conținutul bogat din transcrieri.
  const mappings: Array<{ key: string; order_index: number; title: string; content: Record<string, unknown> }> = [
    {
      key: "section_1_cine_esti", order_index: 1, title: "Cine ești",
      content: {
        full_name: data.full_name, age: data.age, location: data.location,
        experience_years: data.experience_years, coaching_since: data.coaching_since,
        instagram_handle: data.instagram_handle, current_monthly_revenue: data.current_monthly_revenue,
        followers_now: data.followers_now, three_words: data.three_words,
        built_personal_meaning: data.built_personal_meaning, life_outside_fitness: data.life_outside_fitness,
        typical_day_now: data.typical_day_now, proudest_achievement: data.proudest_achievement,
        biggest_personal_weakness: data.biggest_personal_weakness, how_people_describe_you: data.how_people_describe_you,
      },
    },
    {
      key: "section_2_povestea_ta", order_index: 2, title: "Povestea ta",
      content: {
        origin_story: data.origin_story, biggest_transformation: data.biggest_transformation,
        credibility: data.credibility, defining_moment: data.defining_moment,
        failure_story: data.failure_story, why_this_niche: data.why_this_niche,
        darkest_moment: data.darkest_moment, turning_point: data.turning_point,
        first_client_story: data.first_client_story, moment_you_almost_quit: data.moment_you_almost_quit,
        unexpected_lesson: data.unexpected_lesson,
      },
    },
    {
      key: "section_3_filosofia_built", order_index: 3, title: "Filosofia BUILT",
      content: {
        philosophy: data.philosophy, differentiator: data.differentiator,
        things_disagree_with: data.things_disagree_with, controversial_take: data.controversial_take,
        biggest_mindset_shift: data.biggest_mindset_shift, motivation_vs_discipline: data.motivation_vs_discipline,
      },
    },
    {
      key: "section_4_clientul_ideal", order_index: 4, title: "Clientul ideal",
      content: {
        ideal_client: data.ideal_client, dream_day: data.dream_day, niche: data.niche,
        transformation_promise: data.transformation_promise, client_pain_1: data.client_pain_1,
        client_pain_2: data.client_pain_2, client_pain_3: data.client_pain_3,
        client_tried_before: data.client_tried_before, client_objection_1: data.client_objection_1,
        client_objection_2: data.client_objection_2, client_objection_3: data.client_objection_3,
        why_client_stays: data.why_client_stays, why_client_quits: data.why_client_quits,
        client_transformation_story: data.client_transformation_story, client_age_range: data.client_age_range,
        client_income_level: data.client_income_level, client_daily_struggle: data.client_daily_struggle,
        client_secret_desire: data.client_secret_desire, client_before_after: data.client_before_after,
      },
    },
    {
      key: "section_5_vocea_ta", order_index: 5, title: "Vocea ta și conținutul",
      content: {
        tone_of_voice: data.tone_of_voice, content_formats: data.content_formats,
        best_performing_content: data.best_performing_content, content_that_failed: data.content_that_failed,
        posting_frequency: data.posting_frequency, content_topics: data.content_topics,
        best_hook_ever: data.best_hook_ever, favourite_topic: data.favourite_topic,
        avoided_topic: data.avoided_topic, content_inspiration_source: data.content_inspiration_source,
        creator_you_admire: data.creator_you_admire, content_creation_process: data.content_creation_process,
        biggest_content_win: data.biggest_content_win, content_goal_next_90_days: data.content_goal_next_90_days,
      },
    },
    {
      key: "section_7_obiective", order_index: 7, title: "Obiective",
      content: {
        revenue_goal_90_days: data.revenue_goal_90_days, revenue_goal_12_months: data.revenue_goal_12_months,
        followers_goal_90_days: data.followers_goal_90_days, ideal_outcome_90_days: data.ideal_outcome_90_days,
        what_success_looks_like: data.what_success_looks_like, income_goal_why: data.income_goal_why,
      },
    },
    {
      key: "section_8_oferta", order_index: 8, title: "Oferta și vânzarea",
      content: {
        offer_30_sec_pitch: data.offer_30_sec_pitch, why_500_eur: data.why_500_eur,
        offer_what_included: data.offer_what_included, offer_what_not_included: data.offer_what_not_included,
        hardest_part_of_call: data.hardest_part_of_call, price_objection_response: data.price_objection_response,
        best_dm_opener: data.best_dm_opener, qualify_or_disqualify: data.qualify_or_disqualify,
        follow_up_strategy: data.follow_up_strategy, close_rate_estimate: data.close_rate_estimate,
        what_makes_client_say_yes: data.what_makes_client_say_yes, what_makes_client_say_no: data.what_makes_client_say_no,
      },
    },
    {
      key: "section_12_viziune", order_index: 12, title: "Viziune și misiune",
      content: {
        built_in_3_years: data.built_in_3_years, impact_on_romanian_fitness: data.impact_on_romanian_fitness,
        legacy_you_want: data.legacy_you_want, if_money_not_issue: data.if_money_not_issue,
        why_this_work_matters: data.why_this_work_matters, world_without_built: data.world_without_built,
        values_non_negotiable: data.values_non_negotiable, what_would_stop_you: data.what_would_stop_you,
      },
    },
    {
      key: "section_13_blocaje", order_index: 13, title: "Unde te blochezi",
      content: {
        biggest_challenge: data.biggest_challenge, what_tried: data.what_tried, bottleneck: data.bottleneck,
        fear_about_content: data.fear_about_content, why_not_growing: data.why_not_growing,
        biggest_frustration: data.biggest_frustration, biggest_time_waster: data.biggest_time_waster,
        task_you_hate: data.task_you_hate, last_major_doubt: data.last_major_doubt,
        recurring_negative_thought: data.recurring_negative_thought, imposter_syndrome_trigger: data.imposter_syndrome_trigger,
        comparison_trap: data.comparison_trap,
      },
    },
    {
      key: "section_14_mindset_rutina", order_index: 14, title: "Mindset și rutină",
      content: {
        morning_routine: data.morning_routine, how_handle_failure: data.how_handle_failure,
        book_that_changed_you: data.book_that_changed_you, mentor_or_model: data.mentor_or_model,
      },
    },
  ];

  // Merge cu conținutul existent: păstrăm câmpurile narative din Creierul vocal,
  // adăugăm/actualizăm doar câmpurile completate din onboarding.
  const adminDb = getSupabaseServer({ useServiceRole: true });
  const keys = mappings.map((m) => m.key);
  const { data: existing } = await adminDb
    .from("creier_sections")
    .select("key, content")
    .in("key", keys);
  const existingMap = new Map<string, Record<string, unknown>>();
  for (const row of existing ?? []) {
    existingMap.set(row.key, (row.content as Record<string, unknown>) ?? {});
  }

  for (const m of mappings) {
    const filledFields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(m.content)) {
      if (v != null && String(v).trim().length > 0) filledFields[k] = v;
    }
    if (Object.keys(filledFields).length === 0) continue;

    const merged = { ...(existingMap.get(m.key) ?? {}), ...filledFields };
    try {
      await adminDb.from("creier_sections").upsert({
        key: m.key,
        order_index: m.order_index,
        title: m.title,
        content: merged,
        status: "completed",
        updated_at: new Date().toISOString(),
      }, { onConflict: "key" });
    } catch { /* best effort — nu blocăm salvarea onboarding */ }
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
