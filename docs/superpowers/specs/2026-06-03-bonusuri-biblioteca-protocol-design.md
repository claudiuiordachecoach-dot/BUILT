# Design Spec — Biblioteca de Protocol BUILT (Bonusuri)

**Data:** 2026-06-03  
**Scope:** 15 protocoale de urgență + pagini in-app client portal `/client/bonusuri`  
**Obiectiv:** Clientul să nu se simtă niciodată singur. Orice situație din cele 90 de zile are un protocol clar, validat științific, în vocea BUILT.

---

## 1. Arhitectura conținutului

### 15 Protocoale organizate în 4 categorii

**A — Alimentație în afara casei**
- A1: Restaurantul de Afaceri
- A2: Fast-food în Grabă
- A3: Grătarul Românesc
- A4: Restaurantul cu Familia
- A5: Sărbătorile Românești (Crăciun / Paști / Revelion)

**B — Antrenament în afara rutinei**
- B1: Hotelul fără Sală (sau cu sală slabă)
- B2: Sala Necunoscută (deplasare, echipament diferit)
- B3: Acasă fără Echipament
- B4: Timp de Criză (25–35 minute disponibile)

**C — Crize de Sistem**
- C1: Protocolul de Urgență (primele 24h după cădere din sistem)
- C2: Săptămâna Pierdută (revenire fără compensare)
- C3: Binge-ul de Weekend
- C4: Stresul Extrem (cortizol, deadline, insomnie)
- C5: Boala Ușoară (răceală, oboseală)

**D — Evenimente Sociale**
- D1: Nunta / Botezul / Cumetria
- D2: Concediul All-Inclusive
- D3: Vacanța cu Familia

---

## 2. Standardul de conținut al fiecărui protocol

Fiecare protocol respectă același template:

```
[TAG categorie] — [Titlu]
[Subtitlu: "Ce faci când..."]

DE CE SE ÎNTÂMPLĂ (mecanismul fiziologic/psihologic, 2-3 rânduri)
↳ Referință științifică integrată natural în text (nu footnote academic)

REGULA DE AUR (o singură propoziție bold — ancora protocolului)

PROTOCOLUL (numbered list, acțiuni clare):
1. Prima acțiune — specifică, executabilă acum
2. A doua acțiune
...

CE NU FACI (2-3 interdicții cu explicație scurtă)

REÎNCADRAREA BUILT (1 paragraf — vocea lui Claudiu, ton direct)
```

**Standard lingvistic:**
- Mecanisme fiziologice integrate (cortizol, insulină, glicogen, NEAT, TEF) — explicite dar accesibile
- Zero clișee motivaționale
- Ton: arhitect care explică un sistem, nu coach care încurajează
- Română cu diacritice corecte (ș ț, nu ş ţ)

---

## 3. Arhitectura aplicației

### Rute
- `/client/bonusuri` — pagina hub cu toate cele 15 protocoale + cookbook
- `/client/bonusuri/[id]` — pagina individuală a fiecărui protocol (slug: `a1-restaurant-afaceri` etc.)

### Componente noi
- `BonusCard` — card pe hub (categorie, titlu, descriere scurtă, progress indicator)
- `BonusContent` — layout pagină individuală (header categorie, conținut structurat, navigare prev/next)
- `CategoryBadge` — tag colorat per categorie (A/B/C/D cu culori distincte în paleta BUILT)

### Date
Conținut **static** (hardcodat în fișiere TypeScript) — nu necesită bază de date.  
Structura: `src/data/bonusuri.ts` exportă array-ul complet de protocoale.

### Cookbook
Integrat în același sistem ca bonus `#cookbook` cu conținut HTML existent refolosit ca string în data file.

---

## 4. Design vizual

Consistent cu design system-ul BUILT existent:
- Background: `#0A0A0A` / `#111111`
- Accent: `#C0392B` (built-red)
- Text: zinc-400 / white
- Cards: border `white/10` → hover `built-red/40`

**Hub-ul bonusuri — navigare prin tab-uri:**
- 4 tab-uri orizontale în top: Alimentație | Antrenament | Crize de Sistem | Evenimente
- Fiecare tab afișează 3–5 card-uri (doar categoria activă, restul ascunse)
- Tab activ: linie roșie jos + text alb; inactive: zinc-500
- Prima categorie activă implicit (Alimentație)
- Pe mobil: tab-uri scrollabile orizontal (overflow-x: auto)

Pagina individuală: layout full-width cu tipografie ierarhizată, secțiuni separate vizual, navigare prev/next între protocoalele din aceeași categorie.

---

## 5. Ordine de implementare

1. `src/data/bonusuri.ts` — structura de date + conținutul complet al celor 15 protocoale
2. `/client/bonusuri/page.tsx` — hub redesenat cu categorii
3. `/client/bonusuri/[id]/page.tsx` — pagina individuală
4. Componente: `BonusCard`, `BonusContent`, `CategoryBadge`
5. Cookbook integrat în același sistem

---

## 6. Ce NU este în scope

- Personalizare per client (toți clienții văd același conținut)
- Tracking progres / "citit / necitit" (faza 2)
- Notificări push când un protocol e relevant (faza 2)
- Biblioteca de exerciții alternative (scoasă din scope la cererea utilizatorului)
