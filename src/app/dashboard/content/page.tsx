"use client";

import { useState, useEffect } from "react";
import {
  listCompetitors,
  addCompetitor,
  removeCompetitor,
  scrapeCompetitors,
  getLatestWeeklyPackage,
  generateWeeklyPackage,
} from "./actions";

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
      "Antrenamentul intens dimineața crește cortizolul. Cortizol crescut → insulino-rezistență → corp stochează, nu arde. " +
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

function CompetitorsSection() {
  const [competitors, setCompetitors] = useState<{ id: number; handle: string }[]>([]);
  const [handle, setHandle] = useState("");
  const [scraping, setScraping] = useState(false);

  useEffect(() => { listCompetitors().then(setCompetitors); }, []);

  async function handleAdd() {
    if (!handle.trim()) return;
    await addCompetitor(handle);
    setHandle("");
    listCompetitors().then(setCompetitors);
  }

  async function handleScrape() {
    setScraping(true);
    await scrapeCompetitors();
    setScraping(false);
  }

  return (
    <div className="border border-white/10 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-200">My Competitors</h3>
        <button onClick={handleScrape} disabled={scraping}
          className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
          {scraping ? "Scraping..." : "⟳ Scrape Now"}
        </button>
      </div>
      <p className="text-xs text-zinc-500 mb-3">Adaugă conturi Instagram. În fiecare săptămână, AI-ul învață din reels-urile lor performante.</p>
      <div className="flex gap-2 mb-3">
        <input value={handle} onChange={e => setHandle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
          placeholder="@username"
          className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-built-red/50" />
        <button onClick={handleAdd}
          className="bg-built-red/10 hover:bg-built-red/20 border border-built-red/30 text-built-red px-4 py-2 rounded-lg text-sm font-semibold">
          + Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {competitors.map(c => (
          <span key={c.id} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-zinc-300">
            @{c.handle}
            <button
              onClick={() => removeCompetitor(c.id).then(() => listCompetitors().then(setCompetitors))}
              className="text-zinc-600 hover:text-zinc-300 ml-1">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

function WeeklyScriptsSection() {
  const [pkg, setPkg] = useState<{
    intelligence_report?: {
      whats_popping?: string[];
      performance_insights?: string[];
      accounts_to_watch?: string[];
    };
    scripts?: { day: string; hook: string; script: string; caption: string }[];
  } | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { getLatestWeeklyPackage().then(p => setPkg(p as typeof pkg)); }, []);

  async function handleGenerate() {
    setGenerating(true);
    const result = await generateWeeklyPackage();
    setPkg(result);
    setGenerating(false);
  }

  return (
    <div className="border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-200">This Week&apos;s Scripts</h3>
        <button onClick={handleGenerate} disabled={generating}
          className="text-xs bg-built-red text-white px-4 py-2 rounded-lg font-semibold hover:bg-built-red/90 disabled:opacity-50 transition-all">
          {generating ? "Se generează..." : "⟳ Regenerate This Week"}
        </button>
      </div>

      {pkg?.intelligence_report && (
        <div className="bg-[#0d0d0d] border border-white/5 rounded-lg p-4 mb-5">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">Weekly Intelligence Report</p>
          {(pkg.intelligence_report.whats_popping?.length ?? 0) > 0 && (
            <>
              <p className="text-[11px] font-semibold text-zinc-500 mb-1">Ce explodează săptămâna asta</p>
              <ul className="space-y-1 mb-3">
                {pkg.intelligence_report.whats_popping?.map((item, i) => (
                  <li key={i} className="text-xs text-zinc-300 flex gap-2"><span className="text-built-red shrink-0">++</span>{item}</li>
                ))}
              </ul>
            </>
          )}
          {(pkg.intelligence_report.performance_insights?.length ?? 0) > 0 && (
            <>
              <p className="text-[11px] font-semibold text-zinc-500 mb-1">Performanța formatelor</p>
              <ul className="space-y-1">
                {pkg.intelligence_report.performance_insights?.map((item, i) => (
                  <li key={i} className="text-xs text-zinc-300 flex gap-2"><span className="text-zinc-600 shrink-0">·</span>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="space-y-4">
        {pkg?.scripts?.map((script, i) => (
          <div key={i} className="bg-[#0d0d0d] border border-white/5 rounded-lg p-4">
            <span className="text-[10px] font-semibold text-built-red uppercase">{script.day}</span>
            <p className="text-sm font-bold text-white mt-2 mb-2">&quot;{script.hook}&quot;</p>
            <p className="text-xs text-zinc-400 mb-3 whitespace-pre-wrap">{script.script}</p>
            <div className="border-t border-white/5 pt-3 mb-2">
              <p className="text-[11px] text-zinc-500 mb-1">Caption</p>
              <p className="text-xs text-zinc-300">{script.caption}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(`${script.hook}\n\n${script.script}\n\n${script.caption}`)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              ⎘ Copy script
            </button>
          </div>
        ))}
      </div>

      {!pkg && !generating && (
        <div className="text-center py-12">
          <p className="text-sm text-zinc-500">Niciun pachet generat încă.</p>
          <p className="text-xs text-zinc-600 mt-1">Adaugă competitori și apasă &quot;Regenerate This Week&quot;.</p>
        </div>
      )}
    </div>
  );
}

export default function ContentPage() {
  const [openScript, setOpenScript] = useState<number | null>(0);

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

      {/* Competitors + Weekly Scripts */}
      <div className="mt-8 space-y-6">
        <CompetitorsSection />
        <WeeklyScriptsSection />
      </div>
    </div>
  );
}
