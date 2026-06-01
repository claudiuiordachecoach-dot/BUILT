"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { sendChatMessage, type ChatMessage } from "./actions";

const QUICK_QUESTIONS = [
  "De ce reels-urile mele nu primesc views?",
  "Ce ar trebui să postez săptămâna asta?",
  "Cum scriu un hook care oprește scrollul?",
  "Cum cresc mai rapid pe Instagram?",
  "Care e cel mai bun format de conținut pentru nișa mea?",
  "Cum convertesc followerii în clienți?",
  "Analizează cele mai bune reels-uri ale mele și spune-mi ce pattern funcționează.",
  "Generează 3 idei de reels pe baza datelor mele reale.",
];

function AskAIContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoSentRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !autoSentRef.current) {
      autoSentRef.current = true;
      sendMessage(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleQuickQuestion = (q: string) => {
    sendMessage(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Left panel — Quick Questions, fixed 240px */}
      <div className="w-[240px] shrink-0 border-r border-white/[0.06] p-4 flex flex-col gap-1.5 overflow-y-auto">
        <p className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mb-3">
          QUICK QUESTIONS
        </p>
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => handleQuickQuestion(q)}
            disabled={loading}
            className="text-left bg-[#111] border border-white/[0.08] rounded-lg px-3 py-2.5 text-[12px] text-zinc-400 hover:text-zinc-200 hover:border-white/20 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 && !loading ? (
            /* Empty state — centered */
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-600"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <div>
                <p className="text-[18px] font-semibold text-zinc-300 mb-2">
                  Ask BUILT AI anything
                </p>
                <p className="text-[13px] text-zinc-500 text-center max-w-xs leading-relaxed">
                  Get personalized advice on growing your Instagram, writing
                  better content, and converting followers to clients.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-built-red/10 border border-built-red/20 text-zinc-100 rounded-tr-sm"
                        : "bg-[#111] border border-white/[0.08] text-zinc-200 rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Loading indicator — 3 dots */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#111] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3">
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
          )}
        </div>

        {/* Input area — sticky bottom */}
        <div className="sticky bottom-0 bg-[#0a0a0a] border-t border-white/[0.06] p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end bg-[#111] border border-white/10 rounded-xl px-4 py-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Ask BUILT AI anything..."
                rows={1}
                className="flex-1 bg-transparent text-[13px] text-zinc-100 placeholder-zinc-600 resize-none outline-none max-h-32 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="shrink-0 w-8 h-8 rounded-lg bg-built-red flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
    </div>
  );
}

export default function AskAIPage() {
  return (
    <Suspense>
      <AskAIContent />
    </Suspense>
  );
}
