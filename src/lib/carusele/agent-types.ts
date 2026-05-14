// src/lib/carusele/agent-types.ts

export type AgentPhase =
  | "idle"
  | "proposing_angles"
  | "awaiting_choice"
  | "generating_slides"
  | "preview"
  | "iterating"
  | "ready_to_export";

export interface Angle {
  id: "A" | "B" | "C";
  hook: string;
  direction: string;
}

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
  type: "text" | "angles" | "slides" | "slide_update";
  angles?: Angle[];
}

export interface AgentState {
  phase: AgentPhase;
  messages: AgentMessage[];
  caruselId: number | null;
  pngUrls: string[] | null;
}
