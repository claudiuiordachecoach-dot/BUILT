"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { ReelRecord, ReelBody, Pillar } from "@/app/reels/actions";

export type DailyReelStatus = "draft" | "edited" | "posted" | "archived";

const VALID_STATUS = new Set<DailyReelStatus>([
  "draft",
  "edited",
  "posted",
  "archived",
]);

function toReelRecord(row: {
  id: number;
  pillar: string | null;
  hook: string | null;
  body: unknown;
  status: string;
  scheduled_for: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}): ReelRecord {
  return {
    id: row.id,
    pillar: (row.pillar ?? "mix") as Pillar,
    hook: row.hook ?? "",
    body: row.body as ReelBody,
    status: row.status as DailyReelStatus,
    scheduled_for: row.scheduled_for,
    posted_at: row.posted_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Listează reels cu scheduled_for în săptămâna care începe `weekStartIso` (luni).
 * weekStartIso: 'YYYY-MM-DD' format. Returnează 7 zile inclusiv.
 */
export async function listWeekReels(
  weekStartIso: string
): Promise<ReelRecord[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStartIso)) {
    throw new Error(`weekStartIso invalid: ${weekStartIso}`);
  }
  const start = new Date(weekStartIso + "T00:00:00.000Z");
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("generated_outputs")
    .select(
      "id, pillar, hook, body, status, scheduled_for, posted_at, created_at, updated_at"
    )
    .eq("module", "M2_reel")
    .gte("scheduled_for", toIsoDate(start))
    .lte("scheduled_for", toIsoDate(end))
    .order("scheduled_for", { ascending: true });

  if (error) {
    throw new Error(`Supabase listWeekReels: ${error.message}`);
  }

  return (data ?? []).map(toReelRecord);
}

/**
 * Reels nescheduled — pool-ul disponibil pentru drag spre calendar.
 * Limit 30 ca să nu cadă pagina pe acumulare.
 */
export async function listUnscheduledReels(): Promise<ReelRecord[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("generated_outputs")
    .select(
      "id, pillar, hook, body, status, scheduled_for, posted_at, created_at, updated_at"
    )
    .eq("module", "M2_reel")
    .is("scheduled_for", null)
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(`Supabase listUnscheduledReels: ${error.message}`);
  }

  return (data ?? []).map(toReelRecord);
}

/**
 * Reel-ul de azi (dacă există unul programat azi).
 */
export async function getTodayReel(): Promise<ReelRecord | null> {
  const today = toIsoDate(new Date());
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("generated_outputs")
    .select(
      "id, pillar, hook, body, status, scheduled_for, posted_at, created_at, updated_at"
    )
    .eq("module", "M2_reel")
    .eq("scheduled_for", today)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase getTodayReel: ${error.message}`);
  }

  return data ? toReelRecord(data) : null;
}

export type SetScheduleResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Setează scheduled_for pentru un reel. dateIso=null mută înapoi în pool.
 */
export async function setSchedule(
  id: number,
  dateIso: string | null
): Promise<SetScheduleResult> {
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: "ID invalid." };
  }
  if (dateIso !== null && !/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) {
    return { ok: false, error: `Dată invalidă: ${dateIso}` };
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("generated_outputs")
    .update({ scheduled_for: dateIso })
    .eq("id", id)
    .eq("module", "M2_reel");

  if (error) {
    return { ok: false, error: `Supabase: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/reels");
  return { ok: true };
}

export type MarkPostedResult = { ok: true } | { ok: false; error: string };

/**
 * Marchează reel-ul ca postat. Setează status='posted' + posted_at=now().
 */
export async function markPosted(id: number): Promise<MarkPostedResult> {
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: "ID invalid." };
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("generated_outputs")
    .update({
      status: "posted",
      posted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("module", "M2_reel");

  if (error) {
    return { ok: false, error: `Supabase: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/reels");
  return { ok: true };
}

export type SetStatusResult = { ok: true } | { ok: false; error: string };

/**
 * Schimbă status arbitrar (utilă pentru "unposted" / "archive").
 */
export async function setStatus(
  id: number,
  status: DailyReelStatus
): Promise<SetStatusResult> {
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: "ID invalid." };
  }
  if (!VALID_STATUS.has(status)) {
    return { ok: false, error: `Status invalid: ${status}` };
  }

  const supabase = getSupabaseServer();
  const updates: Record<string, unknown> = { status };
  if (status !== "posted") {
    updates.posted_at = null;
  }

  const { error } = await supabase
    .from("generated_outputs")
    .update(updates)
    .eq("id", id)
    .eq("module", "M2_reel");

  if (error) {
    return { ok: false, error: `Supabase: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/reels");
  return { ok: true };
}
