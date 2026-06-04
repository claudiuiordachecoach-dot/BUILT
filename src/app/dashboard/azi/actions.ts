"use server";

import { getSupabaseServer } from "@/lib/supabase/server";

// ─── Jurnalul zilnic — sursa unică de adevăr a zilei (scris de Claudiu) ────────

export interface DailyItem {
  id: string;
  text: string;
  done: boolean;
  type?: string; // pentru "posts": Story / Reel / Carusel / Alt
}

export interface DailyPlan {
  date: string;
  top3: string[];        // Top 3 ale zilei (dimineață)
  posts: DailyItem[];    // Conținut de postat
  tasks: DailyItem[];    // De făcut
  clients: DailyItem[];  // Clienți
  tomorrow: DailyItem[]; // Ce mut pe mâine (seară)
  lesson: string;        // Un gând / lecție (seară)
  notes: string;
}

function emptyPlan(date: string): DailyPlan {
  return {
    date,
    top3: ["", "", ""],
    posts: [
      { id: "story", text: "", done: false, type: "Story" },
      { id: "reel", text: "", done: false, type: "Reel" },
    ],
    tasks: [],
    clients: [],
    tomorrow: [],
    lesson: "",
    notes: "",
  };
}

function keyFor(date: string): string {
  return `daily_${date}`;
}

export async function getDailyPlan(date: string): Promise<DailyPlan> {
  try {
    const supabase = getSupabaseServer({ useServiceRole: true });
    const { data } = await supabase
      .from("creier_metadata")
      .select("value")
      .eq("key", keyFor(date))
      .single();
    const v = data?.value as DailyPlan | undefined;
    if (v && Array.isArray(v.posts)) {
      return {
        date,
        top3: Array.isArray(v.top3) ? v.top3 : ["", "", ""],
        posts: v.posts ?? [],
        tasks: v.tasks ?? [],
        clients: v.clients ?? [],
        tomorrow: v.tomorrow ?? [],
        lesson: v.lesson ?? "",
        notes: v.notes ?? "",
      };
    }
    return emptyPlan(date);
  } catch {
    return emptyPlan(date);
  }
}

export async function saveDailyPlan(plan: DailyPlan): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer({ useServiceRole: true });
    const { error } = await supabase
      .from("creier_metadata")
      .upsert({ key: keyFor(plan.date), value: plan });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare necunoscută." };
  }
}
