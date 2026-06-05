// ═══════════════════════════════════════════════════════════════
// BUILT — Pattern Interrupt Strategy · Figma Plugin
// Bazat pe: "Pattern Interrupt Walkthrough" transcript
// Run once → 6 frame-uri pe canvas
// ═══════════════════════════════════════════════════════════════

(async function () {

await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Bold" });

function rgb(h) {
  return { r: parseInt(h.slice(1,3),16)/255, g: parseInt(h.slice(3,5),16)/255, b: parseInt(h.slice(5,7),16)/255 };
}
function solid(c) { return [{ type:"SOLID", color:c }]; }

function FR(name, x, y, w, h, bg) {
  const f = figma.createFrame();
  f.name = name; f.x = x; f.y = y; f.resize(w, h);
  f.fills = solid(bg); f.clipsContent = true;
  figma.currentPage.appendChild(f); return f;
}
function RCT(p, x, y, w, h, c, r) {
  const s = figma.createRectangle();
  s.x=x; s.y=y; s.resize(Math.max(w,1),Math.max(h,1));
  s.fills=solid(c); if(r) s.cornerRadius=r; if(p) p.appendChild(s); return s;
}
function TXT(p, x, y, str, sz, c, bold, mw) {
  if(!str||!str.length) str=" ";
  const t = figma.createText();
  t.fontName={family:"Inter",style:bold?"Bold":"Regular"};
  t.fontSize=sz; t.fills=solid(c);
  if(mw){ t.textAutoResize="HEIGHT"; t.resize(mw, sz+4); }
  t.characters=str; t.x=x; t.y=y;
  if(p) p.appendChild(t); return t;
}

const BG=rgb("#080808"), CARD=rgb("#0F0F0F"), CARD2=rgb("#111111");
const BDR=rgb("#1E1E1E"), RED=rgb("#C0392B"), WHT=rgb("#FFFFFF");
const GRY=rgb("#A1A1AA"), MUT=rgb("#52525B"), DIM=rgb("#27272A");
const PUR=rgb("#7C3AED"), BLU=rgb("#0891B2"), AMB=rgb("#D97706");
const GRN=rgb("#059669"), ORG=rgb("#EA580C");

const W=1440, H=900, G=80;

// ═══════════════════════════════════════════════════════════════
// FRAME 01 — PROBLEMA: DE CE PIEZI OAMENII
// ═══════════════════════════════════════════════════════════════
{
  const f = FR("01 — Problema", 0, 0, W, H, BG);

  TXT(f,80,52,"PATTERN INTERRUPT — DE CE AI NEVOIE DE EL",10,RED,true);
  TXT(f,80,70,"Toți se concentrează pe hook. Nimeni nu ține oamenii acolo.",32,WHT,true);
  TXT(f,80,116,"Sursa: Pattern Interrupt Walkthrough · aplicat pe BUILT by Iordache Claudiu",12,MUT,false,900);
  RCT(f,80,144,W-160,1,BDR);

  // The problem statement
  RCT(f,80,164,W-160,88,CARD,14);
  RCT(f,80,164,4,88,RED,4);
  TXT(f,104,178,"PROBLEMA REALĂ",9,RED,true);
  TXT(f,104,196,"Majoritatea creatorilor obțin engagement la hook, dar pierd oamenii imediat după.",16,WHT,true,W-200);
  TXT(f,104,224,"Ei simt că: 'a pus efort la început, dar nu-i pasă de mijloc și final.' — și pleacă.",12,GRY,false,W-200);

  // Retention graph — visual representation
  TXT(f,80,276,"GRAFICUL DE RETENȚIE — FĂRĂ PATTERN INTERRUPT",9,RED,true);
  RCT(f,80,292,W-160,200,CARD,14);

  // Graph background grid
  for(let i=0;i<5;i++){
    RCT(f,80,292+i*40,W-160,1,BDR);
  }

  // Y axis labels
  TXT(f,84,296,"100%",9,MUT,false);
  TXT(f,84,336,"75%",9,MUT,false);
  TXT(f,84,376,"50%",9,MUT,false);
  TXT(f,84,416,"25%",9,MUT,false);
  TXT(f,84,456,"0%",9,MUT,false);

  // X axis labels
  TXT(f,140,472,"0s",9,MUT,false);
  TXT(f,310,472,"5s",9,MUT,false);
  TXT(f,490,472,"10s",9,MUT,false);
  TXT(f,670,472,"15s",9,MUT,false);
  TXT(f,850,472,"20s",9,MUT,false);
  TXT(f,1030,472,"25s",9,MUT,false);
  TXT(f,1210,472,"30s",9,MUT,false);
  TXT(f,1360,472,"Final",9,MUT,false);

  // Retention curve — drops sharply after hook (red = bad)
  // Simulate curve with rectangles of decreasing height
  const pts=[100,90,72,55,42,34,28,24,20,18,16,15,14,13,12];
  const barW=80, startX=140;
  pts.forEach((pct,i)=>{
    const barH=Math.round(160*pct/100);
    const bx=startX+i*(barW+2);
    RCT(f,bx,452-barH,barW,barH,rgb("#C0392B"),4);
    // faded overlay
    RCT(f,bx,452-barH,barW,barH,{r:0.75,g:0.22,b:0.17},4);
  });

  // Highlight hook zone
  RCT(f,140,292,168,180,{r:0.75,g:0.22,b:0.17},4);
  TXT(f,148,298,"HOOK",8,WHT,true);
  TXT(f,148,312,"Engagement\nmax",9,WHT,false);

  // Drop arrow annotation
  TXT(f,340,340,"⬇ Pierdere masivă",11,RED,true);
  TXT(f,340,358,"fără re-engagement",11,MUT,false);

  // 3 consequence boxes
  const cons=[
    {c:RED,   t:"Retenție scăzută",   d:"Oamenii pleacă după primele 3-5s. Efortul tău la hook = zero ROI."},
    {c:AMB,   t:"Algoritm penalizează",d:"Watch time mic → algoritm oprește distribuirea. Reach scade săptămânal."},
    {c:MUT,   t:"Zero conversie",      d:"Dacă nu urmăresc, nu convertesc. Atenția = singurul drum spre vânzare."},
  ];
  const cw=Math.floor((W-160-2*24)/3);
  cons.forEach((cn,i)=>{
    const cx=80+i*(cw+24), cy=500;
    RCT(f,cx,cy,cw,112,CARD,12);
    RCT(f,cx,cy,cw,4,cn.c,12);
    TXT(f,cx+16,cy+20,cn.t,14,WHT,true,cw-32);
    TXT(f,cx+16,cy+46,cn.d,11,GRY,false,cw-32);
  });

  // Quote from video
  RCT(f,80,636,W-160,80,CARD,12);
  RCT(f,80,636,4,80,PUR,4);
  TXT(f,104,650,"DIN VIDEO",9,PUR,true);
  TXT(f,104,668,'"Dacă nu incluzi motive repetate să continue să urmărească, vor pleca la mijloc. Nu contează cât de bun a fost hook-ul."',13,WHT,false,W-160);

  RCT(f,80,740,W-160,1,BDR);
  TXT(f,80,752,"BUILT — Pattern Interrupt Strategy · 1/6 · 2026",11,DIM,false);
}

// ═══════════════════════════════════════════════════════════════
// FRAME 02 — CE ESTE PATTERN INTERRUPT
// ═══════════════════════════════════════════════════════════════
{
  const f = FR("02 — Ce este PI", W+G, 0, W, H, BG);

  TXT(f,80,52,"CE ESTE PATTERN INTERRUPT",10,RED,true);
  TXT(f,80,70,"Hook-uri multiple pe tot parcursul video-ului.",32,WHT,true);
  TXT(f,80,116,"Nu e un singur hook la început. E un sistem de re-engagement continuu.",13,MUT,false,900);
  RCT(f,80,144,W-160,1,BDR);

  // Main definition
  RCT(f,80,164,W-160,76,{r:0.06,g:0.02,b:0.02},14);
  RCT(f,80,164,W-160,4,RED,14);
  TXT(f,104,184,"DEFINIȚIE",9,RED,true);
  TXT(f,104,202,"Pattern Interrupt = orice element care rupe fluxul așteptat și re-aduce atenția spectatorului înapoi la video.",14,WHT,true,W-200);

  // The simple mental model
  TXT(f,80,264,"MODELUL SIMPLU DE ÎNȚELES",9,BLU,true);

  const model=[
    {n:"1",c:RED,t:"HOOK inițial",d:"0–3 secunde. Îi captezi atenția. Ei înțeleg despre ce e video-ul."},
    {n:"2",c:AMB,t:"Valoare + atenție scade",d:"Începi să livrezi conținut. Dar atenția începe să scadă după 3-5s."},
    {n:"3",c:PUR,t:"PATTERN INTERRUPT #1",d:"Schimbi ceva — unghi, mișcare, text, prop. Îi snaps back în video."},
    {n:"4",c:AMB,t:"Valoare + atenție scade",d:"Continui să livrezi. Atenția scade din nou după 3-5s."},
    {n:"5",c:PUR,t:"PATTERN INTERRUPT #2",d:"Alt element de re-engagement. Îi ții acolo."},
    {n:"6",c:BLU,t:"Build anticipation",d:"Teaser pentru payoff. Îi faci curioși ce urmează. Ex: arunci mingea."},
    {n:"7",c:GRN,t:"PAYOFF",d:"Livrezi ce ai promis. Construiești trust prin consecvență."},
    {n:"8",c:RED,t:"CTA",d:"DM un cuvânt / urmărește / link. O singură acțiune clară."},
  ];

  const mh=60, mgap=4;
  model.forEach((m,i)=>{
    const my=288+i*(mh+mgap);
    const isPI = m.n==="3"||m.n==="5";
    RCT(f,80,my,W-160,mh,isPI?{r:0.06,g:0.02,b:0.12}:CARD,10);
    RCT(f,80,my,4,mh,m.c,4);
    // Number badge
    RCT(f,92,my+14,28,28,{r:m.c.r*0.15,g:m.c.g*0.15,b:m.c.b*0.15},6);
    TXT(f,100,my+20,m.n,11,m.c,true);
    TXT(f,134,my+10,m.t,12,isPI?m.c:WHT,true);
    TXT(f,134,my+30,m.d,11,GRY,false,W-260);

    // PI badge
    if(isPI){
      RCT(f,W-260,my+16,160,28,{r:0.5,g:0.1,b:0.8},8);
      TXT(f,W-252,my+24,"⚡ RE-ENGAGEMENT",9,WHT,true);
    }
  });

  // Key insight
  RCT(f,80,800,W-160,64,CARD,12);
  RCT(f,80,800,4,64,GRN,4);
  TXT(f,104,814,"REGULA DE AUR",9,GRN,true);
  TXT(f,104,832,"Short form: un Pattern Interrupt la fiecare 3–5 secunde. Long form: la fiecare 15–20 secunde.",13,WHT,false,W-200);

  RCT(f,80,876,W-160,1,BDR);
  TXT(f,80,882,"BUILT — Pattern Interrupt Strategy · 2/6 · 2026",11,DIM,false);
}

// ═══════════════════════════════════════════════════════════════
// FRAME 03 — TIMELINE VIZUAL REEL BUILT
// ═══════════════════════════════════════════════════════════════
{
  const f = FR("03 — Timeline Reel", (W+G)*2, 0, W, H, BG);

  TXT(f,80,52,"TIMELINE REEL BUILT — 30-60 SECUNDE",10,RED,true);
  TXT(f,80,70,"Fiecare secundă are un scop. Zero momente moarte.",32,WHT,true);
  TXT(f,80,116,"Pattern interrupt la fiecare 3-5s pentru short form. Atenția e moneda ta.",13,MUT,false,900);
  RCT(f,80,144,W-160,1,BDR);

  // Timeline bar
  const tlX=80, tlY=184, tlW=W-160, tlH=64;
  RCT(f,tlX,tlY,tlW,tlH,CARD,10);

  // Segments of a 30s reel
  const segments=[
    {from:0,to:3,  c:RED, label:"HOOK",      pct:10},
    {from:3,to:8,  c:AMB, label:"VALOARE",   pct:17},
    {from:8,to:11, c:PUR, label:"PI #1",     pct:10},
    {from:11,to:16,c:AMB, label:"VALOARE",   pct:17},
    {from:16,to:19,c:PUR, label:"PI #2",     pct:10},
    {from:19,to:24,c:AMB, label:"VALOARE",   pct:17},
    {from:24,to:27,c:BLU, label:"PI #3\nANTIC.",pct:10},
    {from:27,to:29,c:GRN, label:"PAYOFF",    pct:7},
    {from:29,to:30,c:RED, label:"CTA",       pct:3},
  ];

  let curX=tlX;
  segments.forEach((seg)=>{
    const segW=Math.round(tlW*seg.pct/100);
    RCT(f,curX,tlY,segW,tlH,seg.c,0);
    if(segW>40){
      TXT(f,curX+4,tlY+8,seg.label,8,WHT,true,segW-8);
      TXT(f,curX+4,tlY+44,seg.from+"s",8,{r:1,g:1,b:1},false);
    }
    curX+=segW;
  });

  // Retention graph WITH pattern interrupts (good version)
  TXT(f,80,276,"GRAFICUL DE RETENȚIE — CU PATTERN INTERRUPT ✓",9,GRN,true);
  RCT(f,80,292,W-160,200,CARD,14);

  // Grid
  for(let i=0;i<5;i++) RCT(f,80,292+i*40,W-160,1,BDR);

  // Y axis
  TXT(f,84,296,"100%",9,MUT,false);
  TXT(f,84,336,"75%",9,MUT,false);
  TXT(f,84,376,"50%",9,MUT,false);
  TXT(f,84,416,"25%",9,MUT,false);

  // Good retention — stays high with bumps at PI moments
  const goodPts=[100,88,72,65,80,70,58,72,64,52,68,60,50,62,56,50];
  const bW2=76, sX2=140;
  goodPts.forEach((pct,i)=>{
    const bH=Math.round(160*pct/100);
    const bx=sX2+i*(bW2+2);
    RCT(f,bx,452-bH,bW2,bH,GRN,4);
  });

  // PI markers on graph
  [2,5,8,11].forEach((idx,i)=>{
    const bx=sX2+idx*(bW2+2);
    RCT(f,bx,292,2,160,PUR,0);
    TXT(f,bx+4,300,i===0?"HOOK":i===3?"PAYOFF":"PI #"+(i),8,PUR,true);
  });

  TXT(f,900,330,"Media retenție: ~65%",11,GRN,true);
  TXT(f,900,348,"vs fără PI: ~18%",11,RED,false);

  // 8 specific pattern interrupts for BUILT
  TXT(f,80,476,"TIPURI DE PATTERN INTERRUPT PENTRU BUILT REELS",9,RED,true);
  RCT(f,80,492,W-160,1,BDR);

  const piTypes=[
    {n:"01",c:RED,   t:"Schimbare unghi cameră",d:"Filmezi același lucru din unghi diferit. Smooth cut. Cel mai ușor de implementat."},
    {n:"02",c:PUR,   t:"Întoarcere cap / corp",   d:"Întorci capul sau corpul la 90°. Cut în timp ce faci mișcarea. Seamless."},
    {n:"03",c:BLU,   t:"Text bold pe ecran",      d:"Cuvinte cheie care apar brusc. Susțin ce spui verbal. Impact vizual instant."},
    {n:"04",c:AMB,   t:"Prop / obiect",            d:"Introduci un element fizic (minge, carte, telefon). Crezi curiozitate + anticipation."},
    {n:"05",c:GRN,   t:"Zoom in / zoom out",       d:"Treci de la wide shot la close-up sau invers. Schimbare de perspectivă."},
    {n:"06",c:ORG,   t:"B-roll intercalat",        d:"Clip scurt relevant între talking head shots. Ilustrezi ce spui vizual."},
    {n:"07",c:PUR,   t:"Teaser verbal",             d:"'Și asta nu e tot — la sfârșit îți arăt...' Promiți un payoff. Îi ții acolo."},
    {n:"08",c:BLU,   t:"Pauza intenționată",        d:"Taci 1 secundă înainte de un punct cheie. Creează tensiune și atenție."},
  ];

  const piW=Math.floor((W-160-3*16)/4);
  piTypes.forEach((pi,i)=>{
    const col=i%4, row=Math.floor(i/4);
    const px=80+col*(piW+16), py=508+row*88;
    RCT(f,px,py,piW,80,CARD,10);
    RCT(f,px,py,piW,3,pi.c,10);
    TXT(f,px+12,py+12,pi.n+" — "+pi.t,10,pi.c,true,piW-24);
    TXT(f,px+12,py+32,pi.d,10,GRY,false,piW-24);
  });

  RCT(f,80,696,W-160,1,BDR);
  TXT(f,80,708,"BUILT — Pattern Interrupt Strategy · 3/6 · 2026",11,DIM,false);
}

// ═══════════════════════════════════════════════════════════════
// FRAME 04 — SCRIPTUL BUILT CU PATTERN INTERRUPT
// ═══════════════════════════════════════════════════════════════
{
  const f = FR("04 — Script Template BUILT", (W+G)*3, 0, W, H, BG);

  TXT(f,80,52,"TEMPLATE SCRIPT REEL BUILT — CU PATTERN INTERRUPT",10,RED,true);
  TXT(f,80,70,"Structura exactă aplicată pe nișa ta.",32,WHT,true);
  TXT(f,80,116,"Completezi [parantezele] cu conținutul tău specific. Structura rămâne.",13,MUT,false,900);
  RCT(f,80,144,W-160,1,BDR);

  // Script sections
  const sections=[
    {
      time:"0–3s", c:RED, tag:"HOOK",
      formula:"[CIFRĂ ȘOCANTĂ] + [DUREREA EXACTĂ A ICP]",
      example:'"De ce bărbații cu salariu bun tot nu reușesc să slăbească — deși au încercat tot."',
      pi:"→ Intri în cadru în mișcare. Text bold apare pe ecran. Unghi ușor de jos.",
      built:"Triggere: Cortizolul / Paradoxul Competenței / Prețul Invizibilității"
    },
    {
      time:"3–8s", c:AMB, tag:"VALOARE #1 + atenție scade",
      formula:"[VALIDEZI SITUAȚIA] + [EXPLICI MECANISMUL]",
      example:'"Nu e lipsă de voință. E biologie. Stresul cronic crește cortizolul, care blochează arderea grăsimilor."',
      pi:"→ Atenția începe să scadă. Pregătești Pattern Interrupt.",
      built:"Pilonul I — Intelligent Fueling sau Pilonul U — Capacity"
    },
    {
      time:"8–11s", c:PUR, tag:"PATTERN INTERRUPT #1",
      formula:"[SCHIMBARE VIZUALĂ BRUSCĂ]",
      example:"Cut la unghi diferit / Întoarcere cap / Text nou apare / Mergi spre cameră",
      pi:"→ IMPLEMENTARE: filmezi același lucru din altă parte. Tai în timp ce te miști.",
      built:"Cel mai ușor: filmezi cu telefonul din 2 unghiuri de la început"
    },
    {
      time:"11–16s", c:AMB, tag:"VALOARE #2 + atenție scade",
      formula:"[SPECIFICĂ SISTEMUL / SOLUȚIA]",
      example:'"Sistemul BUILT rezolvă asta prin Pilonul I: mănânci în ferestre strategice, nu te înfometezi."',
      pi:"→ Atenția scade din nou. Pregătești al doilea interrupt.",
      built:"Leagă soluția de pilonul BUILT relevant. Specific, nu generic."
    },
    {
      time:"16–19s", c:PUR, tag:"PATTERN INTERRUPT #2",
      formula:"[AL DOILEA ELEMENT DE RE-ENGAGEMENT]",
      example:"Zoom in pe față / Introduci un prop (carte, telefon) / Pauză intenționată de 1s",
      pi:"→ IMPLEMENTARE: stat la loc, zoom digital sau mișcare de cameră. Sau text key pe ecran.",
      built:"Pauza de 1 secundă înainte de cifra / revelația principală = efect maxim"
    },
    {
      time:"19–26s", c:BLU, tag:"BUILD ANTICIPATION + PATTERN INTERRUPT #3",
      formula:"[TEASER PENTRU PAYOFF] + [ELEMENT SURPRIZĂ]",
      example:'"Și asta nu e tot — clientul meu Alex a pierdut 8kg în 6 săptămâni fără să renunțe la weekend-uri."',
      pi:"→ IMPLEMENTARE: arunci / prinzi ceva, schimbi locația, apare elementul promis.",
      built:"Testimonial real ca anticipation. Alex / Anastasia = dovadă socială + curiozitate."
    },
    {
      time:"26–29s", c:GRN, tag:"PAYOFF — LIVREZI CE AI PROMIS",
      formula:"[CONCLUZIA SPECIFICĂ] + [REVELAȚIA]",
      example:'"Soluția nu e mai multă voință. E un sistem proiectat pe viața ta reală."',
      pi:"→ IMPLEMENTARE: livrezi informația promisă. Trust-ul se construiește acum.",
      built:"Nu vagi. Specific. Arhitectură, nu motivație. Sistemul BUILT bate voința."
    },
    {
      time:"29–30s", c:RED, tag:"CTA — O SINGURĂ ACȚIUNE",
      formula:"[KEYWORD DM] sau [URMĂREȘTE] sau [LINK]",
      example:'"Dacă te regăsești în asta, scrie-mi SISTEM în DM și îți spun exact ce lipsește."',
      pi:"→ IMPLEMENTARE: o acțiune, ton de diagnostic nu de vânzare, fără urgență forțată.",
      built:"Keywords testate: SISTEM / ARHITECTURĂ / BUILT. Unul per reel."
    },
  ];

  const sh=80, sy0=164, sgap=3;
  const halfW=Math.floor((W-160-16)/2);

  sections.forEach((sec,i)=>{
    const col=i<4?0:1;
    const row=i<4?i:i-4;
    const sx=80+col*(halfW+16);
    const sy=sy0+row*(sh+sgap);
    const isPI=sec.tag.includes("INTERRUPT");

    RCT(f,sx,sy,halfW,sh,isPI?{r:0.06,g:0.02,b:0.12}:CARD,10);
    RCT(f,sx,sy,4,sh,sec.c,4);

    TXT(f,sx+12,sy+6,sec.time,8,sec.c,true);
    TXT(f,sx+70,sy+4,sec.tag,9,isPI?PUR:WHT,true);
    TXT(f,sx+12,sy+24,sec.formula,10,GRY,false,halfW-60);
    TXT(f,sx+12,sy+44,'"'+sec.example.replace(/^"|"$/g,'').slice(0,80)+(sec.example.length>80?'...':""),9,isPI?WHT:GRY,false,halfW-60);

    if(isPI){
      RCT(f,sx+halfW-80,sy+6,72,20,PUR,6);
      TXT(f,sx+halfW-74,sy+12,"⚡ RE-HOOK",8,WHT,true);
    }
  });

  RCT(f,80,860,W-160,1,BDR);
  TXT(f,80,872,"BUILT — Pattern Interrupt Strategy · 4/6 · 2026",11,DIM,false);
}

// ═══════════════════════════════════════════════════════════════
// FRAME 05 — CHECKLIST FILMARE + DE CE FUNCȚIONEAZĂ
// ═══════════════════════════════════════════════════════════════
{
  const f = FR("05 — Checklist + Algoritm", 0, H+G, W, H, BG);

  TXT(f,80,52,"CHECKLIST FILMARE + DE CE FUNCȚIONEAZĂ",10,RED,true);
  TXT(f,80,70,"Tot ce faci înainte, în timpul și după filmare.",32,WHT,true);
  TXT(f,80,116,"Un sistem de filmare > improvizație la fiecare reel.",13,MUT,false,900);
  RCT(f,80,144,W-160,1,BDR);

  // Checklist pre-filmare
  const clW=Math.floor((W-160-32)/2);
  TXT(f,80,164,"PRE-FILMARE",9,BLU,true);
  RCT(f,80,180,clW,1,BDR);
  const pre=[
    "Ai definit HOOK-ul (0-3s) — cifra / declarația contraintuitivă",
    "Ai planificat minim 2 unghiuri de filmare diferite",
    "Ai pregătit textul bold care apare pe ecran la hook",
    "Știi care e PAYOFF-ul promis la 24-27s",
    "Știi care e CTA-ul și keyword-ul DM",
    "Ai un prop / element fizic pentru PI #3 dacă e cazul",
    "Ai setat iluminarea + background-ul curat",
  ];
  pre.forEach((item,i)=>{
    const py=192+i*36;
    RCT(f,80,py,16,16,CARD,3);
    RCT(f,80,py,16,16,BDR,3);
    TXT(f,106,py,item,12,GRY,false,clW-36);
    RCT(f,80,py+28,clW,1,{r:0.07,g:0.07,b:0.07});
  });

  TXT(f,80,452,"ÎN TIMPUL FILMĂRII",9,RED,true);
  RCT(f,80,468,clW,1,BDR);
  const during=[
    "Filmezi hook-ul din UNGHI #1 (față sau ¾)",
    "Filmezi aceeași valoare din UNGHI #2 (lateral sau diferit)",
    "Tai în timp ce ești în mișcare (întoarcere, pas spre cameră)",
    "Incluzi cel puțin 2 cuts la unghiuri diferite în 30s",
    "Introduci prop-ul / elementul fizic la secunda 24-27",
    "CTA-ul îl zici clar, privind direct în cameră",
  ];
  during.forEach((item,i)=>{
    const dy=480+i*36;
    RCT(f,80,dy,16,16,CARD,3);
    RCT(f,80,dy,16,16,BDR,3);
    TXT(f,106,dy,item,12,GRY,false,clW-36);
    RCT(f,80,dy+28,clW,1,{r:0.07,g:0.07,b:0.07});
  });

  TXT(f,80,704,"POST-EDITARE",9,GRN,true);
  RCT(f,80,720,clW,1,BDR);
  const post=[
    "Ai tăiat intro-ul (nu spui 'bună ziua, sunt Claudiu, azi...')",
    "Text bold pe ecran la hook și la momentele cheie",
    "Subtitluri auto — crește retenția cu 15%",
    "Ai verificat că primele 3s sunt impact maxim",
    "Sound design: muzică de fundal low + efect la pattern interrupt",
  ];
  post.forEach((item,i)=>{
    const poy=732+i*28;
    RCT(f,80,poy,16,16,CARD,3);
    RCT(f,80,poy,16,16,BDR,3);
    TXT(f,106,poy,item,12,GRY,false,clW-36);
  });

  // Right column — why it works (algorithm + trust)
  const rx=80+clW+32;
  TXT(f,rx,164,"DE CE FUNCȚIONEAZĂ — LANȚUL COMPLET",9,RED,true);
  RCT(f,rx,180,clW,1,BDR);

  const chain=[
    {c:RED,   n:"01",t:"Pattern Interrupt → Watch Time",   d:"Oamenii urmăresc mai mult. Fiecare secundă în plus = semnal pozitiv pentru algoritm."},
    {c:AMB,   n:"02",t:"Watch Time → Algoritm",            d:"Instagram și TikTok distribuie conținut cu retenție ridicată. Reach-ul tău crește organic."},
    {c:BLU,   n:"03",t:"Reach → Mai mulți oameni",         d:"Videoclipul ajunge la audiențe noi, nu doar la followeri. E combustibil pentru creștere."},
    {c:PUR,   n:"04",t:"Engagement → Trust",               d:"Oamenii care urmăresc tot video-ul simt că investești în ei. Trust-ul se construiește prin efort vizibil."},
    {c:GRN,   n:"05",t:"Trust → Conversie",                d:"Dacă nu urmăresc, nu convertesc. Atenția e singurul drum spre DM și spre apelul de diagnostic."},
    {c:RED,   n:"06",t:"Conversie → Client",               d:"500 EUR nu se vând din primul reel. Se vând din 10-20 reels care construiesc autoritate constant."},
  ];

  chain.forEach((ch,i)=>{
    const cy=196+i*96;
    RCT(f,rx,cy,clW,88,CARD,10);
    RCT(f,rx,cy,4,88,ch.c,4);
    RCT(f,rx+16,cy+18,28,28,{r:ch.c.r*0.15,g:ch.c.g*0.15,b:ch.c.b*0.15},6);
    TXT(f,rx+24,cy+24,ch.n,10,ch.c,true);
    TXT(f,rx+56,cy+14,ch.t,12,WHT,true,clW-80);
    TXT(f,rx+56,cy+36,ch.d,11,GRY,false,clW-80);

    if(i<chain.length-1){
      TXT(f,rx+clW/2-8,cy+88,"↓",11,DIM,false);
    }
  });

  RCT(f,80,768,W-160,1,BDR);
  TXT(f,80,780,"BUILT — Pattern Interrupt Strategy · 5/6 · 2026",11,DIM,false);
}

// ═══════════════════════════════════════════════════════════════
// FRAME 06 — CALENDARUL DE CONȚINUT CU PI
// ═══════════════════════════════════════════════════════════════
{
  const f = FR("06 — Calendar Săptămânal PI", W+G, H+G, W, H, BG);

  TXT(f,80,52,"CALENDARUL SĂPTĂMÂNAL BUILT — CU PATTERN INTERRUPT",10,RED,true);
  TXT(f,80,70,"Fiecare reel = tip specific de PI. Varietate = retenție.",32,WHT,true);
  TXT(f,80,116,"Nu același tip de PI în fiecare video. Alternezi pentru a menține surpriza.",13,MUT,false,900);
  RCT(f,80,144,W-160,1,BDR);

  const days=[
    {
      day:"LUNI", c:RED, type:"Talking Head / Rant",
      hook:'"De ce [CIFRĂ] bărbați cu venituri bune tot nu reușesc să slăbească"',
      pi1:"Schimbare unghi la 8s — cut lateral",
      pi2:"Text bold 'GREȘEALA FATALĂ' la 16s",
      pi3:"Arunci / prinzi obiect la 24s",
      cta:"Scrie SISTEM în DM",
      topic:"Pilonul B sau I"
    },
    {
      day:"MARȚI", c:BLU, type:"Tutorial / Demonstrație",
      hook:'"În 3 pași — cum [REZULTAT SPECIFIC] fără [SACRIFICIUL TEMUT]"',
      pi1:"Mergi spre cameră la pasul 2",
      pi2:"Close-up pe detaliu relevant la pasul 3",
      pi3:"Pauza intenționată 1s înainte de revelație",
      cta:"Urmărește pentru mai multe",
      topic:"Pilonul L — Lifestyle Integration"
    },
    {
      day:"MIERCURI", c:AMB, type:"Story / Case Study",
      hook:'"Clientul meu [PROFIL] a reușit [REZULTAT] în [TIMP]"',
      pi1:"Cut la screenshot / testimonial text la 8s",
      pi2:"Zoom in pe cifra / rezultatul cheie",
      pi3:"Întoarcere spre cameră cu 'și asta nu e tot'",
      cta:"DM DOVADĂ pentru studiul de caz complet",
      topic:"Social proof — Alex / Anastasia"
    },
    {
      day:"JOI", c:PUR, type:"Talking Head — Provocare",
      hook:'"Contrariul față de ce crezi despre [SUBIECT FITNESS]"',
      pi1:"Challenger reframe cu pauza 1s",
      pi2:"B-roll intercalat (sală, mâncare, antrenament)",
      pi3:"Întoarcere corp spre alt unghi + text",
      cta:"Scrie ARHITECTURĂ în DM",
      topic:"Pilonul T — Tough Mindset"
    },
    {
      day:"VINERI", c:GRN, type:"List / Quick Tips",
      hook:'"[NUMĂR] motive pentru care [SITUAȚIE DUREROASĂ]"',
      pi1:"Text numărătoare pe ecran (1... 2... 3...)",
      pi2:"Schimbare unghi la fiecare item nou",
      pi3:"Zoom in la ultimul item — cel mai important",
      cta:"Urmărește pentru restul listei",
      topic:"Pilonul U sau I"
    },
    {
      day:"SÂMBĂTĂ", c:ORG, type:"Behind the Scenes",
      hook:"Intri în cadru în activitate reală (antrenament, masă, planificare)",
      pi1:"Cut la rezultat / progres vizibil",
      pi2:"Text pe ecran cu insight-ul din acea activitate",
      pi3:"Întoarcere directă spre cameră cu mesajul final",
      cta:"Scrie BUILT în DM",
      topic:"Autenticitate + Personal Brand"
    },
  ];

  const dw=Math.floor((W-160-5*16)/days.length);
  days.forEach((d,i)=>{
    const dx=80+i*(dw+16), dy=164;
    RCT(f,dx,dy,dw,636,CARD,12);
    RCT(f,dx,dy,dw,4,d.c,12);

    // Header
    TXT(f,dx+12,dy+16,d.day,10,d.c,true);
    TXT(f,dx+12,dy+34,d.type,11,WHT,true,dw-24);
    TXT(f,dx+12,dy+56,d.topic,9,MUT,false,dw-24);
    RCT(f,dx+12,dy+72,dw-24,1,BDR);

    // Hook
    TXT(f,dx+12,dy+80,"HOOK",7,d.c,true);
    TXT(f,dx+12,dy+92,d.hook,9,GRY,false,dw-24);
    RCT(f,dx+12,dy+160,dw-24,1,BDR);

    // PI sections
    TXT(f,dx+12,dy+168,"PI #1 — 8s",7,PUR,true);
    TXT(f,dx+12,dy+180,d.pi1,9,GRY,false,dw-24);
    RCT(f,dx+12,dy+216,dw-24,1,BDR);

    TXT(f,dx+12,dy+224,"PI #2 — 16s",7,PUR,true);
    TXT(f,dx+12,dy+236,d.pi2,9,GRY,false,dw-24);
    RCT(f,dx+12,dy+272,dw-24,1,BDR);

    TXT(f,dx+12,dy+280,"PI #3 — 24s",7,PUR,true);
    TXT(f,dx+12,dy+292,d.pi3,9,GRY,false,dw-24);
    RCT(f,dx+12,dy+328,dw-24,1,BDR);

    // CTA
    RCT(f,dx+12,dy+340,dw-24,52,{r:d.c.r*0.08,g:d.c.g*0.08,b:d.c.b*0.08},8);
    TXT(f,dx+20,dy+348,"CTA",7,d.c,true);
    TXT(f,dx+20,dy+362,d.cta,9,WHT,false,dw-40);
  });

  // Bottom KPI bar
  RCT(f,80,820,W-160,60,CARD,12);
  RCT(f,80,820,W-160,3,RED,12);
  TXT(f,104,834,"TARGET RETENȚIE",9,RED,true);
  const kpis=[
    "3s hold rate: >60%","Watch time complet: >40%","Save rate: >3%","Share rate: >2%","DM-uri inbound: 5+/săpt"
  ];
  const kw2=Math.floor((W-200)/kpis.length);
  kpis.forEach((k,i)=>{
    TXT(f,104+i*(kw2),848,k,11,GRY,false,kw2-8);
    if(i<kpis.length-1) RCT(f,104+i*(kw2)+kw2-4,832,1,36,BDR);
  });

  RCT(f,80,892,W-160,1,BDR);
  TXT(f,80,882,"BUILT — Pattern Interrupt Strategy · 6/6 · 2026",11,DIM,false);
}

// ── Done ──────────────────────────────────────────────────────────
figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
figma.closePlugin("✅ BUILT Pattern Interrupt Strategy — 6 frame-uri generate!");

})().catch(err => figma.closePlugin("❌ " + err.message));
