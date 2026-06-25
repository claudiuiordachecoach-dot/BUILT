"use server";

import { revalidatePath } from "next/cache";
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

export interface CallSignal {
  id: number;
  name: string;
  next_step: string | null;
  next_step_date: string | null;
  isToday: boolean;
}

export interface CheckinSignal {
  id: number;
  clientId: number;
  name: string;
  week: number;
  daysAgo: number;
}

export interface DailySignals {
  calls: CallSignal[];
  prospects: ProspectSignal[];
  clients: ClientSignal[];
  checkins: CheckinSignal[];
}

// Prospecți încă în joc, în etapa de follow-up (apel_programat e tratat separat ca „apel").
const OPEN_PROSPECT = new Set(["dm", "discovery", "oferta"]);
// Mijloc de pâlnie — dacă n-au pas următor setat, e o scurgere (uitat).
const MID_FUNNEL = new Set(["discovery", "oferta"]);

/**
 * Semnalele zilei — ce aduce bani azi, fără să decizi tu pe gol:
 * prospecți de urmărit (întârziat / azi / fără pas următor setat) + clienți care alunecă.
 */
export async function getDailySignals(): Promise<DailySignals> {
  const today = new Date().toISOString().slice(0, 10);

  let calls: CallSignal[] = [];
  let prospects: ProspectSignal[] = [];
  try {
    const all = await listProspects();

    // Apeluri programate — întâi cele de azi, apoi restul (după dată).
    calls = all
      .filter((p) => p.status === "apel_programat")
      .map((p) => ({
        id: p.id, name: p.name, next_step: p.next_step,
        next_step_date: p.next_step_date, isToday: p.next_step_date === today,
      }))
      .sort((a, b) => {
        if (a.isToday !== b.isToday) return a.isToday ? -1 : 1;
        return (a.next_step_date ?? "9999").localeCompare(b.next_step_date ?? "9999");
      });

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
    calls = [];
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

  // Check-in-uri fără răspuns — clientul așteaptă feedback. Cel mai vechi întâi.
  let checkins: CheckinSignal[] = [];
  try {
    const db = getSupabaseServer({ useServiceRole: true });
    const { data: rows } = await db
      .from("client_checkins")
      .select("id, client_id, week_number, created_at")
      .is("ai_feedback", null)
      .order("created_at", { ascending: true });
    if (rows && rows.length) {
      const ids = [...new Set(rows.map((r) => r.client_id as number))];
      const { data: cls } = await db.from("clients").select("id, name").in("id", ids);
      const nameById = new Map((cls ?? []).map((c) => [c.id as number, c.name as string]));
      const dayMs = 86400000;
      const todayIdx = Math.floor(Date.now() / dayMs);
      checkins = rows.map((r) => ({
        id: r.id as number,
        clientId: r.client_id as number,
        name: nameById.get(r.client_id as number) ?? String(r.client_id),
        week: (r.week_number as number) ?? 0,
        daysAgo: todayIdx - Math.floor(Date.parse(r.created_at as string) / dayMs),
      }));
    }
  } catch {
    checkins = [];
  }

  return { calls, prospects, clients, checkins };
}

// ─── Închiderea buclei: rezultatul apelului, cu un tap din „Azi" ──────────────

export type ProspectOutcome = "castigat" | "followup" | "pierdut";

/**
 * Marchează rezultatul unui apel/prospect direct din cockpit — plombează gaura
 * cu apeluri netrackuite. Câștigat → client. Follow-up → reprogramat peste `days`.
 * Pierdut → status pierdut + motivul scris în notițe (cu dată), ca să înveți din el.
 */
export async function logProspectOutcome(
  id: number,
  outcome: ProspectOutcome,
  opts?: { note?: string; days?: number }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const s = getSupabaseServer();
    const today = new Date().toISOString().slice(0, 10);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (outcome === "castigat") {
      patch.status = "client";
      patch.next_step = null;
      patch.next_step_date = null;
    } else if (outcome === "followup") {
      const days = opts?.days && opts.days > 0 ? opts.days : 2;
      const d = new Date(); d.setDate(d.getDate() + days);
      patch.next_step = opts?.note?.trim() || "Follow-up după apel";
      patch.next_step_date = d.toISOString().slice(0, 10);
    } else {
      patch.status = "pierdut";
      patch.next_step = null;
      patch.next_step_date = null;
      const reason = opts?.note?.trim();
      if (reason) {
        const { data } = await s.from("prospects").select("notes").eq("id", id).single();
        const prev = (data?.notes ?? "").trim();
        patch.notes = (prev ? prev + "\n" : "") + `[${today}] Pierdut: ${reason}`;
      }
    }

    const { error } = await s.from("prospects").update(patch).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/dashboard/prospects");
    revalidatePath("/dashboard/azi");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare necunoscută." };
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
