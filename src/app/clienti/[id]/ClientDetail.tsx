"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { submitCheckin, updateClientStatus, inviteClient, deleteCheckin, generateCheckinFeedbackDraft, saveCheckinFeedback, saveTargetWeight, type Client, type CheckIn, type ClientStatus, type ClientModule, type IntakeRecord, getClientModules, saveClientModule, deleteClientModule } from "../actions";
import { CopyIntakeLink } from "./CopyIntakeLink";
import { ALL_INTAKE_FIELDS } from "@/app/fisa-start/[token]/fields";
import { saveWorkoutPlan, saveNutritionPlan, sendAdminMessage, getClientMessages, setAdminViewClient } from "@/app/client/actions";

const STATUS_OPTIONS: { id: ClientStatus; label: string }[] = [
  { id: "active", label: "Activ" }, { id: "at_risk", label: "La risc" },
  { id: "paused", label: "Pauză" }, { id: "completed", label: "Finalizat" },
];

const weeksSince = (start: string) => Math.max(1, Math.floor((Date.now() - new Date(start).getTime()) / (7 * 24 * 3600 * 1000)));

const TABS = [
  { id: "profile", label: "Profil & Progres" },
  { id: "intake", label: "Fișa de Start" },
  { id: "checkin", label: "Check-in" },
  { id: "workout", label: "Plan Antrenament" },
  { id: "nutrition", label: "Plan Nutrițional" },
  { id: "modules", label: "Module (Academia)" },
  { id: "messages", label: "Mesaje" },
];

export function ClientDetail({ client, initialCheckins, intake, intakeToken }: { client: Client; initialCheckins: CheckIn[]; intake?: IntakeRecord | null; intakeToken?: string | null }) {
  const [checkins, setCheckins] = useState(initialCheckins);
  const [form, setForm] = useState({ training: 80, nutrition: 80, energy: 7, sleep: 7.5, hydration: 2.5, stress: 4, notes: "" });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ClientStatus>(client.status);
  const [activeTab, setActiveTab] = useState("checkin");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [draftState, setDraftState] = useState<Record<number, { loading: boolean; text: string; sent: boolean }>>({});
  const [targetWeight, setTargetWeight] = useState<string>(client.target_weight_kg != null ? String(client.target_weight_kg) : "");
  const [targetSaved, setTargetSaved] = useState(false);

  function handleSaveTarget() {
    const val = targetWeight.trim() === "" ? null : parseFloat(targetWeight);
    startTransition(async () => {
      await saveTargetWeight(client.id, val);
      setTargetSaved(true);
      setTimeout(() => setTargetSaved(false), 2000);
    });
  }

  const numericClientId = client.id;
  const currentWeek = weeksSince(client.start_date);

  function handleCheckin() {
    setError(null); setFeedback(null);
    startTransition(async () => {
      const r = await submitCheckin(client.id, { week: currentWeek, training: form.training, nutrition: form.nutrition, energy: form.energy, sleep: form.sleep, hydration: form.hydration, stress: form.stress, notes: form.notes });
      if (r.ok) { setFeedback(r.feedback); setCheckins((prev) => [{ id: Date.now(), client_id: client.id, week_number: currentWeek, training_adherence: form.training, nutrition_adherence: form.nutrition, energy_level: form.energy, sleep_hours: form.sleep, hydration_l: form.hydration, stress_level: form.stress, notes: form.notes, ai_feedback: r.feedback, created_at: new Date().toISOString() } as CheckIn, ...prev]); }
      else setError(r.error);
    });
  }

  function handleStatusChange(s: ClientStatus) {
    setStatus(s);
    startTransition(async () => { await updateClientStatus(client.id, s); });
  }

  async function handleGenerateDraft(checkin: CheckIn) {
    setDraftState(prev => ({ ...prev, [checkin.id]: { loading: true, text: "", sent: false } }));
    const r = await generateCheckinFeedbackDraft(client.id, checkin);
    setDraftState(prev => ({
      ...prev,
      [checkin.id]: { loading: false, text: r.ok && r.draft ? r.draft : "Eroare la generare.", sent: false },
    }));
  }

  async function handleSendFeedback(checkinId: number) {
    const draft = draftState[checkinId];
    if (!draft?.text) return;
    const r = await saveCheckinFeedback(checkinId, client.id, draft.text);
    if (r.ok) {
      setDraftState(prev => ({ ...prev, [checkinId]: { ...prev[checkinId], sent: true } }));
      setCheckins(prev => prev.map(c => c.id === checkinId ? { ...c, ai_feedback: draft.text } : c));
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-8 pb-12">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl tracking-wider text-built-white">{client.name}</h1>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as ClientStatus)}
              className="bg-[#111111] border border-white/10 text-zinc-400 text-xs px-2 py-1 rounded focus:outline-none focus:border-built-red font-condensed uppercase tracking-wider cursor-pointer"
            >
              {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          {client.email && <p className="text-built-gray-text text-sm mt-1">{client.email}</p>}
        </div>
        <div className="flex gap-2 items-center">
          <a
            href={`/api/admin/view-as-client?clientId=${numericClientId}`}
            className="px-3 py-1.5 font-condensed text-[10px] border border-built-red/40 text-built-red hover:bg-built-red/10 transition-colors flex items-center gap-1.5 uppercase"
          >
            <span>◈</span> View as Client
          </a>
          {(!client.status || client.status === "active") && (
            <button
              onClick={async () => {
                setInviting(true); setInviteMsg(null);
                const r = await inviteClient(client.id);
                setInviting(false);
                setInviteMsg(r.ok ? `✓ Invitație trimisă` : `✖ Eroare`);
                setTimeout(() => setInviteMsg(null), 5000);
              }}
              disabled={inviting}
              className="px-3 py-1.5 font-condensed text-[10px] border border-zinc-600 text-zinc-400 hover:border-built-red hover:text-built-red transition-colors disabled:opacity-50 uppercase"
            >
              {inviting ? "Se trimite..." : "✉ Invită"}
            </button>
          )}
          {inviteMsg && (
            <span className={`text-[10px] font-condensed ${inviteMsg.startsWith("✓") ? "text-emerald-400" : "text-orange-400"}`}>
              {inviteMsg}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[["Săptămâna", currentWeek], ["Check-in-uri", checkins.length], ["Start", new Date(client.start_date).toLocaleDateString("ro-RO")]].map(([l, v]) => (
          <div key={l} className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
            <p className="font-condensed text-[10px] text-built-gray-text uppercase">{l}</p>
            <p className="font-display text-2xl text-built-red mt-1">{v}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-built-gray-2 overflow-x-auto scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-condensed text-xs uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${activeTab === tab.id ? "text-built-red border-b-2 border-built-red" : "text-built-gray-text hover:text-built-white"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Profil & Progres */}
      {activeTab === "profile" && (
        <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm space-y-8 mb-6">
          <div>
            <h3 className="font-display text-xl tracking-wider mb-3">Foaia de Parcurs (Obiective)</h3>
            <div className="bg-[#111111] border border-white/10 rounded-lg p-5">
              <p className="text-sm text-zinc-300 leading-relaxed">
                {client.objectives || "Niciun obiectiv setat încă."}
              </p>
            </div>
          </div>
          
          {checkins.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl tracking-wider">Trend Progres</h3>

              <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider">Performanță</p>
              <div className="bg-[#111111] border border-white/10 rounded-sm p-4" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...checkins].reverse()} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week_number" tick={{ fill: "#71717a", fontSize: 10 }} tickFormatter={(v: number) => `S${v}`} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4 }}
                      labelStyle={{ color: "#a1a1aa", fontSize: 10 }}
                      itemStyle={{ fontSize: 11 }}
                      labelFormatter={(v) => `Săptămâna ${v}`}
                      formatter={(value: unknown, name: unknown) => [`${value}%`, name as string]}
                    />
                    <Line type="monotone" dataKey="training_adherence" stroke="#C0392B" strokeWidth={2} dot={{ r: 3, fill: "#C0392B" }} name="Antrenament" />
                    <Line type="monotone" dataKey="nutrition_adherence" stroke="#a1a1aa" strokeWidth={2} dot={{ r: 3, fill: "#a1a1aa" }} name="Nutriție" />
                    <Line type="monotone" dataKey={(d: CheckIn) => d.energy_level * 10} stroke="#e4e4e7" strokeWidth={2} dot={{ r: 3, fill: "#e4e4e7" }} name="Energie" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4">
                {([["#C0392B", "Antrenament %"], ["#a1a1aa", "Nutriție %"], ["#e4e4e7", "Energie ×10"]] as [string, string][]).map(([color, label]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5" style={{ backgroundColor: color }} />
                    <span className="text-[10px] text-zinc-500">{label}</span>
                  </div>
                ))}
              </div>

              <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider pt-2">Lifestyle</p>
              <div className="bg-[#111111] border border-white/10 rounded-sm p-4" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...checkins].reverse()} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week_number" tick={{ fill: "#71717a", fontSize: 10 }} tickFormatter={(v: number) => `S${v}`} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4 }}
                      labelStyle={{ color: "#a1a1aa", fontSize: 10 }}
                      itemStyle={{ fontSize: 11 }}
                      labelFormatter={(v) => `Săptămâna ${v}`}
                      formatter={(value: unknown, name: unknown) => {
                        const v = Number(value);
                        if (name === "Somn") return [`${(v * 12 / 100).toFixed(1)}h`, name as string];
                        if (name === "Hidratare") return [`${(v * 6 / 100).toFixed(1)}L`, name as string];
                        if (name === "Stres") return [`${(v / 10).toFixed(0)}/10`, name as string];
                        return [`${v}`, name as string];
                      }}
                    />
                    <Line type="monotone" dataKey={(d: CheckIn) => d.sleep_hours != null ? (d.sleep_hours / 12) * 100 : null} stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: "#60a5fa" }} name="Somn" connectNulls={false} />
                    <Line type="monotone" dataKey={(d: CheckIn) => d.hydration_l != null ? (d.hydration_l / 6) * 100 : null} stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: "#34d399" }} name="Hidratare" connectNulls={false} />
                    <Line type="monotone" dataKey={(d: CheckIn) => d.stress_level != null ? d.stress_level * 10 : null} stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: "#f97316" }} name="Stres" connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4">
                {([["#60a5fa", "Somn (max 12h)"], ["#34d399", "Hidratare (max 6L)"], ["#f97316", "Stres /10"]] as [string, string][]).map(([color, label]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5" style={{ backgroundColor: color }} />
                    <span className="text-[10px] text-zinc-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-display text-xl tracking-wider mb-3">Obiectiv de Greutate</h3>
            <div className="bg-[#111111] border border-white/10 rounded-lg p-5">
              <p className="text-[11px] text-built-gray-text mb-3">
                Ținta apare ca bară de progres în profilul clientului (start → actuală → țintă).
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="Ex: 72"
                  className="w-32 bg-black/50 border border-white/10 rounded text-sm p-2 text-white focus:outline-none focus:border-built-red"
                />
                <span className="text-sm text-zinc-400">kg</span>
                <button
                  onClick={handleSaveTarget}
                  disabled={isPending}
                  className="px-4 py-2 bg-built-red hover:bg-red-700 text-white text-xs uppercase tracking-wider rounded transition-colors disabled:opacity-50"
                >
                  {targetSaved ? "Salvat ✓" : "Salvează"}
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl tracking-wider mb-3">Galeria de Progres (Foto)</h3>
            <p className="text-[11px] text-built-gray-text">
              Pozele de progres se adaugă de către client din portalul lui (Profilul Meu → Galeria de Progres), cu upload direct de pe telefon.
            </p>
          </div>
        </div>
      )}

      {/* Tab: Fișa de Start */}
      {activeTab === "intake" && (
        <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl tracking-wider">Fișa de Start</h3>
            {intakeToken && <CopyIntakeLink token={intakeToken} />}
          </div>
          {intake ? (
            <div className="space-y-3">
              <p className="font-condensed text-[10px] uppercase tracking-wider text-zinc-500 mb-4">
                Completată {new Date(intake.submitted_at).toLocaleDateString("ro-RO")}
              </p>
              {ALL_INTAKE_FIELDS.map((f) => {
                const val = intake.answers?.[f.key];
                if (!val) return null;
                return (
                  <div key={f.key} className="bg-[#111111] border border-white/10 rounded-lg p-4">
                    <p className="font-condensed text-[10px] uppercase tracking-wider text-built-red mb-1">{f.label}</p>
                    <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">{val}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              Clientul nu a completat încă Fișa de Start. Copiază linkul și trimite-i-l pe WhatsApp.
            </p>
          )}
        </div>
      )}

      {/* Tab: Check-in */}
      {activeTab === "checkin" && (
        <>
          <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm mb-6">
            <h3 className="font-display text-xl tracking-wider mb-4">Check-in săptămâna {currentWeek}</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
              {/* Row 1 — Aderență */}
              {([
                ["Antrenament", "training", 0, 100, "%"],
                ["Nutriție",    "nutrition", 0, 100, "%"],
              ] as [string, string, number, number, string][]).map(([l, k, min, max, unit]) => (
                <div key={k}>
                  <div className="flex justify-between mb-1">
                    <p className="font-condensed text-[10px] text-built-gray-text uppercase">{l}</p>
                    <span className="font-condensed text-[10px] text-built-red">{(form as unknown as Record<string, number>)[k]}{unit}</span>
                  </div>
                  <input type="range" min={min} max={max} step={5} value={(form as unknown as Record<string, number>)[k]}
                    onChange={(e) => setForm((f) => ({ ...f, [k]: Number(e.target.value) }))}
                    className="w-full accent-built-red" />
                </div>
              ))}
              {/* Row 2 — Energie + Somn */}
              {([
                ["Energie",  "energy",    1, 10,  "/10"],
                ["Somn",     "sleep",     0, 12,  " ore"],
              ] as [string, string, number, number, string][]).map(([l, k, min, max, unit]) => (
                <div key={k}>
                  <div className="flex justify-between mb-1">
                    <p className="font-condensed text-[10px] text-built-gray-text uppercase">{l}</p>
                    <span className="font-condensed text-[10px] text-built-red">{(form as unknown as Record<string, number>)[k]}{unit}</span>
                  </div>
                  <input type="range" min={min} max={max} step={k === "sleep" ? 0.5 : 1} value={(form as unknown as Record<string, number>)[k]}
                    onChange={(e) => setForm((f) => ({ ...f, [k]: Number(e.target.value) }))}
                    className="w-full accent-built-red" />
                </div>
              ))}
              {/* Row 3 — Hidratare + Stres */}
              {([
                ["Hidratare", "hydration", 0, 5,   "L"],
                ["Stres",     "stress",    1, 10,  "/10"],
              ] as [string, string, number, number, string][]).map(([l, k, min, max, unit]) => (
                <div key={k}>
                  <div className="flex justify-between mb-1">
                    <p className="font-condensed text-[10px] text-built-gray-text uppercase">{l}</p>
                    <span className="font-condensed text-[10px] text-built-red">{(form as unknown as Record<string, number>)[k]}{unit}</span>
                  </div>
                  <input type="range" min={min} max={max} step={k === "hydration" ? 0.25 : 1} value={(form as unknown as Record<string, number>)[k]}
                    onChange={(e) => setForm((f) => ({ ...f, [k]: Number(e.target.value) }))}
                    className="w-full accent-built-red" />
                </div>
              ))}
            </div>
            <div className="mb-4">
              <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-1">Note (cum a mers săptămâna?)</p>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3}
                className="w-full bg-built-black border border-built-gray-2 text-built-white text-sm p-3 resize-none focus:outline-none focus:border-built-red" />
            </div>
            {error && <p className="text-built-red font-condensed text-xs mb-2">{error}</p>}
            <button type="button" onClick={handleCheckin} disabled={isPending}
              className="px-6 py-2.5 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs disabled:opacity-50">
              {isPending ? "Procesează... (~10s)" : "Trimite check-in + feedback AI →"}
            </button>
          </div>

          {feedback && (
            <div className="p-6 bg-built-gray-1 border border-built-red/50 rounded-sm mb-6">
              <p className="font-condensed text-[10px] text-built-red uppercase mb-2">Feedback AI (Skill 3)</p>
              <p className="text-sm text-built-white leading-relaxed whitespace-pre-wrap">{feedback}</p>
            </div>
          )}

          {checkins.length > 0 && (
            <div>
              <h3 className="font-condensed text-[11px] text-built-gray-text uppercase tracking-wider mb-3">Istoric check-in-uri</h3>
              <div className="space-y-3">
                {checkins.map((c) => (
                  <div key={c.id} className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm relative">
                    <div className="flex items-center flex-wrap gap-3 mb-2 pr-6">
                      <span className="font-condensed text-xs text-built-red">Săpt. {c.week_number}</span>
                      <span className="font-condensed text-[10px] text-built-gray-text">Antren: {c.training_adherence}%</span>
                      <span className="font-condensed text-[10px] text-built-gray-text">Nutriție: {c.nutrition_adherence}%</span>
                      <span className="font-condensed text-[10px] text-built-gray-text">Energie: {c.energy_level}/10</span>
                      {c.sleep_hours != null && <span className="font-condensed text-[10px] text-built-gray-text">Somn: {c.sleep_hours}h</span>}
                      {c.hydration_l != null && <span className="font-condensed text-[10px] text-built-gray-text">Hidratare: {c.hydration_l}L</span>}
                      {c.stress_level != null && <span className="font-condensed text-[10px] text-built-gray-text">Stres: {c.stress_level}/10</span>}
                    </div>
                    <button onClick={async () => {
                      if (confirm("Sigur vrei să ștergi acest check-in?")) {
                        const r = await deleteCheckin(c.id, client.id);
                        if (r.ok) setCheckins(prev => prev.filter(x => x.id !== c.id));
                        else toast.error("Eroare la ștergere: " + r.error);
                      }
                    }} className="absolute top-4 right-4 text-zinc-500 hover:text-built-red text-xs">
                      ✕
                    </button>
                    {c.notes && <p className="text-xs text-built-white/70 mb-2">Note: {c.notes}</p>}
                    {c.ai_feedback ? (
                      <p className="text-xs text-built-gray-text border-t border-built-gray-2/50 pt-2">{c.ai_feedback}</p>
                    ) : (
                      <div className="border-t border-built-gray-2/50 pt-2">
                        {!draftState[c.id] ? (
                          <button
                            onClick={() => handleGenerateDraft(c)}
                            className="font-condensed text-[10px] text-built-red uppercase hover:underline tracking-wider"
                          >
                            Draft AI →
                          </button>
                        ) : draftState[c.id].loading ? (
                          <p className="font-condensed text-[10px] text-built-gray-text animate-pulse">Generează draft...</p>
                        ) : draftState[c.id].sent ? (
                          <p className="font-condensed text-[10px] text-emerald-400">✓ Trimis clientului</p>
                        ) : (
                          <div className="space-y-2">
                            <textarea
                              value={draftState[c.id].text}
                              onChange={e => setDraftState(prev => ({ ...prev, [c.id]: { ...prev[c.id], text: e.target.value } }))}
                              rows={4}
                              className="w-full bg-built-black border border-built-gray-2 text-built-white text-xs p-2 resize-none focus:outline-none focus:border-built-red"
                            />
                            <button
                              onClick={() => handleSendFeedback(c.id)}
                              className="font-condensed text-[10px] bg-built-red text-white px-3 py-1.5 uppercase tracking-wider hover:bg-built-red/80 transition-colors"
                            >
                              Trimite clientului →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab: Plan Antrenament */}
      {activeTab === "workout" && (
        <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm">
          <h3 className="font-display text-xl tracking-wider mb-4">Plan Antrenament</h3>
          <WorkoutPlanEditor clientId={numericClientId} />
        </div>
      )}

      {/* Tab: Plan Nutrițional */}
      {activeTab === "nutrition" && (
        <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm">
          <h3 className="font-display text-xl tracking-wider mb-4">Plan Nutrițional</h3>
          <NutritionPlanEditor clientId={numericClientId} />
        </div>
      )}

      {/* Tab: Module */}
      {activeTab === "modules" && (
        <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm">
          <h3 className="font-display text-xl tracking-wider mb-4">Module Educaționale</h3>
          <ClientModuleManager clientId={numericClientId} />
        </div>
      )}

      {/* Tab: Mesaje */}
      {activeTab === "messages" && (
        <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm">
          <h3 className="font-display text-xl tracking-wider mb-4">Mesaje</h3>
          <AdminMessagesTab clientId={numericClientId} />
        </div>
      )}
    </div>
  );
}

function WorkoutPlanEditor({ clientId }: { clientId: number }) {
  const DAYS = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
  const [activeDay, setActiveDay] = useState("Luni");
  const [days, setDays] = useState<Record<string, {name:string;sets:number;reps:string;note?:string}[]>>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  function addExercise() {
    setDays(d => ({...d, [activeDay]: [...(d[activeDay] ?? []), {name:"",sets:3,reps:"8-12"}]}));
  }
  function updateExercise(i: number, field: string, value: string | number) {
    setDays(d => ({...d, [activeDay]: (d[activeDay] ?? []).map((ex,idx) => idx===i ? {...ex,[field]:value} : ex)}));
  }
  function removeExercise(i: number) {
    setDays(d => ({...d, [activeDay]: (d[activeDay] ?? []).filter((_,idx) => idx!==i)}));
  }
  async function handleSave() {
    setSaving(true);
    await saveWorkoutPlan(clientId, days, notes);
    setSaving(false);
    toast.success("Plan salvat!");
  }

  const exs = days[activeDay] ?? [];
  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {DAYS.map(d => (
          <button key={d} onClick={() => setActiveDay(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeDay===d ? "bg-built-red text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"}`}>
            {d} {(days[d]?.length ?? 0) > 0 ? `(${days[d].length})` : ""}
          </button>
        ))}
      </div>
      <div className="space-y-2 mb-3">
        {exs.map((ex, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={ex.name} onChange={e => updateExercise(i,"name",e.target.value)}
              placeholder="Exercițiu" className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none" />
            <input type="number" value={ex.sets} onChange={e => updateExercise(i,"sets",Number(e.target.value))}
              className="w-16 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none" />
            <input value={ex.reps} onChange={e => updateExercise(i,"reps",e.target.value)}
              placeholder="8-12" className="w-20 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none" />
            <button onClick={() => removeExercise(i)} className="text-zinc-600 hover:text-red-400 text-lg px-1">×</button>
          </div>
        ))}
        <button onClick={addExercise} className="text-xs text-built-red hover:text-built-red/80 transition-colors mt-1">+ Adaugă exercițiu</button>
      </div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
        placeholder="Note generale..." className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 resize-none mb-3 focus:outline-none" />
      <button onClick={handleSave} disabled={saving}
        className="bg-built-red text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-built-red/90 disabled:opacity-50">
        {saving ? "Salvează..." : "Salvează Plan"}
      </button>
    </div>
  );
}

function NutritionPlanEditor({ clientId }: { clientId: number }) {
  const [macros, setMacros] = useState({ calories: 2200, protein_g: 160, carbs_g: 220, fat_g: 70 });
  const [meals, setMeals] = useState<{name:string;foods:string[]}[]>([
    {name:"Mic dejun",foods:[""]},
    {name:"Prânz",foods:[""]},
    {name:"Cină",foods:[""]},
  ]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await saveNutritionPlan(clientId, {...macros, meals, notes});
    setSaving(false);
    toast.success("Plan nutrițional salvat!");
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["calories","protein_g","carbs_g","fat_g"] as const).map(k => (
          <div key={k}>
            <label className="block text-xs text-zinc-500 mb-1">
              {k === "calories" ? "Calorii (kcal)" : k === "protein_g" ? "Proteine (g)" : k === "carbs_g" ? "Carbohidrați (g)" : "Grăsimi (g)"}
            </label>
            <input type="number" value={macros[k]}
              onChange={e => setMacros(m => ({...m,[k]:Number(e.target.value)}))}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none" />
          </div>
        ))}
      </div>
      {meals.map((meal, i) => (
        <div key={i} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <input value={meal.name}
            onChange={e => setMeals(m => m.map((x,j) => j===i ? {...x,name:e.target.value} : x))}
            className="w-full bg-transparent text-sm font-semibold text-zinc-200 mb-2 focus:outline-none border-b border-white/10 pb-1" />
          {meal.foods.map((food, fi) => (
            <div key={fi} className="flex gap-2 mb-1">
              <input value={food}
                onChange={e => {
                  const newFoods = [...meal.foods]; newFoods[fi] = e.target.value;
                  setMeals(m => m.map((x,j) => j===i ? {...x,foods:newFoods} : x));
                }}
                placeholder="Aliment + cantitate"
                className="flex-1 bg-[#111111] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none" />
            </div>
          ))}
          <button onClick={() => setMeals(m => m.map((x,j) => j===i ? {...x,foods:[...x.foods,""]} : x))}
            className="text-xs text-built-red mt-1">+ Adaugă aliment</button>
        </div>
      ))}
      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
        placeholder="Note nutriționale..." className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 resize-none focus:outline-none" />
      <button onClick={handleSave} disabled={saving}
        className="bg-built-red text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-built-red/90 disabled:opacity-50">
        {saving ? "Salvează..." : "Salvează Plan"}
      </button>
    </div>
  );
}

function AdminMessagesTab({ clientId }: { clientId: number }) {
  const [messages, setMessages] = useState<{id:number;sender:string;content:string;created_at:string}[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { getClientMessages(clientId).then(msgs => setMessages(msgs as typeof messages)); }, [clientId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;
    await sendAdminMessage(clientId, input.trim());
    setInput("");
    getClientMessages(clientId).then(msgs => setMessages(msgs as typeof messages));
  }

  return (
    <div className="flex flex-col" style={{height: "400px"}}>
      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender==="admin" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${m.sender==="admin" ? "bg-built-red text-white" : "bg-[#1a1a1a] border border-white/10 text-zinc-200"}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if(e.key==="Enter") handleSend(); }}
          placeholder="Scrie clientului..."
          className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none" />
        <button onClick={handleSend} className="bg-built-red text-white px-4 py-2 rounded-lg text-sm font-semibold">→</button>
      </div>
    </div>
  );
}

function ClientModuleManager({ clientId }: { clientId: number }) {
  const [modules, setModules] = useState<ClientModule[]>([]);
  const [editing, setEditing] = useState<Partial<ClientModule> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchModules = () => getClientModules(clientId).then(setModules);
  useEffect(() => { fetchModules(); }, [clientId]);

  async function handleSave() {
    if (!editing?.title || !editing?.content_html) return;
    setSaving(true);
    try {
      const res = (await saveClientModule(clientId, editing)) as any;
      if (res && res.ok === false) {
        toast.error("Eroare la salvare: " + res.error);
      } else {
        setEditing(null);
        await fetchModules();
      }
    } catch (e) {
      toast.error("Eroare critică: " + (e instanceof Error ? e.message : "Necunoscută"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Sigur ștergi acest modul?")) return;
    await deleteClientModule(clientId, id);
    await fetchModules();
  }

  return (
    <div className="space-y-6">
      {!editing ? (
        <>
          <div className="grid grid-cols-1 gap-3">
            {modules.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-built-black border border-built-gray-2 rounded-sm group">
                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl text-built-red opacity-50">M{m.module_number}</span>
                  <div>
                    <p className="font-display text-lg text-built-white tracking-wider">{m.title}</p>
                    <p className="text-[10px] text-built-gray-text uppercase">
                      {m.is_published ? "🟢 Publicat" : "🟡 Draft"} · {new Date(m.created_at).toLocaleDateString("ro-RO")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditing(m)} className="text-[10px] font-condensed uppercase text-built-white hover:text-built-red">Editează</button>
                  <button onClick={() => handleDelete(m.id)} className="text-[10px] font-condensed uppercase text-built-gray-text hover:text-red-600">Șterge</button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setEditing({ module_number: (modules[modules.length-1]?.module_number || 0) + 1, title: "", content_html: "", is_published: true })}
            className="w-full py-4 border border-dashed border-built-gray-2 text-built-gray-text hover:border-built-red hover:text-built-red transition-colors font-condensed text-xs uppercase tracking-widest">
            + Adaugă Modul Nou
          </button>
        </>
      ) : (
        <div className="p-6 bg-built-black border border-built-gray-2 rounded-sm space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block font-condensed text-[10px] text-built-gray-text uppercase mb-1">Nr. Modul</label>
              <input type="number" value={editing.module_number} onChange={e => setEditing({...editing, module_number: parseInt(e.target.value)})}
                className="w-full bg-built-gray-1 border border-built-gray-2 p-2 text-sm text-built-white focus:border-built-red outline-none" />
            </div>
            <div className="col-span-3">
              <label className="block font-condensed text-[10px] text-built-gray-text uppercase mb-1">Titlu Modul</label>
              <input type="text" value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})}
                className="w-full bg-built-gray-1 border border-built-gray-2 p-2 text-sm text-built-white focus:border-built-red outline-none" placeholder="ex: Arhitectura Mentală" />
            </div>
          </div>
          <div>
            <label className="block font-condensed text-[10px] text-built-gray-text uppercase mb-1">Conținut HTML (Matteo Style)</label>
            <textarea value={editing.content_html} onChange={e => setEditing({...editing, content_html: e.target.value})}
              rows={12} className="w-full bg-built-gray-1 border border-built-gray-2 p-3 text-[11px] font-mono text-emerald-400/80 focus:border-built-red outline-none resize-none"
              placeholder="Lipeste aici codul HTML complet generat de Claude..." />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editing.is_published} onChange={e => setEditing({...editing, is_published: e.target.checked})} className="accent-built-red" />
              <span className="font-condensed text-[10px] text-built-gray-text uppercase">Publicat</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs py-2.5 uppercase tracking-wider">
              {saving ? "Se salvează..." : "Salvează Modul"}
            </button>
            <button onClick={() => setEditing(null)} className="flex-1 border border-built-gray-2 text-built-gray-text font-condensed text-xs py-2.5 uppercase tracking-wider hover:bg-built-gray-2">
              Anulează
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
