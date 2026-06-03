# Design Spec — Check-in Feedback Flow + Progress Charts

**Data:** 2026-06-03  
**Scope:** Feedback AI manual pe admin, istoric + grafic progres pe client și admin  
**Obiectiv:** Admin generează draft AI per check-in, editează, trimite clientului. Clientul vede istoricul și graficul de trend.

---

## 1. Fluxul de feedback (admin)

### Comportament actual
- Adminul poate trimite check-in-ul clientului din ClientDetail — generează AI feedback imediat
- Clientul NU vede feedback AI când EL trimite propriul check-in
- Istoricul check-in-urilor pe admin există (text simplu, fără grafic)

### Comportament nou
Per fiecare check-in din istoricul adminului (tab "Check-in" în ClientDetail):

1. **Dacă `ai_feedback` este null:** afișează buton "Draft AI"
   - Click → apelează `generateCheckinFeedbackDraft(clientId, checkin)` → returnează text din Claude API (NU se salvează în DB)
   - Textarea editabilă apare cu draft-ul
   - Buton "Trimite clientului" → `saveCheckinFeedback(checkinId, feedback)` → salvează `ai_feedback` în DB
   - Card-ul afișează "✓ Trimis" + textul feedbackului

2. **Dacă `ai_feedback` există deja:** afișează direct feedbackul (fără buton de generare)

**Draft-ul rămâne exclusiv în React state până la trimitere. Clientul nu vede nimic până la "Trimite clientului".**

---

## 2. Pagina client `/client/checkin` — restructurare

### Sus: Form-ul existent
Neschimbat. Submit → mesaj "Check-in trimis. Claudiu analizează săptămâna ta."

### Jos: Secțiunea "Progresul Meu"
Apare doar dacă există cel puțin un check-in în DB.

**Grafic linie (Recharts `LineChart`):**
- X axis: numărul săptămânii (1, 2, 3...)
- 3 linii:
  - Antrenament % (roșu `#C0392B`)
  - Nutriție % (zinc-400 `#a1a1aa`)  
  - Energie normalizat la 100 (energy_level × 10) (alb `#ffffff`)
- Background: `#111111`, grid subtle `white/5`
- Responsive (ResponsiveContainer)
- Dot vizibil pe fiecare punct

**Lista check-in-urilor (cronologic invers):**
- Card per săptămână: numărul săptămânii + data + metricile principale
- Dacă `ai_feedback` nu e null: bloc distinct cu feedback-ul (border-l roșu, italic)
- Dacă `ai_feedback` este null: text subtil "Claudiu analizează această săptămână."

---

## 3. Tab "Profil & Progres" admin (ClientDetail)

Același grafic Recharts adăugat în secțiunea existentă, deasupra galeriei foto.
Date: `initialCheckins` prop deja disponibil în ClientDetail.

---

## 4. Fișiere modificate / create

| Fișier | Acțiune | Ce face |
|---|---|---|
| `package.json` | MODIFY | Adaugă recharts |
| `src/app/clienti/actions.ts` | MODIFY | Adaugă `generateCheckinFeedbackDraft()`, `saveCheckinFeedback()` |
| `src/app/clienti/[id]/ClientDetail.tsx` | MODIFY | Draft AI + Trimite per check-in, grafic în Profil tab |
| `src/app/client/actions.ts` | MODIFY | Adaugă `getClientCheckins()` |
| `src/app/client/checkin/page.tsx` | MODIFY | Refactor: fetch history, grafic + istoric sub form |

---

## 5. Noi funcții server

### `generateCheckinFeedbackDraft(clientId: number, checkin: CheckIn): Promise<string>`
- Locație: `src/app/clienti/actions.ts`
- Apelează Anthropic SDK cu context BUILT Skill 3 (Manager Succes Client)
- Input: metricile check-in-ului + context client (name, week_number)
- Output: string cu draft feedback (nu salvează în DB)

### `saveCheckinFeedback(checkinId: number, feedback: string): Promise<{ ok: boolean }>`
- Locație: `src/app/clienti/actions.ts`  
- UPDATE `client_checkins` SET `ai_feedback = feedback` WHERE id = checkinId
- Simplu, fără validare complexă

### `getClientCheckins(): Promise<CheckIn[]>`
- Locație: `src/app/client/actions.ts`
- SELECT * FROM client_checkins WHERE client_id = [client logat] ORDER BY week_number ASC
- Returnează toate check-in-urile (pentru grafic și istoric)

---

## 6. Ce NU e în scope

- Notificări push/email când adminul trimite feedback (faza 2)
- Editarea unui check-in deja trimis (nu există)
- Mai mult de 3 linii pe grafic (keep simple)
- Grafic pe mobile cu zoom/pan
