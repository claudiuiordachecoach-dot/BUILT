"use client";

import { useState, useEffect, useTransition } from "react";
import {
  saveOnboarding,
  loadOnboarding,
  generateAiSummary,
  type OnboardingData,
  type AiSummary,
} from "./actions";

const EMPTY: OnboardingData = {
  full_name: "", age: "", location: "", experience_years: "",
  coaching_since: "", instagram_handle: "", current_monthly_revenue: "",
  revenue_goal_90_days: "", revenue_goal_12_months: "", followers_now: "",
  followers_goal_90_days: "", niche: "", transformation_promise: "",
  content_formats: "", posting_frequency: "", best_performing_content: "",
  content_topics: "", tone_of_voice: "", content_that_failed: "",
  biggest_challenge: "", what_tried: "", bottleneck: "",
  fear_about_content: "", why_not_growing: "", biggest_frustration: "",
  ideal_outcome_90_days: "", ideal_client: "", dream_day: "",
  income_goal_why: "", what_success_looks_like: "",
  philosophy: "", differentiator: "", things_disagree_with: "",
  controversial_take: "",
  origin_story: "", biggest_transformation: "", credibility: "",
  defining_moment: "", failure_story: "", why_this_niche: "",
};

type FieldDef = {
  key: keyof OnboardingData;
  label: string;
  placeholder: string;
  textarea?: boolean;
};

type SectionDef = {
  id: string;
  num: number;
  title: string;
  description: string;
  fields: FieldDef[];
};

const SECTIONS: SectionDef[] = [
  {
    id: "who_you_are", num: 1,
    title: "Who You Are",
    description: "Bazele. Spune-ne despre tine ca persoană, nu doar ca coach.",
    fields: [
      { key: "full_name", label: "Nume complet", placeholder: "Iordache Claudiu" },
      { key: "age", label: "Vârstă", placeholder: "25" },
      { key: "location", label: "Unde ești bazat", placeholder: "Botoșani, România" },
      { key: "experience_years", label: "Ani de experiență în fitness", placeholder: "7" },
      { key: "coaching_since", label: "De când faci coaching online", placeholder: "2023" },
      { key: "instagram_handle", label: "Handle Instagram", placeholder: "@iordacheclaudiu_" },
      { key: "current_monthly_revenue", label: "Revenue actual/lună (EUR)", placeholder: "900" },
      { key: "revenue_goal_90_days", label: "Revenue goal în 90 zile (EUR/lună)", placeholder: "2500" },
      { key: "revenue_goal_12_months", label: "Revenue goal în 12 luni (EUR/lună)", placeholder: "5000" },
      { key: "followers_now", label: "Followeri actuali", placeholder: "2780" },
      { key: "followers_goal_90_days", label: "Followeri goal în 90 zile", placeholder: "5000" },
      { key: "niche", label: "Nișa ta în 1 propoziție", placeholder: "Reconstrucție corporală pentru bărbați ocupați 28-42 ani" },
      { key: "transformation_promise", label: "Promisiunea ta de transformare", placeholder: "90 zile. Corp reconstruit. Sistem predictibil.", textarea: true },
    ],
  },
  {
    id: "your_content", num: 2,
    title: "Your Content",
    description: "Cum creezi acum și ce a funcționat.",
    fields: [
      { key: "content_formats", label: "Formate principale", placeholder: "Talking Head, Rant, Tutorial" },
      { key: "posting_frequency", label: "Frecvența postărilor actuale", placeholder: "4-5 reels/săptămână" },
      { key: "best_performing_content", label: "Cel mai bun conținut de până acum (descrie)", placeholder: "Reelul despre cortizol — 14k views", textarea: true },
      { key: "content_topics", label: "Topicele principale despre care postezi", placeholder: "Cortizol, nutriție simplă, mindset, dovezi clienți", textarea: true },
      { key: "tone_of_voice", label: "Tonul tău — cum ești tu autentic", placeholder: "Direct, matur, fără clișee, empatic cu situația dar tăios cu scuzele" },
      { key: "content_that_failed", label: "Ce tip de conținut nu a funcționat", placeholder: "Reels cu animații și CapCut templates — prea fabricat", textarea: true },
    ],
  },
  {
    id: "where_stuck", num: 3,
    title: "Where You're Stuck",
    description: "Fii sincer. Cu cât mai mult detaliu, cu atât mai bine te pot ajuta.",
    fields: [
      { key: "biggest_challenge", label: "Cel mai mare obstacol acum", placeholder: "Conversie din DM în call", textarea: true },
      { key: "what_tried", label: "Ce ai încercat și nu a funcționat", placeholder: "Cold DM, reduceri de preț, postare zilnică fără strategie", textarea: true },
      { key: "bottleneck", label: "Unde se blochează lucrurile", placeholder: "Oamenii comentează dar nu intră în DM" },
      { key: "fear_about_content", label: "Ce te blochează cel mai mult la conținut", placeholder: "Frica de cameră, nu știu dacă am ceva valoros de spus" },
      { key: "why_not_growing", label: "De ce crezi că nu crești mai repede", placeholder: "Nu am sistem, postez random, nu calific audiența", textarea: true },
      { key: "biggest_frustration", label: "Cea mai mare frustrare a ta acum", placeholder: "Mă compar cu alții care au mai puțini ani dar mai mulți clienți", textarea: true },
    ],
  },
  {
    id: "what_you_want", num: 4,
    title: "What You Want",
    description: "Fii specific. Obiectivele vagi produc rezultate vagi.",
    fields: [
      { key: "ideal_outcome_90_days", label: "Cum arată ziua ta ideală în 90 de zile", placeholder: "10 clienți activi la 500 EUR, 2 ore de muncă/zi, sistem care rulează fără mine", textarea: true },
      { key: "ideal_client", label: "Descrie clientul ideal", placeholder: "Bărbat 30-40 ani, IT, familie, 15+ kg de dat jos, bani dar fără timp", textarea: true },
      { key: "dream_day", label: "Cum arată ziua ta perfectă (viitor)", placeholder: "Mă trezesc la 7, antrenament 1h, 3 ore pe sistemul BUILT, după-amiaza liberă" },
      { key: "income_goal_why", label: "De ce vrei acel revenue goal", placeholder: "Înseamnă libertate. Să nu depind de nimeni." },
      { key: "what_success_looks_like", label: "Cum știi că ai reușit — indicator concret", placeholder: "Când primul client mă sună și îmi zice că și-a schimbat viața", textarea: true },
    ],
  },
  {
    id: "mindset_opinions", num: 5,
    title: "Mindset & Opinions",
    description: "Perspectivele tale. Ce crezi tu. Asta diferențiază conținutul tău.",
    fields: [
      { key: "philosophy", label: "Filozofia ta despre fitness (2-3 propoziții)", placeholder: "Eșecul nu vine din lipsă de voință — vine din lipsă de sistem.", textarea: true },
      { key: "differentiator", label: "Ce face BUILT diferit de orice alt program", placeholder: "Nu vindem motivație. Vindem arhitectură.", textarea: true },
      { key: "things_disagree_with", label: "Cu ce nu ești de acord în industria fitness", placeholder: "Cardio excesiv, deficit agresiv, motivație fără sistem", textarea: true },
      { key: "controversial_take", label: "Cea mai controversată opinie a ta", placeholder: "Dacă mai dai o dietă unui om fără să-i schimbi identitatea, îl faci rău", textarea: true },
    ],
  },
  {
    id: "your_story", num: 6,
    title: "Your Story",
    description: "Originea ta, dovezile tale, credibilitatea ta. Alimentează fiecare script.",
    fields: [
      { key: "origin_story", label: "Povestea ta de origine", placeholder: "Am ajuns la 120kg, bâlbâit, fără identitate. Sportul m-a reconstruit.", textarea: true },
      { key: "biggest_transformation", label: "Cea mai mare transformare a ta", placeholder: "Am slăbit 40kg și am ajuns vicecampion național la atletism", textarea: true },
      { key: "credibility", label: "Dovezi de credibilitate (titluri, ani, clienți, rezultate)", placeholder: "7 ani experiență, hibrid athlete, Alex -8kg în 11 săptămâni", textarea: true },
      { key: "defining_moment", label: "Momentul care te-a definit ca coach", placeholder: "Prima dată când un client m-a sunat plângând că și-a schimbat viața" },
      { key: "failure_story", label: "O eșuare majoră din care ai învățat", placeholder: "Am pierdut primul client pentru că nu aveam sistem de retenție.", textarea: true },
      { key: "why_this_niche", label: "De ce bărbați 28-42 ani și nu altă nișă", placeholder: "Sunt eu acum 5 ani. Știu exact ce doare. Știu exact ce funcționează.", textarea: true },
    ],
  },
];

const TOTAL_FIELDS = SECTIONS.reduce((sum, s) => sum + s.fields.length, 0);

export default function OnboardingPage() {
  const [data, setData] = useState<OnboardingData>(EMPTY);
  const [openSection, setOpenSection] = useState<string>("who_you_are");
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, startTransition] = useTransition();

  useEffect(() => {
    loadOnboarding().then((saved) => {
      if (saved && Object.keys(saved).length > 0) {
        setData((prev) => ({ ...prev, ...saved }));
        const rec = saved as Record<string, string>;
        if (rec.ai_niche_summary) {
          setAiSummary({
            niche: rec.ai_niche_summary ?? "",
            ideal_client: rec.ai_ideal_client_summary ?? "",
          });
        }
      }
    });
  }, []);

  const filledCount = Object.values(data).filter((v) => v?.trim().length > 0).length;
  const progressPct = Math.round((filledCount / TOTAL_FIELDS) * 100);

  const handleField = (key: keyof OnboardingData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaveStatus("saving");
    startTransition(async () => {
      const result = await saveOnboarding(data);
      setSaveStatus(result.error ? "error" : "saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    });
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    const result = await generateAiSummary(data);
    if (result.ok) setAiSummary(result.summary);
    setSummaryLoading(false);
  };

  const saveBtnLabel =
    saveStatus === "saving" ? "Se salvează..." :
    saveStatus === "saved" ? "✓ Salvat cu succes" :
    saveStatus === "error" ? "Eroare — încearcă din nou" :
    "Save & Update My AI";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header — William Scott style */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-1">Onboarding Hub</h1>
        <div className="flex items-center justify-between gap-4">
          <p className="text-[13px] text-zinc-500">
            The more you put in, the better your AI gets. Come back and update whenever something changes.
          </p>
          <span className="text-[12px] text-zinc-500 whitespace-nowrap shrink-0">
            {filledCount} forms completed | {progressPct}%
          </span>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saveStatus === "saving"}
        className="w-full py-3 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-colors mb-8 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        {saveBtnLabel}
      </button>

      {/* AI Personalized Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">AI Personalized</span>
          <button
            onClick={handleGenerateSummary}
            disabled={summaryLoading}
            className="text-[11px] text-zinc-400 hover:text-zinc-100 border border-white/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
          >
            {summaryLoading ? "Generating..." : "↺ Regenerate"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-4">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Niche</p>
            {aiSummary ? (
              <p className="text-sm text-zinc-300 leading-relaxed">{aiSummary.niche}</p>
            ) : (
              <p className="text-sm text-zinc-600">Fill in fields below and click Regenerate.</p>
            )}
          </div>
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-4">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Ideal Client</p>
            {aiSummary ? (
              <p className="text-sm text-zinc-300 leading-relaxed">{aiSummary.ideal_client}</p>
            ) : (
              <p className="text-sm text-zinc-600">Fill in fields below and click Regenerate.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sections Accordion */}
      <div className="space-y-2">
        {SECTIONS.map((section) => {
          const filled = section.fields.filter((f) => data[f.key]?.trim().length > 0).length;
          const isOpen = openSection === section.id;
          const allFilled = filled === section.fields.length;
          return (
            <div key={section.id} className="bg-[#111] border border-white/[0.08] rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors text-left"
                onClick={() => setOpenSection(isOpen ? "" : section.id)}
              >
                <span className="w-6 h-6 rounded-full bg-white/10 text-zinc-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                  {section.num}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-zinc-200 font-medium">{section.title}</span>
                    <span className="text-[11px] text-zinc-600">
                      {allFilled ? `${filled}/${section.fields.length} completed` : `${filled}/${section.fields.length} complete`}
                    </span>
                  </div>
                </div>
                <span className={`text-zinc-500 text-lg leading-none transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-white/[0.08] pt-4">
                  {section.fields.map((field) =>
                    field.textarea ? (
                      <div key={field.key}>
                        <label className="block text-[11px] text-zinc-500 mb-1.5 font-medium">{field.label}</label>
                        <textarea
                          value={data[field.key]}
                          onChange={(e) => handleField(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-white/20 resize-none transition-colors"
                        />
                      </div>
                    ) : (
                      <div key={field.key}>
                        <label className="block text-[11px] text-zinc-500 mb-1.5 font-medium">{field.label}</label>
                        <input
                          type="text"
                          value={data[field.key]}
                          onChange={(e) => handleField(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-white/20 transition-colors"
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save button bottom */}
      <button
        onClick={handleSave}
        disabled={saveStatus === "saving"}
        className="w-full py-3 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-colors mt-6 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        {saveBtnLabel}
      </button>
    </div>
  );
}
