# Spec — Co-pilot Retenție Clienți (BUILT)

_Data: 2026-06-12 · Status: propunere, pending aprobare Claudiu_

## Problema
Claudiu are clienți activi (Felicia, Alex, Anastasia, Claudia David...). Retenția = revenue + testimoniale + referrals = flywheel-ul care repară bottleneck-ul de conversie. Friction-ul real: detectarea cine alunecă e MANUALĂ (status `at_risk` setat de mână), iar intervenția când cineva dispare se scrie de la zero de fiecare dată.

## Ce există (construim pe el)
- Portal client `/client/*`: check-in, antrenamente, nutriție, mesaje, bonusuri.
- `client_checkins`: week_number, training_adherence (0-100), nutrition_adherence (0-100), energy_level (1-10), mood (1-10), notes, ai_feedback, created_at.
- Admin `/dashboard/clients` cu `status` (inclusiv `at_risk`, manual) + `/dashboard/progress-reports`.
- Skill 3 (Manager de Succes Client) în CLAUDE.md: intervenție în 4 mișcări (elimini vinovăția → diagnostic → MVR Minimum Viable Return → recalibrare). Reîncadrări cheie. INTERZIS: compensare extremă, comparații, așteptarea motivației.

## Ce construim: Co-pilot Retenție (în modulul Clienți)
Strat de inteligență peste check-in-uri (analog Co-pilot DM, dar pe Skill 3).

### A. Detecție automată a riscului (înlocuiește statusul manual)
Calculează un semnal de risc per client din `client_checkins`:
- **Dispărut**: niciun check-in de 8+ zile (sau a ratat ultimul check-in de sâmbătă).
- **Alunecă**: aderența (antrenament sau nutriție) a scăzut semnificativ față de media lui personală.
- **Epuizat**: energie/dispoziție în scădere pe ultimele 2-3 check-in-uri.
Output: fiecare client primește o categorie (OK / Alunecă / Epuizat / Dispărut) + motivul.

### B. Generatorul de intervenție (Skill 3)
Pentru un client la risc, AI-ul generează mesajul de intervenție în vocea BUILT, adaptat la CAUZĂ:
- elimină vinovăția (niciodată „de ce n-ai trimis check-in?")
- numește MVR-ul (un singur pas executabil imediat)
- ton: empatic cu situația, ferm cu sistemul.
Claudiu revizuiește + trimite (ca la Co-pilot DM). Folosește contextul clientului (check-in-uri, note) + Creier.

### C. Surfacing proactiv: „Cine are nevoie de tine"
Un panou (în Clienți sau în „Azi") care listează săptămânal clienții care necesită atenție, sortați după risc, fiecare cu: categoria, de ce, și butonul „Generează intervenția".

## Decizii de luat (cu Claudiu)
1. **Praguri de risc**: 8 zile = dispărut? Ce scădere de aderență = „alunecă"? (Propunere: 8 zile; scădere >25% față de media lui.)
2. **Cât de automat**: AI generează mesajul (tu editezi + trimiți) — DA, ca la Co-pilot DM. Confirmare.
3. **Unde trăiește**: extindem `/dashboard/clients` cu un tab/panou „Retenție / Cine are nevoie de tine". Confirmare.
4. **Onboarding client nou** (N3 7 zile) — fază 2 sau acum? (Propunere: fază 2, după ce retenția merge.)

## Non-goals (acum)
- Nu trimitem automat mesaje (Claudiu trimite manual — relație, nu spam).
- Nu construim onboarding-ul 7 zile în faza asta.
- Nu atingem portalul clientului (doar citim check-in-urile).

## Criteriu de succes
Claudiu deschide modulul Clienți și vede instant cine alunecă + de ce + are mesajul de intervenție gata de trimis — fără să se uite manual prin fiecare client.
