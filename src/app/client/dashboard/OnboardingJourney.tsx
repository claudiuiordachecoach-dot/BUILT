"use client";

import Link from "next/link";

type Mission = { phase: string; title: string; body: string; ctaLabel: string; href: string };

// Tradus din N3 (playbook coach → client). Zilele 1-7. Forțează prima poză (zi 1) + primul check-in (zi 4).
const MISSIONS: Record<number, Mission> = {
  1: {
    phase: "Ziua 1 · Bun venit",
    title: "Trasează linia de start",
    body: "Pune prima poză de progres și greutatea de azi în Profil. De aici măsurăm tot ce urmează — nu de la perfecțiune, de la realitate.",
    ctaLabel: "Mergi la Profil",
    href: "/client/profil",
  },
  2: {
    phase: "Ziua 2 · Prima victorie",
    title: "Un singur lucru azi",
    body: "Bea 2L de apă și bifează „Hidratare” mai jos. Atât. Sistemul lucrează înainte să te epuizeze — primul rezultat vine rapid.",
    ctaLabel: "Vezi execuția de azi",
    href: "#executia-ta",
  },
  3: {
    phase: "Ziua 3 · Planul tău",
    title: "E construit pe tine",
    body: "Deschide Antrenamente și Nutriție. Sunt croite pe corpul și programul tău — nu o copie. Nu trebuie executate perfect, doar începute.",
    ctaLabel: "Vezi antrenamentul",
    href: "/client/antrenamente",
  },
  4: {
    phase: "Ziua 4 · Primul check-in",
    title: "Cum te-ai simțit?",
    body: "Nu mă interesează cifre acum — un contact scurt. 2 minute care îmi spun unde ești cu adevărat și ce ajustez.",
    ctaLabel: "Fă primul check-in",
    href: "/client/checkin",
  },
  5: {
    phase: "Ziua 5 · Ritualul",
    title: "Așa rămâi pe drum",
    body: "În fiecare zi: numerele (pași, somn) + un gând în reflecție. Constanța mică bate efortul mare. Asta e diferența dintre un plan și un sistem.",
    ctaLabel: "Completează azi",
    href: "#executia-ta",
  },
  6: {
    phase: "Ziua 6 · Mintea întâi",
    title: "Deschide Academia",
    body: "Primul modul din Academia BUILT. Corpul urmează mintea, nu invers — de aici se construiește omul echilibrat.",
    ctaLabel: "Intră în Academia",
    href: "/client/module",
  },
  7: {
    phase: "Ziua 7 · Recalibrare",
    title: "Prima săptămână e gata",
    body: "Scrie-i lui Claudiu cum a fost, sincer. Ce a mers, ce nu. Ajustăm sistemul pentru următoarele 11 săptămâni — de aici construim.",
    ctaLabel: "Scrie-i lui Claudiu",
    href: "/client/mesaje",
  },
};

export default function OnboardingJourney({ day, qs }: { day: number; qs: string }) {
  const m = MISSIONS[day];
  if (!m) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-built-red/15 via-[#141414] to-[#111111] border border-built-red/30 rounded-2xl p-5 mb-5">
      {/* progres 7 zile */}
      <div className="flex items-center gap-1.5 mb-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < day ? "bg-built-red" : "bg-white/10"}`} />
        ))}
      </div>
      <p className="font-condensed text-[10px] uppercase tracking-widest text-built-red mb-1.5">{m.phase}</p>
      <h3 className="font-display text-2xl tracking-wide text-built-white leading-none mb-2">{m.title}</h3>
      <p className="text-sm text-zinc-300 leading-relaxed mb-4">{m.body}</p>
      {m.href.startsWith("#") ? (
        <button
          onClick={() => {
            const el = document.getElementById(m.href.slice(1));
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="press inline-flex items-center gap-2 bg-built-red text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-lg hover:bg-built-red/90 transition-colors"
        >
          {m.ctaLabel} →
        </button>
      ) : (
        <Link
          href={`${m.href}${qs}`}
          className="press inline-flex items-center gap-2 bg-built-red text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-lg hover:bg-built-red/90 transition-colors"
        >
          {m.ctaLabel} →
        </Link>
      )}
    </div>
  );
}
