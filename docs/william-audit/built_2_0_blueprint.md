# BUILT 2.0 - The William Scott Blueprint

Acest document stabilește specificațiile tehnice și de design pentru transformarea **BUILT AI Command Center** într-un sistem de autoritate tehnică, inspirat de modelul lui William Scott, păstrând în același timp identitatea de brand BUILT.

---

## 1. Pilonul UI: Estetica „Technical Authority”
Vom trece de la un aspect de „aplicație web” la unul de **„Instrument de Control”**.

### Specificații Vizuale (CSS/Tailwind)
*   **Grid & Borders:**
    *   Folosim borduri de `1px` solide cu culoarea `--color-built-gray-2` (#2A2A2A).
    *   Segregare clară prin „padding” generos între module (`p-8` sau `p-12`).
*   **Tipografie de Precizie:**
    *   Folosim font **Monospace** (ex: `JetBrains Mono` sau `Space Mono`) pentru toate cifrele de performanță (vizualizări, like-uri, scoruri).
    *   Etichetele mici (ex: „TALKING HEAD”, „M1”) vor fi scrise cu fontul `Barlow Condensed` (#72), uppercase, cu `tracking-widest`.
*   **Accent Color (BUILT Red):**
    *   În loc de albastrul lui William, folosim `#C0392B` pentru butoanele de acțiune principală (ex: `✨ Analyse`) și pentru starea „Active” a modulelor.

---

## 2. Pilonul Funcțional: „The Feedback Loop”
Cea mai mare schimbare: modulele nu mai sunt silozuri. Ele comunică.

### A. Analytics → Content Studio (M11 → M2)
*   **Butonul `✨ Analyse`:** Implementat sub fiecare video în Content Library.
*   **Logic:** AI-ul citește transcriptul video-ului și cifrele de la Instagram API. 
*   **Output:** Produce un obiect de tip „Learning”: `{ "hook_score": 85, "reason": "Addressing pain point X worked", "suggestion": "Double down on this angle" }`.
*   **Action:** Acest learning este injectat automat în promptul de generare pentru următoarea săptămână de scripturi.

### B. Competitor Scraper (M6)
*   **Workflow:** Utilizatorul introduce `@username`. 
*   **Backend:** Folosim Apify (deja configurat) pentru a trage ultimele 10 postări ale competitorului.
*   **AI Processing:** Extragem hook-urile lor și le clasificăm în „Winning Patterns”.

---

## 3. Pilonul Nou: „Profile Audit” (M10)
O pagină nouă care transformă vizitatorii în clienți prin optimizarea bio-ului.

### Componente UI:
1.  **Image Upload/Input:** Câmp pentru a introduce URL-ul profilului de Instagram.
2.  **Audit Grid:** 6 căsuțe cu scoruri (Bio, Profile Pic, Highlights, Pinned Posts, Consistency, Niche Alignment).
3.  **Action Board:** Listă de „Priority Fixes” (lucruri de făcut imediat).
4.  **Bio Generator:** Câmp cu „Copy-Paste” pentru noul Bio optimizat de AI.

---

## 4. Schema de Baza de Date (Supabase)
Trebuie să adăugăm aceste tabele pentru a susține noul sistem:

```sql
-- Stocăm datele de la competitori
CREATE TABLE competitor_intel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE,
  last_scraped TIMESTAMP WITH TIME ZONE,
  top_hooks TEXT[],
  avg_views_last_7_days BIGINT
);

-- Stocăm rezultatele auditului de profil
CREATE TABLE profile_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  score DECIMAL(3,1),
  recommendations JSONB,
  new_bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 5. Foaia de Parcurs (Implementation Steps)

1.  **Global Style Update:** Refacem CSS-ul pentru a adopta liniile subțiri și fonturile Mono pe cifre.
2.  **The Analyse Button:** Activăm butonul de analiză în M11 (Analytics).
3.  **Competitor Engine:** Implementăm interfața de adăugare și scraping pentru competitori.
4.  **Profile Audit Tool:** Construim pagina de audit vizual.
5.  **Integration:** Legăm toate aceste date în „The Brain” pentru ca scripturile de Reels să devină „invincibile”.
