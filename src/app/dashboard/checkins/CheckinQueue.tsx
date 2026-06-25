"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  generateCheckinFeedbackDraft, saveCheckinFeedback,
  type PendingCheckin, type CheckIn,
} from "@/app/clienti/actions";

function timeAgo(iso: string): string {
  const dayMs = 86400000;
  const d = Math.floor(Date.now() / dayMs) - Math.floor(Date.parse(iso) / dayMs);
  return d <= 0 ? "azi" : d === 1 ? "ieri" : `acum ${d} zile`;
}

function Metric({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <span className="text-[11px] text-zinc-500">
      {label}: <span className={warn ? "text-amber-400" : "text-zinc-200"}>{value}</span>
    </span>
  );
}

function Card({ item, onSent }: { item: PendingCheckin; onSent: () => void }) {
  const [draft, setDraft] = useState("");
  const [gen, setGen] = useState(false);
  const [sending, setSending] = useState(false);

  async function generate() {
    setGen(true);
    const checkin: CheckIn = {
      id: item.id, client_id: item.clientId, week_number: item.week,
      training_adherence: item.training_adherence, nutrition_adherence: item.nutrition_adherence,
      energy_level: item.energy_level, mood: 0,
      sleep_hours: item.sleep_hours, hydration_l: item.hydration_l, stress_level: item.stress_level,
      notes: item.notes, ai_feedback: null, created_at: item.created_at,
    };
    const r = await generateCheckinFeedbackDraft(item.clientId, checkin);
    setGen(false);
    if (r.ok && r.draft) setDraft(r.draft);
    else toast.error(r.error || "N-a mers generarea draftului.");
  }

  async function send() {
    if (!draft.trim()) { toast.error("Generează sau scrie un feedback întâi."); return; }
    setSending(true);
    const r = await saveCheckinFeedback(item.id, item.clientId, draft.trim());
    setSending(false);
    if (r.ok) { toast.success(`Trimis lui ${item.clientName}. A primit notificare.`); onSent(); }
    else toast.error(r.error || "N-a mers trimiterea.");
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-zinc-100">{item.clientName}</span>
          <span className="text-[11px] text-built-red font-condensed uppercase tracking-wider">Săptămâna {item.week}</span>
        </div>
        <span className="text-[11px] text-zinc-600">{timeAgo(item.created_at)}</span>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
        <Metric label="Antren" value={`${item.training_adherence}%`} warn={item.training_adherence < 50} />
        <Metric label="Nutriție" value={`${item.nutrition_adherence}%`} warn={item.nutrition_adherence < 50} />
        <Metric label="Energie" value={`${item.energy_level}/10`} warn={item.energy_level <= 4} />
        {item.sleep_hours != null && <Metric label="Somn" value={`${item.sleep_hours}h`} warn={item.sleep_hours < 6} />}
        {item.hydration_l != null && <Metric label="Hidratare" value={`${item.hydration_l}L`} />}
        {item.stress_level != null && <Metric label="Stres" value={`${item.stress_level}/10`} warn={item.stress_level >= 7} />}
      </div>

      {item.notes && <p className="text-[13px] text-zinc-400 italic mb-3">„{item.notes}”</p>}
      {item.objectives && <p className="text-[11px] text-zinc-600 mb-3">Obiectiv: {item.objectives}</p>}

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={draft ? 5 : 2}
        placeholder="Generează un draft sau scrie direct feedback-ul..."
        className="w-full bg-[#111111] border border-white/10 focus:border-built-red/40 rounded-xl px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 resize-none focus:outline-none transition-colors mb-3"
      />

      <div className="flex items-center gap-2">
        <button type="button" onClick={generate} disabled={gen}
          className="text-[12px] font-medium text-zinc-300 border border-white/15 hover:border-built-red/50 hover:text-white px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50">
          {gen ? "Se generează..." : draft ? "↻ Regenerează" : "✨ Generează draft"}
        </button>
        <button type="button" onClick={send} disabled={sending || !draft.trim()}
          className="text-[12px] font-semibold text-white bg-built-red hover:bg-built-red/90 px-4 py-2 rounded-lg transition-colors disabled:opacity-40">
          {sending ? "Se trimite..." : "Trimite feedback"}
        </button>
      </div>
    </div>
  );
}

export function CheckinQueue({ initial }: { initial: PendingCheckin[] }) {
  const [items, setItems] = useState(initial);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-6 text-center">
        <p className="text-sm text-zinc-400">
          <span className="text-emerald-400">✓</span> Niciun check-in de răspuns. Toți clienții au feedback la zi.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[12px] text-zinc-600 mb-3">{items.length} {items.length === 1 ? "client așteaptă" : "clienți așteaptă"} răspuns</p>
      <div className="space-y-4">
        {items.map((it) => (
          <Card key={it.id} item={it} onSent={() => setItems((xs) => xs.filter((x) => x.id !== it.id))} />
        ))}
      </div>
    </div>
  );
}
