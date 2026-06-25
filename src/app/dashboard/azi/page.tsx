"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  getDailyPlan, saveDailyPlan, getDailySignals, logProspectOutcome,
  type DailyPlan, type DailyItem, type Appointment, type DailySignals, type CallSignal,
} from "./actions";

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

// ─── Calendar Day View ───────────────────────────────────────────────────────

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_PX = 50; // px per oră

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h - START_HOUR) * 60 + (m ?? 0);
}

function minutesToPx(min: number): number {
  return (min / 60) * HOUR_PX;
}

function nowMinutes(): number {
  const now = new Date();
  return (now.getHours() - START_HOUR) * 60 + now.getMinutes();
}

const APPT_COLORS = [
  "bg-blue-600/80 border-blue-500/40",
  "bg-violet-600/80 border-violet-500/40",
  "bg-emerald-600/80 border-emerald-500/40",
  "bg-amber-600/80 border-amber-500/40",
  "bg-pink-600/80 border-pink-500/40",
  "bg-cyan-600/80 border-cyan-500/40",
];

function apptColor(idx: number) {
  return APPT_COLORS[idx % APPT_COLORS.length];
}

const EMPTY_APPT: Omit<Appointment, "id" | "done"> = {
  time: "09:00",
  duration: 60,
  name: "",
  phone: "",
  email: "",
  notes: "",
};

function AppointmentForm({
  initial,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: Partial<Appointment>;
  onSave: (a: Omit<Appointment, "id" | "done">) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState<Omit<Appointment, "id" | "done">>({
    ...EMPTY_APPT,
    ...initial,
    duration: initial.duration ?? 60,
    phone: initial.phone ?? "",
    email: initial.email ?? "",
    notes: initial.notes ?? "",
  });
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { nameRef.current?.focus(); }, []);

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div
      className="bg-[#1a1a1a] border border-white/15 rounded-2xl shadow-2xl p-5 space-y-3"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-[11px] font-condensed uppercase tracking-widest text-zinc-500 mb-1">
        {initial.id ? "Editează programare" : "Programare nouă"}
      </p>

      {/* Rând Oră + Durată */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-[10px] text-zinc-600 uppercase tracking-wider block mb-1">Oră</label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => set("time", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[13px] text-white focus:outline-none focus:border-built-red/50 transition-colors"
          />
        </div>
        <div className="w-24">
          <label className="text-[10px] text-zinc-600 uppercase tracking-wider block mb-1">Durată (min)</label>
          <input
            type="number"
            min={15} max={480} step={15}
            value={form.duration}
            onChange={(e) => set("duration", Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[13px] text-white focus:outline-none focus:border-built-red/50 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] text-zinc-600 uppercase tracking-wider block mb-1">Nume</label>
        <input
          ref={nameRef}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Ex: Ion Popescu"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[13px] text-white placeholder-zinc-700 focus:outline-none focus:border-built-red/50 transition-colors"
        />
      </div>

      <div>
        <label className="text-[10px] text-zinc-600 uppercase tracking-wider block mb-1">Telefon</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="07xx xxx xxx"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[13px] text-white placeholder-zinc-700 focus:outline-none focus:border-built-red/50 transition-colors"
        />
      </div>

      <div>
        <label className="text-[10px] text-zinc-600 uppercase tracking-wider block mb-1">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="email@exemplu.ro"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[13px] text-white placeholder-zinc-700 focus:outline-none focus:border-built-red/50 transition-colors"
        />
      </div>

      <div>
        <label className="text-[10px] text-zinc-600 uppercase tracking-wider block mb-1">Notițe</label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Context, subiect apel..."
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[13px] text-white placeholder-zinc-700 focus:outline-none focus:border-built-red/50 transition-colors resize-none"
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => form.name.trim() && onSave(form)}
          className="flex-1 bg-built-red hover:bg-built-red/90 text-white text-[12px] font-medium py-1.5 rounded-lg transition-colors"
        >
          Salvează
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-[12px] text-zinc-500 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
        >
          Anulează
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-2 py-1.5 text-[12px] text-red-400/70 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

function CalendarDay({
  appointments,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: {
  appointments: Appointment[];
  onAdd: (a: Omit<Appointment, "id" | "done">) => void;
  onEdit: (id: string, a: Omit<Appointment, "id" | "done">) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const [newForm, setNewForm] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [nowMin, setNowMin] = useState(nowMinutes());

  useEffect(() => {
    const id = setInterval(() => setNowMin(nowMinutes()), 60000);
    return () => clearInterval(id);
  }, []);

  const totalHours = END_HOUR - START_HOUR;
  const gridHeight = totalHours * HOUR_PX;

  function handleGridClick(e: React.MouseEvent<HTMLDivElement>) {
    if (editId || newForm) { setEditId(null); setNewForm(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const yPx = e.clientY - rect.top;
    const totalMin = Math.floor((yPx / HOUR_PX) * 60);
    const hour = START_HOUR + Math.floor(totalMin / 60);
    const min = Math.floor(totalMin % 60 / 15) * 15;
    const h = String(Math.min(hour, END_HOUR - 1)).padStart(2, "0");
    const m = String(min).padStart(2, "0");
    setNewForm(`${h}:${m}`);
  }

  const showNow = nowMin >= 0 && nowMin <= totalHours * 60;
  const activeForm = newForm !== null || editId !== null;
  const editAppt = editId ? appointments.find((a) => a.id === editId) : null;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 shrink-0">
        <span className="text-base">📅</span>
        <p className="text-[11px] font-condensed uppercase tracking-widest text-zinc-400">Programări & Apeluri</p>
        <button
          onClick={() => { setNewForm("09:00"); setEditId(null); }}
          className="ml-auto text-[11px] text-built-red border border-built-red/25 bg-built-red/10 px-2.5 py-1 rounded-lg hover:bg-built-red/20 transition-colors"
        >
          + Adaugă
        </button>
      </div>

      {/* Form — apare deasupra grilei când e activ */}
      {activeForm && (
        <div className="px-5 pb-3 shrink-0">
          {newForm !== null && (
            <AppointmentForm
              initial={{ time: newForm, duration: 60 }}
              onSave={(a) => { onAdd(a); setNewForm(null); }}
              onCancel={() => setNewForm(null)}
            />
          )}
          {editAppt && (
            <AppointmentForm
              initial={editAppt}
              onSave={(a) => { onEdit(editId!, a); setEditId(null); }}
              onCancel={() => setEditId(null)}
              onDelete={() => { onDelete(editId!); setEditId(null); }}
            />
          )}
        </div>
      )}

      {/* Grid — scrollable intern */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <div className="relative" style={{ height: gridHeight }} onClick={handleGridClick}>
          {/* Hour lines + labels */}
          {Array.from({ length: totalHours + 1 }, (_, i) => {
            const hour = START_HOUR + i;
            return (
              <div key={hour} className="absolute left-0 right-0 flex items-start" style={{ top: i * HOUR_PX }}>
                <span className="text-[10px] text-zinc-700 font-mono w-10 shrink-0 -translate-y-2 select-none">
                  {String(hour).padStart(2, "0")}:00
                </span>
                <div className={`flex-1 h-px ${i === 0 ? "bg-white/10" : "bg-white/[0.04]"}`} />
              </div>
            );
          })}

          {/* Half-hour lines */}
          {Array.from({ length: totalHours }, (_, i) => (
            <div key={`h${i}`} className="absolute left-10 right-0 h-px bg-white/[0.02]"
              style={{ top: i * HOUR_PX + HOUR_PX / 2 }} />
          ))}

          {/* Cursor hint on hover */}
          <div className="absolute left-10 right-0 top-0 bottom-0 cursor-pointer" style={{ height: gridHeight }} />

          {/* Now indicator */}
          {showNow && (
            <div className="absolute left-10 right-0 flex items-center pointer-events-none z-10"
              style={{ top: minutesToPx(nowMin) }}>
              <div className="w-2 h-2 rounded-full bg-built-red shrink-0 -ml-1" />
              <div className="flex-1 h-px bg-built-red" />
            </div>
          )}

          {/* Appointment cards */}
          {appointments.map((appt, idx) => {
            const topPx = minutesToPx(timeToMinutes(appt.time));
            const heightPx = Math.max(minutesToPx(appt.duration), 30);
            const color = apptColor(idx);
            return (
              <div
                key={appt.id}
                className={`absolute left-10 right-0 rounded-lg border px-2.5 py-1.5 cursor-pointer transition-opacity z-20 ${color} ${appt.done ? "opacity-40" : "opacity-100"}`}
                style={{ top: topPx, height: heightPx }}
                onClick={(e) => { e.stopPropagation(); setEditId(appt.id); setNewForm(null); }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggle(appt.id); }}
                    className={`w-3.5 h-3.5 shrink-0 rounded border ${appt.done ? "bg-white/60 border-white/60" : "border-white/50 hover:bg-white/20"} flex items-center justify-center transition-colors`}
                  >
                    {appt.done && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                  <span className="text-white text-[11px] font-semibold truncate">{appt.time} · {appt.name || "—"}</span>
                </div>
                {heightPx > 44 && appt.phone && (
                  <p className="text-white/70 text-[10px] mt-0.5 truncate pl-5">📞 {appt.phone}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Semnale: ce contează azi ────────────────────────────────────────────────

const PROSPECT_STATUS_LABEL: Record<string, string> = {
  dm: "în DM", apel_programat: "apel programat", discovery: "discovery", oferta: "ofertă",
};
const URGENCY: Record<string, { label: string; cls: string }> = {
  intarziat: { label: "ÎNTÂRZIAT", cls: "text-red-400 border-red-500/40 bg-red-500/10" },
  azi: { label: "AZI", cls: "text-built-red border-built-red/40 bg-built-red/10" },
  fara_pas: { label: "FĂRĂ PAS", cls: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
};
const CLIENT_LEVEL: Record<string, { label: string; cls: string }> = {
  disparut: { label: "DISPĂRUT", cls: "text-red-400 border-red-500/40 bg-red-500/10" },
  aluneca: { label: "ALUNECĂ", cls: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
  epuizat: { label: "EPUIZAT", cls: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
  atentie: { label: "ATENȚIE", cls: "text-zinc-400 border-white/20 bg-white/5" },
};

function SignalRow({ chip, title, sub, href, onAdd, added, rightSlot }: {
  chip: { label: string; cls: string }; title: string; sub: string;
  href: string; onAdd?: () => void; added?: boolean; rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2 group">
      <span className={`text-[9px] font-condensed uppercase tracking-wider px-2 py-1 rounded-md border shrink-0 w-[88px] text-center ${chip.cls}`}>
        {chip.label}
      </span>
      <Link href={href} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
        <p className="text-sm text-white truncate">{title}</p>
        {sub && <p className="text-[11px] text-zinc-500 truncate">{sub}</p>}
      </Link>
      {rightSlot ?? (
        <button type="button" onClick={onAdd} disabled={added}
          className={`text-[10px] font-condensed uppercase tracking-wider px-2.5 py-1.5 rounded-lg border shrink-0 transition-colors ${
            added ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5 cursor-default"
                  : "text-zinc-400 border-white/10 hover:border-built-red/40 hover:text-built-red"
          }`}>
          {added ? "✓ pe listă" : "+ azi"}
        </button>
      )}
    </div>
  );
}

// ─── Rezultatul apelului — închiderea buclei cu un tap ───────────────────────

function OutcomeControl({ id, name, onResolved }: {
  id: number; name: string; onResolved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function fire(outcome: "castigat" | "followup" | "pierdut", days?: number) {
    setBusy(true);
    const r = await logProspectOutcome(id, outcome, { note: note.trim() || undefined, days });
    setBusy(false);
    if (!r.ok) { toast.error(r.error || "N-a mers, încearcă din nou."); return; }
    toast.success(
      outcome === "castigat" ? `${name} → client. Felicitări.`
        : outcome === "pierdut" ? `${name} marcat pierdut.`
          : `Follow-up pentru ${name}, programat.`
    );
    setOpen(false); setNote(""); onResolved();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="text-[10px] font-condensed uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-white/10 text-zinc-400 hover:border-built-red/40 hover:text-built-red transition-colors shrink-0">
        rezultat
      </button>
    );
  }

  const btn = "text-[10px] font-condensed uppercase tracking-wider px-2 py-1.5 rounded-lg border transition-colors disabled:opacity-40";
  return (
    <div className="flex flex-col gap-1.5 shrink-0 w-[244px]">
      <div className="flex items-center gap-1.5">
        <button type="button" disabled={busy} onClick={() => fire("castigat")}
          className={`${btn} text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10`}>✓ Câștigat</button>
        <button type="button" disabled={busy} onClick={() => fire("followup", 2)}
          className={`${btn} text-amber-400 border-amber-500/30 hover:bg-amber-500/10`}>↻ Follow-up</button>
        <button type="button" disabled={busy} onClick={() => fire("pierdut")}
          className={`${btn} text-zinc-400 border-white/15 hover:border-built-red/40 hover:text-built-red`}>✕ Pierdut</button>
        <button type="button" onClick={() => { setOpen(false); setNote(""); }}
          className="text-zinc-600 hover:text-white w-5 text-center text-base shrink-0">×</button>
      </div>
      <input value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="motiv / ce urmărești (opțional)"
        className="bg-transparent border-b border-white/10 focus:border-built-red/40 px-1 py-1 text-[12px] text-white placeholder-zinc-700 focus:outline-none transition-colors" />
    </div>
  );
}

function SignalsPanel({ signals, onAddToDay, onResolved }: {
  signals: DailySignals | null;
  onAddToDay: (list: "clients" | "tasks", text: string) => void;
  onResolved: () => void;
}) {
  const [added, setAdded] = useState<Set<string>>(new Set());
  if (!signals) return null;
  const total = signals.prospects.length + signals.clients.length + signals.checkins.length + signals.milestones.length;
  const markAdded = (k: string) => setAdded((s) => new Set(s).add(k));

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-5 mb-6">
        <p className="text-sm text-zinc-400">
          <span className="text-emerald-400">✓</span> Niciun semnal urgent. Niciun prospect întârziat, niciun client care alunecă. Construiește.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-built-red/20 bg-built-red/[0.03] p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">⬢</span>
        <p className="text-[11px] font-condensed uppercase tracking-widest text-built-red">Ce contează azi</p>
        <span className="text-[11px] text-zinc-600 ml-auto">{total} {total === 1 ? "semnal" : "semnale"}</span>
      </div>

      {signals.prospects.length > 0 && (
        <div className="mb-1">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Prospecți de urmărit</p>
          <div className="divide-y divide-white/[0.04]">
            {signals.prospects.map((p) => {
              const k = `p${p.id}`;
              const action = p.next_step?.trim() || (p.urgency === "fara_pas" ? "stabilește pasul următor" : "urmărește");
              return (
                <SignalRow key={k}
                  chip={URGENCY[p.urgency]}
                  title={`${p.name} · ${PROSPECT_STATUS_LABEL[p.status] ?? p.status}`}
                  sub={action}
                  href="/dashboard/prospects"
                  rightSlot={<OutcomeControl id={p.id} name={p.name} onResolved={onResolved} />}
                />
              );
            })}
          </div>
        </div>
      )}

      {signals.clients.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Clienți care au nevoie de tine</p>
          <div className="divide-y divide-white/[0.04]">
            {signals.clients.map((c) => {
              const k = `c${c.id}`;
              return (
                <SignalRow key={k}
                  chip={CLIENT_LEVEL[c.level] ?? { label: c.level.toUpperCase(), cls: "text-zinc-400 border-white/20 bg-white/5" }}
                  title={c.name}
                  sub={c.reason}
                  href="/dashboard/clients"
                  added={added.has(k)}
                  onAdd={() => { onAddToDay("clients", `Check-in: ${c.name}`); markAdded(k); }}
                />
              );
            })}
          </div>
        </div>
      )}

      {signals.milestones.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Jaloane — măsoară + cere testimonial</p>
          <div className="divide-y divide-white/[0.04]">
            {signals.milestones.map((m) => {
              const k = `m${m.clientId}_${m.milestone}`;
              const when = m.daysSince <= 0 ? "azi" : m.daysSince === 1 ? "ieri" : `acum ${m.daysSince} zile`;
              return (
                <SignalRow key={k}
                  chip={{ label: `ZIUA ${m.milestone}`, cls: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" }}
                  title={m.name}
                  sub={`Jalon atins ${when} · măsurători oficiale + cere testimonial`}
                  href={`/clienti/${m.clientId}`}
                  added={added.has(k)}
                  onAdd={() => { onAddToDay("clients", `Jalon ${m.milestone}z ${m.name}: măsurători + testimonial`); markAdded(k); }}
                />
              );
            })}
          </div>
        </div>
      )}

      {signals.checkins.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Check-in-uri de răspuns</p>
          <div className="divide-y divide-white/[0.04]">
            {signals.checkins.map((c) => {
              const k = `ci${c.id}`;
              const when = c.daysAgo <= 0 ? "azi" : c.daysAgo === 1 ? "ieri" : `acum ${c.daysAgo} zile`;
              return (
                <SignalRow key={k}
                  chip={{ label: "CHECK-IN", cls: "text-sky-400 border-sky-500/40 bg-sky-500/10" }}
                  title={c.name}
                  sub={`Săptămâna ${c.week} · ${when} · așteaptă feedback`}
                  href="/dashboard/checkins"
                  added={added.has(k)}
                  onAdd={() => { onAddToDay("clients", `Răspunde check-in: ${c.name}`); markAdded(k); }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Apeluri azi: front-and-center + reminder ────────────────────────────────

function notifSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

// Minute până la apel → etichetă scurtă + culoare după urgență.
function fmtCountdown(min: number): { label: string; cls: string } {
  if (min < -2) return { label: "a trecut", cls: "text-zinc-600" };
  if (min <= 2) return { label: "ACUM", cls: "text-built-red font-semibold" };
  if (min < 60) return { label: `în ${min} min`, cls: "text-built-red" };
  const h = Math.floor(min / 60), m = min % 60;
  return { label: `peste ${h}h${m ? ` ${m}m` : ""}`, cls: "text-zinc-400" };
}

function CallsBanner({ appointments, signalCalls, notifPerm, onEnableReminders, onAdd, onEdit, onDelete, onToggle, onResolved }: {
  appointments: Appointment[];
  signalCalls: CallSignal[];
  notifPerm: NotificationPermission;
  onEnableReminders: () => void;
  onAdd: (a: Omit<Appointment, "id" | "done">) => void;
  onEdit: (id: string, a: Omit<Appointment, "id" | "done">) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onResolved: () => void;
}) {
  const [nowMs, setNowMs] = useState(Date.now());
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const calls = appointments.slice().sort((a, b) => a.time.localeCompare(b.time));
  const pipelineToday = signalCalls.filter((c) => c.isToday);
  if (calls.length === 0 && pipelineToday.length === 0) return null;

  return (
    <div className="rounded-2xl border border-blue-500/25 bg-blue-500/[0.04] p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📞</span>
        <p className="text-[11px] font-condensed uppercase tracking-widest text-blue-300">Apeluri azi</p>
        <span className="text-[11px] text-zinc-600 ml-auto">{calls.length} {calls.length === 1 ? "apel" : "apeluri"}</span>
      </div>

      {calls.length > 0 && (
        <div className="space-y-2.5">
          {calls.map((a) => {
            if (editId === a.id) {
              return (
                <AppointmentForm
                  key={a.id}
                  initial={a}
                  onSave={(upd) => { onEdit(a.id, upd); setEditId(null); }}
                  onCancel={() => setEditId(null)}
                  onDelete={() => { onDelete(a.id); setEditId(null); }}
                />
              );
            }
            const [h, m] = a.time.split(":").map(Number);
            const t = new Date(); t.setHours(h, m ?? 0, 0, 0);
            const min = Math.round((t.getTime() - nowMs) / 60000);
            const cd = fmtCountdown(min);
            return (
              <div key={a.id} className="flex items-center gap-3 group">
                <button type="button" onClick={() => onToggle(a.id)}
                  className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${a.done ? "bg-blue-500/70 border-blue-500/70" : "border-white/30 hover:border-blue-400"}`}>
                  {a.done && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
                <span className={`font-mono text-sm w-14 shrink-0 tabular-nums ${a.done ? "text-zinc-600 line-through" : "text-white"}`}>{a.time}</span>
                <button type="button" onClick={() => { setEditId(a.id); setAdding(false); }}
                  className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity">
                  <p className={`text-sm truncate ${a.done ? "text-zinc-600 line-through" : "text-white"}`}>{a.name || "—"}</p>
                  {a.phone && <p className="text-[11px] text-zinc-500 truncate">📞 {a.phone}</p>}
                </button>
                {!a.done && <span className={`text-[11px] font-condensed uppercase tracking-wider shrink-0 ${cd.cls}`}>{cd.label}</span>}
                <button type="button" onClick={() => onDelete(a.id)}
                  className="text-zinc-700 hover:text-built-red opacity-0 group-hover:opacity-100 transition-all w-5 text-center text-base shrink-0">×</button>
              </div>
            );
          })}
        </div>
      )}

      {adding ? (
        <div className="mt-3">
          <AppointmentForm
            initial={{ time: "09:00", duration: 60 }}
            onSave={(a) => { onAdd(a); setAdding(false); }}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : (
        <button type="button" onClick={() => { setAdding(true); setEditId(null); }}
          className="mt-3 text-[11px] text-zinc-600 hover:text-blue-300 transition-colors">+ adaugă apel</button>
      )}

      {pipelineToday.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Apeluri din pipeline azi</p>
          {pipelineToday.map((c) => (
            <div key={c.id} className="flex items-center gap-3 py-1">
              <span className="text-[9px] font-condensed uppercase tracking-wider px-2 py-1 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-400 shrink-0 w-[88px] text-center">
                FĂRĂ ORĂ
              </span>
              <Link href="/dashboard/prospects" className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                <p className="text-sm text-white truncate">{c.name}</p>
                {c.next_step && <p className="text-[11px] text-zinc-500 truncate">{c.next_step}</p>}
              </Link>
              <OutcomeControl id={c.id} name={c.name} onResolved={onResolved} />
            </div>
          ))}
          <p className="text-[11px] text-zinc-600 pt-1">Pune-le oră în calendar ca să primești reminder — sau marchează rezultatul direct după apel.</p>
        </div>
      )}

      {notifSupported() && (
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          {notifPerm === "granted" ? (
            <p className="text-[11px] text-emerald-400/80">🔔 Reminder activ — te anunț cu o oră înainte de fiecare apel (cât timp ai aplicația deschisă).</p>
          ) : notifPerm === "denied" ? (
            <p className="text-[11px] text-zinc-600">Notificările sunt blocate. Activează-le din setările browserului pentru site ca să primești reminder.</p>
          ) : (
            <button type="button" onClick={onEnableReminders}
              className="text-[11px] text-blue-300 border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors">
              🔔 Pornește reminder cu o oră înainte
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AziPage() {
  const [dateStr, setDateStr] = useState(todayStr());
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [signals, setSignals] = useState<DailySignals | null>(null);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>("default");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reminderTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const skipSave = useRef(true);

  useEffect(() => {
    skipSave.current = true;
    setPlan(null);
    getDailyPlan(dateStr).then((p) => { setPlan(p); skipSave.current = false; });
  }, [dateStr]);

  // Semnalele zilei — „acum", nu per dată. Reîncărcabile după ce marchezi un rezultat.
  const reloadSignals = useCallback(() => {
    getDailySignals().then(setSignals).catch(() => setSignals({ calls: [], prospects: [], clients: [], checkins: [], milestones: [] }));
  }, []);
  useEffect(() => { reloadSignals(); }, [reloadSignals]);

  // Starea permisiunii de notificare la încărcare.
  useEffect(() => {
    if (notifSupported()) setNotifPerm(Notification.permission);
  }, []);

  const enableReminders = useCallback(async () => {
    if (!notifSupported()) return;
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
    if (perm === "granted") {
      new Notification("Reminder pornit", { body: "Te anunț cu o oră înainte de fiecare apel.", icon: "/icons/notification.png" });
    }
  }, []);

  // Programează reminder-ele zilei: cu o oră înainte + la start de apel,
  // plus o notă „scrie-ți ziua" la 09:00 dacă ziua e goală. (Cât timp aplicația e deschisă.)
  useEffect(() => {
    reminderTimers.current.forEach(clearTimeout);
    reminderTimers.current = [];
    if (notifPerm !== "granted" || !plan || !isToday(dateStr)) return;

    const now = Date.now();
    const at = (h: number, m: number) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.getTime(); };
    const schedule = (ms: number, title: string, body: string) => {
      const delay = ms - now;
      if (delay <= 0 || delay > 86_400_000) return;
      const t = setTimeout(() => {
        try { new Notification(title, { body, icon: "/icons/notification.png" }); } catch { /* noop */ }
      }, delay);
      reminderTimers.current.push(t);
    };

    for (const a of plan.appointments ?? []) {
      if (a.done || !a.time) continue;
      const [h, m] = a.time.split(":").map(Number);
      const start = at(h, m ?? 0);
      const who = `${a.time} · ${a.name || "apel"}${a.phone ? " · " + a.phone : ""}`;
      schedule(start - 3_600_000, "Apel într-o oră", who);
      schedule(start, "Apel ACUM", `${a.name || "apel"}${a.phone ? " · " + a.phone : ""}`);
    }

    const dayEmpty =
      (plan.top3 ?? []).every((t) => !t.trim()) &&
      plan.posts.every((p) => !p.text.trim()) &&
      plan.tasks.length === 0;
    if (dayEmpty) schedule(at(9, 0), "Scrie-ți ziua", "Top 3 + ce postezi azi (story, reel). 60 de secunde.");

    return () => { reminderTimers.current.forEach(clearTimeout); reminderTimers.current = []; };
  }, [plan, notifPerm, dateStr]);

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

  // ── Appointment handlers ────────────────────────────────────────────────────
  const addAppointment = useCallback((a: Omit<Appointment, "id" | "done">) => {
    const id = newId();
    mutate((p) => ({ ...p, appointments: [...(p.appointments ?? []), { ...a, id, done: false }] }));
  }, [mutate]);

  const editAppointment = useCallback((id: string, a: Omit<Appointment, "id" | "done">) => {
    mutate((p) => ({
      ...p,
      appointments: (p.appointments ?? []).map((ap) => ap.id === id ? { ...ap, ...a } : ap),
    }));
  }, [mutate]);

  const deleteAppointment = useCallback((id: string) => {
    mutate((p) => ({ ...p, appointments: (p.appointments ?? []).filter((ap) => ap.id !== id) }));
  }, [mutate]);

  const toggleAppointment = useCallback((id: string) => {
    mutate((p) => ({
      ...p,
      appointments: (p.appointments ?? []).map((ap) => ap.id === id ? { ...ap, done: !ap.done } : ap),
    }));
  }, [mutate]);

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

  const dayEmpty = !!plan && isToday(dateStr) &&
    (plan.top3 ?? []).every((t) => !t.trim()) &&
    plan.posts.every((p) => !p.text.trim()) &&
    plan.tasks.length === 0;

  if (!plan) return <div className="p-8"><p className="text-zinc-600">Se încarcă...</p></div>;

  return (
    <div className="p-4 md:p-8">
      <div className="stagger grid grid-cols-1 md:grid-cols-[minmax(0,520px)_minmax(0,420px)] gap-6 items-start">

        {/* ── Coloana stângă: jurnal ── */}
        <div>
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="font-condensed text-[10px] text-built-red uppercase tracking-widest mb-2">Jurnalul zilei</p>
              <h1 className="font-display text-4xl md:text-6xl tracking-[0.06em] text-white leading-none mb-2">
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

          {/* Apeluri azi — front and center, ca să nu uiți + reminder */}
          {isToday(dateStr) && (
            <CallsBanner
              appointments={plan.appointments ?? []}
              signalCalls={signals?.calls ?? []}
              notifPerm={notifPerm}
              onEnableReminders={enableReminders}
              onAdd={addAppointment}
              onEdit={editAppointment}
              onDelete={deleteAppointment}
              onToggle={toggleAppointment}
              onResolved={reloadSignals}
            />
          )}

          {/* Ziua e goală — scrie-ți-o */}
          {dayEmpty && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-5 mb-6">
              <p className="text-sm text-zinc-300 leading-relaxed">
                <span className="text-amber-400">✎</span> Ziua e goală. Scrie-ți <span className="text-white font-medium">Top 3</span> și ce postezi azi — <span className="text-white font-medium">story, reel, carusel</span>.
                <span className="text-zinc-500"> 60 de secunde acum, claritate toată ziua.</span>
              </p>
            </div>
          )}

          {/* Semnale — ce contează azi (doar pe ziua curentă) */}
          {isToday(dateStr) && (
            <SignalsPanel signals={signals} onAddToDay={(list, text) => addItem(list, text)} onResolved={reloadSignals} />
          )}

          {/* Dimineață */}
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

          {/* Seară */}
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

        {/* ── Coloana dreaptă: calendar sticky ── */}
        <div className="md:sticky md:top-6" style={{ height: "calc(100vh - 80px)" }}>
          <CalendarDay
            appointments={(plan.appointments ?? []).slice().sort((a, b) => a.time.localeCompare(b.time))}
            onAdd={addAppointment}
            onEdit={editAppointment}
            onDelete={deleteAppointment}
            onToggle={toggleAppointment}
          />
        </div>

      </div>
    </div>
  );
}
