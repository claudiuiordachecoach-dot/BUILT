// src/components/carusele/AgentTab.tsx
"use client";

import { useState, useTransition } from "react";
import { AgentChat } from "@/components/carusele/AgentChat";
import { PreviewPanel } from "@/components/carusele/PreviewPanel";
import { proposeAngles, generateFromAngle, iterateSlide } from "@/app/carusele/agent/actions";
import type { AgentMessage, AgentPhase, AgentState, Angle } from "@/lib/carusele/agent-types";
import type { CaruselSlide } from "@/app/carusele/actions";

const INITIAL_STATE: AgentState = {
  phase: "idle",
  messages: [],
  caruselId: null,
  pngUrls: null,
};

export function AgentTab() {
  const [state, setState] = useState<AgentState>(INITIAL_STATE);
  const [slides, setSlides] = useState<CaruselSlide[]>([]);
  const [originalIdea, setOriginalIdea] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();

  function addMessage(msg: AgentMessage) {
    setState((prev) => ({ ...prev, messages: [...prev.messages, msg] }));
  }

  function setPhase(phase: AgentPhase) {
    setState((prev) => ({ ...prev, phase }));
  }

  function handleSend(text: string) {
    setInputValue("");
    addMessage({ role: "user", content: text, type: "text" });

    const { phase } = state;

    if (phase === "idle") {
      setOriginalIdea(text);
      setPhase("proposing_angles");
      startTransition(async () => {
        const result = await proposeAngles(text);
        if (result.ok) {
          addMessage({ role: "assistant", content: "", type: "angles", angles: result.angles });
          setPhase("awaiting_choice");
        } else {
          addMessage({ role: "assistant", content: `Eroare: ${result.error}`, type: "text" });
          setPhase("idle");
        }
      });
    } else if (phase === "preview" || phase === "iterating") {
      const match = text.match(/slide\s*(\d+)/i);
      const position = match ? parseInt(match[1]) : null;
      const targetSlide = position ? slides.find((s) => s.position === position) : null;

      if (targetSlide && state.caruselId) {
        setPhase("iterating");
        startTransition(async () => {
          const result = await iterateSlide(state.caruselId!, targetSlide.position, text, targetSlide);
          if (result.ok) {
            setSlides((prev) => prev.map((s) => s.position === result.slide.position ? result.slide : s));
            addMessage({ role: "assistant", content: `Slide ${result.slide.position} actualizat. Preview la dreapta.`, type: "text" });
            setPhase("preview");
          } else {
            addMessage({ role: "assistant", content: `Eroare: ${result.error}`, type: "text" });
            setPhase("preview");
          }
        });
      } else {
        addMessage({ role: "assistant", content: "Specifică numărul slide-ului. Ex: 'slide 3 e prea lung'", type: "text" });
      }
    }
  }

  function handleSelectAngle(angle: Angle) {
    addMessage({ role: "user", content: `Am ales: ${angle.id}) ${angle.hook}`, type: "text" });
    setPhase("generating_slides");

    startTransition(async () => {
      const result = await generateFromAngle(angle, originalIdea);
      if (result.ok) {
        setSlides(result.carusel.body.slides);
        setState((prev) => ({ ...prev, caruselId: result.carusel.id, phase: "preview" }));
        addMessage({
          role: "assistant",
          content: `${result.carusel.body.slides.length} slide-uri generate. Vezi preview la dreapta. Dacă vrei să schimbi ceva, scrie ex: "slide 3 e prea lung".`,
          type: "text",
        });
      } else {
        addMessage({ role: "assistant", content: `Eroare: ${result.error}`, type: "text" });
        setPhase("awaiting_choice");
      }
    });
  }

  function handleReset() {
    setState(INITIAL_STATE);
    setSlides([]);
    setOriginalIdea("");
    setInputValue("");
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Chat — stânga */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <p className="font-condensed text-[10px] text-built-red uppercase tracking-wider">Agent Carusel</p>
          {state.phase !== "idle" && (
            <button type="button" onClick={handleReset}
              className="font-condensed text-[10px] text-built-gray-text hover:text-built-white transition-colors">
              ↺ Carusel nou
            </button>
          )}
        </div>
        <AgentChat
          messages={state.messages}
          onSend={handleSend}
          onSelectAngle={handleSelectAngle}
          isLoading={isPending}
          inputValue={inputValue}
          onInputChange={setInputValue}
          phase={state.phase}
        />
      </div>

      {/* Preview — dreapta */}
      <div className="w-[420px] flex-shrink-0 flex flex-col">
        <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-4">Preview</p>
        <div className="flex-1 min-h-0">
          <PreviewPanel
            slides={slides}
            caruselId={state.caruselId}
            onPngGenerated={(urls) => setState((prev) => ({ ...prev, pngUrls: urls }))}
          />
        </div>
      </div>
    </div>
  );
}
