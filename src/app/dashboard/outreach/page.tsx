"use client";

import { useState } from "react";
import { generateDmReply, saveDmTemplate } from "./actions";

interface DailyEntry {
  id: number;
  prospect: string;
  stage: string;
  outcome: "pozitiv" | "neutru" | "negativ";
  notes: string;
  time: string;
}

const KPI_STATS = [
  { label: "DMs Trimise", value: "47", sub: "ultimele 7 zile" },
  { label: "Răspunsuri", value: "18", sub: "38.3% response rate" },
  { label: "Lead-uri Calificate", value: "7", sub: "din 18 conversații" },
  { label: "Apeluri Booked", value: "3", sub: "42.8% qualified→call" },
];

const TEMPLATES = [
  {
    name: "Deschidere — Comentariu",
    stage: "Initial contact",
    preview:
      "Ai comentat la postarea despre [topic]. Ce te-a făcut să comentezi chiar azi?",
  },
  {
    name: "Follow-up 24h",
    stage: "Follow up",
    preview:
      "Revin la mesajul de ieri. Dacă nu e momentul potrivit, nicio problemă — îți respect decizia.",
  },
  {
    name: "Tranziție spre apel",
    stage: "Booking a call",
    preview:
      "Pe baza a ce mi-ai spus, cred că merită 15 minute de diagnostic. Când ești disponibil săptămâna asta?",
  },
  {
    name: "Obiecție preț",
    stage: "Objection",
    preview:
      "Înțeleg — 500 EUR e o decizie. Spune-mi: dacă în 90 de zile ai fi exact omul pe care ți-l dorești, cum s-ar schimba viața ta?",
  },
];

const STAGES = [
  { label: "Initial contact", value: "initial_contact" },
  { label: "Follow up", value: "follow_up" },
  { label: "Booking a call", value: "booking_call" },
  { label: "Objection", value: "objection" },
  { label: "Closing", value: "closing" },
  { label: "Post-apel", value: "post_call" },
];

type Tab = "daily" | "templates" | "generator";

export default function OutreachPage() {
  const [activeTab, setActiveTab] = useState<Tab>("generator");
  const [theirMessage, setTheirMessage] = useState("");
  const [stage, setStage] = useState(STAGES[0].value);
  const [context, setContext] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [dailyLog, setDailyLog] = useState<DailyEntry[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ prospect: "", stage: "initial_contact", outcome: "neutru" as DailyEntry["outcome"], notes: "" });

  const handleGenerate = async () => {
    if (!theirMessage.trim()) return;
    setLoading(true);
    const result = await generateDmReply({ theirMessage, stage, extraContext: context });
    setGeneratedReply(result);
    setLoading(false);
  };

  const TAB_STYLE = (t: Tab) =>
    `text-[12px] px-4 py-2 rounded-lg transition-colors font-medium ${
      activeTab === t
        ? "bg-built-red/15 text-built-red"
        : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
    }`;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] text-built-red font-mono uppercase tracking-widest mb-1">
          Tools · Outreach
        </p>
        <h1 className="text-4xl font-display tracking-[0.06em] text-zinc-100">
          DM OUTREACH
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Generator AI de răspunsuri DM pe metodologia BUILT
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {KPI_STATS.map((k) => (
          <div
            key={k.label}
            className="bg-[#111111] border border-white/10 rounded-xl p-4"
          >
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-mono">
              {k.label}
            </p>
            <p className="text-3xl font-display tracking-wider text-zinc-100 mb-0.5">
              {k.value}
            </p>
            <p className="text-[11px] text-zinc-600">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#111111] border border-white/10 rounded-xl p-1.5 w-fit">
        <button className={TAB_STYLE("daily")} onClick={() => setActiveTab("daily")}>
          Daily Log
        </button>
        <button className={TAB_STYLE("templates")} onClick={() => setActiveTab("templates")}>
          Templates
        </button>
        <button className={TAB_STYLE("generator")} onClick={() => setActiveTab("generator")}>
          ✦ AI Reply Generator
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "generator" && (
        <div className="grid grid-cols-[1fr_1fr] gap-6">
          {/* Input */}
          <div className="space-y-4">
            <div>
              <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono block mb-2">
                Mesajul lor
              </label>
              <textarea
                value={theirMessage}
                onChange={(e) => setTheirMessage(e.target.value)}
                placeholder="Lipește mesajul primit în DM..."
                rows={5}
                className="w-full bg-[#111111] border border-white/10 text-zinc-200 text-[13px] px-4 py-3 rounded-xl focus:outline-none focus:border-built-red/40 placeholder:text-zinc-600 resize-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono block mb-2">
                Stadiul conversației
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 text-zinc-200 text-[13px] px-4 py-3 rounded-xl focus:outline-none focus:border-built-red/40"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono block mb-2">
                Context extra (opțional)
              </label>
              <input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Ex: au comentat la reel-ul despre cortizol"
                className="w-full bg-[#111111] border border-white/10 text-zinc-200 text-[13px] px-4 py-3 rounded-xl focus:outline-none focus:border-built-red/40 placeholder:text-zinc-600"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !theirMessage.trim()}
              className="w-full bg-built-red/10 text-built-red border border-built-red/20 py-3 rounded-xl text-[13px] font-medium hover:bg-built-red/20 transition-colors disabled:opacity-40"
            >
              {loading ? "Generez..." : "✦ Generează Răspuns"}
            </button>
          </div>

          {/* Output */}
          <div>
            <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono block mb-2">
              Răspuns generat
            </label>
            {generatedReply ? (
              <div className="bg-[#111111] border border-white/10 rounded-xl p-5 min-h-[200px]">
                <p className="text-[10px] text-built-red font-mono uppercase tracking-widest mb-3">
                  Generated Reply
                </p>
                <p className="text-zinc-200 text-[13px] leading-relaxed whitespace-pre-line">
                  {generatedReply}
                </p>
                <div className="flex gap-2 mt-5 pt-4 border-t border-white/5">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedReply)}
                    className="text-[11px] text-zinc-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5"
                  >
                    Copiază
                  </button>
                  <button onClick={() => { const name = prompt("Nume template:"); if(name) saveDmTemplate(name, generatedReply); }} className="text-[11px] text-zinc-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5">
                    Salvează ca Template
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="text-[11px] text-built-red border border-built-red/20 px-3 py-1.5 rounded-lg hover:bg-built-red/10"
                  >
                    Regenerează
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#111111] border border-white/10 rounded-xl p-5 min-h-[200px] flex items-center justify-center">
                <p className="text-zinc-700 text-[12px] text-center">
                  Lipește un mesaj și apasă &quot;Generează Răspuns&quot; pentru a vedea răspunsul AI
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="grid grid-cols-2 gap-4">
          {TEMPLATES.map((t, i) => (
            <div
              key={i}
              className="bg-[#111111] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-[13px] text-zinc-200 font-medium">{t.name}</p>
                <span className="text-[10px] bg-white/5 text-zinc-500 px-2 py-0.5 rounded font-mono">
                  {t.stage}
                </span>
              </div>
              <p className="text-[12px] text-zinc-500 leading-relaxed italic mb-3">
                &ldquo;{t.preview}&rdquo;
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setTheirMessage("");
                    setActiveTab("generator");
                  }}
                  className="text-[11px] text-built-red border border-built-red/20 px-2.5 py-1 rounded-lg hover:bg-built-red/10"
                >
                  Folosește
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(t.preview)}
                  className="text-[11px] text-zinc-500 border border-white/10 px-2.5 py-1 rounded-lg hover:bg-white/5"
                >
                  Copiază
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "daily" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono">
              {dailyLog.length} conversații azi
            </p>
            <button
              onClick={() => setShowLogForm(!showLogForm)}
              className="text-[12px] text-built-red border border-built-red/20 px-4 py-2 rounded-lg hover:bg-built-red/10 transition-colors"
            >
              {showLogForm ? "Anulează" : "+ Adaugă Conversație"}
            </button>
          </div>

          {showLogForm && (
            <div className="bg-[#111111] border border-white/10 rounded-xl p-5 space-y-3">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block mb-1">Prospect</label>
                <input
                  value={logForm.prospect}
                  onChange={(e) => setLogForm(f => ({ ...f, prospect: e.target.value }))}
                  placeholder="Nume / @handle"
                  className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[13px] px-3 py-2 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block mb-1">Stadiu</label>
                  <select
                    value={logForm.stage}
                    onChange={(e) => setLogForm(f => ({ ...f, stage: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[13px] px-3 py-2 rounded-lg focus:outline-none"
                  >
                    {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block mb-1">Outcome</label>
                  <select
                    value={logForm.outcome}
                    onChange={(e) => setLogForm(f => ({ ...f, outcome: e.target.value as DailyEntry["outcome"] }))}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[13px] px-3 py-2 rounded-lg focus:outline-none"
                  >
                    <option value="pozitiv">Pozitiv</option>
                    <option value="neutru">Neutru</option>
                    <option value="negativ">Negativ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block mb-1">Note</label>
                <textarea
                  value={logForm.notes}
                  onChange={(e) => setLogForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Ce s-a întâmplat în conversație..."
                  rows={2}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[13px] px-3 py-2 rounded-lg focus:outline-none placeholder:text-zinc-600 resize-none"
                />
              </div>
              <button
                onClick={() => {
                  if (!logForm.prospect.trim()) return;
                  setDailyLog(prev => [...prev, {
                    id: Date.now(),
                    prospect: logForm.prospect,
                    stage: logForm.stage,
                    outcome: logForm.outcome,
                    notes: logForm.notes,
                    time: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
                  }]);
                  setLogForm({ prospect: "", stage: "initial_contact", outcome: "neutru", notes: "" });
                  setShowLogForm(false);
                }}
                disabled={!logForm.prospect.trim()}
                className="w-full bg-built-red/10 text-built-red border border-built-red/20 py-2 rounded-lg text-[13px] font-medium hover:bg-built-red/20 disabled:opacity-40 transition-colors"
              >
                Salvează în Log
              </button>
            </div>
          )}

          {dailyLog.length === 0 && !showLogForm ? (
            <div className="bg-[#111111] border border-white/10 rounded-xl p-8 text-center">
              <p className="text-zinc-600 text-[12px]">Nicio conversație logată azi. Apasă &quot;+ Adaugă Conversație&quot;.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dailyLog.map((entry) => (
                <div key={entry.id} className="bg-[#111111] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-4">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${entry.outcome === "pozitiv" ? "bg-emerald-500" : entry.outcome === "negativ" ? "bg-built-red" : "bg-zinc-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-zinc-200 font-medium">{entry.prospect}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{STAGES.find(s => s.value === entry.stage)?.label ?? entry.stage}</span>
                    </div>
                    {entry.notes && <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{entry.notes}</p>}
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono shrink-0">{entry.time}</span>
                  <button
                    onClick={() => setDailyLog(prev => prev.filter(e => e.id !== entry.id))}
                    className="text-zinc-700 hover:text-zinc-400 text-[16px] shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
