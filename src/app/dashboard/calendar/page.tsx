"use client";

import { useState, useEffect } from "react";
import { generateMonthPlan, generateHookForIdea, type GeneratedIdea } from "./actions";
import {
  listCalendarIdeas,
  addCalendarIdea,
  addCalendarIdeasBatch,
  removeCalendarIdea,
  type CalendarIdea as DBCalendarIdea,
} from "./ideaActions";
import { listInstagramMedia } from "../analytics/actions";

interface CalendarIdea {
  id: string;          // UUID din Supabase
  date: string;
  hook: string;
  format: string;
  cta: string;
  content_pillar: string | null;
  brief?: string | null;
  type: "ai" | "manual";
}

interface InstagramPost {
  instagram_id: string;
  caption: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  posted_at: string | null;
  thumbnail_url: string | null;
  format_type: string | null;
}

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const FORMATS = ["RANT", "TALKING HEAD", "TUTORIAL", "STORY TIME", "TREND", "BTS", "LIST"];

const FORMAT_COLORS: Record<string, string> = {
  "TALKING HEAD": "bg-orange-500",
  RANT: "bg-blue-600",
  TUTORIAL: "bg-purple-600",
  "STORY TIME": "bg-teal-600",
  TREND: "bg-emerald-600",
  BTS: "bg-zinc-500",
  LIST: "bg-indigo-500",
  "BEHIND SCENES": "bg-zinc-500",
  "CLIENT PROOF": "bg-amber-600",
};

const STORAGE_KEY = "built_calendar_ideas";

function formatViews(n: number | null): string {
  if (!n) return "";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [ideas, setIdeas] = useState<CalendarIdea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(true);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<CalendarIdea | null>(null);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);

  // Add idea form state
  const [hook, setHook] = useState("");
  const [format, setFormat] = useState("RANT");
  const [cta, setCta] = useState("DM CULT");
  const [contentBrief, setContentBrief] = useState("");
  const [contentPillar, setContentPillar] = useState("");
  const [hookLoading, setHookLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [planSuccess, setPlanSuccess] = useState(false);

  // Incarca ideile din Supabase la init (nu mai folosim localStorage)
  useEffect(() => {
    listCalendarIdeas()
      .then((data) => {
        setIdeas(data as CalendarIdea[]);
        setIdeasLoading(false);
      })
      .catch(() => setIdeasLoading(false));
    listInstagramMedia(300).then((data) => setPosts(data));
  }, []);

  // saveIdeas eliminat — fiecare operatie merge direct in Supabase

  const getIdeasForDate = (dateStr: string) =>
    ideas.filter((i) => i.date === dateStr);

  const getPostForDate = (dateStr: string): InstagramPost | undefined =>
    posts.find((p) => p.posted_at && p.posted_at.startsWith(dateStr));

  const plannedCount = ideas.length;

  const handlePlanMonth = async () => {
    setPlanLoading(true);
    const existingDates = ideas.map((i) => i.date);
    const result = await generateMonthPlan(year, month, existingDates);
    if (result.ok) {
      // Salveaza toate ideile generate in Supabase (batch)
      const toSave = result.ideas.map((idea: GeneratedIdea) => ({ ...idea, type: "ai" as const }));
      const saved = await addCalendarIdeasBatch(toSave);
      if (saved.ok) {
        // Re-fetch din Supabase pentru a avea UUID-urile corecte
        const fresh = await listCalendarIdeas();
        setIdeas(fresh as CalendarIdea[]);
      }
      setPlanSuccess(true);
      setTimeout(() => {
        setPlanSuccess(false);
        setShowPlanModal(false);
      }, 1500);
    }
    setPlanLoading(false);
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

  const openAddModal = (dateStr: string) => {
    setModalDate(dateStr);
    setHook("");
    setFormat("RANT");
    setCta("DM CULT");
    setContentBrief("");
    setContentPillar("");
    setShowAddModal(true);
  };

  const handleAddIdea = async () => {
    if (!hook.trim()) return;
    const result = await addCalendarIdea({
      date: modalDate,
      hook,
      format,
      cta,
      content_pillar: contentPillar,
      brief: contentBrief,
      type: "manual",
    });
    if (result.ok) {
      setIdeas((prev) => [...prev, result.idea as CalendarIdea]);
    }
    setShowAddModal(false);
  };

  const handleRemoveIdea = async (idea: CalendarIdea) => {
    await removeCalendarIdea(idea.id);
    setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
    setSelectedIdea(null);
  };

  // Calendar grid calculations (Mon-start)
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
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const toDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Content Calendar
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              See what you&apos;ve posted and plan what&apos;s coming next.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Previous nav indicator */}
            <button className="flex items-center gap-1.5 text-zinc-400 text-[13px] px-3 py-2 rounded-lg hover:bg-white/5 border border-white/[0.06] transition-colors">
              <span>←</span>
              <span>Previous</span>
            </button>

            {/* Planned count */}
            <div className="px-3 py-2 border border-white/[0.06] rounded-lg">
              <span className="text-white text-[13px] font-semibold">{plannedCount}</span>
              <span className="text-zinc-500 text-[13px] ml-1">planned</span>
            </div>

            {/* Your Ideas */}
            <button className="flex items-center gap-1.5 text-zinc-400 text-[13px] px-3 py-2 rounded-lg hover:bg-white/5 border border-white/[0.06] transition-colors">
              <span>►</span>
              <span>Your Ideas</span>
            </button>

            {/* Plan this month */}
            <button
              onClick={() => setShowPlanModal(true)}
              disabled={generating}
              className="bg-[#C0392B] text-white text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-[#a93226] transition-colors disabled:opacity-50"
            >
              {generating ? "Generating..." : "Plan this month"}
            </button>

            {/* Add Idea */}
            <button
              onClick={() => openAddModal(toDateStr(today.getDate()))}
              className="bg-[#1a1a1a] border border-white/[0.06] text-zinc-300 text-[13px] px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              + Add Idea
            </button>
          </div>
        </div>

        {/* Calendar container */}
        <div className="bg-[#111] border border-white/[0.06] rounded-xl overflow-hidden">

          {/* Month navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <button
              onClick={prevMonth}
              className="text-zinc-500 hover:text-zinc-200 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            >
              ‹
            </button>
            <span className="text-white text-[15px] font-semibold">
              {MONTHS_EN[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="text-zinc-500 hover:text-zinc-200 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            >
              ›
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/[0.06]">
            {DAYS_EN.map((d) => (
              <div
                key={d}
                className="py-3 text-center text-[11px] text-zinc-600 font-medium uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              const dateStr = day ? toDateStr(day) : "";
              const dayIdeas = day ? getIdeasForDate(dateStr) : [];
              const post = day ? getPostForDate(dateStr) : undefined;
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();
              const isPast = day
                ? new Date(dateStr) < new Date(toDateStr(today.getDate()))
                : false;

              return (
                <div
                  key={idx}
                  className={`min-h-[120px] border-b border-r border-white/[0.06] p-2 relative transition-colors ${
                    day
                      ? "cursor-pointer hover:bg-white/[0.02]"
                      : "bg-[#0d0d0d]"
                  } ${isToday ? "bg-white/[0.03]" : ""} ${
                    isPast && !isToday ? "opacity-70" : ""
                  }`}
                  onClick={() => {
                    if (day) openAddModal(dateStr);
                  }}
                >
                  {day && (
                    <>
                      {/* Day number */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[12px] font-medium ${
                            isToday
                              ? "bg-[#C0392B] text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]"
                              : "text-zinc-500"
                          }`}
                        >
                          {day}
                        </span>
                      </div>

                      {/* Posted reel thumbnail */}
                      {post && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPost(post);
                          }}
                          className="mb-1.5 cursor-pointer group"
                        >
                          {post.thumbnail_url ? (
                            <div className="relative rounded-sm overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={post.thumbnail_url}
                                alt={post.caption ?? "reel"}
                                className="w-full h-16 object-cover group-hover:opacity-80 transition-opacity"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>
                          ) : (
                            <div className="w-full h-14 bg-[#1a1a1a] rounded-sm flex items-center justify-center">
                              <span className="text-zinc-600 text-[10px]">Reel</span>
                            </div>
                          )}
                          {post.views && (
                            <p className="text-[10px] text-zinc-500 mt-0.5 text-center">
                              {formatViews(post.views)} views
                            </p>
                          )}
                        </div>
                      )}

                      {/* Ideas */}
                      <div className="space-y-1">
                        {dayIdeas.map((idea, i) => (
                          <div
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIdea(idea);
                            }}
                            className="relative cursor-pointer group"
                          >
                            <div className={`text-[8px] font-bold px-1.5 py-0.5 rounded text-white inline-block mb-0.5 ${FORMAT_COLORS[idea.format] ?? "bg-zinc-600"}`}>
                              {idea.format.length > 10 ? idea.format.slice(0, 9) + "…" : idea.format}
                            </div>
                            <p className="text-[10px] text-zinc-400 leading-tight line-clamp-2 group-hover:text-zinc-300 transition-colors">
                              {idea.hook.slice(0, 55)}{idea.hook.length > 55 ? "…" : ""}
                            </p>
                            <span className={`absolute top-0 right-0 w-1.5 h-1.5 rounded-full ${idea.type === "ai" ? "bg-blue-500" : "bg-[#C0392B]"}`} />
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

        {/* Legend */}
        <div className="flex items-center gap-5 mt-4 text-[11px] text-zinc-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C0392B]" />
            Manual idea
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            AI planned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-8 h-3 rounded-sm bg-[#1a1a1a] border border-white/10" />
            Posted reel
          </span>
        </div>
      </div>

      {/* ── ADD IDEA MODAL ── */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-[16px] font-semibold text-white">
                  Add your own idea
                </h2>
                <p className="text-[12px] text-zinc-500 mt-0.5 font-mono">
                  {modalDate}
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-600 hover:text-zinc-300 transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* HOOK */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                    HOOK *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateHook}
                    disabled={hookLoading || !contentBrief.trim()}
                    className="px-2.5 py-1 text-[10px] bg-[#C0392B]/10 border border-[#C0392B]/20 text-[#C0392B] rounded-lg hover:bg-[#C0392B]/20 transition-colors disabled:opacity-40 whitespace-nowrap font-medium"
                  >
                    {hookLoading ? "Generating..." : "Generate Hook"}
                  </button>
                </div>
                <textarea
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  placeholder="The opening line that stops the scroll..."
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[13px] px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#C0392B]/40 placeholder:text-zinc-700 resize-none transition-colors"
                />
              </div>

              {/* FORMAT + CTA row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block mb-1.5">
                    FORMAT
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[13px] px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#C0392B]/40 transition-colors"
                  >
                    {FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block mb-1.5">
                    CTA
                  </label>
                  <input
                    type="text"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    placeholder="DM CULT"
                    className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[13px] px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#C0392B]/40 placeholder:text-zinc-700 transition-colors"
                  />
                </div>
              </div>

              {/* BRIEF */}
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block mb-1.5">
                  BRIEF / CONTENT NOTE
                </label>
                <textarea
                  value={contentBrief}
                  onChange={(e) => setContentBrief(e.target.value)}
                  placeholder="What's the story, angle, or key point of this video?"
                  rows={2}
                  className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[13px] px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#C0392B]/40 placeholder:text-zinc-700 resize-none transition-colors"
                />
              </div>

              {/* CONTENT PILLAR */}
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block mb-1.5">
                  CONTENT PILLAR
                </label>
                <input
                  type="text"
                  value={contentPillar}
                  onChange={(e) => setContentPillar(e.target.value)}
                  placeholder="Base Strength, Mindset, ..."
                  className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[13px] px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#C0392B]/40 placeholder:text-zinc-700 transition-colors"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 text-[13px] text-zinc-500 border border-white/10 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddIdea}
                disabled={!hook.trim()}
                className="flex-1 text-[13px] bg-[#C0392B] text-white font-medium py-2.5 rounded-lg hover:bg-[#a93226] transition-colors disabled:opacity-40"
              >
                Add to calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PLAN THIS MONTH MODAL ── */}
      {showPlanModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => !planLoading && setShowPlanModal(false)}
        >
          <div
            className="bg-[#111] border border-white/10 rounded-xl p-8 w-full max-w-md shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {planSuccess ? (
              <>
                <div className="text-4xl mb-3">✓</div>
                <h2 className="text-white text-[18px] font-semibold mb-2">
                  Plan generated!
                </h2>
                <p className="text-zinc-500 text-[13px]">
                  Your content calendar has been filled in.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-white text-[18px] font-semibold mb-2">
                  Plan this month
                </h2>
                <p className="text-zinc-500 text-[13px] mb-6 leading-relaxed">
                  AI will generate a full content plan for{" "}
                  <span className="text-zinc-300 font-medium">
                    {MONTHS_EN[month]} {year}
                  </span>
                  , distributing ideas across all free days. Existing ideas won&apos;t be replaced.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPlanModal(false)}
                    disabled={planLoading}
                    className="flex-1 text-[13px] text-zinc-500 border border-white/10 py-2.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlanMonth}
                    disabled={planLoading}
                    className="flex-1 text-[13px] bg-[#C0392B] text-white font-medium py-2.5 rounded-lg hover:bg-[#a93226] transition-colors disabled:opacity-50"
                  >
                    {planLoading ? "Generating..." : "Generate plan"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── IDEA DETAIL MODAL ── */}
      {selectedIdea && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIdea(null)}
        >
          <div
            className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded text-white ${
                    FORMAT_COLORS[selectedIdea.format] ?? "bg-zinc-600"
                  }`}
                >
                  {selectedIdea.format}
                </span>
                <p className="text-[11px] text-zinc-600 font-mono mt-1">
                  {selectedIdea.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedIdea(null)}
                className="text-zinc-600 hover:text-zinc-300 transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <p className="text-zinc-200 text-[14px] leading-relaxed mb-3">
              {selectedIdea.hook}
            </p>
            {selectedIdea.brief && (
              <p className="text-zinc-500 text-[12px] leading-relaxed mb-3 italic">
                {selectedIdea.brief}
              </p>
            )}
            <div className="flex gap-3 text-[11px] text-zinc-500 mb-5">
              <span>CTA: {selectedIdea.cta}</span>
              {selectedIdea.content_pillar && (
                <>
                  <span>·</span>
                  <span>{selectedIdea.content_pillar}</span>
                </>
              )}
            </div>
            <button
              onClick={() => handleRemoveIdea(selectedIdea)}
              className="text-[11px] text-[#C0392B] border border-[#C0392B]/20 px-3 py-1.5 rounded-lg hover:bg-[#C0392B]/10 transition-colors"
            >
              Remove from calendar
            </button>
          </div>
        </div>
      )}

      {/* ── POSTED REEL DETAIL MODAL ── */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                  Posted Reel
                </span>
                {selectedPost.posted_at && (
                  <p className="text-[11px] text-zinc-600 font-mono mt-0.5">
                    {selectedPost.posted_at.slice(0, 10)}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-zinc-600 hover:text-zinc-300 transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Thumbnail cu fallback — linkurile CDN Instagram expiră după câteva ore */}
            <div className="rounded-lg overflow-hidden mb-4 bg-[#1a1a1a] min-h-[80px] flex items-center justify-center">
              {selectedPost.thumbnail_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`/api/img-proxy?url=${encodeURIComponent(selectedPost.thumbnail_url)}`}
                  alt={selectedPost.caption ?? "reel"}
                  className="w-full object-cover max-h-60"
                  onError={(e) => {
                    const t = e.currentTarget;
                    t.style.display = "none";
                    t.nextElementSibling?.removeAttribute("style");
                  }}
                />
              ) : null}
              <span
                className="text-zinc-600 text-[11px] font-mono"
                style={selectedPost.thumbnail_url ? { display: "none" } : {}}
              >
                No preview
              </span>
            </div>

            {selectedPost.caption && (
              <div className="max-h-32 overflow-y-auto mb-4 pr-1">
                <p className="text-zinc-400 text-[12px] leading-relaxed">
                  {selectedPost.caption}
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-4">
              {selectedPost.views != null && (
                <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                  <p className="text-white text-[15px] font-semibold">
                    {formatViews(selectedPost.views)}
                  </p>
                  <p className="text-zinc-600 text-[10px] mt-0.5">Views</p>
                </div>
              )}
              {selectedPost.likes != null && (
                <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                  <p className="text-white text-[15px] font-semibold">
                    {formatViews(selectedPost.likes)}
                  </p>
                  <p className="text-zinc-600 text-[10px] mt-0.5">Likes</p>
                </div>
              )}
              {selectedPost.comments != null && (
                <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                  <p className="text-white text-[15px] font-semibold">
                    {formatViews(selectedPost.comments)}
                  </p>
                  <p className="text-zinc-600 text-[10px] mt-0.5">Comments</p>
                </div>
              )}
            </div>

            {/* Action buttons — trimite spre uneltele reale */}
            <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
              <a
                href={`/dashboard/reel-copy?url=https://www.instagram.com/reel/${selectedPost.instagram_id}/`}
                className="flex-1 text-center text-[11px] font-medium text-zinc-300 border border-white/10 rounded-lg py-2 hover:bg-white/5 transition-colors"
              >
                ✦ Analizează
              </a>
              <a
                href={`/dashboard/ai?q=${encodeURIComponent("Generează o variație de hook pentru acest reel: " + (selectedPost.caption?.slice(0, 200) ?? ""))}`}
                className="flex-1 text-center text-[11px] font-medium text-zinc-300 border border-white/10 rounded-lg py-2 hover:bg-white/5 transition-colors"
              >
                ↻ Generează variație
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
