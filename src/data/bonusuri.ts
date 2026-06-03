export type BonusCategory = 'alimentatie' | 'antrenament' | 'crize' | 'events';

export interface BonusProtocol {
  id: string;
  category: BonusCategory;
  categoryLabel: string;
  categoryColor: string;
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
    subtitle: "Ce faci când mâncarea este la discreția altora",
    shortDescription: "Prânz de afaceri, cină cu echipa sau întâlniri cu partenerii. Cum navighezi orice meniu fără să compromiți sistemul.",
    icon: "🍽",
    mechanism: "Stresul profesional crește cortizolul bazal, care la rândul său crește rezistența la insulină și stimulează pofta de alimente dense caloric. Adaugă presiunea socială a unui prânz de afaceri, iar mecanismul de decizie al cortexului prefrontal scade vizibil — creierul caută calea de minimă rezistență, care este de obicei meniul cu cele mai multe calorii.",
    goldenRule: "Alegi proteina. Restul este negociabil.",
    protocol: [
      "Scanezi meniul căutând prima opțiune cu proteină slabă — pui la grătar, pește, carne roșie la grătar. Aceasta este ancora ta de comandă.",
      "Comanzi primul la masă. Efectul de ancorare reduce presiunea socială de a 'urma' ceea ce comandă ceilalți.",
      "Refuzi coșul cu pâine când ajunge la masă. Dacă nu este pe masă, nu există tentație.",
      "Apă sau apă minerală ca băutură principală. Dacă există presiune pentru alcool: un pahar de vin, maximum.",
      "Dacă meniul nu are opțiuni evidente: salată plus proteina separată sau o garnitură de legume în locul cartofilor."
    ],
    forbidden: [
      "Fără compensări agresive seara sau a doua zi. Un prânz de 700 kcal nu-ți strică rezultatele, dar înfometarea care urmează, da. Continuă-ți ziua normal.",
      "Nu explici nimănui că 'ești la dietă' sau că 'nu poți mânca asta'. Operezi discret în cadrul oricărui meniu.",
      "Nu mânca tot ce ai pe farfurie din politețe dacă te-ai săturat."
    ],
    reframe: "Restaurantul de afaceri nu este o excepție din sistem — este un scenariu pe care sistemul l-a anticipat. Nu ai nevoie de voință ca să refuzi pâinea. Ai nevoie de un protocol executat automat. Aceasta este diferența dintre un sistem și o intenție."
  },
  {
    id: "a2-fastfood-graba",
    category: "alimentatie",
    categoryLabel: "Alimentație",
    categoryColor: "text-orange-400",
    title: "Fast-food în Grabă",
    subtitle: "Autostradă, aeroport, 15 minute la prânz",
    shortDescription: "Alimentele ultra-procesate există. Nu le interzici — înveți să navighezi prin ele fără să-ți sabotezi metabolismul.",
    icon: "🥡",
    mechanism: "Alimentele ultra-procesate sunt concepute să depășească mecanismele naturale de sațietate. Combinația de grăsime, sare, zahăr și carbohidrați rafinați suprimă semnalizarea leptinei și amplifică răspunsul dopaminergic, creând un ciclu de consum care depășește nevoia calorică reală. Problema nu ești tu — problema este că produsul este construit să bată biologia.",
    goldenRule: "Proteina mai întâi. Chiar și la restaurantele de tip fast-food există opțiuni.",
    protocol: [
      "Burger de pui fără chiflă, salată cu pui la grătar, wrap fără sos — acestea există în orice lanț major. Identifică varianta cu proteină maximă.",
      "Nu combina cu cartofi prăjiți. Dacă ai nevoie de ceva în plus, alege o salată de însoțire.",
      "Apă sau apă minerală, nu sucuri îndulcite. Sucul adaugă 200-300 kcal lichide care nu generează sațietate.",
      "Mănânci la masă, nu în mașină. Alimentarea inconștientă crește consumul cu 20-30%.",
      "Dacă nu există nicio opțiune decentă: alege un sandviș simplu și mănâncă o masă corectă la 2-3 ore distanță."
    ],
    forbidden: [
      "Nu-ți promite că vei 'compensa mai târziu'. Compensarea agresivă după fast-food produce un ciclu de înfometare și exces care destabilizează metabolismul.",
      "Nu alege meniul combo automat. Un combo este proiectat să mărească volumul consumat, nu să-ți satisfacă foamea."
    ],
    reframe: "Nu există mâncare nepermisă în sistem — există alegeri mai puțin eficiente. Un burger fără chiflă este o masă funcțională. Spirala de vinovăție de după este singura problemă reală."
  },
  {
    id: "a3-gratar-romanesc",
    category: "alimentatie",
    categoryLabel: "Alimentație",
    categoryColor: "text-orange-400",
    title: "Grătarul Românesc",
    subtitle: "Mici, bere, presiune socială și familie",
    shortDescription: "Cel mai mare test al sistemului în România. Cum participi deplin fără să compromiți progresul.",
    icon: "🔥",
    mechanism: "Contextele de masă socială activează sistemul limbic — conexiune, apartenanță, plăcere — și suprimă temporar decizia rațională. Presiunea culturală românească adaugă un strat suplimentar: cel care refuză mâncarea sau băutura 'face mofturi' sau 'ține regim'. Aceasta este o presiune reală, nu o scuză. Sistemul o recunoaște și îți oferă un cadru care funcționează cu ea, nu împotriva ei.",
    goldenRule: "Mănânci ce este pe grătar. Eviți ce este în pâine și în pahar.",
    protocol: [
      "Mănânci ceva consistent înainte de grătar: 30g proteină și grăsimi sănătoase. Ajungi cu glicemia stabilă, nu înfometat.",
      "Pui, coaste, ceafă la grătar — toate sunt surse excelente de proteină. Mănânci fără restricție.",
      "Evită micii. Sunt o sursă de grăsimi ascunse și calorii inutile. Alege mereu carnea întreagă (pui, vită, porc slab).",
      "Bere: maximum 1-2 pahare, nu sticlă după sticlă. Alcoolul blochează oxidarea grăsimilor la nivel hepatic pentru 12-24h.",
      "Mezelurile foarte procesate (crenvurști, cârnați ieftini) — le minimizezi; nu pentru calorii, ci pentru conținutul ridicat de aditivi și sodiu."
    ],
    forbidden: [
      "Nu explici nimănui că ești 'la dietă' sau că 'nu poți mânca asta'. Ești la un grătar, nu la un seminar de nutriție.",
      "Nu încerca să compensezi a doua zi prin înfometare. Grătarul în sine nu îți strică rezultatele. Ceea ce le strică este reacția ta extremă de după. Revino imediat la program."
    ],
    reframe: "Grătarul românesc este una din marile plăceri ale vieții. Sistemul BUILT nu îți interzice asta — îți oferă un cadru în care poți participa deplin fără să sabotezi cele 90 de zile, alegând doar sursele curate de proteină și evitând procesatele pline de grăsime (mici, cârnați)."
  },
  {
    id: "a4-restaurant-familie",
    category: "alimentatie",
    categoryLabel: "Alimentație",
    categoryColor: "text-orange-400",
    title: "Restaurantul cu Familia",
    subtitle: "Meniu ales de grup, mâncat în comun, copii la masă",
    shortDescription: "Controlezi porția și viteza, nu meniul. Ești prezent la masă, nu într-o sesiune de dietetică.",
    icon: "👨‍👩‍👧",
    mechanism: "Mesele în familie implică un control redus asupra meniului, mâncare împărțită și presiunea de a mânca ce mănâncă toată lumea. Prezența copiilor creează distrageri care favorizează mâncatul inconștient — mănânci repede, mănânci resturile lor. Studiile arată că distragerea atenției în timpul mesei crește consumul caloric cu 15-25%.",
    goldenRule: "Controlezi porția și viteza. Nu controlezi meniul.",
    protocol: [
      "Comanzi primul sau printre primii — înainte ca grupul să-ți influențeze decizia.",
      "Proteina este baza: pui, pește, carne roșie. Garniturile sunt secundare.",
      "Mănânci lent și conștient — pune tacâmurile pe masă între îmbucături. Sațietatea apare la 15-20 de minute după ce ai mâncat suficient.",
      "Nu mânca din farfuriile copiilor din reflex. Aceasta este una dintre cele mai frecvente surse ascunse de calorii pentru părinți.",
      "Dacă meniul este limitat (pizza, paste) — alegi varianta cu proteină maximă și te limitezi la o porție standard."
    ],
    forbidden: [
      "Nu mânca pe fond de stres dacă masa durează mult și copiii sunt agitați. Agitația de la masă este o stare de fapt, nu un motiv pentru a mânca în exces.",
      "Nu transforma masa în familie într-o dezbatere despre nutriție. Aplică sistemul subtil."
    ],
    reframe: "Masa cu familia este un ritual prețios. Nu o transforma într-o obligație restrictivă. Aplici câteva principii de bază în fundal și ești prezent pentru familia ta."
  },
  {
    id: "a5-sarbatori-romanesti",
    category: "alimentatie",
    categoryLabel: "Alimentație",
    categoryColor: "text-orange-400",
    title: "Sărbătorile Românești",
    subtitle: "Crăciun, Paști, Revelion — cum gestionezi zilele de excepție",
    shortDescription: "2-3 zile de surplus nu distrug 60-80 de zile de muncă. Spirala de vinovăție de după, da.",
    icon: "🎄",
    mechanism: "Sărbătorile sunt perioadele cu cel mai mare risc de abandon pentru orice program. Nu pentru că sarmalele strică progresul (2-3 zile de surplus moderat nu anulează luni de muncă), ci pentru că vinovăția de după declanșează abandonul complet. Gândirea de tip 'dacă tot am stricat, nu mai contează' este cea mai costisitoare capcană.",
    goldenRule: "Mănânci festiv de Crăciun. Nu din 20 decembrie până pe 10 ianuarie.",
    protocol: [
      "Definești clar zilele de 'excepție gestionată': de exemplu, 25-26 decembrie. Doar acelea.",
      "În zilele de excepție: nu numeri caloriile, te bucuri de mâncare, participi la masa în familie.",
      "Antrenamentul nu se oprește complet — păstrează măcar 3 sesiuni scurte pe săptămână.",
      "Hidratare crescută: alcoolul și mâncarea sărată rețin apa. Consumă minimum 3L de apă pe zi.",
      "Ziua de după excepție: revii la mesele normale, fără a apela la înfometare. Sistemul reintră în ritm natural."
    ],
    forbidden: [
      "Nu te urca pe cântar în zilele imediat următoare. Retenția de apă și glicogenul pot adăuga 2-3 kg — aceea nu este grăsime.",
      "Nu încerca să 'arzi' caloriile cu 3 ore de alergare. Aceasta este o abordare bazată pe pedeapsă, nu un sistem inteligent.",
      "Nu prelungi excepția. 2-3 zile de libertate, apoi revii la protocol."
    ],
    reframe: "Sărbătorile sunt parte din viața reală. Clientul BUILT se bucură de cozonac și sarmale de sărbători, dar diferența este că el se oprește după 2 zile, nu transformă o sărbătoare într-o lună de haos alimentar."
  },

  // ─── CATEGORIA B — ANTRENAMENT ───────────────────────────────────────────
  {
    id: "b1-hotel-fara-sala",
    category: "antrenament",
    categoryLabel: "Antrenament",
    categoryColor: "text-blue-400",
    title: "Hotelul fără Sală",
    subtitle: "Deplasare, cameră mică, zero echipament",
    shortDescription: "30 de minute. Propriul corp este singurul echipament necesar. Protocolul complet pentru orice cameră de hotel.",
    icon: "🏨",
    mechanism: "Sedentarismul prelungit (peste 48h) reduce arderea caloriilor zilnice (NEAT) și scade nivelul hormonilor anabolici. Nu ai nevoie de o sală dotată pentru a-ți menține metabolismul activ — ai nevoie de contracție musculară. Greutatea corpului, tempoul controlat și unghiurile de execuție sunt de ajuns.",
    goldenRule: "O jumătate de oră de mișcare controlată îți menține tot progresul.",
    protocol: [
      "Împins: Flotări declinate (picioarele pe marginea patului) + flotări standard + flotări din unghi (pike push-ups pentru umeri). Câte 3 seturi, 10-15 repetări.",
      "Picioare: Genuflexiuni bulgărești cu un picior pe pat (3 × 12 pe picior) + extensii de șold pe un picior (3 × 15). Ai un troller? Folosește-l ca greutate suplimentară.",
      "Core: Menținere hollow body (3 × 30 secunde) + planșă laterală (3 × 20 secunde per parte) + dead bug (3 × 10 per parte).",
      "Cardio la final: 5 minute — 30 de secunde sărituri tip jumping jacks alternat cu 30 de secunde pauză. Sau 5 runde de burpees.",
      "Durata totală: 25-30 de minute, cu pauze scurte de 30-45 de secunde între seturi."
    ],
    forbidden: [
      "Nu sări peste antrenament cu scuza 'nu am sală'. Un antrenament în cameră este net superior inactivității.",
      "Nu improviza făcând 20 de exerciții la întâmplare. 4-5 mișcări de bază executate intens sunt mult mai valoroase."
    ],
    reframe: "Hotelul fără sală este un test al sistemului tău. Dacă rutina ta funcționează doar în condiții perfecte, atunci e doar un moft. Un sistem adevărat este adaptabil oriunde."
  },
  {
    id: "b2-sala-necunoscuta",
    category: "antrenament",
    categoryLabel: "Antrenament",
    categoryColor: "text-blue-400",
    title: "Sala Necunoscută",
    subtitle: "Călătorie, aparate diferite, lipsă de repere",
    shortDescription: "Concentrează-te pe tiparele de mișcare: împins, tras și picioare. Aparatele specifice sunt doar detalii.",
    icon: "🏋️",
    mechanism: "O sală nefamiliară poate provoca paralizie decizională — ajungi să pierzi 20 de minute căutând aparatele cu care ești obișnuit. Soluția este să aplici tiparele fundamentale de mișcare (împingere orizontală, tragere, flexia șoldului) folosind orice este disponibil (gantere, cabluri, bare).",
    goldenRule: "3 tipare mari de mișcare: împins, tras, picioare. Echipamentul e doar instrumentul.",
    protocol: [
      "Identifică rapid: o zonă de împins (presă, gantere, bare), o stație de tras (cabluri, bară de tracțiuni) și un loc pentru picioare.",
      "Execută 1-2 exerciții grele din fiecare tipar: 4 seturi de 8-10 repetări la intensitate normală.",
      "Nu-ți bate capul să explorezi fiecare colț al sălii. Focusează-te pe exercițiile compuse.",
      "Dacă un aparat nu este liber: înlocuiește-l cu alternativa care folosește greutatea corpului.",
      "Termină în 45-60 de minute. Păstrează eficiența."
    ],
    forbidden: [
      "Nu rătăci prin sală fără scop. Intră cu planul clar al celor 3 tipare de mișcare.",
      "Nu reduce greutățile doar pentru că 'aparatele sunt ciudate'. Corpul tău reacționează la tensiune, nu la brandul aparatului."
    ],
    reframe: "Orice sală din lume are exact ceea ce ai nevoie pentru a progresa. Singurul echipament cu adevărat indispensabil este planul tău."
  },
  {
    id: "b3-acasa-fara-echipament",
    category: "antrenament",
    categoryLabel: "Antrenament",
    categoryColor: "text-blue-400",
    title: "Acasă fără Echipament",
    subtitle: "Oriunde, oricând, fără investiții",
    shortDescription: "Antrenamentul cu greutatea propriului corp îți poate asigura peste 85% din rezultatele obținute la sală, dacă folosești un tempo corect.",
    icon: "🏠",
    mechanism: "Cercetările confirmă că exercițiile calistenice produc adaptări musculare similare cu greutățile externe, atâta timp cât se respectă principiul suprasarcinii progresive: mișcări lente, controlate, fază negativă prelungită și creșterea dificultății unghiurilor.",
    goldenRule: "Dacă poți executa un exercițiu 8-12 repetări lent și corect, acesta funcționează perfect.",
    protocol: [
      "Împins: flotări standard, trecând treptat spre flotări cu brațele asimetrice (arcaș) pentru dificultate. Tempo: 3 secunde la coborâre, o secundă sus.",
      "Tras: tracțiuni (dacă ai bară) sau ramat invers pe sub un birou sau o masă stabilă.",
      "Picioare: genuflexiuni bulgărești, îngreunate cu un rucsac cu cărți, combinate cu îndreptări pe un picior pentru coordonare.",
      "Core: balans hollow body (3 seturi) sau planșe cu tensiune maximă pe abdomen.",
      "Cardio opțional: 3-5 runde de sprint pe loc cu ridicarea genunchilor (30 secunde lucru, 30 secunde pauză)."
    ],
    forbidden: [
      "Nu face flotări infinite și executate rapid. 30 de flotări lente și controlate construiesc mult mai multă forță decât 100 de flotări haotice.",
      "Nu renunța sub pretextul că acasă este prea ușor. Îngreunează unghiul și tempoul până devine greu."
    ],
    reframe: "Acasă e laboratorul tău. Nu ai nevoie de zeci de aparate ca să construiești un fizic solid, ai nevoie doar de tensiune musculară aplicată inteligent."
  },
  {
    id: "b4-timp-criza",
    category: "antrenament",
    categoryLabel: "Antrenament",
    categoryColor: "text-blue-400",
    title: "Timp de Criză",
    subtitle: "Ai doar 25-30 de minute disponibile",
    shortDescription: "Un antrenament intens de 25 de minute este superior unuia lălăit de o oră. Intensitatea bate durata.",
    icon: "⚡",
    mechanism: "Studiile de medicină sportivă demonstrează că sesiunile scurte de 20-25 de minute, menținute la intensitate maximă, prezervă forța și compoziția corporală. Răspunsul hormonal (testosteron, hormon de creștere) este dictat de stimul și efort, nu de cât timp petreci în sală.",
    goldenRule: "Nu ai timp de un antrenament complet, dar ai timp de un antrenament eficient.",
    protocol: [
      "Încălzire: 3 minute de mobilitate (rotații de umeri, genuflexiuni profunde).",
      "Bloc principal (circuit): Variație de genuflexiune + Exercițiu de împins + Exercițiu de tras + Îndreptări/Flexia șoldului. 4 serii a câte 8-10 repetări, cu pauze scurte doar între circuite.",
      "Menține greutățile mari! Reduci doar pauzele, nu sarcina cu care lucrezi.",
      "Nu face pauză lungă; folosește o cronometrare strictă (45 de secunde între circuite).",
      "Total net: 25 de minute de intensitate pură."
    ],
    forbidden: [
      "Nu pierde timpul cu exerciții de izolare (ex: flexii pentru biceps) când timpul este limitat. Exercițiile compuse (bază) au prioritate.",
      "Nu lucra cu greutăți mici doar pentru că ești grăbit. Sarcina mecanică este esențială."
    ],
    reframe: "Cel mai bun antrenament din săptămână poate fi cel mai scurt, atâta timp cât îl execuți fără scuze și fără distracții."
  },

  // ─── CATEGORIA C — CRIZE DE SISTEM ───────────────────────────────────────
  {
    id: "c1-protocol-urgenta",
    category: "crize",
    categoryLabel: "Crize de Sistem",
    categoryColor: "text-red-400",
    title: "Protocolul de Urgență",
    subtitle: "Cum acționezi în primele 24 de ore după ce ai deraiat",
    shortDescription: "Fără pedepse, fără compensare agresivă. Faci o singură acțiune pozitivă și reintri pe traseu.",
    icon: "🚨",
    mechanism: "Fiecare ieșire din rutină activează o gândire de tipul 'totul sau nimic'. Aceasta nu este o problemă de voință, ci un răspuns de stres. Cercetările arată că o singură decizie corectă luată imediat după o greșeală restabilește impulsul psihologic și previne efectul de domino (o masă proastă transformată într-o săptămână proastă).",
    goldenRule: "O masă corectă și un pas înainte. Nu judeca și nu compensa exagerat.",
    protocol: [
      "Prima acțiune de recuperare: Mănâncă o masă echilibrată (proteină și legume). Nu ai nevoie de trei zile perfecte, ai nevoie de o masă corectă.",
      "A doua acțiune: Fă mișcare. Chiar și un antrenament scurt de 20 de minute recalibrează mintea.",
      "Dă-mi un mesaj de check-in scurt. Un rând în care scrii că ai revenit la plan.",
      "Bea minimum 3 litri de apă. Excesele și stresul provoacă deshidratare celulară.",
      "Prioritizează un somn odihnitor. Odihna ajută la resetarea hormonilor de stres și foame."
    ],
    forbidden: [
      "Nu te pedepsi cu antrenamente epuizante. Compensarea extremă este doar o altă formă de dezechilibru.",
      "Nu amâna revenirea așteptând 'să vină ziua de luni'. Reluarea se face la următoarea masă."
    ],
    reframe: "Eșecul punctual face parte din proces. Diferența dintre amatori și cei care obțin rezultate este viteza cu care se întorc la execuția planului de bază."
  },
  {
    id: "c2-saptamana-pierduta",
    category: "crize",
    categoryLabel: "Crize de Sistem",
    categoryColor: "text-red-400",
    title: "Săptămâna Pierdută",
    subtitle: "Ai ratat absolut tot — cum revii pe linia de plutire",
    shortDescription: "O săptămână de repaus nu te face să pierzi mușchii. Ceea ce pierzi este ritmul. Să-l recăpătăm.",
    icon: "📅",
    mechanism: "O săptămână fără antrenament scade forța maximală doar cu un marginal 2-3%, iar masa musculară este prezervată dacă asiguri un consum suficient de proteine. Așa-zisa 'memorie musculară' se bazează pe rețele neuronale consolidate care rezistă săptămâni întregi. Ceea ce se degradează ușor este obișnuința și starea ta cardio.",
    goldenRule: "O săptămână slabă nu anulează 12 săptămâni bune. Dar panica da.",
    protocol: [
      "Lasă în urmă ce nu ai făcut. Trecutul nu poate fi recuperat; concentrează-te exclusiv pe acțiunile din prezent.",
      "Prima săptămână de la întoarcere: lucrează la 70% din capacitate. Obiectivul este reacomodarea, nu doborârea de recorduri.",
      "Păstrează aportul proteic ridicat. Acesta este scutul tău împotriva pierderii masei musculare.",
      "Trimite raportul de check-in ca și cum nimic nu s-ar fi întâmplat. Menține responsabilitatea."
    ],
    forbidden: [
      "Nu te antrena de două ori pe zi sperând să 'recuperezi volumul'. Supra-antrenamentul îți va distruge recuperarea și articulațiile.",
      "Nu cere schimbarea întregului program. Programul tău este bun, pur și simplu ai luat o pauză de la el."
    ],
    reframe: "Corpul tău rezistă foarte bine pauzelor. O săptămână fără antrenament este doar o zecimală într-un grafic pe termen lung. Revino la muncă."
  },
  {
    id: "c3-binge-weekend",
    category: "crize",
    categoryLabel: "Crize de Sistem",
    categoryColor: "text-red-400",
    title: "Excesul de Weekend",
    subtitle: "Ai mâncat total dezorganizat 2-3 zile",
    shortDescription: "+3 kg pe cântar nu înseamnă grăsime. Este doar reținere de apă și glicogen. Ele vor dispărea de la sine.",
    icon: "🍕",
    mechanism: "Un exces alimentar crește brusc rezervele de glicogen din mușchi și ficat, atrăgând apă în celule (1 gram de glicogen reține aproximativ 3-4 grame de apă). În plus, sarea excesivă favorizează retenția. Este imposibil fiziologic să acumulezi kilograme de grăsime reală în două zile.",
    goldenRule: "Tot ce ai acumulat în weekend se va elimina în 4-5 zile prin hidratare și revenirea la plan.",
    protocol: [
      "Luni dimineața: mănâncă normal, nu sări peste mese. Senzația de foame de luni arată că metabolismul își revine.",
      "Bea cantități uriașe de apă (peste 3.5 litri). Apa ajută la eliminarea retenției de sodiu.",
      "Luni te antrenezi puternic. Tot acel exces de carbohidrați se transformă într-o pompă excelentă și energie maximă în sală.",
      "Evită cântarul timp de 5 zile. Numărul afișat nu reflectă compoziția corporală reală."
    ],
    forbidden: [
      "Nu te înfometa. Dacă încerci să repari excesul printr-un deficit extrem, corpul va intra în stare de conservare și îți va sabota antrenamentele.",
      "Nu transforma conceptul de 'weekend' într-o scuză permanentă pentru exces."
    ],
    reframe: "Excesul ocazional face parte din parcursul natural. Sistemul poate absorbi șocul, atâta timp cât luni dimineața te întorci cu profesionalism la planul tău."
  },
  {
    id: "c4-stres-extrem",
    category: "crize",
    categoryLabel: "Crize de Sistem",
    categoryColor: "text-red-400",
    title: "Stresul Extrem",
    subtitle: "Proiecte urgente, lipsă de somn, cortizol ridicat",
    shortDescription: "Când viața te lovește din toate părțile, obiectivul nu este progresul absolut, ci protejarea sănătății mentale și fizice.",
    icon: "🧠",
    mechanism: "Stresul cronic susține niveluri crescute de cortizol, care accelerează acumularea de grăsime viscerală, blochează recuperarea musculară și intensifică poftele pentru dulce. A te antrena epuizant cu mai puțin de 5 ore de somn pe noapte doar adaugă benzină pe focul stresului sistemic.",
    goldenRule: "Dacă nu poți respecta și antrenamentul și alimentația, respectă doar alimentația. E baza.",
    protocol: [
      "Dacă ai dormit sub 5 ore: înlocuiește antrenamentul greu de forță cu 30 de minute de mers pe jos alert.",
      "Alimentația devine prioritară: proteină și legume, chiar dacă mănânci mai puțin cantitativ. Protejează calitatea mâncării.",
      "Nu adăuga surse inutile de stimulare nervoasă. Evită abuzul de cafeină după amiaza.",
      "Folosește suplimente care ajută sistemul nervos, precum Magneziul seara și Omega-3.",
      "Spune-mi clar care este situația. Sistemul trebuie adaptat temporar pentru supraviețuirea acestei perioade."
    ],
    forbidden: [
      "Nu compensa stresul prin junk food. Mâncarea proastă în perioade critice doar îți scade vigilența mentală și agravează anxietatea.",
      "Nu lua decizia de a renunța complet. Mintea extenuată ia decizii slabe. Pune programul pe o viteză inferioară, dar nu opri motorul."
    ],
    reframe: "În momentele critice, menținerea sănătății și păstrarea unui minim de disciplină reprezintă o victorie imensă. Când furtuna va trece, vei avea baza intactă."
  },
  {
    id: "c5-boala-usoara",
    category: "crize",
    categoryLabel: "Crize de Sistem",
    categoryColor: "text-red-400",
    title: "Răceală sau Stare de Rău",
    subtitle: "Când corpul cere o pauză medicală",
    shortDescription: "Află regula clară care îți dictează dacă poți continua antrenamentul sau dacă patul este singura opțiune.",
    icon: "🤒",
    mechanism: "Medicina sportivă aplică regula 'neck check' (testul deasupra gâtului). Dacă simptomele sunt doar la nivelul capului (nas înfundat, ușoară durere în gât), antrenamentul moderat este permis. Dacă simptomele sunt sub gât (febră, tuse profundă, probleme gastrointestinale), sistemul imunitar este deja în luptă, iar orice efort fizic agravează și prelungește boala.",
    goldenRule: "Febră sau dureri musculare sistemice? Pauză absolută. Doar nas înfundat? Antrenament la 50%.",
    protocol: [
      "Evaluează corect simptomele. Fii sincer cu starea ta.",
      "Dacă ai febră (peste 37.5°C), odihna devine noul tău antrenament. Sistemul imunitar are nevoie de absolut toată energia ta.",
      "Hidratează-te extrem de bine (ajută la eliminarea toxinelor) și menține proteina ridicată pentru a sprijini producția de anticorpi.",
      "Dormi oricât îți cere corpul.",
      "După ce febra trece complet, revino în sală doar cu un antrenament ușor, de calibrare."
    ],
    forbidden: [
      "Nu încerca să 'transpiri boala' printr-un antrenament intens. E un mit periculos care îți va epuiza complet corpul.",
      "Nu folosi o durere ușoară de cap ca scuză pentru o săptămână întreagă de repaus. Revino treptat imediat ce te simți capabil."
    ],
    reframe: "Boala este un semnal clar de 'stop' din partea corpului. Colaborează cu el, nu-l forța. Zilele de refacere medicală nu îți distrug lunile de muncă."
  },

  // ─── CATEGORIA D — EVENIMENTE SOCIALE ────────────────────────────────────
  {
    id: "d1-nunta-botez",
    category: "events",
    categoryLabel: "Evenimente",
    categoryColor: "text-purple-400",
    title: "Evenimente Majore (Nunți, Botezuri)",
    subtitle: "Meniu fix prelungit, alcool și distracție",
    shortDescription: "Alimentele de la nuntă sunt inofensive în cantități rezonabile. Alcoolul în exces, în schimb, te blochează metabolic timp de 24 de ore.",
    icon: "💒",
    mechanism: "Evenimentele majore presupun servirea de preparate pe durata a multe ore. Problema principală nu este o felie de tort, ci procesarea alcoolului. Ficatul prioritizează eliminarea etanolului din corp, ceea ce inhibă oxidarea grăsimilor și favorizează stocarea caloriilor suplimentare consumate.",
    goldenRule: "Alege conștient. Proteina este prietena ta, iar moderația la alcool este salvarea ta.",
    protocol: [
      "Mănâncă o gustare solidă proteică înainte de a pleca spre eveniment. Te va feri de atacurile de foame când ajungi la aperitive.",
      "Concentrează-te pe sursele de proteină curată din meniu (pește, friptură).",
      "Alcool: stabilește-ți o limită de 2 pahare (preferabil vin curat sau băuturi simple, nu cocktail-uri zaharoase).",
      "Bea un pahar cu apă după fiecare pahar de alcool.",
      "Bucură-te de un desert dacă îți dorești cu adevărat, dar savurează-l, nu-l mânca mecanic."
    ],
    forbidden: [
      "Nu accepta băuturi doar din politețe. Nimeni nu monitorizează cu adevărat cât bei, în afară de tine.",
      "Nu simți nevoia să golești toate platourile ca obligație socială."
    ],
    reframe: "Un eveniment special este făcut pentru celebrare, nu pentru anxietate legată de mâncare. Bucură-te de el aplicând tactici inteligente de limitare a daunelor."
  },
  {
    id: "d2-concediu-all-inclusive",
    category: "events",
    categoryLabel: "Evenimente",
    categoryColor: "text-purple-400",
    title: "Concediul All-Inclusive",
    subtitle: "Bufet nelimitat, zile libere, tentații peste tot",
    shortDescription: "Nu iei vacanță de la propriul corp. Iei vacanță de la ritmul stresant al vieții cotidiene.",
    icon: "🏖",
    mechanism: "Mediile de tip bufet activează mentalitatea de 'trebuie să gust din tot'. Abundența determină un supraconsum mecanic, oamenii mâncând în general cu 30-50% mai mult decât la o masă obișnuită. În paralel, relaxarea ajută extrem de mult refacerea hormonală și scăderea cortizolului.",
    goldenRule: "Relaxează-te mental, dar rămâi conștient fizic.",
    protocol: [
      "Prima farfurie să fie mereu compusă din carne/pește (proteină) și salată verde. După ce mănânci asta, apetitul tău va scădea natural.",
      "A doua farfurie (dacă o dorești) poate fi cu preparatele care îți plac cel mai mult.",
      "Nu opri mișcarea: mergi la sala hotelului sau fă sesiuni calistenice scurte (3 zile pe săptămână).",
      "Atenție la calorii lichide — cocktail-urile de vacanță sunt veritabile bombe calorice. Optează pentru variante mai simple.",
      "Profită la maximum de somn și de recuperare. Un concediu bine dormit te va aduce înapoi mult mai puternic."
    ],
    forbidden: [
      "Nu încerca să fii perfect. A număra strict calorii într-un concediu all-inclusive îți distruge relaxarea mentală.",
      "Nu te cântări în concediu și nici imediat după. Retenția de lichide te va panica inutil."
    ],
    reframe: "All-inclusive-ul reprezintă oportunitatea perfectă pentru a dovedi că noul tău stil de viață e stabil. Nu te înfometezi, nu exagerezi. Ești pur și simplu în control."
  },
  {
    id: "d3-vacanta-familie",
    category: "events",
    categoryLabel: "Evenimente",
    categoryColor: "text-purple-400",
    title: "Vacanța cu Familia",
    subtitle: "Organizare haotică, timp dedicat copiilor, stres logistic",
    shortDescription: "Schimbă obiectivul: nu mai cauți progresul absolut, cauți mentenanța și conservarea rezultatelor obținute.",
    icon: "👨‍👩‍👧‍👦",
    mechanism: "Vacanțele dinamice cu copiii vin la pachet cu un consum energetic ridicat (mult mers pe jos), dar și cu compromisuri privind orele de masă și calitatea somnului. Schimbarea bruscă de pe 'faza de construcție' pe 'faza de mentenanță' te ajută să scazi presiunea psihologică.",
    goldenRule: "Obiectivul în vacanța activă cu familia este mentenanța, nu progresul forțat.",
    protocol: [
      "Mișcare scurtă și eficientă dimineața (30 de minute) înainte ca restul familiei să se trezească.",
      "Activitățile fizice zilnice (înot, alergat cu copiii, vizite) contribuie masiv la arderea caloriilor. Nu le subestima.",
      "Caută restaurante echilibrate și respectă regula farfuriei: baza este mereu proteina.",
      "Păstrează legătura: un mesaj rapid la 3-4 zile către mine pentru a menține ritmul mental activ."
    ],
    forbidden: [
      "Nu sacrifica restul orelor de somn dacă noaptea a fost agitată. Antrenamentul poate aștepta o zi mai bună.",
      "Nu deveni rigid și stresant pentru restul familiei din cauza regimului tău. Ești un exemplu de echilibru, nu un element de stres."
    ],
    reframe: "Familia este cel mai puternic motiv pentru care dorești să fii sănătos, puternic și plin de energie. Fii prezent pentru ei, aplică regulile subtil și bucură-te de experiență."
  }

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
