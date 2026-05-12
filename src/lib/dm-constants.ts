import type { DMStage, ProfileType } from "@/app/dm/actions";

export const STAGE_LABELS: Record<DMStage, string> = {
  opener: "Deschidere",
  q1: "Întrebarea 1 — Unde ești acum?",
  q2: "Întrebarea 2 — Ce te-a oprit?",
  q3: "Întrebarea 3 — Cum arată ziua ideală?",
  call_booked: "Apel rezervat",
  objection: "Obiecție",
  post_call: "Post-apel",
  lost: "Pierdut",
  won: "Client ✅",
};

export const STAGE_COLOR: Record<DMStage, string> = {
  opener: "text-built-gray-text",
  q1: "text-blue-400", q2: "text-blue-400", q3: "text-blue-400",
  call_booked: "text-amber-400",
  objection: "text-orange-400",
  post_call: "text-purple-400",
  lost: "text-built-gray-text/50",
  won: "text-emerald-400",
};

export const STAGE_DOT: Partial<Record<DMStage, string>> = {
  won: "bg-emerald-500", lost: "bg-built-gray-text/50",
  call_booked: "bg-amber-500", objection: "bg-orange-400",
};

export const STAGES: DMStage[] = [
  "opener", "q1", "q2", "q3", "call_booked", "objection", "post_call", "lost", "won",
];

export const PROFILES: { id: ProfileType; label: string }[] = [
  { id: "unknown", label: "Necunoscut" },
  { id: "antreprenor_inecat", label: "Antreprenor înecat" },
  { id: "tata_uitat", label: "Tată uitat" },
  { id: "profesionista_postburnout", label: "Profesionistă post-burnout" },
  { id: "skinny_fat", label: "Skinny fat" },
];
