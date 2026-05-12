# BUILT v2 — Plan 2: Feature Upgrades (William parity)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. **Requires Plan 1 completed first.**

**Goal:** Toate feature-urile din Cult Dashboard (William Scott) replicate 1:1 — conversation saving, dashboard upgrades, content studio cu weekly scripts, AI reply generator, onboarding hub, calendar cu thumbnails, reel analyser upgrade.

**Architecture:** Server Actions pentru toate operațiile de date. Fiecare pagină existentă primește upgrade incremental. Conversațiile AI se salvează automat în `ai_conversations` table.

**Tech Stack:** Next.js 16 App Router, Anthropic Claude API, Supabase, Apify API, TypeScript

---

## File Map

- **Create:** `src/lib/conversations.ts` — save/get/list conversații
- **Create:** `src/lib/apify.ts` — scraping Instagram via Apify
- **Modify:** `src/app/knowledge/page.tsx` — chat complet cu istoric
- **Modify:** `src/app/knowledge/actions.ts` — salvare conversații
- **Modify:** `src/app/dashboard/analytics/page.tsx` — Tip of Week + Content Library cu Analyse
- **Modify:** `src/app/dashboard/analytics/actions.ts` — sync media, analiză reel
- **Modify:** `src/app/dashboard/content/page.tsx` — competitors + weekly scripts
- **Create:** `src/app/dashboard/content/actions.ts`
- **Modify:** `src/app/dashboard/outreach/page.tsx` — AI Reply Generator complet
- **Create:** `src/app/dashboard/outreach/actions.ts`
- **Modify:** `src/app/dashboard/onboarding/page.tsx` — progress % + Save & Update AI
- **Modify:** `src/app/dashboard/calendar/page.tsx` — thumbnails + Add Idea modal complet
- **Modify:** `src/app/dashboard/reel-copy/page.tsx` — Suggested Hook section
- **Modify:** `src/app/dashboard/reel-copy/actions.ts` — adaugă suggested hook
- **Create:** `src/app/api/cron/weekly-scripts/route.ts` — Vercel Cron trigger

---

### Task 1: Conversation saving infrastructure

**Files:**
- Create: `src/lib/conversations.ts`

- [ ] **Step 1: Creează src/lib/conversations.ts**

```typescript
// src/lib/conversations.ts
import { getSupabaseAuth } from "@/lib/supabase/auth-server";

export type ConvMessage = { role: "user" | "assistant"; content: string; created_at: string };

export async function saveConversation(opts: {
  source: string;
  title: string;
  messages: ConvMessage[];
  summary?: string;
  tags?: string[];
}) {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({
      user_id: user.id,
      source: opts.source,
      title: opts.title,
      messages: opts.messages,
      summary: opts.summary ?? null,
      tags: opts.tags ?? [],
    })
    .select("id")
    .single();

  return error ? null : data;
}

export async function appendMessage(conversationId: number, message: ConvMessage) {
  const supabase = await getSupabaseAuth();
  const { data: existing } = await supabase
    .from("ai_conversations")
    .select("messages")
    .eq("id", conversationId)
    .single();

  const messages = [...((existing?.messages as ConvMessage[]) ?? []), message];
  await supabase
    .from("ai_conversations")
    .update({ messages, updated_at: new Date().toISOString() })
    .eq("id", conversationId);
}

export async function listConversations(source?: string, limit = 20) {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("ai_conversations")
    .select("id, source, title, summary, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (source) query = query.eq("source", source);
  const { data } = await query;
  return data ?? [];
}

export async function getConversation(id: number) {
  const supabase = await getSupabaseAuth();
  const { data } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function getRecentContext(limit = 5): Promise<string> {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "";

  const { data } = await supabase
    .from("ai_conversations")
    .select("title, summary, messages")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data?.length) return "";
  return data.map(c =>
    `[Conversație: ${c.title}]\n${c.summary ?? (c.messages as ConvMessage[]).slice(-2).map(m => `${m.role}: ${m.content}`).join('\n')}`
  ).join('\n\n');
}
```

---

### Task 2: Ask BUILT AI — chat cu istoric

**Files:**
- Modify: `src/app/knowledge/page.tsx`
- Modify: `src/app/knowledge/actions.ts`

- [ ] **Step 1: Actualizează knowledge/actions.ts**

Înlocuiește tot conținutul cu:

```typescript
// src/app/knowledge/actions.ts
"use server";
import Anthropic from "@anthropic-ai/sdk";
import { getRecentContext, saveConversation, appendMessage, listConversations, getConversation } from "@/lib/conversations";
import { getSupabaseAuth } from "@/lib/supabase/auth-server";
import { getSupabaseServer } from "@/lib/supabase/server";

const client = new Anthropic();

export async function sendMessage(conversationId: number | null, userMessage: string) {
  const recentContext = await getRecentContext(5);
  const supabase = getSupabaseServer();
  const { data: creierSections } = await supabase
    .from("creier_sections")
    .select("title, content")
    .eq("status", "completed")
    .order("order_index");

  const creierContext = creierSections?.map(s =>
    `## ${s.title}\n${JSON.stringify(s.content)}`
  ).join('\n\n') ?? "";

  const systemPrompt = `Ești BUILT AI — asistentul personal al lui Iordache Claudiu, construit pe baza sistemului BUILT (Arhitectura Corpului pe 90 de zile).

CUNOȘTINȚELE TALE DESPRE CLAUDIU:
${creierContext}

CONVERSAȚII RECENTE (context):
${recentContext}

Răspunzi în română, direct, fără clișee motivaționale. Folosești vocabularul BUILT: sistem, arhitectură, reconstrucție, protocol, piloni, execuție, diagnostic.`;

  let messages: { role: "user" | "assistant"; content: string }[] = [];

  if (conversationId) {
    const conv = await getConversation(conversationId);
    messages = (conv?.messages ?? []).map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  }

  messages.push({ role: "user", content: userMessage });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const assistantMessage = response.content[0].type === "text" ? response.content[0].text : "";
  const now = new Date().toISOString();

  if (!conversationId) {
    const title = userMessage.slice(0, 60) + (userMessage.length > 60 ? "..." : "");
    const saved = await saveConversation({
      source: "ask_built_ai",
      title,
      messages: [
        { role: "user", content: userMessage, created_at: now },
        { role: "assistant", content: assistantMessage, created_at: now },
      ],
    });
    return { reply: assistantMessage, conversationId: saved?.id ?? null };
  } else {
    await appendMessage(conversationId, { role: "user", content: userMessage, created_at: now });
    await appendMessage(conversationId, { role: "assistant", content: assistantMessage, created_at: now });
    return { reply: assistantMessage, conversationId };
  }
}

export async function importConversation(text: string, source: "claude_import" | "gemini_import") {
  const lines = text.split('\n').filter(l => l.trim());
  const messages: { role: "user" | "assistant"; content: string; created_at: string }[] = [];
  const now = new Date().toISOString();
  let current: { role: "user" | "assistant"; content: string[] } | null = null;

  for (const line of lines) {
    if (/^(Human|User|Claudiu|Tu):/i.test(line)) {
      if (current) messages.push({ role: current.role, content: current.content.join('\n'), created_at: now });
      current = { role: "user", content: [line.replace(/^[^:]+:\s*/, '')] };
    } else if (/^(Assistant|Claude|AI|Gemini):/i.test(line)) {
      if (current) messages.push({ role: current.role, content: current.content.join('\n'), created_at: now });
      current = { role: "assistant", content: [line.replace(/^[^:]+:\s*/, '')] };
    } else if (current) {
      current.content.push(line);
    }
  }
  if (current) messages.push({ role: current.role, content: current.content.join('\n'), created_at: now });

  if (!messages.length) return { error: "Nu am putut parsa conversația. Asigură-te că fiecare mesaj începe cu 'Human:' sau 'Assistant:'." };

  const title = messages[0]?.content.slice(0, 60) ?? "Conversație importată";
  const saved = await saveConversation({ source, title, messages });
  return { success: true, id: saved?.id };
}

export { listConversations };
```

- [ ] **Step 2: Înlocuiește knowledge/page.tsx**

```typescript
// src/app/knowledge/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
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
      const updated = await listConversations(undefined, 20);
      setConversations(updated);
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
    if (result.error) { alert(result.error); return; }
    setShowImport(false);
    setImportText("");
    const updated = await listConversations(undefined, 20);
    setConversations(updated);
    alert("Conversație importată cu succes!");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar conversații */}
      <aside className="w-64 shrink-0 bg-[#0d0d0d] border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xs font-semibold text-zinc-400 tracking-widest uppercase mb-3">Ask BUILT AI</h2>
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
              <h3 className="text-lg font-semibold text-zinc-200 mb-1">Ask BUILT AI</h3>
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
              placeholder="Întreabă BUILT AI orice..."
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
            <p className="text-xs text-zinc-500 mb-4">Paste o conversație din Claude sau Gemini. Fiecare mesaj trebuie să înceapă cu "Human:" sau "Assistant:".</p>
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
```

- [ ] **Step 3: Commit**

```bash
cd "built-ai-command-center" && git add -A && git commit -m "feat: ask built ai — chat complet cu istoric, import conversatii Claude/Gemini"
```

---

### Task 3: Apify integration

**Files:**
- Create: `src/lib/apify.ts`

- [ ] **Step 1: Adaugă APIFY_API_KEY în .env.local**

```bash
echo "APIFY_API_KEY=your_apify_api_key_here" >> "built-ai-command-center/.env.local"
```

Înlocuiește `your_apify_api_key_here` cu cheia din apify.com → Settings → Integrations → API tokens.

- [ ] **Step 2: Creează src/lib/apify.ts**

```typescript
// src/lib/apify.ts
export type ApifyReel = {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
};

export async function scrapeInstagramReels(username: string, limit = 20): Promise<ApifyReel[]> {
  const apiKey = process.env.APIFY_API_KEY;
  if (!apiKey) throw new Error("APIFY_API_KEY lipsește");

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-reel-scraper/runs?token=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: [username],
        resultsLimit: limit,
      }),
    }
  );

  if (!runRes.ok) throw new Error(`Apify run failed: ${runRes.status}`);
  const run = await runRes.json();
  const runId = run.data?.id;
  if (!runId) throw new Error("No run ID returned");

  // Poll until finished (max 2 minute)
  for (let i = 0; i < 24; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`
    );
    const status = await statusRes.json();
    if (status.data?.status === "SUCCEEDED") break;
    if (status.data?.status === "FAILED") throw new Error("Apify run failed");
  }

  const dataRes = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiKey}`
  );
  const items = await dataRes.json();
  return (items ?? []).map((item: Record<string, unknown>) => ({
    id: String(item.id ?? item.shortCode ?? ""),
    url: String(item.url ?? ""),
    thumbnailUrl: String(item.displayUrl ?? item.thumbnailUrl ?? ""),
    caption: String(item.caption ?? ""),
    viewsCount: Number(item.videoViewCount ?? item.viewsCount ?? 0),
    likesCount: Number(item.likesCount ?? 0),
    commentsCount: Number(item.commentsCount ?? 0),
    timestamp: String(item.timestamp ?? new Date().toISOString()),
  }));
}
```

---

### Task 4: Dashboard Analytics — Tip of Week + Content Library cu Analyse

**Files:**
- Modify: `src/app/dashboard/analytics/actions.ts`
- Modify: `src/app/dashboard/analytics/page.tsx`

- [ ] **Step 1: Actualizează analytics/actions.ts — adaugă getTipOfWeek, syncReelsFromApify, listInstagramMedia**

Adaugă la sfârșitul fișierului existent:

```typescript
// Adaugă la src/app/dashboard/analytics/actions.ts
"use server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAuth } from "@/lib/supabase/auth-server";
import Anthropic from "@anthropic-ai/sdk";
import { scrapeInstagramReels } from "@/lib/apify";

const anthropic = new Anthropic();

export async function getTipOfWeek(): Promise<string> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("creier_metadata")
    .select("value")
    .eq("key", "tip_of_week")
    .single();

  if (data?.value) {
    const val = data.value as { text: string; generated_at: string };
    const age = Date.now() - new Date(val.generated_at).getTime();
    if (age < 7 * 24 * 60 * 60 * 1000) return val.text;
  }

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [{
      role: "user",
      content: "Generează un sfat acționabil de 2-3 propoziții pentru Iordache Claudiu (@iordacheclaudiu_) legat de content pe Instagram sau vânzarea serviciilor BUILT în această săptămână. Direct, specific, fără clișee. În română."
    }]
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  await supabase.from("creier_metadata").upsert({ key: "tip_of_week", value: { text, generated_at: new Date().toISOString() } });
  return text;
}

export async function listInstagramMedia(limit = 24) {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("instagram_media")
    .select("*")
    .eq("user_id", user.id)
    .order("posted_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function syncReelsFromApify(username: string) {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const reels = await scrapeInstagramReels(username, 30);
  for (const reel of reels) {
    await supabase.from("instagram_media").upsert({
      user_id: user.id,
      instagram_id: reel.id,
      thumbnail_url: reel.thumbnailUrl,
      caption: reel.caption,
      views: reel.viewsCount,
      likes: reel.likesCount,
      comments: reel.commentsCount,
      posted_at: reel.timestamp,
    }, { onConflict: "instagram_id" });
  }
  return { synced: reels.length };
}
```

- [ ] **Step 2: Actualizează analytics/page.tsx — adaugă Tip of Week section și Content Library cu buton Analyse**

Adaugă importuri la începutul fișierului:
```typescript
import { getTipOfWeek, listInstagramMedia } from "./actions";
```

Adaugă în componentă, după KPI cards, înainte de Format Performance, un nou card „Sfatul Săptămânii":
```typescript
// În JSX, adaugă după KPI_CARDS section:
<TipOfWeekCard />
```

Creează componenta `TipOfWeekCard` în același fișier:
```typescript
function TipOfWeekCard() {
  const [tip, setTip] = useState<string | null>(null);
  useEffect(() => { getTipOfWeek().then(setTip); }, []);
  if (!tip) return null;
  return (
    <div className="bg-[#111111] border border-built-red/20 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-built-red animate-pulse" />
        <span className="text-[11px] font-semibold text-built-red tracking-widest uppercase">Sfatul Săptămânii</span>
      </div>
      <p className="text-sm text-zinc-200 leading-relaxed">{tip}</p>
    </div>
  );
}
```

Adaugă butonul „Analizează" pe fiecare card din CONTENT_LIBRARY. Găsește în JSX cardul de content library și adaugă butonul în colțul din dreapta jos al fiecărui card. Asigură-te că se apelează `analyzeContentLibraryReel` cu reel-ul respectiv.

- [ ] **Step 3: Commit**

```bash
cd "built-ai-command-center" && git add -A && git commit -m "feat: dashboard — tip of week, content library cu analyse, sync Apify"
```

---

### Task 5: Content Studio — Competitors + Weekly Scripts

**Files:**
- Create: `src/app/dashboard/content/actions.ts`
- Modify: `src/app/dashboard/content/page.tsx`

- [ ] **Step 1: Creează content/actions.ts**

```typescript
// src/app/dashboard/content/actions.ts
"use server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAuth } from "@/lib/supabase/auth-server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { scrapeInstagramReels } from "@/lib/apify";

const anthropic = new Anthropic();

export async function listCompetitors() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("competitors")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function addCompetitor(handle: string) {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("competitors").insert({ handle: handle.replace("@","") });
  return { error: error?.message };
}

export async function removeCompetitor(id: number) {
  const supabase = getSupabaseServer();
  await supabase.from("competitors").delete().eq("id", id);
}

export async function scrapeCompetitors() {
  const supabase = getSupabaseServer();
  const { data: competitors } = await supabase.from("competitors").select("handle");
  if (!competitors?.length) return { scraped: 0 };

  let total = 0;
  for (const comp of competitors) {
    try {
      const reels = await scrapeInstagramReels(comp.handle, 10);
      for (const reel of reels) {
        await supabase.from("competitor_reels").upsert({
          competitor_handle: comp.handle,
          instagram_id: reel.id,
          thumbnail_url: reel.thumbnailUrl,
          caption: reel.caption,
          views: reel.viewsCount,
          likes: reel.likesCount,
          posted_at: reel.timestamp,
          transcript: null,
        }, { onConflict: "instagram_id" });
      }
      total += reels.length;
    } catch (e) { console.error(`Failed scraping ${comp.handle}:`, e); }
  }
  return { scraped: total };
}

export async function getLatestWeeklyPackage() {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("weekly_packages")
    .select("*")
    .eq("user_id", user.id)
    .order("week_start", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function generateWeeklyPackage() {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const db = getSupabaseServer();

  // Adună context
  const { data: creierSections } = await db
    .from("creier_sections").select("title, content").eq("status", "completed").order("order_index");
  const { data: competitorReels } = await db
    .from("competitor_reels").select("caption, views, competitor_handle")
    .order("views", { ascending: false }).limit(20);
  const { data: myReels } = await supabase
    .from("instagram_media").select("caption, views, format_type")
    .eq("user_id", user.id).order("posted_at", { ascending: false }).limit(10);

  const creierContext = creierSections?.map(s => `## ${s.title}\n${JSON.stringify(s.content)}`).join('\n\n') ?? "";
  const competitorContext = competitorReels?.map(r => `@${r.competitor_handle}: ${r.views} views — "${r.caption?.slice(0,100)}"`).join('\n') ?? "Nu există date competitor";
  const myContext = myReels?.map(r => `${r.format_type}: ${r.views} views — "${r.caption?.slice(0,80)}"`).join('\n') ?? "Nu există date proprii";

  const prompt = `Ești strategul de content al lui Iordache Claudiu (BUILT — Arhitectura Corpului pe 90 de zile).

PROFILUL LUI CLAUDIU:
${creierContext}

TOP REELS COMPETITORI (această săptămână):
${competitorContext}

REELS PROPRII RECENTE:
${myContext}

Generează un pachet săptămânal COMPLET în format JSON cu această structură exactă:
{
  "intelligence_report": {
    "whats_popping": ["insight1", "insight2", "insight3"],
    "performance_insights": ["format_insight1", "format_insight2"],
    "accounts_to_watch": ["@handle1 — de ce", "@handle2 — de ce"]
  },
  "scripts": [
    {
      "day": "Luni",
      "hook": "hook-ul bold",
      "script": "scriptul complet",
      "caption": "caption-ul cu CTA DM ARHITECTURĂ"
    }
  ]
}

Generează 6 scripturi (Luni-Sâmbătă). Fiecare script trebuie să fie în vocea lui Claudiu, bazat pe pilonii BUILT, cu hook contraintuativ, mecanism fiziologic/psihologic, sistem BUILT ca soluție, CTA discret.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { intelligence_report: {}, scripts: [] };

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  await supabase.from("weekly_packages").upsert({
    user_id: user.id,
    week_start: weekStartStr,
    intelligence_report: parsed.intelligence_report,
    scripts: parsed.scripts,
    generated_at: new Date().toISOString(),
  }, { onConflict: "user_id,week_start" } as object);

  return parsed;
}
```

- [ ] **Step 2: Asigură-te că tabelul competitor_reels există**

Rulează în Supabase SQL Editor:
```sql
create table if not exists public.competitor_reels (
  id bigserial primary key,
  competitor_handle text not null,
  instagram_id text unique,
  thumbnail_url text,
  caption text,
  views int default 0,
  likes int default 0,
  transcript text,
  posted_at timestamptz,
  created_at timestamptz default now()
);
alter table public.competitor_reels enable row level security;
create policy "Allow all competitor_reels" on public.competitor_reels for all using (true) with check (true);
```

- [ ] **Step 3: Actualizează content/page.tsx**

Adaugă în pagina existentă secțiunile lipsă. Dacă pagina nu există, creaz-o cu structura completă. Pagina trebuie să aibă 3 secțiuni principale:

**Secțiunea 1 — YOUR REELS** (grid existent, conectat la `instagram_media` din DB)

**Secțiunea 2 — MY COMPETITORS:**
```typescript
// Adaugă în JSX după grid-ul de reels:
<CompetitorsSection />
```

Componenta `CompetitorsSection`:
```typescript
function CompetitorsSection() {
  const [competitors, setCompetitors] = useState<{id:number,handle:string}[]>([]);
  const [handle, setHandle] = useState("");
  const [scraping, setScraping] = useState(false);

  useEffect(() => { listCompetitors().then(setCompetitors); }, []);

  async function handleAdd() {
    if (!handle.trim()) return;
    await addCompetitor(handle);
    setHandle("");
    listCompetitors().then(setCompetitors);
  }

  async function handleScrape() {
    setScraping(true);
    await scrapeCompetitors();
    setScraping(false);
    alert("Scraping complet!");
  }

  return (
    <div className="border border-white/10 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-200">My Competitors</h3>
        <button onClick={handleScrape} disabled={scraping}
          className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
          {scraping ? "Scraping..." : "⟳ Scrape Now"}
        </button>
      </div>
      <p className="text-xs text-zinc-500 mb-3">Adaugă conturi Instagram din nișa ta. În fiecare săptămână, AI-ul învață din reels-urile lor performante.</p>
      <div className="flex gap-2 mb-3">
        <input value={handle} onChange={e => setHandle(e.target.value)}
          placeholder="@username"
          className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-built-red/50" />
        <button onClick={handleAdd}
          className="bg-built-red/10 hover:bg-built-red/20 border border-built-red/30 text-built-red px-4 py-2 rounded-lg text-sm font-semibold">
          + Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {competitors.map(c => (
          <span key={c.id} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-zinc-300">
            @{c.handle}
            <button onClick={() => removeCompetitor(c.id).then(() => listCompetitors().then(setCompetitors))}
              className="text-zinc-600 hover:text-zinc-300">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}
```

**Secțiunea 3 — THIS WEEK'S SCRIPTS:**
```typescript
function WeeklyScriptsSection() {
  const [pkg, setPkg] = useState<{intelligence_report?: {whats_popping?:string[],performance_insights?:string[]},scripts?:{day:string,hook:string,script:string,caption:string}[]}| null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { getLatestWeeklyPackage().then(setPkg); }, []);

  async function handleGenerate() {
    setGenerating(true);
    const result = await generateWeeklyPackage();
    setPkg(result);
    setGenerating(false);
  }

  return (
    <div className="border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-200">This Week's Scripts</h3>
        <button onClick={handleGenerate} disabled={generating}
          className="text-xs bg-built-red text-white px-4 py-2 rounded-lg font-semibold hover:bg-built-red/90 disabled:opacity-50 transition-all">
          {generating ? "Se generează..." : "⟳ Regenerate This Week"}
        </button>
      </div>

      {pkg?.intelligence_report && (
        <div className="bg-[#0d0d0d] border border-white/5 rounded-lg p-4 mb-5">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Weekly Intelligence Report</p>
          <p className="text-[11px] font-semibold text-zinc-500 mb-1">Ce explodează săptămâna asta</p>
          <ul className="space-y-1 mb-3">
            {pkg.intelligence_report.whats_popping?.map((item, i) => (
              <li key={i} className="text-xs text-zinc-300 flex gap-2"><span className="text-built-red shrink-0">++</span>{item}</li>
            ))}
          </ul>
          <p className="text-[11px] font-semibold text-zinc-500 mb-1">Performanța formatelor</p>
          <ul className="space-y-1">
            {pkg.intelligence_report.performance_insights?.map((item, i) => (
              <li key={i} className="text-xs text-zinc-300 flex gap-2"><span className="text-zinc-600 shrink-0">·</span>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        {pkg?.scripts?.map((script, i) => (
          <div key={i} className="bg-[#0d0d0d] border border-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold text-built-red uppercase">{script.day}</span>
            </div>
            <p className="text-sm font-bold text-white mb-2">"{script.hook}"</p>
            <p className="text-xs text-zinc-400 mb-3 whitespace-pre-wrap">{script.script}</p>
            <div className="border-t border-white/5 pt-3">
              <p className="text-[11px] text-zinc-500 mb-1">Caption</p>
              <p className="text-xs text-zinc-300">{script.caption}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(`${script.hook}\n\n${script.script}\n\n${script.caption}`)}
              className="mt-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              ⎘ Copy script
            </button>
          </div>
        ))}
      </div>

      {!pkg && !generating && (
        <div className="text-center py-12">
          <p className="text-sm text-zinc-500">Niciun pachet generat încă.</p>
          <p className="text-xs text-zinc-600 mt-1">Adaugă competitori și apasă „Regenerate This Week".</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd "built-ai-command-center" && git add -A && git commit -m "feat: content studio — competitors, weekly intelligence report, 7 scripturi"
```

---

### Task 6: AI Reply Generator în Outreach

**Files:**
- Create: `src/app/dashboard/outreach/actions.ts`
- Modify: `src/app/dashboard/outreach/page.tsx`

- [ ] **Step 1: Creează outreach/actions.ts**

```typescript
// src/app/dashboard/outreach/actions.ts
"use server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServer } from "@/lib/supabase/server";

const anthropic = new Anthropic();

const STAGE_CONTEXT: Record<string, string> = {
  "initial_contact": "Este primul contact. Nu vinde nimic. Pune o singură întrebare care forțează verbalizarea durerii.",
  "follow_up": "A răspuns anterior dar s-a oprit. Un singur mesaj, fără presiune.",
  "booking_call": "E cald. Tranziționezi spre 15 minute de diagnostic. Nu pitch.",
  "objection": "A ridicat o obiecție. Validezi, reîncadrezi, returnezi controlul.",
  "closing": "E în apel sau post-apel. Decizie clară, ferm, fără scuze pentru preț.",
  "post_call": "Post-apel. Follow-up sau gestionezi o decizie amânată.",
};

export async function generateDmReply(opts: {
  theirMessage: string;
  stage: string;
  extraContext?: string;
}) {
  const supabase = getSupabaseServer();
  const { data: creierSections } = await supabase
    .from("creier_sections").select("title, content").eq("status", "completed").order("order_index");
  const creierContext = creierSections?.map(s => `## ${s.title}\n${JSON.stringify(s.content)}`).join('\n\n') ?? "";

  const stageInstruction = STAGE_CONTEXT[opts.stage] ?? "";

  const prompt = `Ești Iordache Claudiu și răspunzi unui mesaj DM pe Instagram.

PROFILUL TĂU (BUILT):
${creierContext}

MESAJUL LOR: "${opts.theirMessage}"

STAGE: ${opts.stage} — ${stageInstruction}

${opts.extraContext ? `CONTEXT EXTRA: ${opts.extraContext}` : ""}

Scrie UN răspuns DM în română. Direct, maxim 3-4 propoziții. Nu vindem — diagnosticăm. Nu convingem — calificăm. Fără emoji excesiv. Ton: matur, sigur pe sine, empatic cu situația dar ferm cu sistemul.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function saveDmTemplate(name: string, content: string) {
  const supabase = getSupabaseServer();
  await supabase.from("dm_templates").upsert({ name, content }, { onConflict: "name" });
}

export async function listDmTemplates() {
  const supabase = getSupabaseServer();
  const { data } = await supabase.from("dm_templates").select("*").order("created_at", { ascending: false });
  return data ?? [];
}
```

- [ ] **Step 2: Creează tabelul dm_templates în Supabase**

```sql
create table if not exists public.dm_templates (
  id bigserial primary key,
  name text unique not null,
  content text not null,
  created_at timestamptz default now()
);
alter table public.dm_templates enable row level security;
create policy "Allow all dm_templates" on public.dm_templates for all using (true) with check (true);
```

- [ ] **Step 3: Actualizează outreach/page.tsx**

Pagina trebuie să aibă 3 tabs: Daily Log | Templates | AI Reply Generator.
Tab-ul AI Reply Generator:

```typescript
function AiReplyTab() {
  const [theirMessage, setTheirMessage] = useState("");
  const [stage, setStage] = useState("initial_contact");
  const [extraContext, setExtraContext] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const STAGES = [
    { value: "initial_contact", label: "Contact inițial" },
    { value: "follow_up", label: "Follow-up" },
    { value: "booking_call", label: "Rezervare apel" },
    { value: "objection", label: "Obiecție" },
    { value: "closing", label: "Închidere" },
    { value: "post_call", label: "Post-apel" },
  ];

  async function handleGenerate() {
    if (!theirMessage.trim()) return;
    setLoading(true);
    const result = await generateDmReply({ theirMessage, stage, extraContext });
    setReply(result);
    setLoading(false);
  }

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <label className="block text-xs text-zinc-400 mb-1.5">Mesajul lor</label>
        <textarea value={theirMessage} onChange={e => setTheirMessage(e.target.value)}
          rows={3} placeholder="Paste mesajul primit în DM..."
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-built-red/50" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Stage conversație</label>
          <select value={stage} onChange={e => setStage(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none">
            {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Context extra (opțional)</label>
          <input value={extraContext} onChange={e => setExtraContext(e.target.value)}
            placeholder="Ex: Prima dată că îmi scrie"
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none" />
        </div>
      </div>
      <button onClick={handleGenerate} disabled={loading || !theirMessage.trim()}
        className="w-full bg-built-red hover:bg-built-red/90 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm transition-all">
        {loading ? "Se generează..." : "⚡ Generează răspuns"}
      </button>
      {reply && (
        <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Răspuns generat</p>
          <p className="text-sm text-zinc-200 whitespace-pre-wrap mb-3">{reply}</p>
          <div className="flex gap-2">
            <button onClick={() => navigator.clipboard.writeText(reply)}
              className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 px-3 py-1.5 rounded-lg">
              ⎘ Copy
            </button>
            <button onClick={() => { const name = prompt("Nume template:"); if(name) saveDmTemplate(name, reply); }}
              className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 px-3 py-1.5 rounded-lg">
              ✦ Save as Template
            </button>
            <button onClick={handleGenerate}
              className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 px-3 py-1.5 rounded-lg">
              ↺ Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd "built-ai-command-center" && git add -A && git commit -m "feat: outreach — AI reply generator cu stage-uri DM"
```

---

### Task 7: Onboarding Hub — progress % + Save & Update AI

**Files:**
- Modify: `src/app/dashboard/onboarding/page.tsx`

- [ ] **Step 1: Adaugă progress bar și buton Save & Update AI în pagina existentă**

Găsește în `src/app/dashboard/onboarding/page.tsx` secțiunea de header și adaugă progress bar-ul:

```typescript
// Adaugă hook pentru calculul progresului:
const progress = useMemo(() => {
  const fields = Object.values(formData).flat();
  const filled = fields.filter(f => typeof f === 'string' ? f.trim().length > 0 : !!f).length;
  return Math.round((filled / Math.max(fields.length, 1)) * 100);
}, [formData]);
```

Adaugă vizual progress bar-ul sub titlul paginii:
```typescript
<div className="mb-6">
  <div className="flex items-center justify-between mb-2">
    <span className="text-xs text-zinc-400">{progress}% completat</span>
    <span className="text-xs text-zinc-600">{Math.round(progress * 0.21)} / 21 câmpuri</span>
  </div>
  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
    <div className="h-full bg-built-red rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
  </div>
</div>
```

Butonul „Salvează & Actualizează AI-ul" trebuie să apeleze server action-ul existent de save și după să afișeze un toast de confirmare.

- [ ] **Step 2: Commit**

```bash
cd "built-ai-command-center" && git add -A && git commit -m "feat: onboarding hub — progress bar, save and update ai"
```

---

### Task 8: Reel Analyser — Suggested Hook section

**Files:**
- Modify: `src/app/dashboard/reel-copy/actions.ts`
- Modify: `src/app/dashboard/reel-copy/page.tsx`

- [ ] **Step 1: Adaugă câmpul suggestedHook în acțiunea de analiză**

În `src/app/dashboard/reel-copy/actions.ts`, găsește funcția de analiză și adaugă în prompt:

```typescript
// Adaugă la finalul prompt-ului de analiză:
`\n\nSUGGESTED_HOOK: Rescrie hook-ul adaptat SPECIFIC pentru BUILT (Arhitectura Corpului pe 90 de zile, Iordache Claudiu, audiență bărbați 28-42 ani cu burnout fizic). Maximum 2 propoziții.`
```

Parsează răspunsul și extrage `SUGGESTED_HOOK`:
```typescript
const suggestedHookMatch = text.match(/SUGGESTED_HOOK[:\s]+(.+?)(?:\n\n|$)/s);
const suggestedHook = suggestedHookMatch?.[1]?.trim() ?? "";
// Returnează suggestedHook împreună cu restul analizei
```

- [ ] **Step 2: Adaugă secțiunea vizuală în page.tsx**

```typescript
{analysis?.suggestedHook && (
  <div className="border border-built-red/20 bg-built-red/5 rounded-xl p-4 mt-4">
    <p className="text-[11px] font-semibold text-built-red uppercase tracking-widest mb-2">
      Suggested Hook for BUILT
    </p>
    <p className="text-sm text-zinc-200 mb-3">{analysis.suggestedHook}</p>
    <button
      onClick={() => navigator.clipboard.writeText(analysis.suggestedHook)}
      className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
      ⎘ Copy Hook
    </button>
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
cd "built-ai-command-center" && git add -A && git commit -m "feat: reel analyser — suggested hook for BUILT section"
```

---

### Task 9: Vercel Cron — weekly scripts auto-generation

**Files:**
- Create: `src/app/api/cron/weekly-scripts/route.ts`
- Modify: `vercel.json`

- [ ] **Step 1: Creează route-ul de cron**

```typescript
// src/app/api/cron/weekly-scripts/route.ts
import { NextResponse } from "next/server";
import { generateWeeklyPackage } from "@/app/dashboard/content/actions";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await generateWeeklyPackage();
    return NextResponse.json({ success: true, scripts: result?.scripts?.length ?? 0 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
```

- [ ] **Step 2: Actualizează vercel.json**

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-scripts",
      "schedule": "0 7 * * 1"
    }
  ]
}
```

- [ ] **Step 3: Adaugă CRON_SECRET în .env.local**

```bash
echo "CRON_SECRET=$(openssl rand -hex 32)" >> "built-ai-command-center/.env.local"
```

- [ ] **Step 4: Commit**

```bash
cd "built-ai-command-center" && git add -A && git commit -m "feat: vercel cron — weekly scripts auto-generation luni 07:00"
```

Plan 2 complet. Continuă cu Plan 3 (portal clienți).
