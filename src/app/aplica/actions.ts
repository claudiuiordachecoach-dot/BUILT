"use server";

import { getSupabaseServer } from "@/lib/supabase/server";

export type Budget = "gata" | "depinde" | "nu";

export interface ApplicationInput {
  name: string;
  contact: string;
  a1: string;
  a2: string;
  a3: string;
  budget: Budget;
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

const BUDGET_LABEL: Record<Budget, string> = {
  gata: "Gata să investească acum (200–700€)",
  depinde: "Depinde de plan și rezultat",
  nu: "Doar se informează deocamdată",
};

// Scor 0–6: buget (cel mai important semnal) + profunzimea răspunsurilor.
function scoreOf(i: ApplicationInput): number {
  let s = 0;
  s += i.budget === "gata" ? 3 : i.budget === "depinde" ? 1 : 0;
  for (const a of [i.a1, i.a2, i.a3]) if ((a ?? "").trim().length >= 25) s += 1;
  return s;
}

function labelOf(score: number): string {
  return score >= 5 ? "HOT" : score >= 3 ? "CALD" : "RECE";
}

// Detecție de profil din răspunsuri — doar pe potriviri clare, altfel îl lasă pe Claudiu.
function detectProfile(i: ApplicationInput): "atlet_blocat" | "ciclist" | null {
  const t = `${i.a1} ${i.a2}`.toLowerCase();
  if (/platou|fac tot|sal[ăa]\b|antren|sportiv|atlet|nu (mai )?scade|în formă/.test(t)) return "atlet_blocat";
  if (/diet|sl[ăa]b|pus la loc|yo-?yo|restric|[țt]inut|înfomet/.test(t)) return "ciclist";
  return null;
}

export async function submitApplication(input: ApplicationInput): Promise<SubmitResult> {
  const name = input.name?.trim();
  const contact = input.contact?.trim();

  if (!name) return { ok: false, error: "Spune-mi cum te cheamă." };
  if (!contact) return { ok: false, error: "Lasă-mi un contact (Instagram, telefon sau email)." };
  if (!input.a1?.trim()) return { ok: false, error: "Răspunde măcar la prima întrebare." };
  if (!input.budget) return { ok: false, error: "Alege o variantă la ultima întrebare." };

  const score = scoreOf(input);
  const label = labelOf(score);
  const today = new Date().toISOString().slice(0, 10);
  const dateRo = new Date().toLocaleDateString("ro-RO", { day: "numeric", month: "long" });

  const notes =
`APLICARE ${dateRo} · scor ${score}/6 · buget: ${BUDGET_LABEL[input.budget]}
Contact: ${contact}

Unde e acum:
${input.a1.trim()}

Ce a încercat / de ce n-a ținut:
${(input.a2 || "—").trim()}

Cum vrea să fie în 90 de zile:
${(input.a3 || "—").trim()}`;

  const row = {
    name,
    profile: detectProfile(input),
    status: "dm",
    next_step: `Aplicare ${label} — deschide conversația: „Ce te-a făcut să aplici chiar azi?”`,
    next_step_date: today,
    notes,
    source: `aplicare web · ${label}`,
  };

  const s = getSupabaseServer({ useServiceRole: true });
  let { error } = await s.from("prospects").insert(row);

  // Numele are constrângere UNIQUE — dacă mai există unul la fel, îl discriminăm cu contactul.
  if (error && (error.code === "23505" || /duplicate|unique/i.test(error.message))) {
    const short = contact.replace(/\s+/g, " ").slice(0, 20);
    ({ error } = await s.from("prospects").insert({ ...row, name: `${name} · ${short}` }));
  }

  if (error) return { ok: false, error: "Ceva n-a mers la trimitere. Mai încearcă o dată." };
  return { ok: true };
}
