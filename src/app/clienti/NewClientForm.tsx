"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "./actions";

export function NewClientForm() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", start_date: new Date().toISOString().slice(0, 10), objectives: "" });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function set(k: keyof typeof form) { return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value })); }

  function handleSubmit() {
    startTransition(async () => {
      const r = await createClient(form.name, form.start_date, form.objectives, form.email);
      if (r.ok) { setOpen(false); setForm({ name: "", email: "", start_date: new Date().toISOString().slice(0, 10), objectives: "" }); router.push(`/clienti/${r.id}`); }
      else setError(r.error);
    });
  }

  if (!open) return (
    <button type="button" onClick={() => setOpen(true)} className="px-4 py-2 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs transition-colors">
      + Client nou
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] border border-white/10 rounded-sm p-7 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-3xl tracking-wider text-white">CLIENT NOU</h3>
          <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white text-xl leading-none">✕</button>
        </div>
        {[["name", "Nume complet", "text", "Ion Popescu"], ["email", "Email", "email", "ion@email.com"], ["start_date", "Data start", "date", ""], ["objectives", "Obiective", "text", "Slăbit 8kg, energie crescută"]].map(([k, l, t, p]) => (
          <div key={k} className="mb-4">
            <label className="block font-condensed text-[11px] text-zinc-400 uppercase tracking-wider mb-1.5">{l}</label>
            <input type={t as string} value={(form as Record<string, string>)[k as string]} onChange={set(k as keyof typeof form)} placeholder={p as string}
              className="w-full bg-black/40 border border-white/15 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-built-red placeholder:text-zinc-600 rounded-sm" />
          </div>
        ))}
        {error && <p className="text-built-red font-condensed text-xs mb-3">{error}</p>}
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={handleSubmit} disabled={isPending}
            className="flex-1 py-3 bg-built-red hover:bg-built-red-dark text-white font-condensed text-xs tracking-widest uppercase disabled:opacity-50 transition-colors">
            {isPending ? "Se adaugă…" : "Adaugă client"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="px-5 py-3 border border-white/15 text-zinc-400 hover:text-white hover:border-white/30 font-condensed text-xs uppercase tracking-wider transition-colors">Anulează</button>
        </div>
      </div>
    </div>
  );
}
