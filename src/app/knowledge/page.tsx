"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { sendMessage, importConversation, listConversations } from "./actions";

const QUICK_QUESTIONS = [
  "Ce să postez azi pe Instagram?",
  "Cum răspund la obiecția de preț 500 EUR?",
  "Scrie-mi un hook pentru un reel despre cortizol",
  "Cum calific un prospect în DM?",
  "Generează un sfat nutrițional pentru clienți",
];

type Message = { role: "user" | "assistant"; content: string };
type ConvSummary = { id: number; title: string; source: string; created_at: string };

export default function KnowledgePage() {
  const [conversations, setConversations] = useState<ConvSummary[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importSource, setImportSource] = useState<"claude_import" | "gemini_import">("claude_import");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listConversations(undefined, 20).then(setConversations);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text?: string) {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput("");
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    const { reply, conversationId } = await sendMessage(activeConvId, msg);
    if (!activeConvId && conversationId) {
      setActiveConvId(conversationId);
      listConversations(undefined, 20).then(setConversations);
    }
    setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
  }

  function newConversation() {
    setActiveConvId(null);
    setMessages([]);
  }

  async function handleImport() {
    if (!importText.trim()) return;
    const result = await importConversation(importText, importSource);
    if ("error" in result && result.error) { toast.error(result.error); return; }
    setShowImport(false);
    setImportText("");
    listConversations(undefined, 20).then(setConversations);
    toast.success("Conversație importată cu succes!");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#0d0d0d] border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xs font-semibold text-zinc-400 tracking-widest uppercase mb-3">Ask BUILT</h2>
          <button
            onClick={newConversation}
            className="w-full bg-built-red/10 hover:bg-built-red/20 border border-built-red/30 text-built-red text-xs font-semibold py-2 rounded-lg transition-all"
          >
            + Conversație nouă
          </button>
        </div>

        <div className="p-3 border-b border-white/10">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Întrebări rapide</p>
          <div className="space-y-1">
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => handleSend(q)}
                className="w-full text-left text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-white/5 px-2 py-1.5 rounded transition-all truncate">
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Conversații</p>
            <button onClick={() => setShowImport(true)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors">
              + Import
            </button>
          </div>
          <div className="space-y-1">
            {conversations.map(c => (
              <button key={c.id}
                onClick={() => { setActiveConvId(c.id); setMessages([]); }}
                className={`w-full text-left px-2 py-2 rounded-lg text-[11px] transition-all ${activeConvId === c.id ? 'bg-built-red/10 text-built-red' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}>
                <span className="block truncate">{c.title}</span>
                <span className="text-[10px] text-zinc-600">
                  {c.source === 'claude_import' ? '↙ Claude' : c.source === 'gemini_import' ? '↙ Gemini' : '◎'}
                  {' · '}{new Date(c.created_at).toLocaleDateString('ro-RO')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-built-red/10 border border-built-red/20 flex items-center justify-center text-2xl mb-4">◎</div>
              <h3 className="text-lg font-semibold text-zinc-200 mb-1">Ask BUILT</h3>
              <p className="text-sm text-zinc-500 max-w-sm">Sfaturi personalizate pentru content, DM-uri, clienți — bazate pe sistemul BUILT al lui Claudiu.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-built-red text-white rounded-br-sm'
                  : 'bg-[#1a1a1a] text-zinc-200 border border-white/10 rounded-bl-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{animationDelay:`${i*0.15}s`}} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
              placeholder="Întreabă BUILT orice..."
              className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-built-red/50"
            />
            <button onClick={() => handleSend()} disabled={loading || !input.trim()}
              className="bg-built-red hover:bg-built-red/90 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all">
              →
            </button>
          </div>
          <p className="text-[10px] text-zinc-700 mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>

      {/* Import modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-base font-semibold text-white mb-1">Importă conversație</h3>
            <p className="text-xs text-zinc-500 mb-4">Paste o conversație din Claude sau Gemini. Fiecare mesaj trebuie să înceapă cu &quot;Human:&quot; sau &quot;Assistant:&quot;.</p>
            <select
              value={importSource}
              onChange={e => setImportSource(e.target.value as "claude_import" | "gemini_import")}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 mb-3">
              <option value="claude_import">Claude Code / Claude.ai</option>
              <option value="gemini_import">Gemini</option>
            </select>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              rows={8}
              placeholder={"Human: Care e cel mai bun hook?\nAssistant: Cel mai bun hook..."}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder-zinc-700 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowImport(false)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-zinc-400 hover:bg-white/5">
                Anulează
              </button>
              <button onClick={handleImport}
                className="flex-1 py-2.5 rounded-lg bg-built-red text-white text-sm font-semibold hover:bg-built-red/90">
                Importă
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
