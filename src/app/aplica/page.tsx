"use client";

import { useState, useEffect } from "react";
import { BuiltWordmark } from "@/components/BrandLogo";
import { submitApplication, getAvailableSlots, bookDiagnostic, type Budget, type DaySlots } from "./actions";

const BUDGET_OPTIONS: { value: Budget; label: string; sub: string }[] = [
  { value: "gata", label: "Sunt gata să investesc în mine acum", sub: "Programele merg de la 200 la 700€, în funcție de cât de aproape lucrăm." },
  { value: "depinde", label: "Depinde de plan și de rezultat", sub: "Vreau să văd întâi dacă e pentru mine." },
  { value: "nu", label: "Doar mă informez deocamdată", sub: "Nu sunt pregătit să încep acum." },
];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-sm text-built-white font-medium mb-2">{label}</span>
      {hint && <span className="block text-[12px] text-zinc-500 mb-2 -mt-1">{hint}</span>}
      {children}
    </label>
  );
}

const inputCls =
  "w-full bg-white/[0.03] border border-white/10 focus:border-built-red/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors";

// ─── Slot de diagnostic — aplicantul își alege singur ora ────────────────────

function BookingSection({ prospectId, name, contact }: {
  prospectId: number | null; name: string; contact: string;
}) {
  const [slots, setSlots] = useState<DaySlots[] | null>(null);
  const [booked, setBooked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { getAvailableSlots().then(setSlots).catch(() => setSlots([])); }, []);

  async function pick(date: string, time: string) {
    setBusy(true); setErr("");
    const r = await bookDiagnostic({ prospectId, name, contact, date, time });
    setBusy(false);
    if (r.ok) setBooked(r.label); else setErr(r.error);
  }

  if (booked) {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.05] p-5 text-left">
        <p className="font-condensed text-[11px] uppercase tracking-[0.22em] text-emerald-400 mb-2">Apel rezervat ✓</p>
        <p className="text-built-white text-[15px] leading-relaxed">
          Ne auzim <span className="font-medium">{booked}</span>. Îți confirm și în DM. Vino pregătit să vorbești sincer — e un diagnostic, nu o prezentare.
        </p>
      </div>
    );
  }

  if (slots === null) return <p className="text-zinc-600 text-sm text-center">Se încarcă orele disponibile...</p>;
  if (slots.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
      <p className="font-condensed text-[11px] uppercase tracking-[0.22em] text-built-red mb-1">Nu vrei să aștepți?</p>
      <p className="text-built-white text-[15px] font-medium mb-1">Alege-ți direct ora pentru diagnostic</p>
      <p className="text-zinc-500 text-[13px] mb-4">15 minute, video. Înțelegem împreună unde ești blocat — fără pitch.</p>
      <div className="space-y-3.5">
        {slots.map((d) => (
          <div key={d.date}>
            <p className="text-[12px] text-zinc-400 mb-1.5 capitalize">{d.label}</p>
            <div className="flex flex-wrap gap-2">
              {d.times.map((t) => (
                <button key={t} type="button" disabled={busy} onClick={() => pick(d.date, t)}
                  className="font-mono text-sm text-white border border-white/15 hover:border-built-red/60 hover:bg-built-red/10 rounded-lg px-3.5 py-2 transition-colors disabled:opacity-40">
                  {t}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {err && <p className="text-sm text-built-red mt-3">{err}</p>}
    </div>
  );
}

export default function AplicaPage() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [a1, setA1] = useState("");
  const [a2, setA2] = useState("");
  const [a3, setA3] = useState("");
  const [budget, setBudget] = useState<Budget | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [prospectId, setProspectId] = useState<number | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!budget) { setError("Alege o variantă la ultima întrebare."); return; }
    setBusy(true);
    const r = await submitApplication({ name, contact, a1, a2, a3, budget });
    setBusy(false);
    if (r.ok) { setProspectId(r.prospectId); setDone(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else setError(r.error);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-built-black flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-lg text-center anim-fade-up">
          <BuiltWordmark className="text-3xl text-built-white inline-block mb-8" />
          <div className="w-12 h-1 bg-built-red mx-auto mb-8" />
          <h1 className="font-display text-4xl sm:text-5xl text-built-white leading-[0.95] mb-5">
            Am primit <span className="text-built-red">aplicarea ta.</span>
          </h1>
          <p className="text-zinc-400 text-[15px] leading-relaxed mb-3">
            O citesc personal — nu un robot. Dacă văd că te pot ajuta cu adevărat, îți scriu în DM în <span className="text-white">maxim 24 de ore</span>.
          </p>
          <p className="text-zinc-500 text-sm leading-relaxed mb-8">
            Nu trimit oferte automate. Întâi diagnostichez, apoi îți spun sincer dacă e pentru tine. <span className="text-built-white font-medium">BUILT selectează, nu vinde.</span>
          </p>

          {/* Slot de diagnostic — taie așteptarea, alege ora pe loc */}
          <div className="mb-6">
            <BookingSection prospectId={prospectId} name={name} contact={contact} />
          </div>

          {/* Lead magnet — valoare instant cât aștepți DM-ul */}
          <div className="text-left rounded-2xl border border-built-red/25 bg-built-red/[0.04] p-5">
            <p className="font-condensed text-[11px] uppercase tracking-[0.22em] text-built-red mb-2">Până îți scriu — citește asta</p>
            <p className="text-built-white font-display text-2xl leading-[0.95] mb-2">Capcana Cortizolului</p>
            <p className="text-zinc-400 text-[13px] leading-relaxed mb-4">
              De ce voința n-a fost niciodată problema ta — și ce ține grăsimea pe burtă chiar dacă te miști. 10 minute care îți schimbă felul în care vezi tot.
            </p>
            <a href="/lead-magnet/Capcana-Cortizolului-BUILT.pdf" download
              className="inline-flex items-center gap-2 bg-built-red text-white font-condensed uppercase tracking-widest text-[13px] px-5 py-3 rounded-xl hover:bg-built-red/90 active:scale-[0.99] transition-all">
              ↓ Descarcă PDF-ul gratuit
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-built-black px-5 py-12 sm:py-16">
      <div className="w-full max-w-xl mx-auto anim-fade-up">
        {/* Header */}
        <div className="mb-10">
          <BuiltWordmark className="text-2xl text-built-white inline-block mb-7" />
          <p className="font-condensed text-[12px] uppercase tracking-[0.25em] text-built-red mb-4">Aplicare · Arhitectura Corpului pe 90 de zile</p>
          <h1 className="font-display text-[42px] sm:text-[54px] text-built-white leading-[0.92] mb-5">
            Aplici. <span className="text-built-red">Nu te înscrii.</span>
          </h1>
          <p className="text-zinc-400 text-[15px] leading-relaxed">
            BUILT nu e pentru oricine, și nu cerșim clienți — selectăm oameni gata să se reconstruiască. Răspunde sincer la cele de jos. Dacă ești un fit, îți scriu personal.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-7">
          <Field label="Cum te cheamă?">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Numele tău" className={inputCls} />
          </Field>

          <Field label="Unde te găsesc?" hint="Instagram, telefon sau email — pe care îți răspund.">
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="@instagram / telefon / email" className={inputCls} />
          </Field>

          <div className="h-px bg-white/[0.06] my-2" />

          <Field label="1. Unde ești acum, concret?" hint="Cu corpul, cu energia, cu greutatea. Fără filtru.">
            <textarea value={a1} onChange={(e) => setA1(e.target.value)} rows={3}
              placeholder="Ex: 95 kg, burtă, energie scăzută după prânz, mă mișc puțin..." className={inputCls} />
          </Field>

          <Field label="2. Ce ai încercat până acum și de ce crezi că n-a ținut?">
            <textarea value={a2} onChange={(e) => setA2(e.target.value)} rows={3}
              placeholder="Ex: diete, sală în reprize, am slăbit și am pus la loc..." className={inputCls} />
          </Field>

          <Field label="3. Dacă peste 90 de zile ai fi exact unde-ți dorești — ce s-a schimbat?">
            <textarea value={a3} onChange={(e) => setA3(e.target.value)} rows={3}
              placeholder="Cum arată ziua ta, cum te simți, ce poți face și acum nu poți..." className={inputCls} />
          </Field>

          <div className="h-px bg-white/[0.06] my-2" />

          {/* Buget — calificarea */}
          <div>
            <span className="block text-sm text-built-white font-medium mb-3">Cât de serios ești în privința investiției?</span>
            <div className="space-y-2.5">
              {BUDGET_OPTIONS.map((opt) => {
                const active = budget === opt.value;
                return (
                  <button type="button" key={opt.value} onClick={() => setBudget(opt.value)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                      active ? "border-built-red/60 bg-built-red/[0.06]" : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}>
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${active ? "border-built-red" : "border-zinc-600"}`}>
                        {active && <span className="w-2 h-2 rounded-full bg-built-red" />}
                      </span>
                      <span>
                        <span className={`block text-sm ${active ? "text-built-white" : "text-zinc-300"}`}>{opt.label}</span>
                        <span className="block text-[12px] text-zinc-500 mt-0.5">{opt.sub}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-built-red">{error}</p>}

          <button type="submit" disabled={busy}
            className="w-full bg-built-red text-white font-condensed uppercase tracking-widest text-sm py-4 rounded-xl hover:bg-built-red/90 active:scale-[0.99] transition-all disabled:opacity-50">
            {busy ? "Se trimite..." : "Trimite aplicarea"}
          </button>

          <p className="text-[12px] text-zinc-600 text-center leading-relaxed">
            Răspunsurile tale ajung direct la Claudiu. Nu le folosim pentru nimic altceva.
          </p>
        </form>
      </div>
    </div>
  );
}
