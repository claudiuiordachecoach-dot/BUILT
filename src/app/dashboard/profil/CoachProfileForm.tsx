"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { saveCoachProfile, type CoachProfile } from "./actions";

type Data = Partial<CoachProfile>;

function Field({
  label, value, onChange, placeholder, textarea,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-built-red/50 resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-built-red/50"
        />
      )}
    </div>
  );
}

export default function CoachProfileForm({ initial }: { initial: Data }) {
  const [data, setData] = useState<Data>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof CoachProfile, v: string) => setData((d) => ({ ...d, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await saveCoachProfile(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const card = "bg-built-gray-1 border border-built-gray-2 rounded-lg p-5 space-y-4";
  const sectionTitle = "font-display text-lg tracking-wider text-built-white";

  return (
    <div className="space-y-6">
      {/* Identitate */}
      <section className={card}>
        <h2 className={sectionTitle}>Identitate</h2>
        <ImageUpload
          folder="coach"
          shape="circle"
          value={data.coach_avatar_url}
          label={data.coach_avatar_url ? "Schimbă poza" : "Adaugă poza ta"}
          onUploaded={(url) => set("coach_avatar_url", url)}
        />
        <Field label="Nume afișat" value={data.coach_name ?? ""} onChange={(v) => set("coach_name", v)} placeholder="Iordache Claudiu" />
        <Field label="Bio (apare clienților)" value={data.coach_bio ?? ""} onChange={(v) => set("coach_bio", v)} placeholder="Hybrid Athlete · Arhitect al Metodei BUILT" textarea />
      </section>

      {/* Contact & social */}
      <section className={card}>
        <h2 className={sectionTitle}>Contact &amp; Social</h2>
        <Field label="Email" value={data.coach_email ?? ""} onChange={(v) => set("coach_email", v)} placeholder="claudiuiordache.coach@gmail.com" />
        <Field label="Telefon" value={data.coach_phone ?? ""} onChange={(v) => set("coach_phone", v)} placeholder="07xx xxx xxx" />
        <Field label="Instagram" value={data.coach_instagram ?? ""} onChange={(v) => set("coach_instagram", v)} placeholder="@iordacheclaudiu_" />
      </section>

      {/* Setări aplicație */}
      <section className={card}>
        <h2 className={sectionTitle}>Setări aplicație</h2>
        <Field
          label="Titlu notificare mesaj"
          value={data.push_message_title ?? ""}
          onChange={(v) => set("push_message_title", v)}
          placeholder="Mesaj nou de la Coach"
        />
        <Field
          label="Mesaj check-in de sâmbătă"
          value={data.saturday_message ?? ""}
          onChange={(v) => set("saturday_message", v)}
          placeholder="Cum a mers săptămâna? 2 minute de check-in țin sistemul pe drum."
          textarea
        />
      </section>

      <button
        onClick={save}
        disabled={saving}
        className="w-full md:w-auto px-6 py-3 bg-built-red hover:bg-red-700 text-white text-sm font-semibold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
      >
        {saved ? "Salvat ✓" : saving ? "Se salvează..." : "Salvează profilul"}
      </button>
    </div>
  );
}
