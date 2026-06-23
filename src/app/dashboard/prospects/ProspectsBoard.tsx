"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import {
  type Prospect, type ProspectStatus,
  createProspect, updateProspect, deleteProspect,
} from "./actions";

const STATUS: { key: ProspectStatus; label: string; dot: string; ring: string }[] = [
  { key: "dm",             label: "DM / calificare", dot: "bg-yellow-400",  ring: "border-yellow-400/30" },
  { key: "apel_programat", label: "Apel programat",  dot: "bg-blue-400",    ring: "border-blue-400/30" },
  { key: "discovery",      label: "Discovery",       dot: "bg-purple-400",  ring: "border-purple-400/30" },
  { key: "oferta",         label: "Ofertă",          dot: "bg-orange-400",  ring: "border-orange-400/30" },
  { key: "client",         label: "Client",          dot: "bg-emerald-400", ring: "border-emerald-400/30" },
  { key: "nu_acum",        label: "Nu acum",          dot: "bg-zinc-400",    ring: "border-zinc-500/30" },
  { key: "pierdut",        label: "Pierdut",          dot: "bg-red-500/70",  ring: "border-red-500/20" },
];
const STATUS_LABEL = Object.fromEntries(STATUS.map((s) => [s.key, s.label]));
const PROFILE_LABEL: Record<string, string> = {
  salt_direct: "Salt direct", ciclist: "Ciclist cronic", atlet_blocat: "Atlet blocat",
};

function today() { return new Date().toISOString().slice(0, 10); }

export function ProspectsBoard({ initial }: { initial: Prospect[] }) {
  const [rows, setRows] = useState<Prospect[]>(initial);
  const [adding, setAdding] = useState(false);
  const [, startTransition] = useTransition();

  function refreshRow(id: number, patch: Partial<Prospect>) {
    setRows((r) => r.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  const active = rows.filter((p) => !["client", "pierdut", "nu_acum"].includes(p.status));
  const todo = active.filter((p) => p.next_step && (!p.next_step_date || p.next_step_date <= today()));

  return (
    <div className="space-y-8">
      {/* DE FĂCUT */}
      <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-5">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-3">
          ⚡ De făcut acum ({todo.length})
        </p>
        {todo.length === 0 ? (
          <p className="text-zinc-600 text-sm">Nimic urgent. Adaugă următorul pas la cineva din pipeline.</p>
        ) : (
          <ul className="space-y-2">
            {todo.map((p) => (
              <li key={p.id} className="flex items-center gap-3 text-sm">
                <span className="text-zinc-100 font-medium w-40 shrink-0">{p.name}</span>
                <span className="text-zinc-400 flex-1">{p.next_step}</span>
                {p.next_step_date && <span className="text-zinc-600 font-mono text-xs">{p.next_step_date}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* KPI */}
      <div className="stagger grid grid-cols-3 md:grid-cols-6 gap-3">
        {STATUS.map((s) => (
          <div key={s.key} className="hover-lift bg-[#111111] border border-white/[0.08] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono">{s.label}</p>
            </div>
            <p className="text-2xl font-semibold font-mono text-zinc-100">
              {rows.filter((p) => p.status === s.key).length}
            </p>
          </div>
        ))}
      </div>

      {/* Add */}
      {adding ? (
        <AddForm
          onCancel={() => setAdding(false)}
          onCreated={(p) => { setRows((r) => [p, ...r]); setAdding(false); }}
        />
      ) : (
        <button onClick={() => setAdding(true)}
          className="press text-sm text-zinc-300 border border-white/[0.12] rounded-lg px-4 py-2 hover:bg-white/[0.04] hover:border-white/25 transition-colors">
          + Adaugă prospect
        </button>
      )}

      {/* Coloane pe status */}
      <div className="space-y-6">
        {STATUS.map((s) => {
          const list = rows.filter((p) => p.status === s.key);
          if (list.length === 0) return null;
          return (
            <div key={s.key}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                <h2 className="text-sm font-semibold text-zinc-200">{s.label}</h2>
                <span className="text-zinc-600 text-xs font-mono">{list.length}</span>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {list.map((p) => (
                  <ProspectCard key={p.id} p={p} ring={s.ring}
                    onChange={(patch) => refreshRow(p.id, patch)}
                    onDelete={() => setRows((r) => r.filter((x) => x.id !== p.id))}
                    startTransition={startTransition} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProspectCard({ p, ring, onChange, onDelete, startTransition }: {
  p: Prospect; ring: string;
  onChange: (patch: Partial<Prospect>) => void;
  onDelete: () => void;
  startTransition: (cb: () => void) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(p);
  const [saving, setSaving] = useState(false);

  function save() {
    setSaving(true);
    startTransition(async () => {
      const res = await updateProspect(p.id, {
        name: draft.name, profile: draft.profile, status: draft.status,
        package: draft.package, next_step: draft.next_step,
        next_step_date: draft.next_step_date, notes: draft.notes,
      });
      setSaving(false);
      if (res.ok) { onChange(draft); setOpen(false); }
      else toast.error(res.error);
    });
  }
  function quickStatus(status: ProspectStatus) {
    setDraft((d) => ({ ...d, status }));
    startTransition(async () => {
      const res = await updateProspect(p.id, { status });
      if (res.ok) onChange({ status }); else toast.error(res.error);
    });
  }
  function remove() {
    if (!confirm(`Ștergi prospectul "${p.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteProspect(p.id);
      if (res.ok) onDelete(); else toast.error(res.error);
    });
  }

  return (
    <div className={`hover-lift bg-[#0E0E0E] border ${ring} rounded-xl p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-zinc-100 font-medium">{p.name}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {p.profile ? PROFILE_LABEL[p.profile] : "—"}{p.package ? ` · ${p.package}€` : ""}
          </p>
        </div>
        <select value={draft.status} onChange={(e) => quickStatus(e.target.value as ProspectStatus)}
          className="bg-[#1a1a1a] border border-white/[0.1] rounded-md text-xs text-zinc-300 px-2 py-1">
          {STATUS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {p.next_step && (
        <div className="mt-3 text-sm">
          <span className="text-zinc-300">{p.next_step}</span>
          {p.next_step_date && <span className="text-zinc-600 font-mono text-xs ml-2">{p.next_step_date}</span>}
        </div>
      )}
      {p.notes && <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{p.notes}</p>}

      <button onClick={() => setOpen((o) => !o)}
        className="text-[11px] text-zinc-500 hover:text-zinc-300 mt-3 font-mono uppercase tracking-wider">
        {open ? "închide" : "editează"}
      </button>

      {open && (
        <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
          <Field label="Nume"><input className={inputCls} value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
          <Field label="Profil">
            <select className={inputCls} value={draft.profile ?? ""}
              onChange={(e) => setDraft({ ...draft, profile: (e.target.value || null) as Prospect["profile"] })}>
              <option value="">—</option>
              <option value="salt_direct">Salt direct</option>
              <option value="ciclist">Ciclist cronic</option>
              <option value="atlet_blocat">Atlet blocat</option>
            </select>
          </Field>
          <Field label="Pachet vizat">
            <select className={inputCls} value={draft.package ?? ""}
              onChange={(e) => setDraft({ ...draft, package: e.target.value || null })}>
              <option value="">—</option>
              <option value="200">200€ (Hartă)</option>
              <option value="400">400€ (Co-pilot)</option>
              <option value="700">700€ (Cauza)</option>
              <option value="cuplu">Cuplu</option>
            </select>
          </Field>
          <Field label="Următorul pas"><input className={inputCls} value={draft.next_step ?? ""}
            onChange={(e) => setDraft({ ...draft, next_step: e.target.value })} /></Field>
          <Field label="Data"><input type="date" className={inputCls} value={draft.next_step_date ?? ""}
            onChange={(e) => setDraft({ ...draft, next_step_date: e.target.value })} /></Field>
          <Field label="Notă"><textarea className={inputCls} rows={2} value={draft.notes ?? ""}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></Field>
          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={saving}
              className="text-xs bg-[#C0392B] text-white rounded-md px-3 py-1.5 disabled:opacity-50">
              {saving ? "Salvez…" : "Salvează"}
            </button>
            <button onClick={remove}
              className="text-xs text-red-400/80 hover:text-red-400 rounded-md px-3 py-1.5">Șterge</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: (p: Prospect) => void }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<ProspectStatus>("dm");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    const res = await createProspect({ name, status, next_step: next });
    setBusy(false);
    if (!res.ok) { toast.error(res.error); return; }
    onCreated({
      id: res.id!, name: name.trim(), profile: null, status, package: null,
      next_step: next || null, next_step_date: null, notes: null, source: null,
      dm_conversation_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
  }
  return (
    <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-4 space-y-2">
      <div className="grid md:grid-cols-3 gap-2">
        <input className={inputCls} placeholder="Nume prospect" value={name} onChange={(e) => setName(e.target.value)} />
        <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as ProspectStatus)}>
          {STATUS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <input className={inputCls} placeholder="Următorul pas" value={next} onChange={(e) => setNext(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button onClick={submit} disabled={busy}
          className="text-xs bg-[#C0392B] text-white rounded-md px-3 py-1.5 disabled:opacity-50">
          {busy ? "Adaug…" : "Adaugă"}
        </button>
        <button onClick={onCancel} className="text-xs text-zinc-400 px-3 py-1.5">Anulează</button>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-[#1a1a1a] border border-white/[0.1] rounded-md text-sm text-zinc-200 px-2.5 py-1.5 focus:outline-none focus:border-white/[0.25]";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export { STATUS_LABEL };
