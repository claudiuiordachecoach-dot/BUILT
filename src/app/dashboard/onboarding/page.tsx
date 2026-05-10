"use client";

import { useState, useEffect } from "react";

interface OnboardingData {
  full_name: string;
  age: string;
  location: string;
  experience_years: string;
  revenue_90_days: string;
  revenue_12_months: string;
  followers_goal_90_days: string;
  content_formats: string;
  posting_frequency: string;
  best_performing_content: string;
  biggest_challenge: string;
  what_tried: string;
  ideal_outcome: string;
  ideal_client: string;
  philosophy: string;
  differentiator: string;
  things_disagree_with: string;
  origin_story: string;
  biggest_transformation: string;
  credibility: string;
}

const EMPTY: OnboardingData = {
  full_name: "", age: "", location: "", experience_years: "",
  revenue_90_days: "", revenue_12_months: "", followers_goal_90_days: "",
  content_formats: "", posting_frequency: "", best_performing_content: "",
  biggest_challenge: "", what_tried: "",
  ideal_outcome: "", ideal_client: "",
  philosophy: "", differentiator: "", things_disagree_with: "",
  origin_story: "", biggest_transformation: "", credibility: "",
};

const STORAGE_KEY = "built_onboarding_data";

const SECTIONS = [
  {
    id: "who_you_are",
    title: "Who You Are",
    description: "Bazele. Spune-ne despre tine ca persoană, nu doar ca coach.",
    fields: [
      { key: "full_name", label: "Nume complet", placeholder: "Iordache Claudiu" },
      { key: "age", label: "Vârstă", placeholder: "25" },
      { key: "location", label: "Unde ești bazat", placeholder: "Botoșani, România" },
      { key: "experience_years", label: "Ani de experiență în fitness/coaching", placeholder: "7" },
    ],
  },
  {
    id: "revenue_goals",
    title: "Revenue & Growth Goals",
    description: "Obiective concrete pentru AI.",
    fields: [
      { key: "revenue_90_days", label: "Revenue goal în 90 zile (EUR/lună)", placeholder: "2500" },
      { key: "revenue_12_months", label: "Revenue goal în 12 luni (EUR/lună)", placeholder: "5000" },
      { key: "followers_goal_90_days", label: "Followeri goal în 90 zile", placeholder: "5000" },
    ],
  },
  {
    id: "your_content",
    title: "Your Content",
    description: "Ce tipuri de conținut creezi, cât de des, ce merge.",
    fields: [
      { key: "content_formats", label: "Formate principale", placeholder: "Talking Head, Rant, Tutorial" },
      { key: "posting_frequency", label: "Frecvența postărilor actuale", placeholder: "4-5 reels/săptămână" },
      { key: "best_performing_content", label: "Cel mai bun conținut de până acum (descrie)", placeholder: "Reelul despre cortizol — 14k views", textarea: true },
    ],
  },
  {
    id: "where_stuck",
    title: "Where You're Stuck",
    description: "Sincer. Sistemul îți poate ajuta doar dacă știe blocajele reale.",
    fields: [
      { key: "biggest_challenge", label: "Cel mai mare obstacol acum", placeholder: "Conversie din DM în call", textarea: true },
      { key: "what_tried", label: "Ce ai încercat și nu a funcționat", placeholder: "Cold DM, reduceri de preț", textarea: true },
    ],
  },
  {
    id: "what_you_want",
    title: "What You Want",
    description: "Specific. Ce înseamnă succesul pentru tine?",
    fields: [
      { key: "ideal_outcome", label: "Cum arată ziua ta ideală în 90 de zile", placeholder: "10 clienți activi la 500 EUR, 2 ore de muncă/zi pe sistem", textarea: true },
      { key: "ideal_client", label: "Descrie clientul ideal", placeholder: "Bărbat 30-40 ani, IT sau antreprenor, familie, 15+ kg de dat jos, bani dar fără timp, a mai eșuat", textarea: true },
    ],
  },
  {
    id: "mindset_opinions",
    title: "Mindset & Opinions",
    description: "Credințele tale. Ce face conținutul tău diferit.",
    fields: [
      { key: "philosophy", label: "Filozofia ta despre fitness (2-3 propoziții)", placeholder: "Eșecul nu vine din lipsă de voință — vine din lipsă de sistem.", textarea: true },
      { key: "differentiator", label: "Ce face BUILT diferit de orice alt program", placeholder: "Nu vindem motivație. Vindem arhitectură.", textarea: true },
      { key: "things_disagree_with", label: "Cu ce nu ești de acord în industria fitness", placeholder: "Cardio excesiv, deficit agresiv, motivație fără sistem", textarea: true },
    ],
  },
  {
    id: "your_story",
    title: "Your Story",
    description: "Credibilitatea ta. Ce ai trăit tu însuți.",
    fields: [
      { key: "origin_story", label: "Povestea ta de origine — de unde ai pornit", placeholder: "Am ajuns la 120kg, bâlbâit, fără identitate...", textarea: true },
      { key: "biggest_transformation", label: "Cea mai mare transformare a ta", placeholder: "Am slăbit 40kg și am ajuns vicecampion național la atletism", textarea: true },
      { key: "credibility", label: "Dovezi de credibilitate (titluri, ani, clienți, rezultate)", placeholder: "7 ani experiență, hibrid athlete, clienți cu -8kg în 11 săptămâni", textarea: true },
    ],
  },
];

function countFilled(data: OnboardingData): number {
  return Object.values(data).filter((v) => v.trim().length > 0).length;
}

const TOTAL_FIELDS = Object.keys(EMPTY).length;

export default function OnboardingPage() {
  const [data, setData] = useState<OnboardingData>(EMPTY);
  const [openSection, setOpenSection] = useState<string>("who_you_are");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setData(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const update = (key: keyof OnboardingData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // ignore
    }
  };

  const filled = countFilled(data);
  const pct = Math.round((filled / TOTAL_FIELDS) * 100);

  const aiPreview = {
    niche: data.philosophy || "Te ajut profesioniștii ocupați să-și reconstruiască corpul în 90 de zile fără să sacrifice cariera.",
    idealClient: data.ideal_client || "Bărbați 28-42 ani, profesioniști/antreprenori cu corp uitat pe drum. Au burtă, frustrări, au mai eșuat. Au nevoie de sistem, nu motivație.",
  };

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      <div className="mb-6">
        <p className="text-[11px] text-built-red font-mono uppercase tracking-widest mb-1">
          Admin · My Profile
        </p>
        <h1 className="text-4xl font-display tracking-[0.06em] text-zinc-100">
          ONBOARDING HUB
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Cu cât completezi mai mult, cu atât AI-ul devine mai precis. Revino și actualizează când ceva se schimbă.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-[11px] text-zinc-500 mb-1.5">
          <span>{filled} câmpuri completate</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full">
          <div
            className="h-full bg-built-red rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-zinc-200 text-zinc-900 text-[13px] font-semibold py-3 rounded-xl mb-6 hover:bg-white transition-colors"
      >
        {saved ? "✓ Salvat — AI-ul a fost actualizat" : "⟳ Save & Update My AI"}
      </button>

      {(data.philosophy || data.ideal_client) && (
        <div className="bg-[#111111] border border-built-red/20 rounded-xl p-5 mb-6">
          <p className="text-[10px] text-built-red font-mono uppercase tracking-widest mb-3">
            AI Personalised
          </p>
          <div className="grid grid-cols-2 gap-4 text-[12px]">
            <div>
              <p className="text-zinc-600 uppercase tracking-widest text-[10px] font-mono mb-1">Nișă</p>
              <p className="text-zinc-300 leading-relaxed">{aiPreview.niche}</p>
            </div>
            <div>
              <p className="text-zinc-600 uppercase tracking-widest text-[10px] font-mono mb-1">Client Ideal</p>
              <p className="text-zinc-300 leading-relaxed">{aiPreview.idealClient}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {SECTIONS.map((section) => {
          const sectionFields = section.fields.map((f) => f.key as keyof OnboardingData);
          const sectionFilled = sectionFields.filter((k) => data[k]?.trim().length > 0).length;
          const isOpen = openSection === section.id;

          return (
            <div key={section.id} className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
                onClick={() => setOpenSection(isOpen ? "" : section.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-600 font-mono w-6 text-right">
                    {sectionFilled}/{section.fields.length}
                  </span>
                  <span className="text-[13px] text-zinc-200 font-medium">{section.title}</span>
                </div>
                <span className={`text-zinc-500 transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                  <p className="text-zinc-600 text-[12px]">{section.description}</p>
                  {section.fields.map((field) => {
                    const k = field.key as keyof OnboardingData;
                    return (
                      <div key={field.key}>
                        <label className="text-[11px] text-zinc-500 font-mono block mb-1.5">
                          {field.label}
                        </label>
                        {"textarea" in field && field.textarea ? (
                          <textarea
                            value={data[k]}
                            onChange={(e) => update(k, e.target.value)}
                            placeholder={field.placeholder}
                            rows={3}
                            className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-700 resize-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={data[k]}
                            onChange={(e) => update(k, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-700"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        className="w-full mt-6 bg-zinc-200 text-zinc-900 text-[13px] font-semibold py-3 rounded-xl hover:bg-white transition-colors"
      >
        {saved ? "✓ Salvat" : "⟳ Save & Update My AI"}
      </button>
    </div>
  );
}
