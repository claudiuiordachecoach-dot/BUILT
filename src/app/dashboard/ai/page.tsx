"use client";

import { useState, useRef, useEffect } from "react";
import { sendChatMessage, type ChatMessage } from "./actions";

const QUICK_QUESTIONS = [
  "De ce reels-urile mele nu prind vizualizări?",
  "Ce ar trebui să postez săptămâna asta?",
  "Cum calific un prospect în DM?",
  "Dă-mi un hook bun pentru Talking Head",
  "Care e structura apelului de diagnostic?",
  "Cum răspund la obiecția \"e prea scump\"?",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Bună, Claudiu. Sunt Creierul BUILT — antrenat pe filozofia ta, metodologia ta și vocea ta. Întreabă-mă orice despre conținut, DM-uri, clienți sau strategie.",
  },
];

export default function AskAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setError("");

    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const result = await sendChatMessage(newMessages);

    if (result.ok) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.reply },
      ]);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-screen bg-built-black">
      {/* Left panel — Quick Questions */}
      <div className="w-56 shrink-0 border-r border-white/10 p-4 flex flex-col gap-1">
        <p className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase mb-3">
          Quick Questions
        </p>
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={loading}
            className="text-left text-[12px] text-zinc-400 hover:text-zinc-100 hover:bg-white/5 px-3 py-2 rounded-lg transition-all disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-built-red/20 flex items-center justify-center">
            <span className="text-built-red text-xs font-bold">B</span>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-100">Ask BUILT AI</p>
            <p className="text-[11px] text-zinc-500">Personalizat pentru Iordache Claudiu</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.length === 1 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-built-red/10 flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <p className="text-zinc-100 font-medium mb-1">Ask BUILT AI orice</p>
                <p className="text-zinc-500 text-sm max-w-sm">
                  Sfaturi personalizate despre conținut Instagram, DM-uri și conversie. Folosește întrebările din stânga sau scrie propria ta întrebare.
                </p>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-built-red/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-built-red text-xs font-bold">B</span>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-built-red/15 text-zinc-100 rounded-tr-sm"
                    : "bg-[#111111] text-zinc-200 rounded-tl-sm border border-white/5"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-built-red/20 flex items-center justify-center shrink-0">
                <span className="text-built-red text-xs font-bold">B</span>
              </div>
              <div className="bg-[#111111] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          {error && (
            <p className="text-center text-xs text-built-red">{error}</p>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-4">
          <div className="flex gap-3 items-end bg-[#111111] border border-white/10 rounded-xl px-4 py-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask BUILT AI orice..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 resize-none outline-none max-h-32 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="shrink-0 w-8 h-8 rounded-lg bg-built-red flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-zinc-600 text-center mt-2">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
