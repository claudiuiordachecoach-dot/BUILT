"use client";

import { useState, useEffect, useCallback } from "react";
import { generateMonthPlan, generateHookForIdea, type GeneratedIdea } from "./actions";

interface CalendarIdea {
  date: string;
  hook: string;
  format: string;
  cta: string;
  content_pillar: string;
  type: "ai" | "manual";
}

const MONTHS_RO = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
];
const DAYS_RO = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

const FORMAT_COLORS: Record<string, string> = {
  "TALKING HEAD": "bg-orange-500",
  RANT: "bg-blue-600",
  TUTORIAL: "bg-purple-600",
  "STORY TIME": "bg-teal-600",
  TREND: "bg-emerald-600",
  "BEHIND SCENES": "bg-zinc-500",
  "CLIENT PROOF": "bg-amber-600",
};

const STORAGE_KEY = "built_calendar_ideas";

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [ideas, setIdeas] = useState<CalendarIdea[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<CalendarIdea | null>(null);

  const [hook, setHook] = useState("");
  const [format, setFormat] = useState("TALKING HEAD");
  const [cta, setCta] = useState("DM ARHITECTURĂ");
  const [contentBrief, setContentBrief] = useState("");
  const [contentPillar, setContentPillar] = useState("B — Base Strength");
  const [hookLoading, setHookLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setIdeas(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const saveIdeas = useCallback((newIdeas: CalendarIdea[]) => {
    setIdeas(newIdeas);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIdeas));
    } catch {
      // ignore
    }
  }, []);

  const getIdeasForDate = (dateStr: string) =>
    ideas.filter((i) => i.date === dateStr);

  const handlePlanMonth = async () => {
    setGenerating(true);
    const existingDates = ideas.map((i) => i.date);
    const result = await generateMonthPlan(year, month, existingDates);
    if (result.ok) {
      const newIdeas: CalendarIdea[] = result.ideas.map(
        (idea: GeneratedIdea) => ({ ...idea, type: "ai" as const })
      );
      saveIdeas([...ideas, ...newIdeas]);
    }
    setGenerating(false);
  };

  const handleGenerateHook = async () => {
    if (!contentBrief.trim()) return;
    setHookLoading(true);
    const result = await generateHookForIdea({
      format,
      contentBrief,
      contentPillar,
    });
    if (result.ok) setHook(result.hook);
    setHookLoading(false);
  };

  const handleAddIdea = () => {
    if (!hook.trim()) return;
    const newIdea: CalendarIdea = {
      date: modalDate,
      hook,
      format,
      cta,
      content_pillar: contentPillar,
      type: "manual",
    };
    saveIdeas([...ideas, newIdea]);
    setShowModal(false);
    setHook("");
    setContentBrief("");
  };

  const handleRemoveIdea = (date: string, ideaHook: string) => {
    saveIdeas(ideas.filter((i) => !(i.date === date && i.hook === ideaHook)));
    setSelectedIdea(null);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const firstMonDay = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstMonDay + daysInMonth) / 7) * 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const day = i - firstMonDay + 1;
    cells.push(day >= 1 && day <= daysInMonth ? day : null);
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const toDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[11px] text-built-red font-mono uppercase tracking-widest mb-1">
            Content Calendar
          </p>
          <h1 className="text-4xl font-display tracking-[0.06em] text-zinc-100">
            CONTENT CALENDAR
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Vezi ce ai postat și planifică ce urmează.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#111111] border border-white/10 rounded-xl px-3 py-2">
            <button onClick={prevMonth} className="text-zinc-500 hover:text-zinc-200 px-2">‹</button>
            <span className="text-zinc-200 text-[13px] font-medium px-3 min-w-[140px] text-center">
              {MONTHS_RO[month]} {year}
            </span>
            <button onClick={nextMonth} className="text-zinc-500 hover:text-zinc-200 px-2">›</button>
          </div>
          <button
            onClick={handlePlanMonth}
            disabled={generating}
            className="bg-[#111111] border border-white/10 text-zinc-200 text-[12px] px-4 py-2 rounded-xl hover:bg-white/5 disabled:opacity-50"
          >
            {generating ? "⟳ Generating..." : "✦ Plan this month"}
          </button>
          <button
            onClick={() => { setModalDate(toDateStr(today.getDate())); setShowModal(true); }}
            className="bg-built-red/10 border border-built-red/20 text-built-red text-[12px] px-4 py-2 rounded-xl hover:bg-built-red/20"
          >
            + Add Idea
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-4 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-built-red" /> Idee manuală</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Planificat AI</span>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/10">
          {DAYS_RO.map((d) => (
            <div key={d} className="py-2 text-center text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const dateStr = day ? toDateStr(day) : "";
            const dayIdeas = day ? getIdeasForDate(dateStr) : [];
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            return (
              <div
                key={idx}
                className={`min-h-[100px] border-b border-r border-white/5 p-2 ${
                  day ? "cursor-pointer hover:bg-white/5" : "opacity-20"
                } ${isToday ? "bg-built-red/5" : ""}`}
                onClick={() => {
                  if (day) { setModalDate(dateStr); setShowModal(true); }
                }}
              >
                {day && (
                  <>
                    <span className={`text-[11px] font-mono ${isToday ? "text-built-red font-bold" : "text-zinc-600"}`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayIdeas.map((idea, i) => (
                        <div
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setSelectedIdea(idea); }}
                          className="group relative"
                        >
                          <span className={`inline-block text-[8px] font-bold px-1 py-0.5 rounded text-white ${FORMAT_COLORS[idea.format] ?? "bg-zinc-600"}`}>
                            {idea.format.slice(0, 8)}
                          </span>
                          <p className="text-[10px] text-zinc-400 leading-tight mt-0.5 line-clamp-2">
                            {idea.hook.slice(0, 50)}
                          </p>
                          <span className={`absolute top-0 right-0 w-1.5 h-1.5 rounded-full ${idea.type === "ai" ? "bg-blue-500" : "bg-built-red"}`} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-semibold text-zinc-200">Add your own idea</h2>
                <p className="text-[11px] text-zinc-600 font-mono">{modalDate}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-600 hover:text-zinc-200">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">Hook *</label>
                  <button
                    type="button"
                    onClick={handleGenerateHook}
                    disabled={hookLoading || !contentBrief.trim()}
                    className="shrink-0 px-2.5 py-1 text-[10px] bg-built-red/10 border border-built-red/20 text-built-red rounded-lg hover:bg-built-red/20 transition-colors disabled:opacity-40 whitespace-nowrap"
                  >
                    {hookLoading ? "..." : "⚡ Generate"}
                  </button>
                </div>
                <textarea
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  placeholder="The opening line that stops the scroll..."
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-700 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono block mb-1">Format</label>
                  <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none">
                    {Object.keys(FORMAT_COLORS).map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono block mb-1">CTA</label>
                  <select value={cta} onChange={(e) => setCta(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none">
                    {["DM ARHITECTURĂ", "Comentează BUILT", "Salvează pentru mai târziu", "Apasă follow"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono block mb-1">Angle / Content Brief</label>
                <textarea
                  value={contentBrief}
                  onChange={(e) => setContentBrief(e.target.value)}
                  placeholder="Care e povestea, punctul cheie sau structura acestui video?"
                  rows={2}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none placeholder:text-zinc-700 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono block mb-1">Content Pillar</label>
                <select value={contentPillar} onChange={(e) => setContentPillar(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[12px] px-3 py-2 rounded-lg focus:outline-none">
                  {["B — Base Strength", "U — Unbreakable Capacity", "I — Intelligent Fueling", "L — Lifestyle Integration", "T — Tough Mindset"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 text-[12px] text-zinc-500 border border-white/10 py-2 rounded-lg hover:bg-white/5">Cancel</button>
              <button onClick={handleAddIdea} disabled={!hook.trim()} className="flex-1 text-[12px] bg-built-red/10 text-built-red border border-built-red/20 py-2 rounded-lg hover:bg-built-red/20 disabled:opacity-40">Add to calendar</button>
            </div>
          </div>
        </div>
      )}

      {selectedIdea && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedIdea(null)}>
          <div className="bg-[#111111] border border-white/10 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded text-white ${FORMAT_COLORS[selectedIdea.format] ?? "bg-zinc-600"}`}>
                  {selectedIdea.format}
                </span>
                <p className="text-[11px] text-zinc-600 font-mono mt-1">{selectedIdea.date}</p>
              </div>
              <button onClick={() => setSelectedIdea(null)} className="text-zinc-600 hover:text-zinc-200">✕</button>
            </div>
            <p className="text-zinc-200 text-[14px] leading-relaxed mb-3">{selectedIdea.hook}</p>
            <div className="flex gap-3 text-[11px] text-zinc-500 mb-4">
              <span>CTA: {selectedIdea.cta}</span>
              <span>·</span>
              <span>{selectedIdea.content_pillar}</span>
            </div>
            <button
              onClick={() => handleRemoveIdea(selectedIdea.date, selectedIdea.hook)}
              className="text-[11px] text-built-red border border-built-red/20 px-3 py-1.5 rounded-lg hover:bg-built-red/10"
            >
              Șterge din calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
