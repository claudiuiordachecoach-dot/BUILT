"use client";

import { useState, useEffect } from "react";

const WEEKLY_TRENDS = [
  "Cortizolul de dimineață ca factor de stocare a grăsimii — pattern în creștere",
  "Conținut \"1 singur obicei\" primește cu 40% mai multe save-uri decât liste lungi",
  "Hook-urile cu cifre specifice (&lt;10k followeri) funcționează mai bine decât declarațiile",
  "Video-urile de 45-60 secunde domină din nou după update-ul din Mai",
];

const SCRIPTS = [
  {
    day: "Luni",
    theme: "Talking Head — Cortizol",
    hook: "Dacă faci sport în fiecare dimineață și nu slăbești — nu e metabolismul tău. E cortizolul tău.",
    body:
      "Antrenamentul intens dimineața crește cortizolul. Cortizolul crescut → insulino-rezistență → corp stochează, nu arde. " +
      "Nu trebuie să renunți la sport — trebuie să muți antrenamentul sau să schimbi tipul. Zone 2 dimineața, " +
      "forță după-amiaza. Asta face sistemul BUILT, nu voința.",
    full_script:
      "Antrenamentul intens dimineața crește cortizolul cronic. Cortizol crescut înseamnă insulino-rezistență. Insulino-rezistență înseamnă că corpul stochează grăsime în loc să o ardă — chiar dacă ești în deficit caloric.\n\nNu trebuie să renunți la sport. Trebuie să schimbi tipul sau ora. Zone 2 dimineața — ritm de conversație, 30-40 minute. Antrenamentul de forță după-amiaza, când cortizolul e natural mai scăzut.\n\nAsta e diferența dintre a munci din greu și a munci inteligent.",
    caption:
      "Antrenezi dimineața și nu slăbești? Nu e lipsă de disciplină — e biologie pe dos. Cortizol crescut = stocare, nu ardere. Schimbi ora, schimbi rezultatele.",
    cta: "Dacă te regăsești în asta, scrie-mi ARHITECTURĂ în DM.",
    status: "ready",
  },
  {
    day: "Marți",
    theme: "Comparație — Client Proof",
    hook: "Alex a pierdut 8kg în 11 săptămâni fără să numere o singură calorie.",
    body:
      "Nu a schimbat tot. A schimbat ordinea. Proteina la prima masă → sațietate naturală toată ziua. " +
      "Antrenament de 40 min, 4x/săptămână — fără să rateze o zi. Nu voință. Sistem.",
    full_script:
      "Alex, 39 de ani, project manager IT. Tată. Program încărcat. A venit la BUILT cu 8 kilograme de dat jos și convingerea că nu are timp.\n\nNu am schimbat totul dintr-o dată. Am schimbat ordinea. Proteina la prima masă — sațietate naturală toată ziua, fără să numere o singură calorie. Antrenament de 40 de minute, de 4 ori pe săptămână — la ore fixe, ca o ședință de lucru.\n\n11 săptămâni mai târziu: minus 8 kilograme. Fără foame. Fără sacrificiu. Fără motivație forțată.\n\nNu voință. Sistem.",
    caption:
      "8kg în 11 săptămâni fără să numere o calorie. Nu magie — ordine. Proteina la prima masă schimbă tot ce urmează în ziua ta.",
    cta: "Câte kilograme ai de dat jos? Scrie-mi și îți spun dacă te pot ajuta.",
    status: "ready",
  },
  {
    day: "Miercuri",
    theme: "Tutorial — Protocolul 3 Mese",
    hook: "Trei mese pe zi. Fără gustări. Fără numărare. Funcționează — iată de ce.",
    body:
      "Fiecare masă declanșează insulină. Mai multe mese = mai mult timp în modul \"stocare\". " +
      "3 mese bine structurate → fereastră mai lungă de ardere. Nu e magie. E fiziologie de bază.",
    full_script:
      "Fiecare masă pe care o mănânci declanșează o secreție de insulină. Insulina = modul stocare. Cu cât mănânci mai des, cu atât petreci mai mult timp în modul stocare.\n\nProtocolul BUILT: 3 mese structurate, fără gustări între ele. Masă 1 — proteină + grăsime bună. Masă 2 — proteină + carbohidrați complecși. Masă 3 — proteină + legume.\n\nFereastră de ardere mai lungă între mese. Insulină stabilizată. Foame controlată natural — nu prin voință.\n\nNu e magie. E fiziologie de bază pe care industria de suplimente nu vrea să o auzi.",
    caption:
      "Nu mai mânca de 6 ori pe zi. 3 mese structurate = insulină stabilă = corp care arde, nu stochează. Fiziologie, nu dietă.",
    cta: "Vrei protocolul exact? Comentează MESE.",
    status: "draft",
  },
  {
    day: "Joi",
    theme: "Rant — Cardio Infinit",
    hook: "1 oră de cardio pe zi și nu slăbești? Nu ești leneș. Ești într-o buclă greșită.",
    body:
      "Corpul se adaptează. Cardio excesiv → cortizol crescut → mai multă foame → mai multă mâncare. " +
      "Paradox complet. Soluția nu e mai mult cardio — e forță + Zone 2 la intensitate corectă.",
    full_script:
      "Dacă faci o oră de cardio în fiecare zi și nu slăbești — nu ești leneș. Ești victima unui paradox fiziologic.\n\nCorporul se adaptează la stresul cardio în 3-4 săptămâni. Eficiența crește, caloriile arse scad. Între timp, cortizolul crescut din sesiunile lungi îți stimulează foamea. Mănânci mai mult fără să realizezi.\n\nBucla: cardio → cortizol → foame → mâncare → fără deficit → fără slăbire → mai mult cardio.\n\nSoluția nu e mai mult cardio. E forță de 3 ori pe săptămână + Zone 2 de 2 ori, la intensitate de conversație. Asta rupe bucla.",
    caption:
      "O oră de cardio zilnic și nu slăbești. Nu e vina ta — e bucla cortizolului. Cardio excesiv îți crește foamea. Soluția e alta.",
    cta: "Câte ore de cardio faci pe săptămână? Scrie mai jos.",
    status: "draft",
  },
  {
    day: "Vineri",
    theme: "Behind Scenes — Ziua mea reală",
    hook: "Nu am chef de antrenament. Fac antrenament. Iată cum arată o zi reală.",
    body:
      "6:30 — proteină la micul dejun. 7:00 — 30 min Zone 2. Nu mă simt motivat. Nu contează. " +
      "Sistemul nu funcționează pe motivație — funcționează pe obiceiuri programate. " +
      "Asta e diferența dintre antrenamentul de 7 ani și cel de 7 luni.",
    full_script:
      "6:30 dimineața. Nu am dormit bine. Nu am chef de nimic.\n\n6:35 — mănânc proteina la micul dejun. Nu pentru că vreau. Pentru că e în sistem.\n\n7:00 — pornesc ceasul. 30 de minute Zone 2. Ritm de conversație. Nu mă gândesc la motivație. Mă gândesc la pas următor.\n\n7:30 — gata. Nu am simțit nimic spectaculos. Nu trebuia să simt.\n\nAsta e diferența dintre 7 ani de antrenament și 7 luni. Nu e mai multă motivație. E un sistem care funcționează independent de starea ta de spirit.\n\nMotivația vine după ce faci. Nu înainte.",
    caption:
      "Nu aveam chef. Am făcut. Nu pentru motivație — pentru sistem. 7 ani de constanță nu înseamnă 7 ani de chef. Înseamnă 7 ani de protocol.",
    cta: "Urmărește pentru mai mult conținut de tip behind-the-scenes.",
    status: "scheduled",
  },
];

const STATUS_STYLE: Record<string, string> = {
  ready: "bg-emerald-500/10 text-emerald-400",
  draft: "bg-zinc-700/40 text-zinc-400",
  scheduled: "bg-built-red/10 text-built-red",
};

const STATUS_LABEL: Record<string, string> = {
  ready: "Ready",
  draft: "Draft",
  scheduled: "Programat",
};

export default function ContentPage() {
  const [openScript, setOpenScript] = useState<number | null>(0);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("built_competitors");
      if (stored) setCompetitors(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const addCompetitor = () => {
    const handle = newCompetitor.trim().replace(/^@/, "");
    if (!handle || competitors.includes(handle) || competitors.length >= 10) return;
    const updated = [...competitors, handle];
    setCompetitors(updated);
    localStorage.setItem("built_competitors", JSON.stringify(updated));
    setNewCompetitor("");
  };

  const removeCompetitor = (handle: string) => {
    const updated = competitors.filter((c) => c !== handle);
    setCompetitors(updated);
    localStorage.setItem("built_competitors", JSON.stringify(updated));
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] text-built-red font-mono uppercase tracking-widest mb-1">
          Content Studio
        </p>
        <h1 className="text-4xl font-display tracking-[0.06em] text-zinc-100">
          WEEKLY INTELLIGENCE
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Scripturi săptămânale · Săptămâna 10–16 Mai 2026
        </p>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6">
        {/* Left — Scripts accordion */}
        <div className="space-y-2">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-4">
            Scripturi săptămânale
          </p>
          {SCRIPTS.map((script, i) => (
            <div
              key={i}
              className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
                onClick={() => setOpenScript(openScript === i ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-zinc-600 w-10 text-left">
                    {script.day}
                  </span>
                  <span className="text-[13px] text-zinc-200 font-medium">
                    {script.theme}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono ${STATUS_STYLE[script.status]}`}
                  >
                    {STATUS_LABEL[script.status]}
                  </span>
                  <span
                    className={`text-zinc-500 transition-transform ${
                      openScript === i ? "rotate-90" : ""
                    }`}
                  >
                    ›
                  </span>
                </div>
              </button>

              {openScript === i && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                  <div>
                    <p className="text-[10px] text-built-red font-mono uppercase tracking-widest mb-1.5">
                      Hook
                    </p>
                    <p className="text-zinc-200 text-sm leading-relaxed font-medium">
                      &ldquo;{script.hook}&rdquo;
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1.5">
                      Corp
                    </p>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {script.body}
                    </p>
                  </div>
                  {/* Full Script */}
                  {"full_script" in script && script.full_script && (
                    <div>
                      <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1.5">
                        Full Script
                      </p>
                      <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                        {(script as { full_script: string }).full_script}
                      </p>
                    </div>
                  )}
                  {/* Caption + CTA */}
                  {"caption" in script && script.caption && (
                    <div>
                      <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1.5">
                        Caption
                      </p>
                      <p className="text-zinc-400 text-sm leading-relaxed italic">
                        {(script as { caption: string }).caption}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-built-red font-mono">
                          CTA: {script.cta}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText((script as { caption: string }).caption)}
                          className="text-[10px] text-zinc-500 border border-white/10 px-2 py-0.5 rounded hover:bg-white/5"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button className="text-[11px] bg-built-red/10 text-built-red border border-built-red/20 px-3 py-1.5 rounded-lg hover:bg-built-red/20 transition-colors">
                      ✦ Regenerează
                    </button>
                    <button className="text-[11px] text-zinc-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                      Copiază
                    </button>
                    <button className="text-[11px] text-zinc-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                      Salvează
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right — What's popping + Competitor Intel */}
        <div className="space-y-4">
          <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
            <p className="text-[10px] text-built-red font-mono uppercase tracking-widest mb-3">
              What&apos;s popping this week
            </p>
            <ul className="space-y-2.5">
              {WEEKLY_TRENDS.map((t, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="text-built-red shrink-0 mt-0.5">▸</span>
                  <p className="text-zinc-400 text-[12px] leading-relaxed">{t}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">
              Generator scripturi noi
            </p>
            <select className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-300 text-[12px] px-3 py-2 rounded-lg mb-2 focus:outline-none focus:border-built-red/40">
              <option>Talking Head</option>
              <option>Rant</option>
              <option>Tutorial</option>
              <option>Behind the scenes</option>
              <option>Client proof</option>
            </select>
            <select className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-300 text-[12px] px-3 py-2 rounded-lg mb-3 focus:outline-none focus:border-built-red/40">
              <option>Pilon B — Base Strength</option>
              <option>Pilon U — Unbreakable Capacity</option>
              <option>Pilon I — Intelligent Fueling</option>
              <option>Pilon L — Lifestyle Integration</option>
              <option>Pilon T — Tough Mindset</option>
            </select>
            <button className="w-full bg-built-red/10 text-built-red border border-built-red/20 text-[12px] py-2 rounded-lg hover:bg-built-red/20 transition-colors">
              ✦ Generează Script
            </button>
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">
              Progres săptămânal
            </p>
            <div className="space-y-2">
              {["Luni", "Marți", "Miercuri", "Joi", "Vineri"].map((d, i) => (
                <div key={d} className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-500 w-14">{d}</span>
                  <div
                    className={`flex-1 h-1.5 rounded-full ${
                      i < 2 ? "bg-emerald-500" : i === 2 ? "bg-built-red/40" : "bg-white/10"
                    }`}
                  />
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {i < 2 ? "✓" : i === 2 ? "Draft" : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MY COMPETITORS */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
              My Competitors
            </p>
            <p className="text-zinc-600 text-[11px] mt-0.5">
              Adaugă conturi Instagram din nișa ta. În fiecare săptămână, scripturile tale se vor baza pe ce merge la ei.
            </p>
          </div>
          <button className="text-[11px] text-built-red border border-built-red/20 px-3 py-1.5 rounded-lg hover:bg-built-red/10">
            ⟳ Scrape Now
          </button>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">
            My Competitors — {competitors.length}/10 accounts tracked
          </p>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
              placeholder="@username"
              className="flex-1 bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-600"
            />
            <button
              onClick={addCompetitor}
              disabled={!newCompetitor.trim() || competitors.length >= 10}
              className="text-[12px] bg-built-red/10 text-built-red border border-built-red/20 px-4 py-2 rounded-lg hover:bg-built-red/20 disabled:opacity-40"
            >
              + Add
            </button>
          </div>
          {competitors.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {competitors.map((handle) => (
                <span
                  key={handle}
                  className="flex items-center gap-1.5 text-[11px] text-zinc-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full"
                >
                  @{handle}
                  <button
                    onClick={() => removeCompetitor(handle)}
                    className="text-zinc-600 hover:text-zinc-200 text-[10px]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-zinc-700 text-[11px]">
              Niciun competitor adăugat. Adaugă conturi din nișa ta (fitness, coaching, mindset).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
