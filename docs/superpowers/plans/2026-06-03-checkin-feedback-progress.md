# Check-in Feedback Flow + Progress Charts

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin generează draft AI per check-in, editează și trimite clientului; clientul vede istoricul + grafic trend; admin vede același grafic în Profil tab.

**Architecture:** Server actions noi în `clienti/actions.ts` și `client/actions.ts`; Recharts LineChart refolosit în 2 locuri (ClientDetail + client checkin page); draft AI rămâne în React state până la "Trimite".

**Tech Stack:** Next.js 16.2.4, Recharts, Anthropic SDK (deja instalat), Supabase, TypeScript

---

## File Structure

| Fișier | Acțiune | Ce face |
|---|---|---|
| `package.json` | MODIFY | Adaugă recharts |
| `src/app/clienti/actions.ts` | MODIFY | `generateCheckinFeedbackDraft()` + `saveCheckinFeedback()` |
| `src/app/client/actions.ts` | MODIFY | `getClientCheckinsForClient()` |
| `src/app/clienti/[id]/ClientDetail.tsx` | MODIFY | Draft AI per card + grafic în Profil tab |
| `src/app/client/checkin/page.tsx` | MODIFY | Istoric + grafic sub form |

---

## Task 1: Instalare Recharts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalează recharts**

```bash
cd "/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center" && npm install recharts
```

Expected output: `added N packages` fără erori.

- [ ] **Step 2: Verifică TypeScript**

```bash
cd "/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center" && npx tsc --noEmit 2>&1 | head -10
```

Expected: fără erori noi.

---

## Task 2: Admin actions — draft AI + salvare feedback

**Files:**
- Modify: `src/app/clienti/actions.ts`

Context: Fișierul folosește deja `getAnthropicClient`, `MODELS`, `buildSystemBlocks`, `readCreierFromSupabase` din `@/lib/anthropic` și `@/lib/creier`. Tipul `CheckIn` e definit la linia 26. Patternul exact pentru apelul AI: vezi `submitCheckin` (linia 69).

- [ ] **Step 1: Adaugă `generateCheckinFeedbackDraft` la finalul `src/app/clienti/actions.ts`**

```typescript
export async function generateCheckinFeedbackDraft(
  clientId: number,
  checkin: CheckIn
): Promise<{ ok: boolean; draft?: string; error?: string }> {
  const client = await getClient(clientId);
  if (!client) return { ok: false, error: "Client negăsit." };

  const avg = (checkin.training_adherence + checkin.nutrition_adherence + checkin.energy_level * 10) / 3;

  const task = `# TASK: Generează feedback check-in client BUILT

## Client: ${client.name}
## Săptămâna: ${checkin.week_number}
## Date check-in:
- Antrenament: ${checkin.training_adherence}% aderență
- Nutriție: ${checkin.nutrition_adherence}% aderență
- Energie: ${checkin.energy_level}/10
- Somn: ${checkin.sleep_hours ?? "—"} ore
- Hidratare: ${checkin.hydration_l ?? "—"}L
- Stres: ${checkin.stress_level ?? "—"}/10
- Note: "${checkin.notes || "—"}"

## Obiective client: ${client.objectives || "—"}

## Misiunea ta (Skill 3 — Manager de Succes Client)
${avg < 40
  ? "Client la risc de abandon. Aplică MVR. Elimini vinovăția, dai UN singur pas mic."
  : avg < 60
  ? "Săptămână sub medie. Validezi progresul, identifici blocajul, recalibrezi."
  : "Săptămână bună. Celebrezi specific, ancorezi comportamentul, anticipezi săptămâna viitoare."
}

Răspunde cu un mesaj scurt (3-5 propoziții) în vocea BUILT. Direct, uman, fără clișee.`;

  try {
    const creier = await readCreierFromSupabase();
    const ai = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({ creierJson: JSON.stringify(creier, null, 2), taskContext: task });
    const message = await ai.messages.create({
      model: MODELS.routine,
      max_tokens: 400,
      system: systemBlocks,
      messages: [{ role: "user", content: "Generează feedback-ul de check-in. Răspunde direct cu mesajul, fără introducere." }],
    });
    const textBlock = message.content.find((b) => b.type === "text");
    const draft = textBlock?.type === "text" ? textBlock.text : "Check-in înregistrat.";
    return { ok: true, draft };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}
```

- [ ] **Step 2: Adaugă `saveCheckinFeedback` imediat după**

```typescript
export async function saveCheckinFeedback(
  checkinId: number,
  clientId: number,
  feedback: string
): Promise<{ ok: boolean; error?: string }> {
  const s = getSupabaseServer();
  const { error } = await s
    .from("client_checkins")
    .update({ ai_feedback: feedback })
    .eq("id", checkinId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/clienti/${clientId}`);
  return { ok: true };
}
```

- [ ] **Step 3: Verifică TypeScript**

```bash
cd "/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center" && npx tsc --noEmit 2>&1 | head -20
```

Expected: fără erori.

---

## Task 3: Client action — fetch istoricul propriu

**Files:**
- Modify: `src/app/client/actions.ts`

Context: `getClientId()` e definit la linia 19 — returnează ID-ul clientului logat (sau din cookie admin). `getSupabaseServer()` importat deja.

- [ ] **Step 1: Adaugă `getClientCheckinsForClient` la finalul `src/app/client/actions.ts`**

```typescript
export type ClientCheckin = {
  id: number;
  week_number: number;
  training_adherence: number;
  nutrition_adherence: number;
  energy_level: number;
  sleep_hours: number | null;
  hydration_l: number | null;
  stress_level: number | null;
  notes: string | null;
  ai_feedback: string | null;
  created_at: string;
};

export async function getClientCheckinsForClient(): Promise<ClientCheckin[]> {
  const clientId = await getClientId();
  if (!clientId) return [];
  const db = getSupabaseServer();
  const { data } = await db
    .from("client_checkins")
    .select("id, week_number, training_adherence, nutrition_adherence, energy_level, sleep_hours, hydration_l, stress_level, notes, ai_feedback, created_at")
    .eq("client_id", clientId)
    .order("week_number", { ascending: true });
  return (data ?? []) as ClientCheckin[];
}
```

- [ ] **Step 2: Verifică TypeScript**

```bash
cd "/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center" && npx tsc --noEmit 2>&1 | head -20
```

Expected: fără erori.

---

## Task 4: ClientDetail.tsx — draft AI per check-in card

**Files:**
- Modify: `src/app/clienti/[id]/ClientDetail.tsx`

Context: Fișierul importă deja `submitCheckin` din `../actions`. Trebuie adăugate importurile pentru `generateCheckinFeedbackDraft` și `saveCheckinFeedback`. Istoricul check-in-urilor e la linia ~232, în `{activeTab === "checkin"}`.

- [ ] **Step 1: Adaugă importurile noi la linia 5 (lângă importurile existente din `../actions`)**

Înlocuiește linia:
```typescript
import { submitCheckin, updateClientStatus, inviteClient, deleteCheckin, type Client, type CheckIn, type ClientStatus, type ClientModule, getClientModules, saveClientModule, deleteClientModule } from "../actions";
```

Cu:
```typescript
import { submitCheckin, updateClientStatus, inviteClient, deleteCheckin, generateCheckinFeedbackDraft, saveCheckinFeedback, type Client, type CheckIn, type ClientStatus, type ClientModule, getClientModules, saveClientModule, deleteClientModule } from "../actions";
```

- [ ] **Step 2: Adaugă state-ul pentru drafturi după linia cu `const [inviteMsg`**

```typescript
const [draftState, setDraftState] = useState<Record<number, { loading: boolean; text: string; sent: boolean }>>({});
```

- [ ] **Step 3: Adaugă cele 2 handler functions după `handleStatusChange`**

```typescript
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
```

- [ ] **Step 4: Înlocuiește blocul `{c.ai_feedback && ...}` din istoricul check-in-urilor (linia ~257) cu noul bloc de feedback**

Găsește:
```typescript
{c.ai_feedback && <p className="text-xs text-built-gray-text border-t border-built-gray-2/50 pt-2">{c.ai_feedback}</p>}
```

Înlocuiește cu:
```typescript
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
```

- [ ] **Step 5: Verifică build**

```bash
cd "/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center" && npx next build 2>&1 | tail -15
```

Expected: `✓ Compiled successfully`

---

## Task 5: Grafic progres în Profil tab (admin)

**Files:**
- Modify: `src/app/clienti/[id]/ClientDetail.tsx`

Context: Tab-ul "Profil & Progres" e la linia ~120. Secțiunea "Galeria de Progres" urmează după "Foaia de Parcurs". `checkins` (array de `CheckIn`, cronologic descrescător) e disponibil în scope.

- [ ] **Step 1: Adaugă importul Recharts la topul fișierului (după importurile existente)**

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
```

- [ ] **Step 2: Adaugă graficul în tab-ul "profile", ÎNAINTE de secțiunea "Galeria de Progres" (linia ~131)**

Găsește:
```typescript
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl tracking-wider">Galeria de Progres (Foto)</h3>
```

Inserează ÎNAINTE:
```typescript
          {checkins.length > 0 && (
            <div>
              <h3 className="font-display text-xl tracking-wider mb-4">Trend Progres</h3>
              <div className="bg-[#111111] border border-white/10 rounded-sm p-4" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...checkins].reverse()} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week_number" tick={{ fill: "#71717a", fontSize: 10 }} tickFormatter={(v: number) => `S${v}`} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4 }}
                      labelStyle={{ color: "#a1a1aa", fontSize: 10 }}
                      itemStyle={{ fontSize: 11 }}
                      labelFormatter={(v: number) => `Săptămâna ${v}`}
                    />
                    <Line type="monotone" dataKey="training_adherence" stroke="#C0392B" strokeWidth={2} dot={{ r: 3, fill: "#C0392B" }} name="Antrenament %" />
                    <Line type="monotone" dataKey="nutrition_adherence" stroke="#a1a1aa" strokeWidth={2} dot={{ r: 3, fill: "#a1a1aa" }} name="Nutriție %" />
                    <Line type="monotone" dataKey={(d: CheckIn) => d.energy_level * 10} stroke="#e4e4e7" strokeWidth={2} dot={{ r: 3, fill: "#e4e4e7" }} name="Energie ×10" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
```

- [ ] **Step 3: Verifică build**

```bash
cd "/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center" && npx next build 2>&1 | tail -15
```

Expected: `✓ Compiled successfully`

---

## Task 6: Client checkin page — istoric + grafic

**Files:**
- Modify: `src/app/client/checkin/page.tsx`

Context: Pagina curentă are doar form-ul. Trebuie adăugate: import `getClientCheckinsForClient` + `ClientCheckin` din `../actions`, import Recharts, useEffect pentru fetch, și secțiunea "Progresul Meu" sub form.

- [ ] **Step 1: Înlocuiește complet `src/app/client/checkin/page.tsx`**

```tsx
"use client";
import { useState, useEffect } from "react";
import { submitCheckin, getClientCheckinsForClient, type ClientCheckin } from "../actions";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function RangeInput({ label, value, onChange, min, max, step = 1, unit }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit: string;
}) {
  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-zinc-200">{label}</label>
        <span className="text-lg font-bold text-built-red">{value}<span className="text-xs text-zinc-500 ml-0.5">{unit}</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-built-red" />
      <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function CheckinPage() {
  const [form, setForm] = useState({ training_adherence: 70, nutrition_adherence: 70, energy_level: 6, sleep_hours: 7, hydration_l: 2.5, stress_level: 5, notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ClientCheckin[]>([]);

  useEffect(() => {
    getClientCheckinsForClient().then(setHistory);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await submitCheckin(form);
    const updated = await getClientCheckinsForClient();
    setHistory(updated);
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-xl font-bold text-white mb-2">Check-in Săptămânal</h1>
      <p className="text-sm text-zinc-500 mb-6">Evaluează săptămâna ta sincer.</p>

      {submitted ? (
        <div className="flex flex-col items-center justify-center py-10 mb-12">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl mb-4">✓</div>
          <h2 className="text-lg font-bold text-white mb-1">Check-in trimis!</h2>
          <p className="text-sm text-zinc-500 text-center">Claudiu analizează săptămâna ta și îți trimite feedback în curând.</p>
          <button onClick={() => setSubmitted(false)} className="mt-4 text-xs text-zinc-500 hover:text-white transition-colors">← Trimite alt check-in</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mb-12">
          <RangeInput label="Antrenament" value={form.training_adherence} onChange={v => setForm(f => ({...f, training_adherence: v}))} min={0} max={100} unit="%" />
          <RangeInput label="Nutriție" value={form.nutrition_adherence} onChange={v => setForm(f => ({...f, nutrition_adherence: v}))} min={0} max={100} unit="%" />
          <RangeInput label="Energie" value={form.energy_level} onChange={v => setForm(f => ({...f, energy_level: v}))} min={1} max={10} unit="/10" />
          <RangeInput label="Somn" value={form.sleep_hours} onChange={v => setForm(f => ({...f, sleep_hours: v}))} min={0} max={12} step={0.5} unit="h" />
          <RangeInput label="Hidratare" value={form.hydration_l} onChange={v => setForm(f => ({...f, hydration_l: v}))} min={0} max={6} step={0.5} unit="L" />
          <RangeInput label="Stres" value={form.stress_level} onChange={v => setForm(f => ({...f, stress_level: v}))} min={1} max={10} unit="/10" />
          <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
            <label className="block text-sm font-semibold text-zinc-200 mb-2">Note (opțional)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              rows={4} placeholder="Ce a mers bine? Unde ai întâmpinat dificultăți?"
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-zinc-300 placeholder-zinc-700 resize-none focus:outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-built-red hover:bg-built-red/90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all">
            {loading ? "Se trimite..." : "Trimite Check-in"}
          </button>
        </form>
      )}

      {history.length > 0 && (
        <div className="border-t border-white/5 pt-8">
          <h2 className="text-sm font-bold text-white mb-6">Progresul Meu</h2>

          {/* Grafic trend */}
          <div className="bg-[#111111] border border-white/10 rounded-xl p-4 mb-6" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week_number" tick={{ fill: "#71717a", fontSize: 10 }} tickFormatter={(v: number) => `S${v}`} />
                <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#a1a1aa", fontSize: 10 }}
                  itemStyle={{ fontSize: 11 }}
                  labelFormatter={(v: number) => `Săptămâna ${v}`}
                />
                <Line type="monotone" dataKey="training_adherence" stroke="#C0392B" strokeWidth={2} dot={{ r: 3, fill: "#C0392B" }} name="Antrenament %" />
                <Line type="monotone" dataKey="nutrition_adherence" stroke="#a1a1aa" strokeWidth={2} dot={{ r: 3, fill: "#a1a1aa" }} name="Nutriție %" />
                <Line type="monotone" dataKey={(d: ClientCheckin) => d.energy_level * 10} stroke="#e4e4e7" strokeWidth={2} dot={{ r: 3, fill: "#e4e4e7" }} name="Energie ×10" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legendă */}
          <div className="flex gap-4 mb-6">
            {[["#C0392B", "Antrenament %"], ["#a1a1aa", "Nutriție %"], ["#e4e4e7", "Energie ×10"]].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-0.5" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-zinc-500">{label}</span>
              </div>
            ))}
          </div>

          {/* Istoric carduri */}
          <div className="space-y-3">
            {[...history].reverse().map(c => (
              <div key={c.id} className="bg-[#111111] border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-built-red">Săptămâna {c.week_number}</span>
                  <span className="text-[10px] text-zinc-600">{new Date(c.created_at).toLocaleDateString("ro-RO")}</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                  <span className="text-[10px] text-zinc-500">Antren: <span className="text-zinc-300">{c.training_adherence}%</span></span>
                  <span className="text-[10px] text-zinc-500">Nutriție: <span className="text-zinc-300">{c.nutrition_adherence}%</span></span>
                  <span className="text-[10px] text-zinc-500">Energie: <span className="text-zinc-300">{c.energy_level}/10</span></span>
                  {c.sleep_hours != null && <span className="text-[10px] text-zinc-500">Somn: <span className="text-zinc-300">{c.sleep_hours}h</span></span>}
                  {c.hydration_l != null && <span className="text-[10px] text-zinc-500">Hidratare: <span className="text-zinc-300">{c.hydration_l}L</span></span>}
                  {c.stress_level != null && <span className="text-[10px] text-zinc-500">Stres: <span className="text-zinc-300">{c.stress_level}/10</span></span>}
                </div>
                {c.notes && <p className="text-xs text-zinc-400 mb-3 italic">&ldquo;{c.notes}&rdquo;</p>}
                {c.ai_feedback ? (
                  <div className="border-l-2 border-built-red pl-3">
                    <p className="text-[10px] font-bold text-built-red uppercase tracking-widest mb-1">Feedback Claudiu</p>
                    <p className="text-xs text-zinc-300 leading-relaxed">{c.ai_feedback}</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-600 italic">Claudiu analizează această săptămână.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verifică build final**

```bash
cd "/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center" && npx next build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`, rutele `/client/checkin` și `/clienti/[id]` prezente.

---

## Task 7: Deploy

**Files:** niciun fișier nou

- [ ] **Step 1: Deploy Vercel producție**

```bash
cd "/Users/iordacheclaudiu/Claude - BUILT Cowork/built-ai-command-center" && vercel --prod 2>&1 | tail -20
```

Expected: `Production: https://built-ai-command-center.vercel.app`

---

## Self-Review

**Spec coverage:**
- ✅ Draft AI per check-in (admin) → Task 2 + Task 4
- ✅ Editare + trimitere feedback → Task 4
- ✅ Clientul vede feedback când e trimis → Task 6 (ai_feedback != null)
- ✅ Grafic progres pe client → Task 6
- ✅ Grafic progres pe admin → Task 5
- ✅ Istoricul check-in-urilor pe client → Task 6
- ✅ Recharts instalat → Task 1

**Placeholders:** Niciun TBD sau TODO.

**Type consistency:**
- `ClientCheckin` definit în Task 3, importat și folosit în Task 6 ✓
- `generateCheckinFeedbackDraft(clientId, checkin: CheckIn)` definit în Task 2, importat în Task 4 ✓
- `saveCheckinFeedback(checkinId, clientId, feedback)` definit în Task 2, apelat în Task 4 cu aceleași argumente ✓
- `draftState: Record<number, { loading, text, sent }>` definit în Task 4 Step 2, folosit în Steps 3+4 ✓
