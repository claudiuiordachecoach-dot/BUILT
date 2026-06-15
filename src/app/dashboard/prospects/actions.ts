"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";

export type ProspectStatus =
  | "dm" | "apel_programat" | "discovery" | "oferta" | "client" | "nu_acum" | "pierdut";
export type ProspectProfile = "salt_direct" | "ciclist" | "atlet_blocat";

export interface Prospect {
  id: number;
  name: string;
  profile: ProspectProfile | null;
  status: ProspectStatus;
  package: string | null;
  next_step: string | null;
  next_step_date: string | null;
  notes: string | null;
  source: string | null;
  dm_conversation_id: number | null;
  created_at: string;
  updated_at: string;
}

export async function listProspects(): Promise<Prospect[]> {
  const s = getSupabaseServer();
  const { data, error } = await s
    .from("prospects")
    .select("*")
    .order("next_step_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Prospect[];
}

export type MutResult = { ok: true; id?: number } | { ok: false; error: string };

export async function createProspect(input: {
  name: string; profile?: string; status?: string; package?: string;
  next_step?: string; next_step_date?: string; notes?: string; source?: string;
}): Promise<MutResult> {
  if (!input.name?.trim()) return { ok: false, error: "Numele e obligatoriu." };
  const s = getSupabaseServer();
  const { data, error } = await s.from("prospects").insert({
    name: input.name.trim(),
    profile: input.profile || null,
    status: input.status || "dm",
    package: input.package || null,
    next_step: input.next_step || null,
    next_step_date: input.next_step_date || null,
    notes: input.notes || null,
    source: input.source || null,
  }).select("id").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/prospects");
  return { ok: true, id: data.id };
}

export async function updateProspect(
  id: number,
  patch: Partial<Pick<Prospect, "name" | "profile" | "status" | "package" | "next_step" | "next_step_date" | "notes">>
): Promise<MutResult> {
  const s = getSupabaseServer();
  const clean: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(patch)) clean[k] = v === "" ? null : v;
  const { error } = await s.from("prospects").update(clean).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/prospects");
  return { ok: true };
}

export async function deleteProspect(id: number): Promise<MutResult> {
  const s = getSupabaseServer();
  const { error } = await s.from("prospects").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/prospects");
  return { ok: true };
}
