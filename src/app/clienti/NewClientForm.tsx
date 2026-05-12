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
    <div className="fixed inset-0 bg-built-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-built-gray-1 border border-built-gray-2 rounded-sm p-6 w-full max-w-md">
        <h3 className="font-display text-2xl tracking-wider mb-6">Client nou</h3>
        {[["name", "Nume complet *", "text", "Ion Popescu"], ["email", "Email", "email", "ion@email.com"], ["start_date", "Data start", "date", ""], ["objectives", "Obiective", "text", "Slăbit 8kg, energie crescută"]].map(([k, l, t, p]) => (
          <div key={k} className="mb-4">
            <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-1">{l}</p>
            <input type={t as string} value={(form as Record<string, string>)[k as string]} onChange={set(k as keyof typeof form)} placeholder={p as string}
              className="w-full bg-built-black border border-built-gray-2 text-built-white text-sm px-3 py-2 focus:outline-none focus:border-built-red" />
          </div>
        ))}
        {error && <p className="text-built-red font-condensed text-xs mb-3">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={handleSubmit} disabled={isPending}
            className="flex-1 py-2.5 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs disabled:opacity-50">
            {isPending ? "..." : "Adaugă client"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 border border-built-gray-2 text-built-gray-text font-condensed text-xs">Anulează</button>
        </div>
      </div>
    </div>
  );
}
