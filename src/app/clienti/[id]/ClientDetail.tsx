"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { submitCheckin, updateClientStatus, inviteClient, type Client, type CheckIn, type ClientStatus, type ClientModule, getClientModules, saveClientModule, deleteClientModule } from "../actions";
import { saveWorkoutPlan, saveNutritionPlan, sendAdminMessage, getClientMessages } from "@/app/client/actions";

const STATUS_OPTIONS: { id: ClientStatus; label: string }[] = [
  { id: "active", label: "Activ" }, { id: "at_risk", label: "La risc" },
  { id: "paused", label: "Pauză" }, { id: "completed", label: "Finalizat" },
];

const weeksSince = (start: string) => Math.max(1, Math.floor((Date.now() - new Date(start).getTime()) / (7 * 24 * 3600 * 1000)));

const TABS = [
  { id: "checkin", label: "Check-in" },
  { id: "workout", label: "Plan Antrenament" },
  { id: "nutrition", label: "Plan Nutrițional" },
  { id: "modules", label: "Module (Academia)" },
  { id: "messages", label: "Mesaje" },
];

export function ClientDetail({ client, initialCheckins }: { client: Client; initialCheckins: CheckIn[] }) {
  const [checkins, setCheckins] = useState(initialCheckins);
  const [form, setForm] = useState({ training: 80, nutrition: 80, energy: 7, mood: 7, notes: "" });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ClientStatus>(client.status);
  const [activeTab, setActiveTab] = useState("checkin");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);

  const numericClientId = client.id;
  const currentWeek = weeksSince(client.start_date);

  function handleCheckin() {
    setError(null); setFeedback(null);
    startTransition(async () => {
      const r = await submitCheckin(client.id, { week: currentWeek, training: form.training, nutrition: form.nutrition, energy: form.energy, mood: form.mood, notes: form.notes });
      if (r.ok) { setFeedback(r.feedback); setCheckins((prev) => [{ id: Date.now(), client_id: client.id, week_number: currentWeek, training_adherence: form.training, nutrition_adherence: form.nutrition, energy_level: form.energy, mood: form.mood, notes: form.notes, ai_feedback: r.feedback, created_at: new Date().toISOString() }, ...prev]); }
      else setError(r.error);
    });
  }

  function handleStatusChange(s: ClientStatus) {
    setStatus(s);
    startTransition(async () => { await updateClientStatus(client.id, s); });
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl tracking-wider text-built-white">{client.name}</h1>
          {client.email && <p className="text-built-gray-text text-sm mt-1">{client.email}</p>}
          {client.objectives && <p className="text-sm text-built-white/70 mt-1">{client.objectives}</p>}
        </div>
        <div className="flex gap-2 items-center">
          <Link
            href={`/client/dashboard?clientId=${numericClientId}`}
            className="px-3 py-1.5 font-condensed text-[10px] border border-built-red/40 text-built-red hover:bg-built-red/10 transition-colors flex items-center gap-1.5"
            target="_blank"
          >
            <span>◈</span> View as Client
          </Link>
          <button
            onClick={async () => {
              setInviting(true); setInviteMsg(null);
              const r = await inviteClient(client.id);
              setInviting(false);
              setInviteMsg(r.ok ? `✓ Invitație trimisă la ${client.email}` : `✖ ${r.error}`);
              setTimeout(() => setInviteMsg(null), 5000);
            }}
            disabled={inviting}
            className="px-3 py-1.5 font-condensed text-[10px] border border-zinc-600 text-zinc-400 hover:border-built-red hover:text-built-red transition-colors disabled:opacity-50"
          >
            {inviting ? "Se trimite..." : "✉ Trimite Invitație"}
          </button>
          {inviteMsg && (
            <span className={`text-[10px] font-condensed ${inviteMsg.startsWith("✓") ? "text-emerald-400" : "text-orange-400"}`}>
              {inviteMsg}
            </span>
          )}
          {STATUS_OPTIONS.map((s) => (
            <button key={s.id} type="button" onClick={() => handleStatusChange(s.id)}
              className={`px-3 py-1.5 font-condensed text-[10px] border transition-colors ${status === s.id ? "bg-built-red border-built-red text-built-white" : "border-built-gray-2 text-built-gray-text hover:border-built-red"}`}>
              {s.label}
            </button>
          ))}
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
      <div className="flex gap-1 mb-6 border-b border-built-gray-2">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-condensed text-xs uppercase tracking-wider transition-colors ${activeTab === tab.id ? "text-built-red border-b-2 border-built-red" : "text-built-gray-text hover:text-built-white"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Check-in */}
      {activeTab === "checkin" && (
        <>
          <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm mb-6">
            <h3 className="font-display text-xl tracking-wider mb-4">Check-in săptămâna {currentWeek}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[["Antrenament", "training", 100], ["Nutriție", "nutrition", 100], ["Energie", "energy", 10], ["Dispoziție", "mood", 10]].map(([l, k, max]) => (
                <div key={k}>
                  <div className="flex justify-between mb-1">
                    <p className="font-condensed text-[10px] text-built-gray-text uppercase">{l}</p>
                    <span className="font-condensed text-[10px] text-built-red">{(form as unknown as Record<string, number>)[k as string]}{max === 100 ? "%" : "/10"}</span>
                  </div>
                  <input type="range" min={0} max={max as number} value={(form as unknown as Record<string, number>)[k as string]}
                    onChange={(e) => setForm((f) => ({ ...f, [k as string]: Number(e.target.value) }))}
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
                  <div key={c.id} className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-condensed text-xs text-built-red">Săptămâna {c.week_number}</span>
                      <span className="font-condensed text-[10px] text-built-gray-text">Antren: {c.training_adherence}%</span>
                      <span className="font-condensed text-[10px] text-built-gray-text">Nutriție: {c.nutrition_adherence}%</span>
                      <span className="font-condensed text-[10px] text-built-gray-text">Energie: {c.energy_level}/10</span>
                      <span className="font-condensed text-[10px] text-built-gray-text">Dispoziție: {c.mood}/10</span>
                    </div>
                    {c.notes && <p className="text-xs text-built-white/70 mb-2">Note: {c.notes}</p>}
                    {c.ai_feedback && <p className="text-xs text-built-gray-text border-t border-built-gray-2/50 pt-2">{c.ai_feedback}</p>}
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
    alert("Plan salvat!");
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
    alert("Plan nutrițional salvat!");
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
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
        alert("Eroare la salvare: " + res.error);
      } else {
        setEditing(null);
        await fetchModules();
      }
    } catch (e) {
      alert("Eroare critică: " + (e instanceof Error ? e.message : "Necunoscută"));
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
