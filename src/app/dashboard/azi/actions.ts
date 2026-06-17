"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { listProspects } from "@/app/dashboard/prospects/actions";
import { listClientsWithRisk } from "@/app/clienti/actions";

// ─── Jurnalul zilnic — sursa unică de adevăr a zilei (scris de Claudiu) ────────

export interface DailyItem {
  id: string;
  text: string;
  done: boolean;
  type?: string; // pentru "posts": Story / Reel / Carusel / Alt
}

export interface Appointment {
  id: string;
  time: string;       // "HH:MM"
  duration: number;   // minute
  name: string;
  phone: string;
  email: string;
  notes: string;
  done: boolean;
}

export interface DailyPlan {
  date: string;
  top3: string[];            // Top 3 ale zilei (dimineață)
  posts: DailyItem[];        // Conținut de postat
  tasks: DailyItem[];        // De făcut
  clients: DailyItem[];      // Clienți
  appointments: Appointment[]; // Programări / Apeluri
  tomorrow: DailyItem[];     // Ce mut pe mâine (seară)
  lesson: string;            // Un gând / lecție (seară)
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
    appointments: [],
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
        appointments: Array.isArray(v.appointments) ? v.appointments : [],
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

// ─── Semnale: ce contează azi (tras automat din prospecți + clienți) ──────────

export interface ProspectSignal {
  id: number;
  name: string;
  status: string;
  next_step: string | null;
  next_step_date: string | null;
  urgency: "intarziat" | "azi" | "fara_pas";
}

export interface ClientSignal {
  id: number;
  name: string;
  level: string;
  reason: string;
}

export interface DailySignals {
  prospects: ProspectSignal[];
  clients: ClientSignal[];
}

// Prospecți încă în joc (nu închiși, nu pierduți).
const OPEN_PROSPECT = new Set(["dm", "apel_programat", "discovery", "oferta"]);
// Mijloc de pâlnie — dacă n-au pas următor setat, e o scurgere (uitat).
const MID_FUNNEL = new Set(["discovery", "oferta", "apel_programat"]);

/**
 * Semnalele zilei — ce aduce bani azi, fără să decizi tu pe gol:
 * prospecți de urmărit (întârziat / azi / fără pas următor setat) + clienți care alunecă.
 */
export async function getDailySignals(): Promise<DailySignals> {
  const today = new Date().toISOString().slice(0, 10);

  let prospects: ProspectSignal[] = [];
  try {
    const all = await listProspects();
    prospects = all
      .filter((p) => OPEN_PROSPECT.has(p.status))
      .map((p): ProspectSignal | null => {
        if (p.next_step_date && p.next_step_date < today)
          return { id: p.id, name: p.name, status: p.status, next_step: p.next_step, next_step_date: p.next_step_date, urgency: "intarziat" };
        if (p.next_step_date && p.next_step_date === today)
          return { id: p.id, name: p.name, status: p.status, next_step: p.next_step, next_step_date: p.next_step_date, urgency: "azi" };
        if (!p.next_step_date && MID_FUNNEL.has(p.status))
          return { id: p.id, name: p.name, status: p.status, next_step: p.next_step, next_step_date: null, urgency: "fara_pas" };
        return null;
      })
      .filter((x): x is ProspectSignal => x !== null);
    // Întârziat întâi, apoi azi, apoi fără pas.
    const order = { intarziat: 0, azi: 1, fara_pas: 2 };
    prospects.sort((a, b) => order[a.urgency] - order[b.urgency]);
  } catch {
    prospects = [];
  }

  let clients: ClientSignal[] = [];
  try {
    const risks = await listClientsWithRisk();
    clients = risks
      .filter((r) => r.level !== "ok")
      .map((r) => ({ id: r.client.id, name: r.client.name, level: r.level, reason: r.reason }));
  } catch {
    clients = [];
  }

  return { prospects, clients };
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
