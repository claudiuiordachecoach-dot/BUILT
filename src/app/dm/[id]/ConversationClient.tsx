"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import {
  addMessage, generateDMResponse, updateStage, updateProfile, updateNotes,
  type DMConversation, type DMMessage, type AIsuggestion, type DMStage, type ProfileType,
} from "../actions";
import { STAGE_LABELS, STAGES, PROFILES, STAGE_DOT } from "@/lib/dm-constants";


export function ConversationClient({ conversation: initialConv, initialMessages }: {
  conversation: DMConversation;
  initialMessages: DMMessage[];
}) {
  const [conv, setConv] = useState(initialConv);
  const [messages, setMessages] = useState(initialMessages);
  const [incoming, setIncoming] = useState("");
  const [outgoing, setOutgoing] = useState("");
  const [suggestion, setSuggestion] = useState<AIsuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState(initialConv.notes ?? "");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function handleGenerateSuggestion() {
    if (!incoming.trim()) return;
    setError(null); setSuggestion(null);
    startTransition(async () => {
      const result = await generateDMResponse(conv.id, incoming);
      if (result.ok) {
        setSuggestion(result.suggestion);
        setOutgoing(result.suggestion.message);
        setMessages((prev) => [...prev, { id: Date.now(), conversation_id: conv.id, direction: "in", content: incoming, created_at: new Date().toISOString() }]);
        setIncoming("");
        if (result.suggestion.next_stage) setConv((c) => ({ ...c, stage: result.suggestion!.next_stage! }));
      } else setError(result.error);
    });
  }

  function handleSendOutgoing() {
    if (!outgoing.trim()) return;
    startTransition(async () => {
      await addMessage(conv.id, "out", outgoing);
      setMessages((prev) => [...prev, { id: Date.now() + 1, conversation_id: conv.id, direction: "out", content: outgoing, created_at: new Date().toISOString() }]);
      setOutgoing(""); setSuggestion(null);
    });
  }

  function handleStageChange(stage: DMStage) {
    startTransition(async () => {
      await updateStage(conv.id, stage);
      setConv((c) => ({ ...c, stage }));
    });
  }

  function handleProfileChange(profile_type: ProfileType) {
    startTransition(async () => {
      await updateProfile(conv.id, profile_type);
      setConv((c) => ({ ...c, profile_type }));
    });
  }

  function handleSaveNotes() {
    startTransition(async () => { await updateNotes(conv.id, notes); });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      {/* Thread */}
      <div className="flex flex-col gap-4">
        {/* Messages */}
        <div className="min-h-[300px] max-h-[50vh] overflow-y-auto space-y-3 p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
          {messages.length === 0 ? (
            <p className="text-built-gray-text text-sm text-center py-8">Niciun mesaj. Adaugă mesajul primit de la prospect.</p>
          ) : messages.map((m) => (
            <div key={m.id} className={`flex ${m.direction === "out" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-3 rounded-sm text-sm leading-relaxed ${
                m.direction === "out"
                  ? "bg-built-red/20 border border-built-red/40 text-built-white"
                  : "bg-built-gray-2 border border-built-gray-2/50 text-built-white/90"
              }`}>
                <p className={`font-condensed text-[9px] mb-1 ${m.direction === "out" ? "text-built-red" : "text-built-gray-text"}`}>
                  {m.direction === "out" ? "CLAUDIU" : "PROSPECT"} · {new Date(m.created_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                </p>
                {m.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input mesaj primit */}
        <div className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-2">Mesaj primit de la prospect</p>
          <textarea value={incoming} onChange={(e) => setIncoming(e.target.value)} rows={3}
            placeholder="Copiază mesajul primit..."
            className="w-full bg-built-black border border-built-gray-2 text-built-white text-sm p-3 resize-none focus:outline-none focus:border-built-red mb-3" />
          <button type="button" onClick={handleGenerateSuggestion} disabled={isPending || !incoming.trim()}
            className="px-5 py-2.5 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs disabled:opacity-50 transition-colors">
            {isPending ? "Generează... (~10s)" : "Generează răspuns AI →"}
          </button>
          {error && <p className="text-built-red font-condensed text-xs mt-2">{error}</p>}
        </div>

        {/* Sugestie AI */}
        {suggestion && (
          <div className="p-4 bg-built-gray-1 border border-built-red/50 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="font-condensed text-[10px] text-built-red uppercase">Sugestie AI</p>
              {suggestion.next_stage && (
                <span className="font-condensed text-[10px] text-amber-400">→ {STAGE_LABELS[suggestion.next_stage]}</span>
              )}
            </div>
            {suggestion.red_flags.length > 0 && (
              <div className="mb-3 p-2 bg-orange-400/10 border border-orange-400/30">
                <p className="font-condensed text-[9px] text-orange-400 uppercase mb-1">Red flags detectate</p>
                {suggestion.red_flags.map((f, i) => <p key={i} className="text-xs text-orange-300">⚠ {f}</p>)}
              </div>
            )}
            <p className="font-condensed text-[9px] text-built-gray-text uppercase mb-1">Raționament intern</p>
            <p className="text-xs text-built-gray-text italic mb-3">{suggestion.reasoning}</p>
            <textarea value={outgoing} onChange={(e) => setOutgoing(e.target.value)} rows={4}
              className="w-full bg-built-black border border-built-gray-2 text-built-white text-sm p-3 resize-none focus:outline-none focus:border-built-red mb-3" />
            <button type="button" onClick={handleSendOutgoing} disabled={isPending || !outgoing.trim()}
              className="px-5 py-2.5 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs disabled:opacity-50 transition-colors">
              {isPending ? "..." : "Trimite (marchează ca trimis)"}
            </button>
          </div>
        )}
      </div>

      {/* Sidebar conversație */}
      <div className="space-y-4">
        {/* Stage */}
        <div className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-3">Stage</p>
          <div className="space-y-1">
            {STAGES.map((s) => (
              <button key={s} type="button" onClick={() => handleStageChange(s)}
                className={`w-full text-left px-3 py-2 font-condensed text-[10px] transition-colors rounded-sm ${
                  conv.stage === s ? "bg-built-red/20 text-built-red border border-built-red/40" : "text-built-gray-text hover:text-built-white"
                }`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${STAGE_DOT[s] ?? (conv.stage === s ? "bg-built-red" : "bg-built-gray-2")}`} />
                {STAGE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Profil */}
        <div className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-3">Profil prospect</p>
          <div className="space-y-1">
            {PROFILES.map((p) => (
              <button key={p.id} type="button" onClick={() => handleProfileChange(p.id)}
                className={`w-full text-left px-3 py-2 font-condensed text-[10px] transition-colors rounded-sm ${
                  conv.profile_type === p.id ? "bg-built-red/20 text-built-red border border-built-red/40" : "text-built-gray-text hover:text-built-white"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Red flags */}
        {conv.red_flags?.length > 0 && (
          <div className="p-4 bg-orange-400/5 border border-orange-400/30 rounded-sm">
            <p className="font-condensed text-[10px] text-orange-400 uppercase mb-2">Red flags</p>
            {conv.red_flags.map((f, i) => <p key={i} className="text-xs text-orange-300 mb-1">⚠ {f}</p>)}
          </div>
        )}

        {/* Note */}
        <div className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-2">Note interne</p>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} onBlur={handleSaveNotes}
            placeholder="Observații despre prospect..."
            className="w-full bg-built-black border border-built-gray-2 text-built-white text-xs p-2 resize-none focus:outline-none focus:border-built-red" />
          <p className="font-condensed text-[9px] text-built-gray-text/50 mt-1">Se salvează automat la pierderea focusului.</p>
        </div>
      </div>
    </div>
  );
}
