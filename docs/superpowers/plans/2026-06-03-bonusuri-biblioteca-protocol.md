# Bonusuri — Biblioteca de Protocol BUILT

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construiește pagina `/client/bonusuri` cu 15 protocoale de urgență + cookbook, navigare pe tab-uri, pagini individuale per protocol — totul în app, calitate premium.

**Architecture:** Date statice în `src/data/bonusuri.ts`, hub cu tab-uri client-side, pagini individuale via `useParams()`. Fără bază de date — conținutul e același pentru toți clienții.

**Tech Stack:** Next.js 16.2.4, TypeScript, Tailwind CSS, `"use client"`, `useParams()` din `next/navigation`

---

## File Structure

| Fișier | Acțiune | Responsabilitate |
|---|---|---|
| `src/data/bonusuri.ts` | CREATE | Tipuri + conținut complet 15 protocoale |
| `src/app/client/bonusuri/page.tsx` | MODIFY | Hub redesenat cu tab-uri pe categorii |
| `src/app/client/bonusuri/[id]/page.tsx` | CREATE | Pagina individuală a unui protocol |

---

## Task 1: Structura de date și conținutul complet

**Files:**
- Create: `src/data/bonusuri.ts`

- [ ] **Step 1: Creează `src/data/bonusuri.ts` cu tipurile și toate cele 15 protocoale**

```typescript
export type BonusCategory = 'alimentatie' | 'antrenament' | 'crize' | 'events';

export interface BonusProtocol {
  id: string;
  category: BonusCategory;
  categoryLabel: string;
  categoryColor: string; // clasa Tailwind pentru accent
  title: string;
  subtitle: string;
  shortDescription: string;
  icon: string;
  mechanism: string;
  goldenRule: string;
  protocol: string[];
  forbidden: string[];
  reframe: string;
}

export const BONUSURI: BonusProtocol[] = [
  // ─── CATEGORIA A — ALIMENTAȚIE ───────────────────────────────────────────
  {
    id: "a1-restaurant-afaceri",
    category: "alimentatie",
    categoryLabel: "Alimentație",
    categoryColor: "text-orange-400",
    title: "Restaurantul de Afaceri",
    subtitle: "Ce faci când mâncarea e la discreția altora",
    shortDescription: "Client lunch, team dinner, prânz cu parteneri. Cum navighezi orice meniu fără să compromiți sistemul.",
    icon: "🍽",
    mechanism: "Stresul profesional crește cortizolul basal, care la rândul lui crește rezistența la insulină și stimulează pofta de alimente dense caloric. Adaugă presiunea socială a unui prânz de afaceri și mecanismul de decizie al prefrontal cortex-ului scade vizibil — creierul caută calea de minimă rezistență, care e de obicei meniul cu cele mai multe calorii.",
    goldenRule: "Alegi proteina. Totul restul e negociabil.",
    protocol: [
      "Scanezi meniul căutând prima opțiune cu proteina slabă — pui la grătar, pește, carne roșie la grătar. Aceasta e ancora ta de comandă.",
      "Comanzi primul la masă. Efectul de ancorare reduce presiunea socială de a 'urma' ce comandă ceilalți.",
      "Refuzi coșul cu pâine când ajunge la masă. Dacă nu e pe masă, nu există ispita.",
      "Apă sau apă minerală ca băutură principală. Dacă există presiune pentru alcool: un pahar de vin, maxim.",
      "Dacă meniul nu are opțiuni evidente: salată + proteina separată sau o garnitură de legume în locul cartofilor."
    ],
    forbidden: [
      "Nu compensezi seara sau a doua zi cu deficit agresiv. Un prânz de afaceri la 700 kcal nu strică nimic dacă nu îl urmezi de două mese sacrificate.",
      "Nu explici nimănui că 'ești la dietă' sau că 'nu poți mânca asta'. Operezi discret în cadrul oricărui meniu.",
      "Nu mânca tot ce e pe farfurie din politețe dacă ești sătul."
    ],
    reframe: "Restaurantul de afaceri nu e o excepție din sistem — e un scenariu pe care sistemul l-a anticipat. Nu ai nevoie de voință ca să refuzi pâinea. Ai nevoie de un protocol executat automat. Asta e diferența dintre un sistem și o intenție."
  },
  {
    id: "a2-fastfood-graba",
    category: "alimentatie",
    categoryLabel: "Alimentație",
    categoryColor: "text-orange-400",
    title: "Fast-food în Grabă",
    subtitle: "Autostradă, aeroport, 15 minute la prânz",
    shortDescription: "Alimentele ultra-procesate există. Nu le interzici — înveți să navighezi prin ele fără să sabotezi metabolismul.",
    icon: "🥡",
    mechanism: "Alimentele ultra-procesate sunt inginerizate să depășească mecanismele naturale de sațietate. Combinația grăsime + sare + zahăr + carbohidrați rafinați suprimă semnalizarea leptinei și amplifică răspunsul dopaminergic, creând un ciclu de consum care depășește nevoia calorică reală. Problema nu e că ești slab — e că produsul e construit să bată biologia.",
    goldenRule: "Proteina mai întâi. Chiar și la McDonald's există opțiuni.",
    protocol: [
      "McChicken sau burger fără chifle, salată cu pui grillat, wrap fără sos — acestea există în orice lanț major. Identifici varianta cu proteina maximă.",
      "Nu combini cu cartofi prăjiți. Dacă ai nevoie de ceva în plus, alege salată sau porumb.",
      "Apă sau apă minerală, nu suc. Sucul adaugă 200-300 kcal lichide care nu generează sațietate.",
      "Mănânci la masă, nu în mașină. Alimentarea inconștientă crește consumul cu 20-30%.",
      "Dacă nu există nicio opțiune decentă: un sandwich simplu și mănânci o masă corectă la 2-3 ore distanță."
    ],
    forbidden: [
      "Nu îți promite că 'compensezi mai târziu'. Compensarea agresivă post-fast-food produce un ciclu binge-restrict care destabilizează metabolismul.",
      "Nu alege combo-ul automat. Combo-ul e proiectat să mărească consumul, nu să satisfacă foamea."
    ],
    reframe: "Nu există mâncare nepermisă în sistem — există alegeri mai puțin eficiente. Un McChicken fără chifle e o masă funcțională. Spirala de vinovăție de după e singura problemă reală."
  },
  {
    id: "a3-gratar-romanesc",
    category: "alimentatie",
    categoryLabel: "Alimentație",
    categoryColor: "text-orange-400",
    title: "Grătarul Românesc",
    subtitle: "Mici, bere, presiune socială și familie",
    shortDescription: "Cel mai testul sistem real în România. Cum participi deplin fără să compromiți progresul.",
    icon: "🔥",
    mechanism: "Contextele de mâncat social activează sistemul limbic — conexiune, apartenanță, plăcere — și suprimă temporar decizia rațională. Presiunea culturală românească adaugă un strat suplimentar: cel care refuză mâncarea sau băutura 'e bolnav' sau 'face mofturi'. Aceasta e o presiune reală, nu o scuză. Sistemul o recunoaște și oferă un cadru care funcționează în ea, nu împotriva ei.",
    goldenRule: "Mănânci tot ce e pe grătar. Eviți ce e în pâine și ce e în pahar.",
    protocol: [
      "Mănânci ceva consistent înainte de grătar: 30g proteina + grăsimi. Ajungi cu glicemia stabilă, nu flămând.",
      "Mici, pui, coaste, ceafă la grătar — toate sunt surse excelente de proteina. Mănânci fără restricție.",
      "Pâinea și micii 'în pâine' — eviți. Nu faci un scandal, nu explici nimănui. Pur și simplu nu pui pâinea.",
      "Bere: maxim 1-2 pahare, nu sticlă după sticlă. Alcoolul blochează oxidarea grăsimilor la nivel hepatic pentru 12-24h.",
      "Mezeluri procesate (cârnați în pachet, cremwurst) — minimizezi, nu pentru calorii, ci pentru conținutul de aditivi și sodiu."
    ],
    forbidden: [
      "Nu explici nimănui că ești 'la dietă' sau că 'nu poți mânca'. Ești la un grătar, nu la o sesiune de coaching.",
      "Nu compensa a doua zi cu înfometare. Grătarul nu a stricat nimic dacă nu l-ai urmat de o zi de zero mâncare."
    ],
    reframe: "Grătarul românesc e una din marile plăceri ale vieții. Sistemul BUILT nu îți interzice asta — îți oferă un cadru în care poți participa deplin fără să saboțezi cele 90 de zile. Mici cu muștar, nu mici în pâine. Diferența e minimă social, semnificativă metabolic."
  },
  {
    id: "a4-restaurant-familie",
    category: "alimentatie",
    categoryLabel: "Alimentație",
    categoryColor: "text-orange-400",
    title: "Restaurantul cu Familia",
    subtitle: "Meniu ales de grup, mâncat în comun, copii la masă",
    shortDescription: "Controlezi porția și viteza, nu meniul. Ești prezent la masă, nu în sesiune de nutriție.",
    icon: "👨‍👩‍👧",
    mechanism: "Mâncatul cu familia implică control redus al meniului, mâncare pusă pe masă în comun și presiunea de a mânca ce mănâncă toată lumea. În plus, prezența copiilor creează distrageri care favorizează alimentarea inconștientă — mănânci ce rămâne, mănânci repede, mănânci din farfuria lor. Studiile arată că distragerea în timpul mesei crește consumul caloric cu 15-25%.",
    goldenRule: "Controlezi porția și viteza. Nu controlezi meniul.",
    protocol: [
      "Comanzi primul sau în primii — înainte ca grupul să influențeze decizia.",
      "Proteina e baza: pui, pește, carne roșie. Garniturile sunt mai puțin importante.",
      "Mănânci lent și conștient — pune furculița jos între îmbucături. Sațietatea apare la 15-20 minute după ce ai mâncat suficient.",
      "Nu mânca din farfuriile copiilor din reflex. Aceasta e una din cele mai frecvente surse ascunse de calorii la părinți.",
      "Dacă meniul e limitat (pizza, paste) — alegi varianta cu proteina maximă și mănânci o porție, nu două."
    ],
    forbidden: [
      "Nu mânca din stres dacă masa durează 2 ore și e haotică. Haosul de la masă e o stare de fapt, nu un motiv să mânci în exces.",
      "Nu transforma masa de familie în sesiune de nutriție publică. Aplici sistemul discret."
    ],
    reframe: "Masa cu familia e un ritual social prețios. Nu o transformi în sesiune de coaching. Aplici câteva principii simple în background și ești prezent la ceea ce contează cu adevărat."
  },
  {
    id: "a5-sarbatori-romanesti",
    category: "alimentatie",
    categoryLabel: "Alimentație",
    categoryColor: "text-orange-400",
    title: "Sărbătorile Românești",
    subtitle: "Crăciun, Paști, Revelion — cum gestionezi 3-7 zile de excepție",
    shortDescription: "2-3 zile de surplus nu distrug 60-80 de zile de muncă. Spirala de vinovăție post-sărbătoare o face.",
    icon: "🎄",
    mechanism: "Crăciunul, Paștele și Revelionul sunt perioadele cu cel mai mare risc de abandon la orice program — nu pentru că mâncarea strică progresul (2-3 zile de surplus caloric moderat nu distrug luni de muncă), ci pentru că spirala de vinovăție post-sărbătoare produce abandonul complet al sistemului. Fenomenul 'ce-a fost, a fost' e cea mai costisitoare greșeală cognitivă în coaching.",
    goldenRule: "Mănânci de Crăciun. Nu din 20 decembrie pe 10 ianuarie.",
    protocol: [
      "Definești exact zilele de 'excepție gestionată': 25-26 decembrie, 1 ianuarie, 19-20 aprilie (Paști). Acestea și atât.",
      "În zilele de excepție: nu numeri calorii, mănânci ce vrei, participi deplin la masa de familie.",
      "Antrenamentul nu se oprește complet pe toată perioada de sărbători — 3 sesiuni pe săptămână, chiar și mai scurte.",
      "Hidratare crescută: alcoolul și mâncarea sărată din această perioadă rețin apa. 3L apă/zi minimum.",
      "Ziua după excepție: masă normală, nu deficit agresiv. Sistemul reintrătn ritm natural."
    ],
    forbidden: [
      "Nu te cântări în zilele imediat după sărbători. Retenția de apă și glicogenul pot arăta 2-3 kg în plus — nu sunt grăsime.",
      "Nu 'compensa' cu 3h de cardio pe 27 decembrie. Aceasta e psihologia restricție-binge, nu un sistem.",
      "Nu extinde excepția la 2-3 săptămâni. 2 zile de excepție gestionată, restul sistem normal."
    ],
    reframe: "Sărbătorile nu sunt inamicul corpului tău — sunt o parte din viața reală pe care sistemul BUILT o anticipează. Clientul BUILT mănâncă sarmalele de Crăciun. Diferența e că se oprește pe 26 decembrie, nu pe 10 ianuarie."
  },

  // ─── CATEGORIA B — ANTRENAMENT ───────────────────────────────────────────
  {
    id: "b1-hotel-fara-sala",
    category: "antrenament",
    categoryLabel: "Antrenament",
    categoryColor: "text-blue-400",
    title: "Hotelul fără Sală",
    subtitle: "Deplasare, cameră de 20 mp, zero echipament",
    shortDescription: "30 de minute. Propriul corp e singurul echipament necesar. Protocolul complet pentru orice cameră de hotel.",
    icon: "🏨",
    mechanism: "Sedentarismul prelungit (>48h) reduce NEAT (Non-Exercise Activity Thermogenesis) cu 15-20% și scade nivelul de testosteron și hormon de creștere. Nu ai nevoie de echipament pentru a menține baseline-ul hormonal — ai nevoie de contracție musculară sub rezistență, indiferent de sursa acesteia. Greutatea corpului, schimbarea unghiului și tempoul controlat sunt suficiente.",
    goldenRule: "30 de minute. Propriul corp e singurul echipament necesar.",
    protocol: [
      "Push: Push-up declinat cu picioarele pe marginea patului (umeri) + push-up standard (piept) + pike push-up (umeri). 3 seturi din fiecare, 10-15 repetări.",
      "Picioare: Bulgarian split squat cu piciorul pe pat (3 × 12 per picior) + single-leg glute bridge (3 × 15). Dacă ai valiză: o ții în mâini pentru rezistență suplimentară.",
      "Core: Hollow body hold (3 × 30 sec) + plank lateral (3 × 20 sec per parte) + dead bug (3 × 10 per parte).",
      "Cardio de închidere: 5 minute — 30 secunde jumping jacks + 30 secunde repaus. Sau 5 runde de burpees.",
      "Structura totală: 25-30 minute. Pauze de 30-45 secunde între seturi."
    ],
    forbidden: [
      "Nu sări peste antrenament pentru că 'nu ai sala'. Un antrenament în cameră e inferior unui antrenament complet, nu inferior sedentarismului.",
      "Nu improvizezi 50 de exerciții. 4-5 exerciții executate cu intensitate > 20 exerciții executate haotic."
    ],
    reframe: "Hotelul fără sală e un test de sistem, nu o scuză. Dacă sistemul funcționează doar în condiții perfecte, nu e un sistem — e o rutină. Rutinele cedează. Sistemele nu."
  },
  {
    id: "b2-sala-necunoscuta",
    category: "antrenament",
    categoryLabel: "Antrenament",
    categoryColor: "text-blue-400",
    title: "Sala Necunoscută",
    subtitle: "Călătorie, echipament diferit, nu știi ce să faci",
    shortDescription: "3 tipare de mișcare: împingere + tragere + picioare. Restul e detaliu. Funcționează în orice sală din lume.",
    icon: "🏋️",
    mechanism: "Echipamentul nefamiliar produce paralizie de decizie — te plimbi prin sală 20 de minute fără să știi ce faci. Soluția nu e să reproduci exact antrenamentul de acasă, ci să aplici aceleași tipare de mișcare fundamentale (împingere orizontală, tragere verticală, extensie șold) cu echipamentul disponibil. Tiparele de mișcare sunt universale — echipamentul e doar instrumentul.",
    goldenRule: "3 tipare de mișcare: împingere + tragere + picioare. Restul e detaliu.",
    protocol: [
      "Identifici în sală: o stație de împingere (presă, gantere, bare) + o stație de tragere (cables, bară de tracțiuni, rowing) + o stație pentru picioare (presă, rack, gantere pentru split squat).",
      "Execuți 1 exercițiu principal din fiecare tipar: 4 seturi × 8-10 repetări la intensitate normală.",
      "Nu te grăbești să explorezi toată sala. Concentrare pe 3 exerciții executate corect > 10 exerciții executate haotic.",
      "Dacă nu găsești un echipament specific: înlocuiești cu varianta bodyweight (push-up, pull-up, squat bulgăresc).",
      "Durata: 45-60 minute maxim. Eficiența, nu durata."
    ],
    forbidden: [
      "Nu pierzi 20 minute explorând sala. Intri cu planul de 3 tipare și execuți.",
      "Nu reduci greutatea sau intensitatea pentru că 'e o sală necunoscută'. Corpul tău e același oriunde."
    ],
    reframe: "O sală necunoscută are tot ce ai nevoie. Bara, haltere, cabluri sau greutatea corpului tău — sunt suficiente pentru orice antrenament productiv. Problema nu e echipamentul, ci planul."
  },
  {
    id: "b3-acasa-fara-echipament",
    category: "antrenament",
    categoryLabel: "Antrenament",
    categoryColor: "text-blue-400",
    title: "Acasă fără Echipament",
    subtitle: "Oriunde, oricând, zero investiție în echipament",
    shortDescription: "Antrenamentul cu greutatea proprie poate produce 85-90% din stimulul muscular al sălii dacă aplici principiile corecte de progresie.",
    icon: "🏠",
    mechanism: "Cercetările arată că antrenamentul cu greutatea proprie produce 85-90% din stimulul muscular al antrenamentului cu greutăți externe, dacă se aplică principiile progresiei: tempo controlat (3-4 secunde excentrice), amplitudine maximă de mișcare și suprasarcină progresivă prin variații mai dificile. Lipsa echipamentului nu e o problemă de stimul muscular — e o problemă de creativitate în selecția exercițiilor.",
    goldenRule: "Dacă poți face 3 seturi de 8-12 repetări cu formă corectă, exercițiul funcționează.",
    protocol: [
      "Push: push-up standard → archer push-up → pseudo planche push-up. Alegi varianta la care poți face 8-12 repetări cu formă corectă. Tempo: 3 secunde coborâre, 1 secundă sus.",
      "Pull: bară de ușă → pull-up/chin-up. Fără bară → inverted row sub o masă solidă (picioare pe scaun pentru dificultate crescută).",
      "Picioare: squat bulgăresc cu un picior pe scaun (îngreuiere cu rucsac dacă e nevoie) + single-leg Romanian deadlift (balans + coordonare).",
      "Core: hollow body rocks (3 × 10) + L-sit pe scaune (3 × hold maxim) sau ab wheel cu prosop pe parchet.",
      "Cardio opțional: 3-5 runde de 30 secunde sprint pe loc + 30 secunde repaus."
    ],
    forbidden: [
      "Nu face 100 flotări cu formă proastă. 30 flotări executate lent, cu control excentrice, stimulează mai mult.",
      "Nu sări peste antrenament pentru că 'nu e la fel ca la sală'. Nu e la fel — e 85% din efect, cu zero deplasare."
    ],
    reframe: "Lipsa echipamentului nu e un obstacol — e o problemă de inginerie care are soluție. Sistemul a rezolvat-o pentru tine. Singura variabilă rămasă ești tu."
  },
  {
    id: "b4-timp-criza",
    category: "antrenament",
    categoryLabel: "Antrenament",
    categoryColor: "text-blue-400",
    title: "Timp de Criză",
    subtitle: "Ai 25-35 minute disponibile, nu mai mult",
    shortDescription: "Un antrenament de 25 minute executat la 90% intensitate e superior unui antrenament de 60 minute executat la 60%. Variabila critică e intensitatea, nu durata.",
    icon: "⚡",
    mechanism: "Studiile publicate în Journal of Strength and Conditioning Research arată că sesiunile de 20-25 minute de intensitate ridicată mențin forța și compoziția corporală când volumul e redus temporar. Mecanismul: intensitatea mare stimulează fibrele musculare de tip II și crește răspunsul hormonal anabolic (testosteron, GH) indiferent de volumul total. Durata sesiunii nu e variabila cheie — stimulul muscular e.",
    goldenRule: "Nu ai timp de un antrenament complet. Ai timp de un antrenament eficient.",
    protocol: [
      "Warm-up: 3 minute — mobilitate articulară + activare (rotații umeri, squat adânc, hip hinge).",
      "Bloc principal — circuit de 4 exerciții compound fără pauze între ele: Squat variație (4 × 8) + Împingere (4 × 10) + Tragere (4 × 10) + Hip hinge/Romanian deadlift (4 × 10). Pauză 45 secunde între runde.",
      "Nu schimbi exercițiile față de planul normal — reduci pauza și menții intensitatea.",
      "Cooldown: 2 minute stretching static (flexori șold + piept).",
      "Total: 25-30 minute net, fără compromis pe greutăți."
    ],
    forbidden: [
      "Nu adaugi exerciții de izolație (biceps curl, lateral raise) când ai timp limitat. Compound movements first, always.",
      "Nu reduci greutatea pentru că 'te grăbești'. Intensitatea e variabila care contează — nu o sacrifici."
    ],
    reframe: "25 de minute nu e un semi-antrenament — e un antrenament cu densitate maximă. Cel mai productiv antrenament al săptămânii poate fi cel mai scurt, dacă e executat corect."
  },

  // ─── CATEGORIA C — CRIZE DE SISTEM ───────────────────────────────────────
  {
    id: "c1-protocol-urgenta",
    category: "crize",
    categoryLabel: "Crize de Sistem",
    categoryColor: "text-red-400",
    title: "Protocolul de Urgență",
    subtitle: "Primele 24h după ce ai căzut din sistem",
    shortDescription: "Nu compensezi. Nu judeci. Un singur pas imediat și ești înapoi în sistem.",
    icon: "🚨",
    mechanism: "Fiecare deviere de la rutină activează bias-ul cognitiv 'all-or-nothing': 'am ratat, n-are rost să mai continui'. Aceasta nu e o problemă de caracter — e răspunsul implicit al cortexului prefrontal sub stres. Cercetările în psihologia comportamentului arată că primul comportament post-deviere determină traiectoria: un singur pas în direcția corectă în 24h reactivează sistemul de obiceiuri, indiferent de magnitudinea devierii.",
    goldenRule: "Nu compensezi. Nu judeci. Reintri în sistem în 24 de ore cu un singur pas.",
    protocol: [
      "Prima acțiune (în primele 24h): O masă corectă. Nu trei mese perfecte — una. Proteina + legume + carbohidrat moderat. Aceasta repornește sistemul.",
      "A doua acțiune: Un antrenament. Chiar și 20 de minute. Nu antrenamentul perfect — orice mișcare structurată contează.",
      "Trimite check-in lui Claudiu. Nu trebuie să fie un raport complet — două rânduri despre ce s-a întâmplat și ce ai făcut ca să reintri.",
      "Hidratare: 2.5-3L apă în ziua de revenire. Stresul și alimentația haotică deshidratează.",
      "Somnul: prioritizezi somnul în noaptea de revenire. Privarea de somn menține cortizolul ridicat și sabotează revenirea."
    ],
    forbidden: [
      "Nu planifici 'săptămâna de compensare'. Compensarea extremă e tot o formă de all-or-nothing thinking.",
      "Nu aștepți motivația. Motivația vine după primul pas, nu înainte.",
      "Nu te cântărești a doua zi dimineața. Greutatea e un semnal cu zgomot mare imediat după o deviere."
    ],
    reframe: "Nu există eșec în sistem — există capitole pe care le știam că vor veni. Protocolul de urgență există tocmai pentru că ieșirile din sistem sunt previzibile. Sistemul e construit să supraviețuiască vieții reale."
  },
  {
    id: "c2-saptamana-pierduta",
    category: "crize",
    categoryLabel: "Crize de Sistem",
    categoryColor: "text-red-400",
    title: "Săptămâna Pierdută",
    subtitle: "Ai ratat tot — cum reintri fără să compensezi",
    shortDescription: "O săptămână de antrenament absent produce pierderi minime. Sistemul nervos central păstrează tot ce ai construit.",
    icon: "📅",
    mechanism: "O săptămână de antrenament redus sau absent produce pierderi de forță de 2-3% și nu afectează semnificativ masa musculară dacă proteina e menținută. Sistemul nervos central păstrează pattern-urile motorii învățate — fenomenul 'muscle memory' are o bază neurologică reală (sinaptic potentiation menținut săptămâni). Ce se pierde cel mai repede nu e mușchi — e condiționarea cardiovasculară (VO2 max scade cu 5-7% într-o săptămână) și obiceiul.",
    goldenRule: "O săptămână pierdută nu distruge 12 săptămâni de muncă. Spirala de vinovăție o face.",
    protocol: [
      "Nu inventariezi tot ce ai 'ratat'. Nu există recuperare pentru trecut — există revenire la prezent.",
      "Prima săptămână de revenire: 70-75% din intensitatea normală. Volumul complet revine în săptămâna 2.",
      "Nu adaugi sesiuni extra ca să 'recuperezi volumul pierdut'. Suprasolicitarea post-pauză crește riscul de accidentare cu 40%.",
      "Proteina rămâne la nivelul normal pe toată perioada — inclusiv în săptămâna pierdută dacă e posibil.",
      "Reintri în structura de check-in ca și când nimic nu s-a întâmplat. Accountability, nu autopedepsire."
    ],
    forbidden: [
      "Nu te antrena de două ori pe zi ca să compensezi. Aceasta e psihologia restricție-binge aplicată antrenamentului.",
      "Nu anula planul și nu cere refacerea lui completă. Planul e valid — tu ai ieșit temporar din el."
    ],
    reframe: "Corpul tău e mai rezistent decât crezi. A suportat ani de inactivitate completă și tot a răspuns la sistem. O săptămână pierdută e zgomot statistic în 90 de zile de progres."
  },
  {
    id: "c3-binge-weekend",
    category: "crize",
    categoryLabel: "Crize de Sistem",
    categoryColor: "text-red-400",
    title: "Binge-ul de Weekend",
    subtitle: "Ai mâncat haotic 2-3 zile",
    shortDescription: "+2-5 kg pe cântar după weekend nu sunt grăsime. Sunt apă și glicogen. Dispare în 4-5 zile cu revenire la sistem.",
    icon: "🍕",
    mechanism: "Un binge de 2-3 zile crește glicogenul muscular și hepatic la maxim și produce retenție de apă cauzată de sodiu crescut și carbohidrați în exces. Fiecare gram de glicogen reține 3-4g de apă. Greutatea care apare pe cântar (2-5 kg) nu e grăsime — e apă și glicogen. Grăsimea reală necesită un surplus caloric de 7.000 kcal pentru 1 kg — imposibil de acumulat în 2-3 zile.",
    goldenRule: "Ce ai mâncat în weekend nu e grăsime. E apă și glicogen. Dispare în 4-5 zile.",
    protocol: [
      "Luni dimineața: masă normală (nu sari peste mic dejun 'ca să compensezi'). Foamea de luni dimineața e semnalul că metabolismul funcționează normal.",
      "Hidratare masivă: 3-3.5L apă luni-marți. Elimini surplusul de sodiu și reduci retenția de apă.",
      "Antrenament luni normal. Glicogenul crescut din weekend te avantajează de fapt la sesiunea de luni — ai carburant.",
      "Nu intri în deficit caloric agresiv. Deficitul post-binge creează un ciclu binge-restrict care destabilizează metabolismul pe termen lung.",
      "Nu te cântări timp de 5 zile. Greutatea post-binge nu reflectă realitatea compoziției corporale."
    ],
    forbidden: [
      "Nu sări peste mese luni-marți. Compensarea prin înfometare e singura parte a ciclului care produce daune reale.",
      "Nu redefini weekendul ca 'zi liberă permanentă'. Excepțiile gestionate există. Weekendul ca sistem alternativ nu."
    ],
    reframe: "Binge-ul de weekend e un capitol cunoscut. Sistemul l-a anticipat. Singura decizie care contează e ce faci luni dimineața."
  },
  {
    id: "c4-stres-extrem",
    category: "crize",
    categoryLabel: "Crize de Sistem",
    categoryColor: "text-red-400",
    title: "Stresul Extrem",
    subtitle: "Deadline, criză la muncă, insomnie, cortizol",
    shortDescription: "Stresul cronic e deja catabolism. Strategia nu e să forțezi sistemul — e să protejezi ce contează mai mult.",
    icon: "🧠",
    mechanism: "Stresul cronic crește cortizolul → cortizolul crescut accelerează depunerea de grăsime viscerală, suprimă testosteronul și GH, afectează recuperarea musculară și amplifică poftele pentru alimente dense caloric. Antrenamentul intens cu somn sub 5h adaugă un stressor suplimentar sistemului nervos deja suprasolicitat, crește riscul de accidentare și poate produce rhabdomioliza în cazuri extreme.",
    goldenRule: "Dacă nu poți antrena și mânca corect, mănâncă corect. Aceasta e prioritatea 1.",
    protocol: [
      "Sub 5h somn → înlocuiești antrenamentul de forță cu mers 20-30 minute. Nu e înfrângere — e management inteligent al sistemului nervos.",
      "Mâncarea nu se negociază. Chiar și în perioada de criză: proteina + legume + carbohidrat. O singură masă bună pe zi e mai valoroasă decât zero.",
      "Stresul cronic e deja catabolism — nu mai adaugi cortizol din antrenament de intensitate mare cu somn insuficient.",
      "Suplimentare validată pentru perioade de stres: magneziu (400mg seara), vitamina D dacă nu e deja în protocol, omega-3. Acestea au dovezi clare pentru modularea cortizolului.",
      "Trimiți check-in lui Claudiu cu situația reală. Sistemul se adaptează — dar doar dacă există comunicare."
    ],
    forbidden: [
      "Nu renunța la mâncare ca să 'câștigi timp'. Alimentarea proastă sub stres amplifică cortizolul, nu îl reduce.",
      "Nu lua decizii majore despre program în vârful perioadei de stres. 'Renunț, nu funcționează' e vocea epuizării, nu evaluarea ta reală."
    ],
    reframe: "Stresul extrem e o urgență de sistem nervos, nu un test de caracter. Cel mai inteligent lucru pe care îl poți face e să menții proteina și somnul. Restul revine la locul lui când criza trece."
  },
  {
    id: "c5-boala-usoara",
    category: "crize",
    categoryLabel: "Crize de Sistem",
    categoryColor: "text-red-400",
    title: "Boala Ușoară",
    subtitle: "Răceală, oboseală, simptome minore",
    shortDescription: "Regula neck check: simptome deasupra gâtului = antrenament posibil. Sub gât = repaus obligatoriu. Fără excepții.",
    icon: "🤒",
    mechanism: "Regula 'neck check' e validată în medicina sportivă și folosită de la sportivii de performanță: simptome deasupra gâtului (nas înfundat, ușoară durere în gât, oboseală ușoară) indică o infecție localizată la nivel superior — antrenament la 50-70% e posibil fără a agrava boala. Simptome sub gât (febră >37.5°C, congestie pulmonară, dureri musculare sistemice, GI issues) = sistem imunitar în luptă activă. Antrenamentul cu febră crește temperatura centrală suplimentar și prelungește recuperarea cu 2-4 zile.",
    goldenRule: "Răceală = antrenament ușor posibil. Febră = repaus complet. Fără excepții.",
    protocol: [
      "Faci neck check. Simptome exclusiv deasupra gâtului? Continui cu intensitate 50-70%. Jos de gât sau febră? Repaus complet.",
      "Febra >37.5°C = zero antrenament. Nu negociezi cu asta.",
      "Hidratare masivă (3L+), proteina menținută (ajută imunitatea — aminoacizii sunt precursori pentru anticorpi), carbohidrați moderați.",
      "Somnul e 'antrenamentul' tău în perioada de boală — minimum 8-9h. GH secretat în somn profund e principalul mediator al recuperării.",
      "Revenirea la antrenament: o zi după ce febra a dispărut complet, reintri la 60-70% intensitate."
    ],
    forbidden: [
      "Nu 'transpiri boala' cu antrenament intens. Aceasta e o credință populară fără bază fiziologică și prelungește recuperarea.",
      "Nu sări 7-10 zile de antrenament dacă e doar o răceală ușoară. Mobilizarea ușoară accelerează recuperarea la virusuri respiratorii superioare."
    ],
    reframe: "Boala e un semnal de sistem, nu un eșec. Corpul redistribuie resurse spre imunitate. Tu colaborezi cu el, nu forțezi sistemul."
  },

  // ─── CATEGORIA D — EVENIMENTE SOCIALE ────────────────────────────────────
  {
    id: "d1-nunta-botez",
    category: "events",
    categoryLabel: "Evenimente",
    categoryColor: "text-purple-400",
    title: "Nunta / Botezul / Cumetria",
    subtitle: "Meniu fix, bar deschis, 6-8 ore de eveniment",
    shortDescription: "Mâncarea de la nuntă nu strică nimic. Alcoolul în exces blochează oxidarea grăsimilor pentru 12-24h.",
    icon: "💒",
    mechanism: "Evenimentele sociale românești sunt maratoane de 6-8 ore cu serviciu continuu de mâncare. Variabila metabolică critică nu e mâncarea — e alcoolul. Etanolul inhibă oxidarea acizilor grași la nivel hepatic prin acumularea de NADH, deoarece ficatul prioritizează metabolizarea etanolului față de orice altă sursă energetică. Aceasta nu înseamnă că toate caloriile mâncate se depun direct ca grăsime, dar eficiența metabolică scade semnificativ pentru 12-24h după consum.",
    goldenRule: "Mâncarea de la nuntă nu strică nimic. Alcoolul în exces face ravagii metabolice.",
    protocol: [
      "Mănânci ceva consistent înainte de eveniment: 30-40g proteina + grăsimi. Ajungi cu glicemia stabilă, nu flămând.",
      "La eveniment: proteina (friptură, pui, pește) e prioritatea pe orice bufet sau meniu fix.",
      "Alcool: dacă bei, alegi o singură categorie (fie vin, fie tărie). Cantitate: 2-3 pahare de vin sau echivalent.",
      "Apă între băuturi alcoolice — nu ca ritual de sănătate, ci pentru că hidratarea reduce efectele negative și reduce consumul total.",
      "Tortul și desertul sunt o alegere, nu o obligație. Dacă vrei — o porție."
    ],
    forbidden: [
      "Nu bea 'pentru că nu dă bine să refuzi'. Poți ține un pahar în mână fără să-l bei. Nimeni nu verifică.",
      "Nu mânca din toate platoul-urile din politețe. Ești acolo pentru eveniment, nu pentru bufet."
    ],
    reframe: "Nunta e o celebrare, nu o excepție de la fiziologie. Poți participa deplin și inteligent simultan. Nu ești singurul de la masă care face alegeri — ești singurul care le face cu un sistem în spate."
  },
  {
    id: "d2-concediu-all-inclusive",
    category: "events",
    categoryLabel: "Evenimente",
    categoryColor: "text-purple-400",
    title: "Concediul All-Inclusive",
    subtitle: "Bufet nelimitat, piscină, zero rutină",
    shortDescription: "Nu ești în concediu de la corp. Ești în concediu de la stres. Există o diferență importantă.",
    icon: "🏖",
    mechanism: "Ambientele bufet activează o contradicție psihologică: abundența declanșează mentalitatea de penurie ('trebuie să mănânc tot pentru că am plătit'). Studiile publicate în Appetite arată că oamenii mănâncă 30-50% mai mult în medii bufet față de meniu fix. Suplimentar, 2 săptămâni de antrenament redus scad condiționarea cardiovasculară cu 10-15%, dar forța se menține la 90%+ — investiția anterioară e protejată.",
    goldenRule: "Nu ești în concediu de la corp. Ești în concediu de la stres.",
    protocol: [
      "Prima farfurie la orice masă: proteina + legume. Aceasta reduce apetitul pentru restul bufetului.",
      "A doua farfurie (opțional): ce vrei, cât vrei. Ai deja proteina acoperită.",
      "Antrenament: 3 sesiuni pe săptămână, 30-40 minute, bodyweight sau sala hotelului. Nu e negociabil — e protecția investiției de 90 de zile.",
      "Hidratare masivă: clima caldă + alcool + sare din mâncare produc deshidratare semnificativă. 3-4L apă/zi.",
      "Somnul: prioritizat. Un concediu cu somn bun e mai valoros metabolic decât orice protocol de antrenament."
    ],
    forbidden: [
      "Nu calcula caloriile în concediu. Ai un sistem funcțional — dai drumul și te relaxezi.",
      "Nu te cântări în concediu sau în prima săptămână după. Fluctuațiile de apă și sodiu sunt normale."
    ],
    reframe: "All-inclusive-ul e o oportunitate de recuperare, nu o amenințare la adresa progresului. Corpul tău a muncit 60-80 de zile. Îi dai combustibil bun și odihnă — și revii la sistem după."
  },
  {
    id: "d3-vacanta-familie",
    category: "events",
    categoryLabel: "Evenimente",
    categoryColor: "text-purple-400",
    title: "Vacanța cu Familia",
    subtitle: "Copii, program haotic, mâncat cu tot grupul",
    shortDescription: "Obiectivul în vacanța cu familia e mentenanța, nu progresia. Ai instrumentele pentru asta.",
    icon: "👨‍👩‍👧‍👦",
    mechanism: "Vacanța cu familia combină disrupția programului de antrenament cu disrupția alimentară simultan, creând o presiune compusă. Adaugă oboseala din activitățile cu copiii, privarea parțială de somn (dacă sunt copii mici) și lipsa rutinei. Goalul se schimbă: nu mai ești în faza de construcție, ești în faza de mentenanță. Aceasta e o decizie strategică, nu un eșec.",
    goldenRule: "Obiectivul în vacanța cu familia e mentenanța, nu progresia.",
    protocol: [
      "Antrenament: 3 sesiuni pe săptămână, 25-30 minute bodyweight, dimineața devreme înainte ca familia să se trezească.",
      "Mâncarea: identifici 2-3 restaurante cu opțiuni clare (grill, proteina) în zona în care ești — nu improvizezi fiecare masă.",
      "Aplici principiul restaurantului cu familia (A4) la orice masă de grup: proteina ca bază, porție controlată, prezent.",
      "Activitățile fizice cu copiii (înot, mers, explorare) contează în NEAT și susțin metabolismul fără efort deliberat.",
      "Trimiți check-in scurt la fiecare 3-4 zile. Două rânduri, nu un raport complet."
    ],
    forbidden: [
      "Nu sacrifici somnul pentru antrenament. Dacă copilul a dormit prost și tu ai dormit 5h, antrenamentul nu e prioritatea dimineții — aplici C4.",
      "Nu pui familia în așteptare pentru fiecare sesiune de antrenament. 30 minute devreme dimineața rezolvă totul discret."
    ],
    reframe: "Vacanța cu familia e una din cele mai bune motivații pentru care muncești la corp. Nu o transforma în perioadă de tensiune. Ești prezent, aplici sistemul în background și te bucuri."
  },
];

export const CATEGORY_LABELS: Record<BonusCategory, string> = {
  alimentatie: "Alimentație",
  antrenament: "Antrenament",
  crize: "Crize de Sistem",
  events: "Evenimente",
};

export const CATEGORY_ORDER: BonusCategory[] = [
  "alimentatie",
  "antrenament",
  "crize",
  "events",
];

export function getBonusById(id: string): BonusProtocol | undefined {
  return BONUSURI.find(b => b.id === id);
}

export function getBonusesByCategory(category: BonusCategory): BonusProtocol[] {
  return BONUSURI.filter(b => b.category === category);
}
```

- [ ] **Step 2: Verifică TypeScript**

```bash
cd "built-ai-command-center" && npx tsc --noEmit 2>&1 | head -20
```

Expected: fără erori pe fișierul nou.

- [ ] **Step 3: Commit**

```bash
git -C "built-ai-command-center" add src/data/bonusuri.ts
git -C "built-ai-command-center" commit -m "feat: add bonusuri protocol data — 15 protocoale complete"
```

---

## Task 2: Hub redesenat cu tab-uri

**Files:**
- Modify: `src/app/client/bonusuri/page.tsx`

- [ ] **Step 1: Înlocuiește complet `src/app/client/bonusuri/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import {
  BONUSURI,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  getBonusesByCategory,
  type BonusCategory,
} from "@/data/bonusuri";

const CATEGORY_ICONS: Record<BonusCategory, string> = {
  alimentatie: "🍽",
  antrenament: "⚡",
  crize: "🚨",
  events: "🎉",
};

const CATEGORY_DESCRIPTIONS: Record<BonusCategory, string> = {
  alimentatie: "Restaurant, fast-food, grătar, familie, sărbători",
  antrenament: "Hotel, sală nouă, acasă, timp limitat",
  crize: "Urgență, săptămână pierdută, binge, stres, boală",
  events: "Nuntă, all-inclusive, vacanță cu familia",
};

export default function BonusuriPage() {
  const [activeCategory, setActiveCategory] = useState<BonusCategory>("alimentatie");
  const protocols = getBonusesByCategory(activeCategory);

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <span className="text-[10px] font-bold text-built-red uppercase tracking-widest mb-2 block">
          Pachet Exclusiv
        </span>
        <h1 className="text-2xl font-bold text-white">Biblioteca de Protocol BUILT</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Orice situație din cele 90 de zile are un protocol. Nu ești niciodată singur.
        </p>
      </div>

      {/* Cookbook card */}
      <a
        href="/BUILT_Cookbook_v2.html"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 bg-[#111111] border border-built-red/30 hover:border-built-red/60 rounded-xl p-4 mb-8 transition-all group"
      >
        <span className="text-3xl">🥩</span>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold text-built-red uppercase tracking-widest block mb-0.5">
            Nutriție & Performanță
          </span>
          <h3 className="text-sm font-bold text-white group-hover:text-built-red transition-colors">
            BUILT 50 — Performance Cookbook
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 truncate">
            Cartea de rețete oficială — combustibil pentru cele 90 de zile
          </p>
        </div>
        <span className="text-zinc-600 group-hover:text-built-red transition-colors text-sm shrink-0">→</span>
      </a>

      {/* Tab navigation */}
      <div className="flex overflow-x-auto gap-1 pb-1 mb-6 scrollbar-none border-b border-white/5">
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 border-b-2 ${
              activeCategory === cat
                ? "text-white border-built-red bg-built-red/5"
                : "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/5"
            }`}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            {CATEGORY_LABELS[cat]}
            <span className="text-[10px] font-normal text-zinc-600 ml-0.5">
              {getBonusesByCategory(cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Category description */}
      <p className="text-xs text-zinc-600 mb-5">
        {CATEGORY_DESCRIPTIONS[activeCategory]}
      </p>

      {/* Protocol cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {protocols.map((protocol) => (
          <Link
            key={protocol.id}
            href={`/client/bonusuri/${protocol.id}`}
            className="bg-[#111111] border border-white/10 hover:border-built-red/40 rounded-xl p-5 transition-all group flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] font-bold text-built-red uppercase tracking-widest">
                Protocol {protocol.id.split("-")[0].toUpperCase()}
              </span>
              <span className="text-2xl ml-2 leading-none">{protocol.icon}</span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-built-red transition-colors mb-1">
              {protocol.title}
            </h3>
            <p className="text-xs text-zinc-500 mb-3">{protocol.subtitle}</p>
            <p className="text-xs text-zinc-400 leading-relaxed flex-1">
              {protocol.shortDescription}
            </p>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest italic">
                "{protocol.goldenRule}"
              </span>
            </div>
            <div className="mt-3 text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
              Citește protocolul →
            </div>
          </Link>
        ))}
      </div>

      {/* Footer counter */}
      <div className="mt-10 p-5 bg-built-red/5 border border-built-red/20 rounded-xl">
        <p className="text-xs text-zinc-400 leading-relaxed">
          <span className="font-bold text-white">{BONUSURI.length} protocoale</span> acoperă
          fiecare situație previzibilă din cele 90 de zile. Dacă îți apare o situație care nu
          e acoperită, scrie-mi în mesaje — o adăugăm.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verifică că build-ul trece**

```bash
cd "built-ai-command-center" && npx next build 2>&1 | tail -15
```

Expected: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git -C "built-ai-command-center" add src/app/client/bonusuri/page.tsx
git -C "built-ai-command-center" commit -m "feat: redesign bonusuri hub cu tab-uri pe categorii"
```

---

## Task 3: Pagina individuală a unui protocol

**Files:**
- Create: `src/app/client/bonusuri/[id]/page.tsx`

- [ ] **Step 1: Creează `src/app/client/bonusuri/[id]/page.tsx`**

```tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getBonusById, BONUSURI, CATEGORY_ORDER } from "@/data/bonusuri";

export default function BonusDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const protocol = getBonusById(id as string);

  if (!protocol) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-500 text-sm">Protocol negăsit.</p>
        <Link href="/client/bonusuri" className="text-built-red text-sm mt-2 inline-block">
          ← Înapoi la Bonusuri
        </Link>
      </div>
    );
  }

  // nav prev/next în aceeași categorie
  const sameCat = BONUSURI.filter(b => b.category === protocol.category);
  const idx = sameCat.findIndex(b => b.id === id);
  const prev = idx > 0 ? sameCat[idx - 1] : null;
  const next = idx < sameCat.length - 1 ? sameCat[idx + 1] : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 h-12 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/5 flex items-center px-6 gap-4">
        <Link
          href="/client/bonusuri"
          className="text-zinc-500 hover:text-white transition-colors text-sm flex items-center gap-1.5"
        >
          ← Bonusuri
        </Link>
        <div className="w-px h-4 bg-white/10" />
        <span className={`text-xs font-bold uppercase tracking-widest ${protocol.categoryColor}`}>
          {protocol.categoryLabel}
        </span>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <div className="text-5xl mb-4">{protocol.icon}</div>
          <h1 className="text-3xl font-bold text-white mb-2">{protocol.title}</h1>
          <p className="text-zinc-400 text-base">{protocol.subtitle}</p>
        </div>

        {/* Mecanism */}
        <section className="mb-8">
          <h2 className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-3">
            De ce se întâmplă
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">{protocol.mechanism}</p>
        </section>

        {/* Regula de Aur */}
        <section className="mb-8 bg-built-red/5 border border-built-red/20 rounded-xl p-5">
          <span className="text-[10px] font-bold text-built-red uppercase tracking-widest block mb-2">
            Regula de Aur
          </span>
          <p className="text-base font-bold text-white">"{protocol.goldenRule}"</p>
        </section>

        {/* Protocol */}
        <section className="mb-8">
          <h2 className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-4">
            Protocolul
          </h2>
          <ol className="space-y-3">
            {protocol.protocol.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-built-red font-bold text-sm shrink-0 w-5 text-right">
                  {i + 1}.
                </span>
                <p className="text-sm text-zinc-300 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Ce nu faci */}
        <section className="mb-8">
          <h2 className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-4">
            Ce nu faci
          </h2>
          <ul className="space-y-2">
            {protocol.forbidden.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-red-500 shrink-0 mt-0.5">✕</span>
                <p className="text-sm text-zinc-400 leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Reîncadrarea BUILT */}
        <section className="mb-10 border-l-2 border-built-red pl-5">
          <h2 className="text-[11px] font-bold text-built-red uppercase tracking-widest mb-3">
            Reîncadrarea BUILT
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed italic">{protocol.reframe}</p>
        </section>

        {/* Nav prev/next */}
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          {prev ? (
            <Link
              href={`/client/bonusuri/${prev.id}`}
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:block">{prev.title}</span>
            </Link>
          ) : (
            <div />
          )}
          <Link
            href="/client/bonusuri"
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Toate protocoalele
          </Link>
          {next ? (
            <Link
              href={`/client/bonusuri/${next.id}`}
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors"
            >
              <span className="hidden sm:block">{next.title}</span>
              <span>→</span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verifică build final**

```bash
cd "built-ai-command-center" && npx next build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`, ruta `/client/bonusuri/[id]` prezentă în output.

- [ ] **Step 3: Commit final**

```bash
git -C "built-ai-command-center" add src/app/client/bonusuri/
git -C "built-ai-command-center" commit -m "feat: add protocol detail pages /client/bonusuri/[id]"
```

---

## Self-Review

**Spec coverage:**
- ✅ 15 protocoale în 4 categorii — acoperite complet în `bonusuri.ts`
- ✅ Tab-uri pe hub — implementate în Task 2
- ✅ Pagini individuale cu template complet — implementate în Task 3
- ✅ Cookbook integrat în hub ca link extern (fișierul HTML există deja în `/public`)
- ✅ Navigare prev/next în aceeași categorie
- ✅ Design consistent cu BUILT design system (culori, fonturi, borduri)
- ✅ Mobile-friendly (tab-uri scrollabile, layout responsive)

**Placeholders:** Niciun TBD sau TODO în plan.

**Type consistency:** `BonusProtocol`, `BonusCategory`, `getBonusById`, `getBonusesByCategory` definite în Task 1 și folosite consistent în Task 2 și 3.
