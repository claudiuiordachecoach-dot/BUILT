"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getDailyPlan, saveDailyPlan, type DailyPlan, type DailyItem } from "./actions";

function todayStr() { return new Date().toISOString().split("T")[0]; }
function shiftDate(d: string, n: number) {
  const dt = new Date(d + "T12:00:00"); dt.setDate(dt.getDate() + n);
  return dt.toISOString().split("T")[0];
}
function prettyDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });
}
function isToday(d: string) { return d === todayStr(); }
function newId() {
  try { return crypto.randomUUID(); }
  catch { return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
}

const POST_TYPES = ["Story", "Reel", "Carusel", "Alt"];

// ─── Check ────────────────────────────────────────────────────────────────────

function Check({ done, onToggle }: { done: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      className={`w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${
        done ? "bg-built-red border-built-red" : "border-built-gray-2 hover:border-built-red/60"
      }`}>
      {done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ label, emoji, children, hint }: {
  label: string; emoji: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">{emoji}</span>
        <p className="text-[11px] font-condensed uppercase tracking-widest text-zinc-400">{label}</p>
      </div>
      {hint && <p className="text-[11px] text-zinc-600 mb-3 -mt-2">{hint}</p>}
      {children}
    </div>
  );
}

// ─── Top 3 ────────────────────────────────────────────────────────────────────

function Top3({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  const filled = [...items, "", "", ""].slice(0, 3);
  return (
    <div className="space-y-3">
      {filled.map((val, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className={`font-display text-xl w-6 shrink-0 ${val.trim() ? "text-built-red" : "text-zinc-700"}`}>{i + 1}</span>
          <input
            value={val}
            onChange={(e) => { const n = [...filled]; n[i] = e.target.value; onChange(n); }}
            placeholder={["Cel mai important lucru de azi", "Al doilea", "Al treilea"][i]}
            className="flex-1 bg-transparent border-b border-white/10 focus:border-built-red/50 px-1 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
          />
        </div>
      ))}
    </div>
  );
}

// ─── Post row ─────────────────────────────────────────────────────────────────

function PostRow({ item, onToggle, onEdit, onCycleType, onRemove }: {
  item: DailyItem; onToggle: () => void; onEdit: (t: string) => void;
  onCycleType: () => void; onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 group">
      <Check done={item.done} onToggle={onToggle} />
      <button type="button" onClick={onCycleType}
        className="text-[10px] font-condensed uppercase tracking-wider px-2.5 py-1 rounded-md border border-white/10 text-built-red/80 w-16 shrink-0 hover:border-built-red/40 transition-colors">
        {item.type ?? "Alt"}
      </button>
      <input value={item.text} onChange={(e) => onEdit(e.target.value)}
        placeholder="Ce pui..."
        className={`flex-1 bg-transparent border-b border-white/10 focus:border-built-red/40 px-1 py-1.5 text-sm focus:outline-none transition-colors ${item.done ? "line-through text-zinc-600" : "text-white"}`}
      />
      <button type="button" onClick={onRemove}
        className="text-zinc-700 hover:text-built-red opacity-0 group-hover:opacity-100 transition-all w-5 text-center text-base">×</button>
    </div>
  );
}

// ─── Checklist ────────────────────────────────────────────────────────────────

function Checklist({ items, placeholder, onToggle, onEdit, onRemove, onAdd }: {
  items: DailyItem[]; placeholder: string;
  onToggle: (id: string) => void; onEdit: (id: string, t: string) => void;
  onRemove: (id: string) => void; onAdd: (t: string) => void;
}) {
  const [draft, setDraft] = useState("");
  function commit() { const t = draft.trim(); if (t) { onAdd(t); setDraft(""); } }
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-2.5 group">
          <Check done={it.done} onToggle={() => onToggle(it.id)} />
          <input value={it.text} onChange={(e) => onEdit(it.id, e.target.value)}
            className={`flex-1 bg-transparent border-b border-transparent hover:border-white/10 focus:border-built-red/40 px-1 py-1 text-sm focus:outline-none transition-colors ${it.done ? "line-through text-zinc-600" : "text-white"}`}
          />
          <button type="button" onClick={() => onRemove(it.id)}
            className="text-zinc-700 hover:text-built-red opacity-0 group-hover:opacity-100 transition-all w-5 text-center text-base">×</button>
        </div>
      ))}
      <input value={draft} onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
        onBlur={commit}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-white/[0.06] focus:border-built-red/40 px-1 py-1.5 text-sm text-white placeholder-zinc-700 focus:outline-none transition-colors"
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AziPage() {
  const [dateStr, setDateStr] = useState(todayStr());
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipSave = useRef(true);

  useEffect(() => {
    skipSave.current = true;
    setPlan(null);
    getDailyPlan(dateStr).then((p) => { setPlan(p); skipSave.current = false; });
  }, [dateStr]);

  useEffect(() => {
    if (!plan || skipSave.current) return;
    setStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await saveDailyPlan(plan);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    }, 700);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [plan]);

  const mutate = useCallback((fn: (p: DailyPlan) => DailyPlan) => {
    setPlan((prev) => (prev ? fn(prev) : prev));
  }, []);

  const toggle = (list: "tasks" | "clients" | "tomorrow", id: string) =>
    mutate((p) => ({ ...p, [list]: (p[list] ?? []).map((it) => it.id === id ? { ...it, done: !it.done } : it) }));
  const editItem = (list: "tasks" | "clients" | "tomorrow", id: string, text: string) =>
    mutate((p) => ({ ...p, [list]: (p[list] ?? []).map((it) => it.id === id ? { ...it, text } : it) }));
  const removeItem = (list: "tasks" | "clients" | "tomorrow", id: string) =>
    mutate((p) => ({ ...p, [list]: (p[list] ?? []).filter((it) => it.id !== id) }));
  const addItem = (list: "tasks" | "clients" | "tomorrow", text: string) =>
    mutate((p) => ({ ...p, [list]: [...(p[list] ?? []), { id: newId(), text, done: false }] }));

  const togglePost = (id: string) =>
    mutate((p) => ({ ...p, posts: p.posts.map((it) => it.id === id ? { ...it, done: !it.done } : it) }));
  const editPost = (id: string, text: string) =>
    mutate((p) => ({ ...p, posts: p.posts.map((it) => it.id === id ? { ...it, text } : it) }));
  const cycleType = (id: string, cur: string) => {
    const next = POST_TYPES[(POST_TYPES.indexOf(cur) + 1) % POST_TYPES.length];
    mutate((p) => ({ ...p, posts: p.posts.map((it) => it.id === id ? { ...it, type: next } : it) }));
  };
  const removePost = (id: string) => mutate((p) => ({ ...p, posts: p.posts.filter((it) => it.id !== id) }));
  const addPost = () => mutate((p) => ({ ...p, posts: [...p.posts, { id: newId(), text: "", done: false, type: "Alt" }] }));

  // Progress bar
  const doneCount = plan
    ? plan.posts.filter((p) => p.done && p.text.trim()).length + plan.tasks.filter((t) => t.done).length + plan.clients.filter((c) => c.done).length
    : 0;
  const totalCount = plan
    ? plan.posts.filter((p) => p.text.trim()).length + plan.tasks.length + plan.clients.length
    : 0;

  if (!plan) return <div className="p-8"><p className="text-zinc-600">Se încarcă...</p></div>;

  return (
    <div className="p-8 max-w-2xl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-condensed text-[10px] text-built-red uppercase tracking-widest mb-2">Jurnalul zilei</p>
          <h1 className="font-display text-6xl tracking-[0.06em] text-white leading-none mb-2">
            {isToday(dateStr) ? "AZI" : prettyDate(dateStr).split(",")[0].toUpperCase()}
          </h1>
          <p className="text-zinc-500 text-sm capitalize">{prettyDate(dateStr)}</p>
        </div>
        <div className="flex flex-col items-end gap-3 pt-1">
          {totalCount > 0 && (
            <div className="flex items-center gap-2.5">
              <div className="w-28 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-built-red rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((doneCount / totalCount) * 100)}%` }} />
              </div>
              <span className="text-xs text-zinc-500 tabular-nums">{doneCount}/{totalCount}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setDateStr((d) => shiftDate(d, -1))}
              className="w-8 h-8 rounded-lg border border-white/10 text-zinc-500 hover:text-white hover:border-white/20 transition-colors text-sm flex items-center justify-center">◄</button>
            {!isToday(dateStr) && (
              <button type="button" onClick={() => setDateStr(todayStr())}
                className="px-3 h-8 text-[11px] rounded-lg border border-built-red/30 text-built-red hover:bg-built-red/10 transition-colors">Azi</button>
            )}
            <button type="button" onClick={() => setDateStr((d) => shiftDate(d, 1))}
              className="w-8 h-8 rounded-lg border border-white/10 text-zinc-500 hover:text-white hover:border-white/20 transition-colors text-sm flex items-center justify-center">►</button>
          </div>
          <span className="text-[11px] text-zinc-700 h-4">
            {status === "saving" ? "Salvez..." : status === "saved" ? "✓ Salvat" : ""}
          </span>
        </div>
      </div>

      {/* ── DIMINEAȚĂ ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <p className="font-condensed text-[10px] uppercase tracking-widest text-zinc-600">Dimineață</p>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>

      <div className="space-y-3 mb-8">
        <Section emoji="🎯" label="Top 3 ale zilei" hint="Dacă faci doar astea, ziua a fost un succes.">
          <Top3
            items={plan.top3 ?? ["", "", ""]}
            onChange={(v) => mutate((p) => ({ ...p, top3: v }))}
          />
        </Section>

        <Section emoji="📲" label="Conținut de postat">
          <div className="space-y-2.5 mb-2">
            {plan.posts.map((it) => (
              <PostRow key={it.id} item={it}
                onToggle={() => togglePost(it.id)}
                onEdit={(t) => editPost(it.id, t)}
                onCycleType={() => cycleType(it.id, it.type ?? "Alt")}
                onRemove={() => removePost(it.id)}
              />
            ))}
          </div>
          <button type="button" onClick={addPost}
            className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">+ adaugă</button>
        </Section>

        <Section emoji="✅" label="De făcut">
          <Checklist items={plan.tasks} placeholder="Adaugă și apasă Enter"
            onToggle={(id) => toggle("tasks", id)}
            onEdit={(id, t) => editItem("tasks", id, t)}
            onRemove={(id) => removeItem("tasks", id)}
            onAdd={(t) => addItem("tasks", t)}
          />
        </Section>

        <Section emoji="💬" label="Clienți">
          <Checklist items={plan.clients} placeholder="Cui scrii / check-in (Enter)"
            onToggle={(id) => toggle("clients", id)}
            onEdit={(id, t) => editItem("clients", id, t)}
            onRemove={(id) => removeItem("clients", id)}
            onAdd={(t) => addItem("clients", t)}
          />
        </Section>

        <Section emoji="📝" label="Notițe">
          <textarea
            value={plan.notes ?? ""}
            onChange={(e) => mutate((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Orice altceva — gânduri, idei, context..."
            rows={4}
            className="w-full bg-transparent border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-white/15 transition-colors resize-none"
          />
        </Section>
      </div>

      {/* ── SEARĂ ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <p className="font-condensed text-[10px] uppercase tracking-widest text-zinc-600">Seară</p>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>

      <div className="space-y-3">
        <Section emoji="→" label="Ce mut pe mâine" hint="Ce n-a mers azi. Fără vinovăție.">
          <Checklist items={plan.tomorrow ?? []} placeholder="Adaugă și apasă Enter"
            onToggle={(id) => toggle("tomorrow", id)}
            onEdit={(id, t) => editItem("tomorrow", id, t)}
            onRemove={(id) => removeItem("tomorrow", id)}
            onAdd={(t) => addItem("tomorrow", t)}
          />
        </Section>

        <Section emoji="💡" label="Un gând / lecție" hint="O propoziție. Ce ai învățat azi.">
          <textarea
            value={plan.lesson ?? ""}
            onChange={(e) => mutate((p) => ({ ...p, lesson: e.target.value }))}
            placeholder="..."
            rows={3}
            className="w-full bg-transparent border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-white/15 transition-colors resize-none"
          />
        </Section>
      </div>

    </div>
  );
}
