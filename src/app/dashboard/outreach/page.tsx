"use client";

import { useState, useEffect } from "react";
import {
  dmCopilot,
  saveDmTemplate,
  calculateLeadScore,
  saveDmLog,
  listDmLogs,
  listDmTemplates,
  type DmLog,
  type DmCopilotResult,
} from "./actions";

interface DailyEntry {
  id: number;
  prospect: string;
  stage: string;
  outcome: "positive" | "neutral" | "negative";
  notes: string;
  time: string;
  score?: number;
  temperature?: string;
  recommendation?: string;
}

interface SavedTemplate {
  id: number;
  name: string;
  stage: string;
  content: string;
}

const STAGES = [
  { label: "Contact inițial", value: "initial_contact" },
  { label: "Follow up", value: "follow_up" },
  { label: "Rezervare apel", value: "booking_call" },
  { label: "Obiecție", value: "objection" },
  { label: "Closing", value: "closing" },
  { label: "Apel preț", value: "price_call" },
];

type Tab = "daily" | "templates" | "generator";

export default function OutreachPage() {
  const [activeTab, setActiveTab] = useState<Tab>("daily");

  // Daily Log state — persisted in Supabase
  const [dailyLog, setDailyLog] = useState<DmLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({
    prospect: "",
    stage: "initial_contact",
    outcome: "neutral" as "positive" | "neutral" | "negative",
    notes: "",
  });
  // DM Co-pilot state
  const [conversation, setConversation] = useState("");
  const [context, setContext] = useState("");
  const [copilot, setCopilot] = useState<DmCopilotResult | null>(null);
  const [copilotError, setCopilotError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copiedReply, setCopiedReply] = useState(false);

  // Templates state
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [copiedTemplateId, setCopiedTemplateId] = useState<number | null>(null);

  // Load logs + templates from Supabase on mount
  useEffect(() => {
    listDmLogs(50).then((logs) => {
      setDailyLog(logs);
      setLogsLoading(false);
    }).catch(() => setLogsLoading(false));

    listDmTemplates().then((tmpl) => {
      setTemplates(tmpl.map((t, i) => ({ id: i, name: t.name, stage: "", content: t.content })));
    }).catch(() => {});
  }, []);

  // KPI computed
  const dmsSent = dailyLog.length;
  const responses = dailyLog.filter((e) => e.outcome !== "negative").length;
  const qualified = dailyLog.filter((e) => e.outcome === "positive").length;
  const responseRate = dmsSent > 0 ? Math.round((responses / dmsSent) * 100) : 0;

  const KPI_STATS = [
    { label: "DM-URI TRIMISE (7Z)", value: dmsSent },
    { label: "RĂSPUNSURI (7Z)", value: responses },
    { label: "LEADURI CALIFICATE (7Z)", value: qualified },
    { label: "RATĂ RĂSPUNS", value: `${responseRate}%` },
  ];

  const TAB_STYLE = (t: Tab) =>
    `text-[13px] px-5 py-2 rounded-lg transition-colors font-medium ${
      activeTab === t
        ? "bg-white/10 text-zinc-100"
        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
    }`;

  const handleGenerate = async () => {
    if (!conversation.trim()) return;
    setGenerating(true);
    setCopilotError(null);
    const result = await dmCopilot({ conversation, extraContext: context });
    if (result.ok) setCopilot(result.data);
    else setCopilotError(result.error);
    setGenerating(false);
  };

  const handleCopyReply = () => {
    if (!copilot) return;
    navigator.clipboard.writeText(copilot.reply);
    setCopiedReply(true);
    setTimeout(() => setCopiedReply(false), 2000);
  };

  const handleSaveAsTemplate = async () => {
    if (!copilot?.reply.trim()) return;
    const name = window.prompt("Numele template-ului:");
    if (!name?.trim()) return;
    await saveDmTemplate(name.trim(), copilot.reply);
    setTemplates((prev) => [
      ...prev,
      { id: Date.now(), name: name.trim(), stage: copilot.phase, content: copilot.reply },
    ]);
  };

  const handleCopyTemplate = (t: SavedTemplate) => {
    navigator.clipboard.writeText(t.content);
    setCopiedTemplateId(t.id);
    setTimeout(() => setCopiedTemplateId(null), 2000);
  };

  const handleAddLog = async () => {
    if (!logForm.prospect.trim()) return;
    const { score, temperature, recommendation } = await calculateLeadScore({
      prospect: logForm.prospect,
      stage: logForm.stage,
      outcome: logForm.outcome,
      recentMessagesCount: 2,
    });

    // Salveaza in Supabase — persista la refresh si pe orice device
    const result = await saveDmLog({
      prospect: logForm.prospect,
      stage: logForm.stage,
      outcome: logForm.outcome,
      notes: logForm.notes,
      score,
      temperature,
      recommendation,
    });

    if (result.ok) {
      setDailyLog((prev) => [result.log, ...prev]);
    }

    setLogForm({ prospect: "", stage: "initial_contact", outcome: "neutral", notes: "" });
    setShowLogForm(false);
  };

  const outcomeColor = (o: string) =>
    o === "positive" ? "bg-emerald-500" : o === "negative" ? "bg-built-red" : "bg-zinc-500";

  return (
    <div className="p-8 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display tracking-[0.06em] text-zinc-100 mb-2">
          Outreach
        </h1>
        <p className="text-zinc-500 text-sm">
          Loghează DM-urile zilnice, generează răspunsuri și salvează-ți cele mai bune template-uri.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {KPI_STATS.map((k) => (
          <div
            key={k.label}
            className="bg-[#111111] border border-white/[0.08] rounded-xl p-5"
          >
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-2">
              {k.label}
            </p>
            <p className="text-3xl font-display tracking-wider text-zinc-100">
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        <button className={TAB_STYLE("daily")} onClick={() => setActiveTab("daily")}>
          Jurnal Zilnic
        </button>
        <button className={TAB_STYLE("templates")} onClick={() => setActiveTab("templates")}>
          Template-uri
        </button>
        <button className={TAB_STYLE("generator")} onClick={() => setActiveTab("generator")}>
          Co-pilot DM
        </button>
      </div>

      {/* Tab: Daily Log */}
      {activeTab === "daily" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowLogForm(true)}
              className="bg-built-red text-white text-[13px] font-medium px-4 py-2.5 rounded-lg hover:bg-built-red/90 transition-colors"
            >
              + Loghează DM-ul de Azi
            </button>
          </div>

          {showLogForm && (
            <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-5 space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block mb-1.5">
                  Prospect
                </label>
                <input
                  value={logForm.prospect}
                  onChange={(e) => setLogForm((f) => ({ ...f, prospect: e.target.value }))}
                  placeholder="Name / @handle"
                  className="w-full bg-[#0a0a0a] border border-white/[0.08] text-zinc-200 text-[13px] px-4 py-2.5 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block mb-1.5">
                    Etapă
                  </label>
                  <select
                    value={logForm.stage}
                    onChange={(e) => setLogForm((f) => ({ ...f, stage: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border border-white/[0.08] text-zinc-200 text-[13px] px-4 py-2.5 rounded-lg focus:outline-none"
                  >
                    {STAGES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block mb-1.5">
                    Rezultat
                  </label>
                  <select
                    value={logForm.outcome}
                    onChange={(e) =>
                      setLogForm((f) => ({ ...f, outcome: e.target.value as DailyEntry["outcome"] }))
                    }
                    className="w-full bg-[#0a0a0a] border border-white/[0.08] text-zinc-200 text-[13px] px-4 py-2.5 rounded-lg focus:outline-none"
                  >
                    <option value="positive">Pozitiv</option>
                    <option value="neutral">Neutru</option>
                    <option value="negative">Negativ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block mb-1.5">
                  Note
                </label>
                <input
                  value={logForm.notes}
                  onChange={(e) => setLogForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Ce s-a întâmplat în conversație..."
                  className="w-full bg-[#0a0a0a] border border-white/[0.08] text-zinc-200 text-[13px] px-4 py-2.5 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-600"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddLog}
                  disabled={!logForm.prospect.trim()}
                  className="bg-built-red text-white text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-built-red/90 disabled:opacity-40 transition-colors"
                >
                  Salvează
                </button>
                <button
                  onClick={() => setShowLogForm(false)}
                  className="text-zinc-500 text-[13px] px-4 py-2 rounded-lg hover:text-zinc-200 transition-colors"
                >
                  Anulează
                </button>
              </div>
            </div>
          )}

          {dailyLog.length === 0 ? (
            <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-12 text-center">
              <p className="text-zinc-500 text-[13px]">
                Niciun DM logat încă — Loghează activitatea zilnică de DM-uri pentru a urmări ratele de răspuns și leadurile calificate.
              </p>
            </div>
          ) : (
            <div className="bg-[#111111] border border-white/[0.08] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-[10px] text-zinc-500 uppercase tracking-widest font-mono px-5 py-3">Prospect</th>
                    <th className="text-left text-[10px] text-zinc-500 uppercase tracking-widest font-mono px-5 py-3">Stage</th>
                    <th className="text-left text-[10px] text-zinc-500 uppercase tracking-widest font-mono px-5 py-3">Outcome</th>
                    <th className="text-left text-[10px] text-zinc-500 uppercase tracking-widest font-mono px-5 py-3">Lead Score</th>
                    <th className="text-left text-[10px] text-zinc-500 uppercase tracking-widest font-mono px-5 py-3">Notes</th>
                    <th className="text-left text-[10px] text-zinc-500 uppercase tracking-widest font-mono px-5 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyLog.map((entry) => (
                    <tr key={entry.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-[13px] text-zinc-200">{entry.prospect}</td>
                      <td className="px-5 py-3">
                        <span className="text-[11px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded font-mono">
                          {STAGES.find((s) => s.value === entry.stage)?.label ?? entry.stage}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${outcomeColor(entry.outcome)}`} />
                          <span className="text-[12px] text-zinc-400 capitalize">{entry.outcome}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {entry.score ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-mono font-bold text-zinc-200">{entry.score}/100</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${entry.temperature === 'Hot' ? 'bg-built-red/20 text-built-red' : entry.temperature === 'Warm' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                              {entry.temperature}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[12px] text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[12px] text-zinc-500 max-w-[250px] truncate">
                        {entry.notes || "—"}
                        {entry.recommendation && (
                          <p className="text-[11px] text-amber-400/90 truncate mt-0.5">✦ {entry.recommendation}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[11px] text-zinc-600 font-mono">
                        {entry.logged_at ? new Date(entry.logged_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: DM Co-pilot */}
      {activeTab === "generator" && (
        <div className="space-y-5">
          <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-5 space-y-4">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-1">
                CO-PILOT DM · pe playbook-ul BUILT
              </p>
              <p className="text-[12px] text-zinc-500">
                Lipește conversația de până acum. AI-ul detectează faza din funnel și-ți dă următorul mesaj, semnalul și ce urmărești.
              </p>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-2">Conversația (prospect ↔ tu)</label>
              <textarea
                value={conversation}
                onChange={(e) => setConversation(e.target.value)}
                placeholder={"Lipește tot schimbul de mesaje. Ex:\nEl: Am comentat PLATOU\nTu: Salut! Ce te-a făcut să comentezi azi?\nEl: Sunt blocat la 95kg de luni bune..."}
                rows={9}
                className="w-full bg-[#0a0a0a] border border-white/[0.08] text-zinc-200 text-[13px] px-4 py-3 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-600 resize-none whitespace-pre-line"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-2">Context extra (opțional)</label>
              <input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="ex. a descărcat ghidul de resetare metabolică"
                className="w-full bg-[#0a0a0a] border border-white/[0.08] text-zinc-200 text-[13px] px-4 py-2.5 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-600"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !conversation.trim()}
              className="w-full bg-built-red text-white py-3 rounded-lg text-[13px] font-medium hover:bg-built-red/90 transition-colors disabled:opacity-40"
            >
              {generating ? "Analizez conversația..." : "✦ Dă-mi următorul mesaj"}
            </button>
          </div>

          {copilotError && (
            <div className="bg-built-red/10 border border-built-red/40 rounded-xl p-4">
              <p className="text-built-red text-[13px]">⚠ {copilotError}</p>
            </div>
          )}

          {copilot && (
            <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-5 space-y-4">
              {/* Faza + semnal */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-mono px-2 py-1 rounded bg-built-red/15 text-built-red">
                  Faza: {copilot.phase}
                </span>
                <span className="text-[12px] text-amber-400/90">✦ {copilot.signal}</span>
              </div>

              {/* Răspunsul */}
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-2">Mesajul de trimis</p>
                <p className="text-zinc-100 text-[14px] leading-relaxed whitespace-pre-line">{copilot.reply}</p>
              </div>

              {/* Ce urmărești */}
              <div className="pt-3 border-t border-white/[0.06]">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-1">Ce urmărești</p>
                <p className="text-[12px] text-zinc-400">{copilot.next_step}</p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  onClick={handleCopyReply}
                  className="text-[12px] text-zinc-300 bg-built-red/15 border border-built-red/30 px-3 py-1.5 rounded-lg hover:bg-built-red/25 transition-colors"
                >
                  {copiedReply ? "Copiat!" : "Copiază mesajul"}
                </button>
                <button
                  onClick={handleSaveAsTemplate}
                  className="text-[12px] text-zinc-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Salvează ca Template
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Templates */}
      {activeTab === "templates" && (
        <div>
          {templates.length === 0 ? (
            <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-12 text-center">
              <p className="text-zinc-500 text-[13px]">
                Niciun template salvat încă — generează un răspuns și salvează-l ca template.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#111111] border border-white/[0.08] rounded-xl p-5 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[13px] text-zinc-200 font-medium">{t.name}</p>
                    <span className="text-[10px] bg-white/5 text-zinc-500 px-2 py-0.5 rounded font-mono shrink-0 ml-2">
                      {t.stage}
                    </span>
                  </div>
                  <p className="text-[12px] text-zinc-500 leading-relaxed line-clamp-3 mb-4">
                    {t.content}
                  </p>
                  <button
                    onClick={() => handleCopyTemplate(t)}
                    className="text-[12px] text-zinc-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {copiedTemplateId === t.id ? "Copiat!" : "Copiază"}
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
