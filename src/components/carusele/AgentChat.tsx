// src/components/carusele/AgentChat.tsx
"use client";

import { useRef, useEffect } from "react";
import type { AgentMessage, Angle, AgentPhase } from "@/lib/carusele/agent-types";

interface AgentChatProps {
  messages: AgentMessage[];
  onSend: (text: string) => void;
  onSelectAngle: (angle: Angle) => void;
  isLoading: boolean;
  inputValue: string;
  onInputChange: (v: string) => void;
  phase: AgentPhase;
}

export function AgentChat({ messages, onSend, onSelectAngle, isLoading, inputValue, onInputChange, phase }: AgentChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isLoading) onSend(inputValue.trim());
    }
  }

  const placeholder =
    phase === "idle" ? "Descrie ideea ta pentru carusel..." :
    phase === "awaiting_choice" ? "Scrie A, B sau C (sau descrie ajustarea)..." :
    "Spune ce vrei să schimbi...";

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="text-built-gray-text text-sm">
            <p className="mb-2">Descrie ideea ta pentru carusel.</p>
            <p className="font-condensed text-[10px]">Exemplu: "vreau ceva despre cortizol și grăsime abdominală"</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.type === "angles" && msg.angles ? (
              <div className="bg-built-gray-1 border border-built-gray-2 rounded-sm p-4 max-w-full w-full space-y-3">
                <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider">3 unghiuri propuse — alege unul:</p>
                {msg.angles.map((angle) => (
                  <button key={angle.id} type="button" onClick={() => onSelectAngle(angle)}
                    disabled={isLoading}
                    className="w-full text-left p-3 border border-built-gray-2 hover:border-built-red transition-colors group disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="font-display text-built-red text-lg mr-2">{angle.id}</span>
                    <span className="font-display text-base tracking-wider text-built-white group-hover:text-built-white">{angle.hook}</span>
                    <p className="font-condensed text-[10px] text-built-gray-text mt-1">{angle.direction}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className={`max-w-[85%] px-4 py-3 rounded-sm text-sm ${msg.role === "user" ? "bg-built-red text-built-white" : "bg-built-gray-1 border border-built-gray-2 text-built-white/90"}`}>
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-built-gray-1 border border-built-gray-2 px-4 py-3 rounded-sm">
              <span className="font-condensed text-[10px] text-built-gray-text">Generează...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-built-gray-2 pt-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-built-black border border-built-gray-2 text-built-white text-sm p-3 resize-none focus:outline-none focus:border-built-red disabled:opacity-50"
          />
          <button type="button"
            onClick={() => { if (inputValue.trim() && !isLoading) onSend(inputValue.trim()); }}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs disabled:opacity-50 transition-colors self-end">
            →
          </button>
        </div>
        <p className="font-condensed text-[9px] text-built-gray-text mt-1">Enter = trimite · Shift+Enter = linie nouă</p>
      </div>
    </div>
  );
}
