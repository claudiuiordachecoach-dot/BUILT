"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getDailyPlan, saveDailyPlan, type DailyPlan, type DailyItem } from "./actions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function prettyDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("ro-RO", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}

function newId(): string {
  try { return crypto.randomUUID(); }
  catch { return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
}

const POST_TYPES = ["Story", "Reel", "Carusel", "Alt"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Check({ done, onToggle }: { done: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-all ${
        done
          ? "bg-built-red border-built-red text-white"
          : "border-built-gray-2 hover:border-built-red/60"
      }`}
    >
      {done && <span className="text-[10px] font-bold leading-none">✓</span>}
    </button>
  );
}

function Top3({ items, onChange }: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const filled = [...items, "", "", ""].slice(0, 3);
  return (
    <div className="space-y-2">
      {filled.map((val, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="font-display text-2xl text-built-red/60 w-6 shrink-0">{i + 1}</span>
          <input
            value={val}
            onChange={(e) => {
              const next = [...filled];
              next[i] = e.target.value;
              onChange(next.map(v => v));
            }}
            placeholder={i === 0 ? "Cea mai importantă chestie de azi" : "Al doilea lucru important"}
            className="flex-1 bg-transparent border-b border-built-gray-2 focus:border-built-red/50 px-1 py-1.5 text-built-white placeholder-built-gray-text/40 text-sm focus:outline-none transition-colors"
          />
        </div>
      ))}
    </div>
  );
}

function PostRow({ item, onToggle, onEdit, onChangeType, onRemove }: {
  item: DailyItem;
  onToggle: () => void;
  onEdit: (text: string) => void;
  onChangeType: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 group">
      <Check done={item.done} onToggle={onToggle} />
      <button
        type="button"
        onClick={onChangeType}
        title="Schimbă tipul"
        className="text-[10px] font-condensed uppercase tracking-wider px-2 py-1 rounded border border-built-gray-2 text-built-red w-16 shrink-0 hover:border-built-red/60 transition-colors"
      >
        {item.type ?? "Alt"}
      </button>
      <input
        value={item.text}
        onChange={(e) => onEdit(e.target.value)}
        placeholder="Ce pui..."
        className={`flex-1 bg-transparent border-b border-built-gray-2 focus:border-built-red/50 px-1 py-1.5 text-sm focus:outline-none transition-colors ${
          item.done ? "line-through text-built-gray-text" : "text-built-white"
        }`}
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-built-gray-text hover:text-built-red opacity-0 group-hover:opacity-100 transition-opacity w-5 text-center"
      >×</button>
    </div>
  );
}

function Checklist({ items, placeholder, onToggle, onEdit, onRemove, onAdd }: {
  items: DailyItem[];
  placeholder: string;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onAdd: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const t = draft.trim();
    if (t) { onAdd(t); setDraft(""); }
  }

  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-2 group">
          <Check done={it.done} onToggle={() => onToggle(it.id)} />
          <input
            value={it.text}
            onChange={(e) => onEdit(it.id, e.target.value)}
            className={`flex-1 bg-transparent border-b border-transparent hover:border-built-gray-2 focus:border-built-red/50 px-1 py-1 text-sm focus:outline-none transition-colors ${
              it.done ? "line-through text-built-gray-text" : "text-built-white"
            }`}
          />
          <button
            type="button"
            onClick={() => onRemove(it.id)}
            className="text-built-gray-text hover:text-built-red opacity-0 group-hover:opacity-100 transition-opacity w-5 text-center"
          >×</button>
        </div>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
        onBlur={commit}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-built-gray-2/50 focus:border-built-red/50 px-1 py-1.5 text-sm text-built-white placeholder-built-gray-text/40 focus:outline-none transition-colors"
      />
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AziPage() {
  const [dateStr, setDateStr] = useState(todayStr());
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipSave = useRef(true);

  useEffect(() => {
    skipSave.current = true;
    setPlan(null);
    getDailyPlan(dateStr).then((p) => {
      setPlan(p);
      skipSave.current = false;
    });
  }, [dateStr]);

  useEffect(() => {
    if (!plan || skipSave.current) return;
    setStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await saveDailyPlan(plan);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    }, 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [plan]);

  const mutate = useCallback((fn: (p: DailyPlan) => DailyPlan) => {
    setPlan((prev) => (prev ? fn(prev) : prev));
  }, []);

  // Checklist ops
  const toggle = (list: "tasks" | "clients", id: string) =>
    mutate((p) => ({ ...p, [list]: p[list].map((it) => it.id === id ? { ...it, done: !it.done } : it) }));
  const editItem = (list: "tasks" | "clients", id: string, text: string) =>
    mutate((p) => ({ ...p, [list]: p[list].map((it) => it.id === id ? { ...it, text } : it) }));
  const removeItem = (list: "tasks" | "clients", id: string) =>
    mutate((p) => ({ ...p, [list]: p[list].filter((it) => it.id !== id) }));
  const addItem = (list: "tasks" | "clients", text: string) =>
    mutate((p) => ({ ...p, [list]: [...p[list], { id: newId(), text, done: false }] }));

  // Posts ops
  const togglePost = (id: string) =>
    mutate((p) => ({ ...p, posts: p.posts.map((it) => it.id === id ? { ...it, done: !it.done } : it) }));
  const editPost = (id: string, text: string) =>
    mutate((p) => ({ ...p, posts: p.posts.map((it) => it.id === id ? { ...it, text } : it) }));
  const cycleType = (id: string, current: string) => {
    const next = POST_TYPES[(POST_TYPES.indexOf(current) + 1) % POST_TYPES.length];
    mutate((p) => ({ ...p, posts: p.posts.map((it) => it.id === id ? { ...it, type: next } : it) }));
  };
  const removePost = (id: string) =>
    mutate((p) => ({ ...p, posts: p.posts.filter((it) => it.id !== id) }));
  const addPost = () =>
    mutate((p) => ({ ...p, posts: [...p.posts, { id: newId(), text: "", done: false, type: "Alt" }] }));

  // Progress
  const allCheckable = plan
    ? [...plan.posts.filter((p) => p.text.trim()), ...plan.tasks, ...plan.clients,
       ...(plan.top3 ?? []).filter(Boolean).map((_, i) => ({ id: `t3_${i}`, done: false, text: "" }))]
    : [];
  const doneCount = plan
    ? plan.posts.filter((p) => p.done && p.text.trim()).length +
      plan.tasks.filter((t) => t.done).length +
      plan.clients.filter((c) => c.done).length
    : 0;
  const totalCount = plan
    ? plan.posts.filter((p) => p.text.trim()).length +
      plan.tasks.length +
      plan.clients.length
    : 0;
  void allCheckable;

  if (!plan) return (
    <div className="p-8"><p className="text-built-gray-text">Se încarcă...</p></div>
  );

  return (
    <div className="p-8 max-w-2xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">Jurnalul zilei</p>
          <h1 className="font-display text-5xl tracking-[0.06em] text-built-white leading-none">
            {isToday(dateStr) ? "AZI" : prettyDate(dateStr).split(",")[0].toUpperCase()}
          </h1>
          <p className="text-built-gray-text text-sm mt-1 capitalize">{prettyDate(dateStr)}</p>
        </div>
        <div className="flex flex-col items-end gap-2 pt-1">
          {/* Progres */}
          {totalCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-built-gray-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-built-red rounded-full transition-all"
                  style={{ width: `${Math.round((doneCount / totalCount) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-built-gray-text">{doneCount}/{totalCount}</span>
            </div>
          )}
          {/* Navigare */}
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setDateStr((d) => shiftDate(d, -1))}
              className="px-2.5 py-1.5 rounded border border-built-gray-2 text-built-gray-text hover:text-built-white hover:border-white/20 transition-colors text-sm">◄</button>
            {!isToday(dateStr) && (
              <button type="button" onClick={() => setDateStr(todayStr())}
                className="px-3 py-1.5 text-xs rounded border border-built-red/40 text-built-red hover:bg-built-red/10 transition-colors">Azi</button>
            )}
            <button type="button" onClick={() => setDateStr((d) => shiftDate(d, 1))}
              className="px-2.5 py-1.5 rounded border border-built-gray-2 text-built-gray-text hover:text-built-white hover:border-white/20 transition-colors text-sm">►</button>
          </div>
          <span className="text-[11px] text-built-gray-text/60 h-4">
            {status === "saving" ? "Salvez..." : status === "saved" ? "✓ Salvat" : ""}
          </span>
        </div>
      </div>

      <div className="w-full h-px bg-built-gray-2 mb-6" />

      {/* ── DIMINEAȚĂ ── */}
      <p className="font-condensed text-[10px] uppercase tracking-widest text-built-gray-text mb-4">Dimineață</p>

      {/* Top 3 */}
      <div className="mb-6">
        <p className="text-[11px] font-condensed uppercase tracking-wider text-built-red mb-2">Top 3 ale zilei</p>
        <p className="text-[11px] text-built-gray-text/70 mb-3">Dacă faci doar astea, ziua a fost un succes.</p>
        <Top3
          items={plan.top3 ?? ["", "", ""]}
          onChange={(items) => mutate((p) => ({ ...p, top3: items }))}
        />
      </div>

      {/* Conținut */}
      <div className="mb-6">
        <p className="text-[11px] font-condensed uppercase tracking-wider text-built-red mb-3">Conținut de postat</p>
        <div className="space-y-2">
          {plan.posts.map((it) => (
            <PostRow
              key={it.id}
              item={it}
              onToggle={() => togglePost(it.id)}
              onEdit={(text) => editPost(it.id, text)}
              onChangeType={() => cycleType(it.id, it.type ?? "Alt")}
              onRemove={() => removePost(it.id)}
            />
          ))}
        </div>
        <button type="button" onClick={addPost}
          className="mt-2 text-xs text-built-gray-text hover:text-built-white transition-colors">
          + adaugă
        </button>
      </div>

      {/* De făcut */}
      <div className="mb-6">
        <p className="text-[11px] font-condensed uppercase tracking-wider text-built-red mb-3">De făcut</p>
        <Checklist
          items={plan.tasks}
          placeholder="Adaugă și apasă Enter"
          onToggle={(id) => toggle("tasks", id)}
          onEdit={(id, text) => editItem("tasks", id, text)}
          onRemove={(id) => removeItem("tasks", id)}
          onAdd={(text) => addItem("tasks", text)}
        />
      </div>

      {/* Clienți */}
      <div className="mb-6">
        <p className="text-[11px] font-condensed uppercase tracking-wider text-built-red mb-3">Clienți</p>
        <Checklist
          items={plan.clients}
          placeholder="Cui scrii / check-in (Enter)"
          onToggle={(id) => toggle("clients", id)}
          onEdit={(id, text) => editItem("clients", id, text)}
          onRemove={(id) => removeItem("clients", id)}
          onAdd={(text) => addItem("clients", text)}
        />
      </div>

      <div className="w-full h-px bg-built-gray-2 mb-6" />

      {/* ── SEARA ── */}
      <p className="font-condensed text-[10px] uppercase tracking-widest text-built-gray-text mb-4">Seară</p>

      {/* Ce mut pe mâine */}
      <div className="mb-6">
        <p className="text-[11px] font-condensed uppercase tracking-wider text-built-red mb-1">Ce mut pe mâine →</p>
        <p className="text-[11px] text-built-gray-text/70 mb-3">Ce n-a mers azi. Fără vinovăție — migrezi și gata.</p>
        <Checklist
          items={plan.tomorrow ?? []}
          placeholder="Adaugă și apasă Enter"
          onToggle={(id) => mutate((p) => ({ ...p, tomorrow: (p.tomorrow ?? []).map((it) => it.id === id ? { ...it, done: !it.done } : it) }))}
          onEdit={(id, text) => mutate((p) => ({ ...p, tomorrow: (p.tomorrow ?? []).map((it) => it.id === id ? { ...it, text } : it) }))}
          onRemove={(id) => mutate((p) => ({ ...p, tomorrow: (p.tomorrow ?? []).filter((it) => it.id !== id) }))}
          onAdd={(text) => mutate((p) => ({ ...p, tomorrow: [...(p.tomorrow ?? []), { id: newId(), text, done: false }] }))}
        />
      </div>

      {/* Un gând */}
      <div className="mb-6">
        <p className="text-[11px] font-condensed uppercase tracking-wider text-built-red mb-1">Un gând / lecție</p>
        <p className="text-[11px] text-built-gray-text/70 mb-2">O propoziție. Ce ai învățat azi.</p>
        <textarea
          value={plan.lesson ?? ""}
          onChange={(e) => mutate((p) => ({ ...p, lesson: e.target.value }))}
          placeholder="..."
          rows={2}
          className="w-full bg-transparent border-b border-built-gray-2 focus:border-built-red/50 px-1 py-2 text-sm text-built-white placeholder-built-gray-text/40 focus:outline-none transition-colors resize-none"
        />
      </div>

    </div>
  );
}
