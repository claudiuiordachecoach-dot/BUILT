"use server";

import { getSettings, setSettings } from "@/lib/settings";
import { getSupabaseServer } from "@/lib/supabase/server";

const COACH_KEYS = [
  "coach_avatar_url",
  "coach_name",
  "coach_bio",
  "coach_email",
  "coach_phone",
  "coach_instagram",
  "push_message_title",
  "saturday_message",
] as const;

export type CoachProfile = Record<(typeof COACH_KEYS)[number], string>;

export async function getCoachProfile(): Promise<Partial<CoachProfile>> {
  return (await getSettings([...COACH_KEYS])) as Partial<CoachProfile>;
}

export async function saveCoachProfile(data: Partial<CoachProfile>) {
  const clean: Record<string, string> = {};
  for (const k of COACH_KEYS) {
    if (data[k] != null) clean[k] = data[k] as string;
  }
  await setSettings(clean);
}

export type CoachStats = {
  total: number;
  active: number;
  atRisk: number;
  checkinsToProcess: number;
  unreadMessages: number;
};

export async function getCoachStats(): Promise<CoachStats> {
  const db = getSupabaseServer({ useServiceRole: true });
  const [{ data: clients }, { count: unread }] = await Promise.all([
    db.from("clients").select("status"),
    db.from("client_messages").select("id", { count: "exact", head: true }).eq("sender", "client").is("read_at", null),
  ]);

  const list = clients ?? [];
  return {
    total: list.length,
    active: list.filter((c) => c.status === "active").length,
    atRisk: list.filter((c) => c.status === "at_risk").length,
    checkinsToProcess: 0,
    unreadMessages: unread ?? 0,
  };
}
