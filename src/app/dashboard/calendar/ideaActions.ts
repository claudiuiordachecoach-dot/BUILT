"use server";

import { getSupabaseServer } from "@/lib/supabase/server";

export interface CalendarIdea {
  id: string;
  date: string;
  hook: string;
  format: string;
  cta: string;
  content_pillar: string | null;
  brief: string | null;
  type: "manual" | "ai";
  created_at: string;
}

export async function listCalendarIdeas(): Promise<CalendarIdea[]> {
  const supabase = getSupabaseServer({ useServiceRole: true });
  const { data } = await supabase
    .from("calendar_ideas")
    .select("*")
    .order("date", { ascending: true });
  return (data ?? []) as CalendarIdea[];
}

export async function addCalendarIdea(idea: {
  date: string;
  hook: string;
  format: string;
  cta: string;
  content_pillar?: string;
  brief?: string;
  type: "manual" | "ai";
}): Promise<{ ok: true; idea: CalendarIdea } | { ok: false; error: string }> {
  const supabase = getSupabaseServer({ useServiceRole: true });
  const { data, error } = await supabase
    .from("calendar_ideas")
    .insert({
      date: idea.date,
      hook: idea.hook,
      format: idea.format,
      cta: idea.cta,
      content_pillar: idea.content_pillar ?? null,
      brief: idea.brief ?? null,
      type: idea.type,
    })
    .select()
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, idea: data as CalendarIdea };
}

export async function addCalendarIdeasBatch(
  ideas: {
    date: string;
    hook: string;
    format: string;
    cta: string;
    content_pillar?: string;
    brief?: string;
    type: "manual" | "ai";
  }[]
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const supabase = getSupabaseServer({ useServiceRole: true });
  const { error } = await supabase.from("calendar_ideas").insert(
    ideas.map((idea) => ({
      date: idea.date,
      hook: idea.hook,
      format: idea.format,
      cta: idea.cta,
      content_pillar: idea.content_pillar ?? null,
      brief: idea.brief ?? null,
      type: idea.type,
    }))
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true, count: ideas.length };
}

export async function removeCalendarIdea(id: string): Promise<void> {
  const supabase = getSupabaseServer({ useServiceRole: true });
  await supabase.from("calendar_ideas").delete().eq("id", id);
}
