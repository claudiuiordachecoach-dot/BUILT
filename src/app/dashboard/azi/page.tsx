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

function newId(): string {
  try { return crypto.randomUUID(); } catch { return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
}

const POST_TYPES = ["Story", "Reel", "Carusel", "Alt"];

// ─── Checkbox ─────────────────────────────────────────────────────────────────

function Check({ done, onToggle }: { done: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
        done ? "bg-built-red border-built-red text-white" : "border-built-gray-2 hover:border-built-red/60"
      }`}
    >
      {done && <span className="text-[11px] leading-none">✓</span>}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AziPage() {
  const [dateStr, setDateStr] = useState(todayStr());
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipSave = useRef(true);

  // Load on date change
  useEffect(() => {
    skipSave.current = true;
    setPlan(null);
    getDailyPlan(dateStr).then((p) => { setPlan(p); skipSave.current = false; });
  }, [dateStr]);

  // Debounced autosave
  useEffect(() => {
    if (!plan || skipSave.current) return;
    setStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await saveDailyPlan(plan);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    }, 700);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [plan]);

  const mutate = useCallback((fn: (p: DailyPlan) => DailyPlan) => {
    setPlan((prev) => (prev ? fn(prev) : prev));
  }, []);

  // ── Item operations ──
  const updateItem = (list: "posts" | "tasks" | "clients", id: string, patch: Partial<DailyItem>) =>
    mutate((p) => ({ ...p, [list]: p[list].map((it) => (it.id === id ? { ...it, ...patch } : it)) }));

  const removeItem = (list: "posts" | "tasks" | "clients", id: string) =>
    mutate((p) => ({ ...p, [list]: p[list].filter((it) => it.id !== id) }));

  const addItem = (list: "posts" | "tasks" | "clients", item: DailyItem) =>
    mutate((p) => ({ ...p, [list]: [...p[list], item] }));

  const cyclePostType = (id: string, current: string) => {
    const next = POST_TYPES[(POST_TYPES.indexOf(current) + 1) % POST_TYPES.length];
    updateItem("posts", id, { type: next });
  };

  // ── Progress ──
  const checkable = plan ? [...plan.posts.filter((p) => p.text.trim()), ...plan.tasks, ...plan.clients] : [];
  const doneCount = checkable.filter((i) => i.done).length;

  return (
    <div className="p-8 max-w-3xl">
      {/* Header + navigare zi */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">Jurnalul zilei</p>
          <h1 className="font-display text-5xl tracking-[0.06em] text-built-white">AZI</h1>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setDateStr((d) => shiftDate(d, -1))} className="px-2.5 py-1 rounded border border-built-gray-2 text-built-gray-text hover:text-built-white transition-colors">◄</button>
          {dateStr !== todayStr() && (
            <button type="button" onClick={() => setDateStr(todayStr())} className="px-3 py-1 text-xs rounded border border-built-red/40 text-built-red hover:bg-built-red/10 transition-colors">Azi</button>
          )}
          <button type="button" onClick={() => setDateStr((d) => shiftDate(d, 1))} className="px-2.5 py-1 rounded border border-built-gray-2 text-built-gray-text hover:text-built-white transition-colors">►</button>
        </div>
      </div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-built-gray-text capitalize">{prettyDate(dateStr)}</p>
        <div className="flex items-center gap-3">
          {checkable.length > 0 && <span className="text-xs text-built-gray-text">{doneCount}/{checkable.length} bifate</span>}
          <span className="text-[11px] text-built-gray-text w-14 text-right">
            {status === "saving" ? "Salvez..." : status === "saved" ? "✓ Salvat" : ""}
          </span>
        </div>
      </div>

      {!plan && <p className="text-built-gray-text">Se încarcă ziua...</p>}

      {plan && (
        <div className="space-y-6">
          {/* De postat */}
          <section className="bg-built-gray-1 border border-built-gray-2 rounded-xl p-5">
            <h2 className="font-display text-xl text-built-white tracking-wide mb-3">📲 De postat azi</h2>
            <div className="space-y-2">
              {plan.posts.map((it) => (
                <div key={it.id} className="flex items-center gap-2 group">
                  <Check done={it.done} onToggle={() => updateItem("posts", it.id, { done: !it.done })} />
                  <button
                    type="button"
                    onClick={() => cyclePostType(it.id, it.type ?? "Alt")}
                    className="text-[10px] font-condensed uppercase tracking-wider px-2 py-1 rounded border border-built-gray-2 text-built-red w-16 shrink-0 hover:border-built-red/60 transition-colors"
                    title="Schimbă tipul"
                  >
                    {it.type ?? "Alt"}
                  </button>
                  <input
                    value={it.text}
                    onChange={(e) => updateItem("posts", it.id, { text: e.target.value })}
                    placeholder="Ce pui..."
                    className={`flex-1 bg-transparent border-b border-built-gray-2 focus:border-built-red/50 px-1 py-1 text-sm focus:outline-none transition-colors ${it.done ? "line-through text-built-gray-text" : "text-built-white"}`}
                  />
                  <button type="button" onClick={() => removeItem("posts", it.id)} className="text-built-gray-text hover:text-built-red opacity-0 group-hover:opacity-100 transition-opacity px-1">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => addItem("posts", { id: newId(), text: "", done: false, type: "Alt" })} className="mt-3 text-xs text-built-gray-text hover:text-built-white transition-colors">+ Adaugă conținut</button>
          </section>

          {/* De făcut */}
          <ChecklistSection
            title="🎯 Ce îmi propun azi"
            placeholder="Adaugă un obiectiv și apasă Enter"
            items={plan.tasks}
            onToggle={(id, done) => updateItem("tasks", id, { done })}
            onEdit={(id, text) => updateItem("tasks", id, { text })}
            onRemove={(id) => removeItem("tasks", id)}
            onAdd={(text) => addItem("tasks", { id: newId(), text, done: false })}
          />

          {/* Clienți */}
          <ChecklistSection
            title="💬 Clienți"
            placeholder="Cui scrii / check-in (Enter)"
            items={plan.clients}
            onToggle={(id, done) => updateItem("clients", id, { done })}
            onEdit={(id, text) => updateItem("clients", id, { text })}
            onRemove={(id) => removeItem("clients", id)}
            onAdd={(text) => addItem("clients", { id: newId(), text, done: false })}
          />

          {/* Jurnal */}
          <section className="bg-built-gray-1 border border-built-gray-2 rounded-xl p-5">
            <h2 className="font-display text-xl text-built-white tracking-wide mb-3">📝 Jurnal</h2>
            <textarea
              value={plan.notes}
              onChange={(e) => mutate((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Ce s-a întâmplat azi, gânduri, ce urmează..."
              rows={5}
              className="w-full bg-built-black border border-built-gray-2 rounded-lg px-4 py-3 text-built-white placeholder-built-gray-text/50 focus:outline-none focus:border-built-red/50 transition-colors resize-y text-sm"
            />
          </section>
        </div>
      )}
    </div>
  );
}

// ─── Checklist section (tasks / clients) ──────────────────────────────────────

function ChecklistSection({
  title, placeholder, items, onToggle, onEdit, onRemove, onAdd,
}: {
  title: string;
  placeholder: string;
  items: DailyItem[];
  onToggle: (id: string, done: boolean) => void;
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
    <section className="bg-built-gray-1 border border-built-gray-2 rounded-xl p-5">
      <h2 className="font-display text-xl text-built-white tracking-wide mb-3">{title}</h2>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2 group">
            <Check done={it.done} onToggle={() => onToggle(it.id, !it.done)} />
            <input
              value={it.text}
              onChange={(e) => onEdit(it.id, e.target.value)}
              className={`flex-1 bg-transparent border-b border-transparent hover:border-built-gray-2 focus:border-built-red/50 px-1 py-1 text-sm focus:outline-none transition-colors ${it.done ? "line-through text-built-gray-text" : "text-built-white"}`}
            />
            <button type="button" onClick={() => onRemove(it.id)} className="text-built-gray-text hover:text-built-red opacity-0 group-hover:opacity-100 transition-opacity px-1">×</button>
          </div>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
        onBlur={commit}
        placeholder={placeholder}
        className="mt-3 w-full bg-transparent border-b border-built-gray-2 focus:border-built-red/50 px-1 py-1.5 text-sm text-built-white placeholder-built-gray-text/50 focus:outline-none transition-colors"
      />
    </section>
  );
}
