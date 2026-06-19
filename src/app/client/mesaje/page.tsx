"use client";
import { useState, useEffect, useRef } from "react";
import { getMessages, sendClientMessage, getCoachPublic } from "../actions";

type Msg = { id: number; sender: string; content: string; created_at: string };

export default function MesajePage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [coach, setCoach] = useState<{ avatar_url: string | null; name: string | null; bio: string | null }>({ avatar_url: null, name: null, bio: null });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { getMessages().then(msgs => setMessages(msgs as Msg[])); }, []);
  useEffect(() => { getCoachPublic().then(setCoach); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    await sendClientMessage(content);
    getMessages().then(msgs => setMessages(msgs as Msg[]));
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] md:h-screen">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {coach.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coach.avatar_url} alt="Coach" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-built-red flex items-center justify-center text-sm font-bold text-white">IC</div>
          )}
          <div>
            <p className="text-sm font-semibold text-zinc-200">{coach.name || "Iordache Claudiu"}</p>
            <p className="text-xs text-zinc-500">{coach.bio || "Coach BUILT"}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-12 h-12 rounded-full bg-built-red/10 border border-built-red/20 flex items-center justify-center text-xl text-built-red mb-4">◎</div>
            <p className="font-condensed text-sm uppercase tracking-wider text-zinc-200">Linie directă cu Claudiu</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">Orice întrebare, blocaj sau victorie — scrie aici. Primești răspuns direct.</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === "client" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
              msg.sender === "client" ? "bg-built-red text-white rounded-br-sm" : "bg-[#1a1a1a] border border-white/10 text-zinc-200 rounded-bl-sm"
            }`}>
              <p>{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.sender === "client" ? "text-red-200/70" : "text-zinc-600"}`}>
                {new Date(msg.created_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="Scrie un mesaj..."
            className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-built-red/50" />
          <button onClick={handleSend} disabled={!input.trim() || sending}
            className="bg-built-red hover:bg-built-red/90 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
