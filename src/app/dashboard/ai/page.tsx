"use client";

import { useState, useRef, useEffect } from "react";

const QUICK_QUESTIONS = [
  "De ce reels-urile mele nu prind vizualizări?",
  "Ce ar trebui să postez săptămâna asta?",
  "Cum calific un prospect în DM?",
  "Dă-mi un hook bun pentru Talking Head",
  "Care e structura apelului de diagnostic?",
  "Cum răspund la obiecția \"e prea scump\"?",
  "Ce urmăresc în analizele de sânge la 30 ani?",
];

type Message = {
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content:
      "Bună, Claudiu. Sunt Creierul BUILT — antrenat pe filozofia ta, metodologia ta și vocea ta. Întreabă-mă orice despre conținut, DM-uri, clienți sau strategie.",
  },
];

export default function AskAIPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1200));

    const mockReply: Message = {
      role: "assistant",
      content:
        "Aceasta este o demonstrație mock. Când integrezi API-ul Claude real, răspunsurile vor fi generate din creierul BUILT — toate skill-urile, filozofia și vocea ta.\n\nPentru că ai întrebat despre «" +
        text.slice(0, 40) +
        "...» — răspunsul exact ar veni din knowledge base-ul tău din /creier.",
    };
    setMessages((prev) => [...prev, mockReply]);
    setLoading(false);
  };

  return (
    <div className="flex h-screen">
      {/* Left panel — Quick Questions */}
      <div className="w-56 shrink-0 border-r border-white/10 bg-[#0d0d0d] p-5 flex flex-col">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-4">
          Quick Questions
        </p>
        <div className="space-y-1">
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="w-full text-left text-[11px] text-zinc-500 hover:text-zinc-200 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors leading-snug"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-8 py-5 border-b border-white/10">
          <p className="text-[11px] text-built-red font-mono uppercase tracking-widest mb-0.5">
            Ask BUILT AI
          </p>
          <h1 className="text-2xl font-display tracking-wider text-zinc-100">
            CREIERUL LUI CLAUDIU
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          {messages.length === 1 && (
            <div className="text-center py-16">
              <p className="text-5xl mb-4 opacity-10">◎</p>
              <p className="text-zinc-600 text-sm max-w-sm mx-auto leading-relaxed">
                Întreabă-mă orice despre conținut, DM-uri, clienți sau strategie
                BUILT. Sunt antrenat pe metodologia ta.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-built-red/20 border border-built-red/30 flex items-center justify-center text-[10px] text-built-red shrink-0 mt-1 mr-2">
                  B
                </div>
              )}
              <div
                className={`max-w-[70%] px-4 py-3 rounded-xl text-[13px] leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-built-red/10 border border-built-red/20 text-zinc-200"
                    : "bg-[#111111] border border-white/10 text-zinc-300"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full bg-built-red/20 border border-built-red/30 flex items-center justify-center text-[10px] text-built-red shrink-0 mt-1 mr-2">
                B
              </div>
              <div className="bg-[#111111] border border-white/10 px-4 py-3 rounded-xl">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-built-red/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-built-red/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-built-red/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-8 py-5 border-t border-white/10">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Întreabă-mă orice..."
              className="flex-1 bg-[#111111] border border-white/10 text-zinc-200 text-[13px] px-4 py-3 rounded-xl focus:outline-none focus:border-built-red/40 placeholder:text-zinc-600"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="bg-built-red text-white px-5 py-3 rounded-xl text-[13px] font-medium hover:bg-built-red-dark transition-colors disabled:opacity-40"
            >
              ✦
            </button>
          </div>
          <p className="text-[10px] text-zinc-700 mt-2 font-mono">
            Demo mode — conectează API-ul Claude din /creier pentru răspunsuri reale
          </p>
        </div>
      </div>
    </div>
  );
}
