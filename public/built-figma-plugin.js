// ═══════════════════════════════════════════════════════════════
// BUILT — Sales Strategy System Map · Figma Plugin
// Run once → 8 frame-uri complete pe canvas
// ═══════════════════════════════════════════════════════════════

(async function () {

await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Bold" });

// ── Helpers ─────────────────────────────────────────────────────
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
  s.x=x; s.y=y; s.resize(Math.max(w,1), Math.max(h,1));
  s.fills=solid(c); if(r) s.cornerRadius=r; if(p) p.appendChild(s); return s;
}
function TXT(p, x, y, str, sz, c, bold, mw) {
  if(!str||!str.length) str=" ";
  const t = figma.createText();
  t.fontName={family:"Inter",style:bold?"Bold":"Regular"};
  t.fontSize=sz; t.fills=solid(c);
  if(mw){ t.textAutoResize="HEIGHT"; t.resize(mw,sz+4); }
  t.characters=str; t.x=x; t.y=y;
  if(p) p.appendChild(t); return t;
}

// ── Colors ───────────────────────────────────────────────────────
const BG   = rgb("#080808"), CARD = rgb("#0F0F0F"), CARD2= rgb("#111111");
const BDR  = rgb("#1E1E1E"), RED  = rgb("#C0392B"), WHT  = rgb("#FFFFFF");
const GRY  = rgb("#A1A1AA"), MUT  = rgb("#52525B"), DIM  = rgb("#27272A");
const PUR  = rgb("#7C3AED"), BLU  = rgb("#0891B2"), AMB  = rgb("#D97706");
const GRN  = rgb("#059669"), YEL  = rgb("#EAB308");

const W=1440, H=900, G=80;

// ─────────────────────────────────────────────────────────────────
// FRAME 01 — OVERVIEW
// ─────────────────────────────────────────────────────────────────
{
  const f = FR("01 — System Overview", 0, 0, W, H, BG);
  TXT(f,80,52,"BUILT — SISTEM DE CONVERSIE 2026",10,RED,true);
  TXT(f,80,70,"De la Vizualizare la Client Plătitor",34,WHT,true);
  TXT(f,80,118,"Reel → DM → Apel Diagnostic → Onboarding → Ambasador",13,MUT,false,900);
  RCT(f,80,148,W-160,1,BDR);

  // 7 stage boxes
  const stages=[
    {n:"01",l:"CONTENT",    c:RED, d:"Hook + CTA\nKeyword DM"},
    {n:"02",l:"DM",         c:PUR, d:"4 mesaje\ncalificare"},
    {n:"03",l:"TRANZIȚIE",  c:BLU, d:"15 min\ndiagnostic"},
    {n:"04",l:"APEL",       c:AMB, d:"5 faze\n500 EUR"},
    {n:"05",l:"ONBOARDING", c:GRN, d:"7 zile\nApple-style"},
    {n:"06",l:"90 ZILE",    c:RED, d:"5 piloni\nB.U.I.L.T."},
    {n:"07",l:"AMBASADOR",  c:PUR, d:"Referral\nFlywheel"},
  ];
  const bw=172, bh=148, sy=168;
  const gap=Math.floor((W-160-stages.length*bw)/(stages.length-1));
  stages.forEach((s,i)=>{
    const bx=80+i*(bw+gap);
    RCT(f,bx,sy,bw,bh,CARD,12);
    RCT(f,bx,sy+bh-4,bw,4,s.c,12);
    TXT(f,bx+12,sy+12,s.n,9,s.c,true);
    TXT(f,bx+12,sy+28,s.l,11,s.c,true);
    TXT(f,bx+12,sy+52,s.d,12,GRY,false,bw-24);
    if(i<stages.length-1) TXT(f,bx+bw+Math.floor(gap/2)-6,sy+bh/2-8,"→",14,DIM,false);
  });

  // 6 key metrics
  const metrics=[
    {v:"500 EUR",l:"Preț ancorare",      c:RED},
    {v:"90 ZILE", l:"Durata program",    c:AMB},
    {v:"5 PILONI",l:"Arhitectura BUILT", c:BLU},
    {v:"15 MIN",  l:"Apel diagnostic",   c:GRN},
    {v:"4 MSG",   l:"Calificare DM",     c:PUR},
    {v:"24–48H",  l:"Follow-up unic",    c:GRY},
  ];
  const mw=Math.floor((W-160-5*16)/metrics.length);
  metrics.forEach((m,i)=>{
    const mx=80+i*(mw+16), my=338;
    RCT(f,mx,my,mw,88,CARD,12);
    RCT(f,mx,my,mw,4,m.c,12);
    TXT(f,mx+14,my+22,m.v,22,m.c,true);
    TXT(f,mx+14,my+56,m.l,11,MUT,false,mw-28);
  });

  // Regula de aur
  RCT(f,80,450,W-160,96,CARD,12);
  RCT(f,80,450,4,96,RED,4);
  TXT(f,104,466,"REGULA FUNDAMENTALĂ",9,RED,true);
  TXT(f,104,484,"Nu vindem. Diagnosticăm. Nu convingem. Calificăm.",18,WHT,true,W-200);
  TXT(f,104,514,"Nu cerșim clienți. Selectăm. Nu improvizăm prețul. 500 EUR — ferm, o dată, fără scuze.",12,GRY,false,W-200);

  // 5 pillars
  TXT(f,80,572,"CEI 5 PILONI B.U.I.L.T.",9,RED,true);
  RCT(f,80,586,W-160,1,BDR);
  const pillars=[
    {l:"B",t:"Base Strength",      d:"Forță compusă, progresie logaritmică"},
    {l:"U",t:"Unbreakable Capacity",d:"Zone 2, rezistență cardiovasculară"},
    {l:"I",t:"Intelligent Fueling", d:"Nutriție ca sistem, 80/20, anti-binge"},
    {l:"L",t:"Lifestyle Integration",d:"Integrat în viața reală cu job și familie"},
    {l:"T",t:"Tough Mindset",       d:"Identitate de om echilibrat, nu la dietă"},
  ];
  const pw=Math.floor((W-160-4*16)/pillars.length);
  pillars.forEach((p,i)=>{
    const px=80+i*(pw+16), py=596;
    RCT(f,px,py,pw,100,CARD,10);
    TXT(f,px+14,py+12,p.l,28,RED,true);
    TXT(f,px+14,py+50,p.t,11,WHT,true,pw-28);
    TXT(f,px+14,py+70,p.d,10,MUT,false,pw-28);
  });

  RCT(f,80,720,W-160,1,BDR);
  TXT(f,80,732,"BUILT — System Overview · 1/8 · 2026",11,DIM,false);
}

// ─────────────────────────────────────────────────────────────────
// FRAME 02 — ICP PROFILE
// ─────────────────────────────────────────────────────────────────
{
  const f = FR("02 — ICP Profile", W+G, 0, W, H, BG);
  TXT(f,80,52,"PROFILUL CLIENTULUI IDEAL",10,RED,true);
  TXT(f,80,70,"Cu cine lucrăm. Cu cine nu.",34,WHT,true);
  TXT(f,80,118,"Nu toți sunt potriviți. Selectăm oameni gata să se reconstruiască.",13,MUT,false,900);
  RCT(f,80,148,W-160,1,BDR);

  const aw=Math.floor((W-160-32)/2);

  // Avatar 1 — Bărbat
  const a1x=80, a1y=168;
  RCT(f,a1x,a1y,aw,540,CARD,14);
  RCT(f,a1x,a1y,aw,4,RED,14);
  TXT(f,a1x+20,a1y+18,"AVATAR 01",9,RED,true);
  TXT(f,a1x+20,a1y+34,"Bărbatul Profesionist",17,WHT,true);
  TXT(f,a1x+20,a1y+58,"28–42 ani · IT / Antreprenor / Manager",12,MUT,false,aw-40);
  RCT(f,a1x+20,a1y+82,aw-40,1,BDR);
  const a1rows=[
    ["SITUAȚIE","Job bun, familie, dar burtă vizibilă și energie scăzută. A mai încercat: sală 3 luni, keto, intermittent fasting. Toate au eșuat."],
    ["DUREREA REALĂ","Rușine că reușește la orice altceva în afară de propriul corp. Simte că pierde autoritate în fața copiilor și partenerului."],
    ["FRICA #1","Că și de data asta va eșua și va fi o altă confirmare că 'nu e de el'. Că e prea ocupat ca să aibă timp."],
    ["CE VREA","Să se vadă în oglindă și să fie mândru. Energie pentru familie. Un corp care să reflecte cine este la job."],
    ["DE CE BUILT","Sistem clar pe viața lui reală. Nu sală 6 zile/săpt. Nu dietă imposibilă. Un arhitect, nu un majoret."],
  ];
  a1rows.forEach(([k,v],i)=>{
    const iy=a1y+96+i*80;
    TXT(f,a1x+20,iy,k,9,RED,true);
    TXT(f,a1x+20,iy+16,v,11,GRY,false,aw-40);
    if(i<a1rows.length-1) RCT(f,a1x+20,iy+70,aw-40,1,BDR);
  });
  RCT(f,a1x+20,a1y+504,aw-40,28,{r:0.12,g:0.02,b:0.02},6);
  RCT(f,a1x+20,a1y+504,3,28,RED,3);
  TXT(f,a1x+32,a1y+512,'"Am reușit la orice. Dar propriul corp... nu știu de ce nu funcționează."',10,GRY,false,aw-52);

  // Avatar 2 — Femeie
  const a2x=80+aw+32, a2y=168;
  RCT(f,a2x,a2y,aw,540,CARD,14);
  RCT(f,a2x,a2y,aw,4,PUR,14);
  TXT(f,a2x+20,a2y+18,"AVATAR 02",9,PUR,true);
  TXT(f,a2x+20,a2y+34,"Femeia Activă",17,WHT,true);
  TXT(f,a2x+20,a2y+58,"28–42 ani · Antreprenoare / Profesionistă",12,MUT,false,aw-40);
  RCT(f,a2x+20,a2y+82,aw-40,1,BDR);
  const a2rows=[
    ["SITUAȚIE","A slăbit și s-a îngrășat de 5 ori. Deficit caloric agresiv, cardio 6 zile/săpt. Platou de luni de zile."],
    ["DUREREA REALĂ","Obosită de ciclul: restricție → binge → vinovăție → restricție. Vrea să iasă din relația toxică cu mâncarea."],
    ["FRICA #1","Că va trebui să renunțe la tot ce-i place ca să aibă corpul dorit. Că trebuie să sufere."],
    ["CE VREA","Tonus, energie, claritate mintală. Să mănânce normal și să se simtă bine în haine."],
    ["DE CE BUILT","Reconstrucție, nu înfometare. Sistem sustenabil pe viața ei reală. Fără vinovăție, fără extreme."],
  ];
  a2rows.forEach(([k,v],i)=>{
    const iy=a2y+96+i*80;
    TXT(f,a2x+20,iy,k,9,PUR,true);
    TXT(f,a2x+20,iy+16,v,11,GRY,false,aw-40);
    if(i<a2rows.length-1) RCT(f,a2x+20,iy+70,aw-40,1,BDR);
  });
  RCT(f,a2x+20,a2y+504,aw-40,28,{r:0.06,g:0.02,b:0.12},6);
  RCT(f,a2x+20,a2y+504,3,28,PUR,3);
  TXT(f,a2x+32,a2y+512,'"Știu cum funcționează. Am citit totul. Dar nu reușesc să aplic consistent."',10,GRY,false,aw-52);

  // Red flags
  RCT(f,80,730,W-160,96,{r:0.07,g:0.02,b:0.02},12);
  RCT(f,80,730,4,96,RED,4);
  TXT(f,104,746,"RED FLAGS — NU INTRĂM ÎN APEL",9,RED,true);
  const flags=["Vrea să slăbească 30kg în 2 luni","Nu are deloc timp — niciodată","Răspunsuri monosilabice repetate","Caută cel mai ieftin antrenor","Nu vrea să schimbe nimic din rutină"];
  flags.forEach((fl,i)=>{
    const col=i<3?0:1, row=i<3?i:i-3;
    TXT(f,104+col*580,770+row*22,"✕  "+fl,11,{r:0.78,g:0.3,b:0.3},false);
  });
  RCT(f,80,848,W-160,1,BDR); TXT(f,80,860,"BUILT — ICP Profile · 2/8 · 2026",11,DIM,false);
}

// ─────────────────────────────────────────────────────────────────
// FRAME 03 — CONTENT SYSTEM
// ─────────────────────────────────────────────────────────────────
{
  const f = FR("03 — Content System", (W+G)*2, 0, W, H, BG);
  TXT(f,80,52,"SISTEMUL DE CONȚINUT",10,RED,true);
  TXT(f,80,70,"Content care convertește",34,WHT,true);
  TXT(f,80,118,"Fiecare secundă câștigă dreptul ca următoarea să existe.",13,MUT,false,900);
  RCT(f,80,148,W-160,1,BDR);

  // Script structure — left
  const cw=620;
  TXT(f,80,164,"STRUCTURA SCRIPTULUI — OBLIGATORIE",9,RED,true);
  const parts=[
    {t:"0–3s",  c:RED, h:"HOOK",               d:"Declarație contraintuitivă / Cifră + durere / Oglindire directă. Oprești scrollul sau clipul nu există."},
    {t:"3–20s", c:AMB, h:"PROBLEMĂ / VALIDARE", d:"Numești situația exactă. Validezi: 'Nu e lipsă de voință — e lipsă de sistem.' Explici mecanismul fiziologic."},
    {t:"20–50s",c:BLU, h:"SISTEMUL BUILT",      d:"Soluție legată de pilonul B/U/I/L/T relevant. Specificitate extremă. Arhitectură, nu promisiune."},
    {t:"50–55s",c:GRN, h:"CTA DISCRET",          d:"O singură acțiune. Ton diagnostic, nu vânzare. Ex: 'Dacă te regăsești, scrie-mi SISTEM în DM.'"},
  ];
  parts.forEach((p,i)=>{
    const sy=180+i*116;
    RCT(f,80,sy,cw,108,CARD,12);
    RCT(f,80,sy,4,108,p.c,4);
    TXT(f,100,sy+12,p.t,9,p.c,true);
    TXT(f,148,sy+10,p.h,11,p.c,true);
    RCT(f,100,sy+30,cw-40,1,BDR);
    TXT(f,100,sy+42,p.d,12,GRY,false,cw-60);
  });

  // Right column
  const rx=80+cw+48, rw=W-160-cw-48;
  TXT(f,rx,164,"5 TEME DE AUTORITATE BUILT",9,RED,true);
  const themes=["Sistemul bate voința","Corpul e inginerie, nu moralitate","Cortizolul e dușmanul real","Eșecul anterior e al metodei","Identitatea precede comportamentul"];
  themes.forEach((th,i)=>{
    const ty=180+i*46;
    RCT(f,rx,ty,rw,38,CARD,8);
    RCT(f,rx,ty,3,38,RED,3);
    TXT(f,rx+16,ty+10,th,12,WHT,false,rw-32);
  });

  // Weekly calendar
  TXT(f,rx,424,"CADENȚĂ SĂPTĂMÂNALĂ",9,BLU,true);
  const days=[
    {d:"LUN",t:"Reel",      c:RED},{d:"MAR",t:"Stories",   c:MUT},
    {d:"MIE",t:"Newsletter",c:BLU},{d:"JOI",t:"Reel",      c:RED},
    {d:"VIN",t:"Carusel",   c:MUT},{d:"SÂM",t:"BTS",       c:MUT},
  ];
  const dw=Math.floor(rw/days.length)-4;
  days.forEach((d,i)=>{
    const dx=rx+i*(dw+4), dy=442;
    RCT(f,dx,dy,dw,80,CARD,8);
    RCT(f,dx,dy,dw,3,d.c,8);
    TXT(f,dx+8,dy+14,d.d,10,d.c,true);
    TXT(f,dx+8,dy+32,d.t,11,WHT,false,dw-16);
  });

  // CTA keyword
  RCT(f,rx,542,rw,72,CARD,12);
  RCT(f,rx,542,rw,4,RED,12);
  TXT(f,rx+16,558,"SISTEM CTA KEYWORD",9,RED,true);
  TXT(f,rx+16,576,"Scrie-mi SISTEM / ARHITECTURĂ / BUILT în DM",13,WHT,false,rw-32);
  TXT(f,rx+16,598,"Un singur keyword per reel. CTA la ultimele 3–5 secunde.",11,GRY,false,rw-32);

  // KPIs
  TXT(f,80,640,"KPI CONȚINUT — URMĂREȘTI SĂPTĂMÂNAL",9,RED,true);
  RCT(f,80,656,W-160,1,BDR);
  const kpis=[
    {m:"Reach / reel",         t:"10K+",  c:PUR},
    {m:"DM-uri inbound/săpt",  t:"5+",    c:BLU},
    {m:"Calificare DM",        t:"60%+",  c:AMB},
    {m:"Show-up la apel",      t:"80%+",  c:RED},
    {m:"Conversie apel→client",t:"40%+",  c:GRN},
  ];
  const kw=Math.floor((W-160-4*16)/kpis.length);
  kpis.forEach((k,i)=>{
    const kx=80+i*(kw+16), ky=668;
    RCT(f,kx,ky,kw,80,CARD,10);
    TXT(f,kx+12,ky+12,k.m,10,MUT,false,kw-24);
    TXT(f,kx+12,ky+30,k.t,22,k.c,true);
    RCT(f,kx,ky,kw,3,k.c,10);
  });

  RCT(f,80,772,W-160,1,BDR); TXT(f,80,784,"BUILT — Content System · 3/8 · 2026",11,DIM,false);
}

// ─────────────────────────────────────────────────────────────────
// FRAME 04 — DM SYSTEM
// ─────────────────────────────────────────────────────────────────
{
  const f = FR("04 — DM Qualification", (W+G)*3, 0, W, H, BG);
  TXT(f,80,52,"SISTEMUL DM — CALIFICARE",10,PUR,true);
  TXT(f,80,70,"Cele 4 Mesaje Magice",34,WHT,true);
  TXT(f,80,118,"Primul mesaj nu vinde nimic. Fiecare mesaj diagnostichează un nivel mai adânc.",13,MUT,false,900);
  RCT(f,80,148,W-160,1,BDR);

  const msgs=[
    {n:"M1",c:PUR,g:"VERBALIZAREA DURERII",
     s:'"Ce te-a făcut să comentezi chiar azi?"',
     w:"Forțezi verbalizarea durerii reale. Nu 'de ce m-ai contactat' — 'DE CE AZI' specifică momentul, nu intenția generală.",
     l:"Răspuns specific și emoțional = semnal verde. Generic = sondezi mai adânc."},
    {n:"M2",c:BLU,g:"PROFILAREA",
     s:'"Unde ești acum, concret? Nu ca să te judec — ca să înțeleg de unde plecăm."',
     w:"Identifici profilul: Saltu direct / Ciclist cronic / Atlet blocat. Fiecare primește abordare diferită.",
     l:"Ascultă: cât timp au eșuat, câte tentative, ce au încercat anterior."},
    {n:"M3",c:AMB,g:"DEZARMAREA APĂRĂRII",
     s:'"Ce te-a oprit până acum? Nu mă refer la timp sau bani — la asta ajungem noi."',
     w:"Dezarmezi bariera principală explicit. Excluderea 'timp și bani' forțează verbalizarea barierei reale: frică de eșec, lipsă sistem.",
     l:"Bariera reală dezvăluită = proxy pentru angajament. Dacă nu poate articula = nu e gata."},
    {n:"M4",c:GRN,g:"TENSIUNEA EMOȚIONALĂ",
     s:'"Dacă în 90 de zile ai fi exact omul pe care ți-l dorești — cum arată ziua ta? Concret."',
     w:"Creezi tensiunea emoțională pozitivă. Prospectul se imaginează în viitorul dorit. Detalii specifice = candidat serios.",
     l:"Ora de trezire, energia, cum se simte în haine = angajament real. Răspuns vag = nicio urgență."},
  ];

  const mw=Math.floor((W-160-32)/2), mh=260;
  msgs.forEach((m,i)=>{
    const col=i%2, row=Math.floor(i/2);
    const mx=80+col*(mw+32), my=168+row*(mh+16);
    RCT(f,mx,my,mw,mh,CARD,12);
    RCT(f,mx,my,mw,4,m.c,12);
    TXT(f,mx+16,my+18,m.n,9,m.c,true);
    TXT(f,mx+50,my+16,m.g,11,m.c,true);
    RCT(f,mx+16,my+36,mw-32,1,BDR);
    RCT(f,mx+16,my+46,mw-32,56,{r:m.c.r*0.06,g:m.c.g*0.06,b:m.c.b*0.06},8);
    RCT(f,mx+16,my+46,3,56,m.c,3);
    TXT(f,mx+28,my+54,m.s,11,WHT,false,mw-56);
    TXT(f,mx+16,my+114,"DE CE",8,m.c,true);
    TXT(f,mx+16,my+128,m.w,11,GRY,false,mw-32);
    RCT(f,mx+16,my+210,mw-32,1,BDR);
    TXT(f,mx+16,my+218,"↳  "+m.l,10,MUT,false,mw-32);
  });

  // Follow-up + Red flags
  const botY=168+2*(mh+16)+8;
  RCT(f,80,botY,380,100,CARD,12);
  RCT(f,80,botY,4,100,AMB,4);
  TXT(f,100,botY+12,"FOLLOW-UP PROTOCOL",9,AMB,true);
  TXT(f,100,botY+30,"O singură dată, la 24–48h.",13,WHT,false,340);
  TXT(f,100,botY+52,"Dacă nu răspunde — nu mai contactezi.",11,GRY,false,340);
  TXT(f,100,botY+72,"Fiecare mesaj în plus îți reduce autoritatea 50%.",11,MUT,false,340);

  RCT(f,476,botY,W-556,100,CARD,12);
  RCT(f,476,botY,4,100,RED,4);
  TXT(f,496,botY+12,"RED FLAGS — OPREȘTI CONVERSAȚIA",9,RED,true);
  ["Vrea 30kg în 2 luni","Nu are deloc timp","Răspunsuri sub 5 cuvinte","Caută cel mai ieftin"].forEach((fl,i)=>{
    TXT(f,496,botY+32+i*18,"✕  "+fl,11,{r:0.7,g:0.3,b:0.3},false);
  });

  RCT(f,80,botY+118,W-160,1,BDR);
  TXT(f,80,botY+130,"BUILT — DM System · 4/8 · 2026",11,DIM,false);
}

// ─────────────────────────────────────────────────────────────────
// FRAME 05 — SALES CALL
// ─────────────────────────────────────────────────────────────────
{
  const f = FR("05 — Sales Call", 0, H+G, W, H, BG);
  TXT(f,80,52,"APELUL DE DIAGNOSTIC — 20–30 MIN",10,AMB,true);
  TXT(f,80,70,"5 Faze. Un Singur Obiectiv.",34,WHT,true);
  TXT(f,80,118,"Cel mai slab semnal dintr-un apel = disperarea de a vinde.",13,MUT,false,900);
  RCT(f,80,148,W-160,1,BDR);

  const phases=[
    {n:"F1",t:"0–2 min", c:BLU, h:"SETAREA CADRULUI",
     s:'"Acesta e un diagnostic, nu o prezentare de vânzare. Vreau să înțeleg situația ta și să-ți spun sincer dacă și cum te pot ajuta. OK?"',
     r:"Stabilești autoritatea din primul minut. Dacă nu setezi cadrul, clientul intră în modul 'convinge-mă'."},
    {n:"F2",t:"2–10 min",c:PUR, h:"DIAGNOSTICUL",
     s:'"Unde ești acum fizic?" → "Cât timp ești în această situație?" → "Cum a afectat asta energia ta / relația / încrederea?"',
     r:"Obiectivul: clientul să audă problema cu VOCEA LUI. Tu pui întrebări. Tăcerile nu se umplu niciodată."},
    {n:"F3",t:"10–15 min",c:AMB, h:"CHALLENGER REFRAME",
     s:'"Dacă îți spun ceva care poate părea dur, e OK? Problema nu e lipsa de voință. E că ai aplicat soluții pentru altă problemă decât cea pe care o ai."',
     r:"Contrazici constructiv credința falsă. Muți responsabilitatea la metodă, nu la om. Aceasta îl eliberează să fie deschis."},
    {n:"F4",t:"15–22 min",c:GRN, h:"PREZENTAREA SOLUȚIEI",
     s:"Legi fiecare element BUILT de o durere pe care el tocmai a verbalizat-o: 'Ai zis că... Exact pentru asta avem pilonul [X]...'",
     r:"Nu prezinți features. Prezinți soluții la dureri specifice, în ordinea în care le-a menționat EL."},
    {n:"F5",t:"22–30 min",c:RED, h:"PREȚUL + OBIECȚII",
     s:'"Investiția pentru 90 de zile este 500 EUR. Cum vrei să procedăm?" (PAUZĂ COMPLETĂ — nu adaugi nimic.)',
     r:"Prețul: ferm, o dată, fără scuze, fără justificare. Tăcerea după preț e normală. Cel care vorbește primul pierde."},
  ];

  const pw=Math.floor((W-160-4*16)/phases.length), ph=448;
  phases.forEach((p,i)=>{
    const px=80+i*(pw+16), py=168;
    RCT(f,px,py,pw,ph,CARD,12);
    RCT(f,px,py,pw,4,p.c,12);
    TXT(f,px+12,py+18,p.n,9,p.c,true);
    TXT(f,px+12,py+34,p.t,9,MUT,false);
    TXT(f,px+12,py+52,p.h,11,p.c,true,pw-24);
    RCT(f,px+12,py+78,pw-24,1,BDR);
    RCT(f,px+12,py+88,pw-24,148,{r:p.c.r*0.05,g:p.c.g*0.05,b:p.c.b*0.05},8);
    RCT(f,px+12,py+88,2,148,p.c,2);
    TXT(f,px+22,py+96,p.s,10,WHT,false,pw-44);
    RCT(f,px+12,py+248,pw-24,1,BDR);
    TXT(f,px+12,py+258,"REGULĂ",8,p.c,true);
    TXT(f,px+12,py+272,p.r,10,GRY,false,pw-24);
  });

  // Rules
  RCT(f,80,638,W-160,100,CARD,12);
  RCT(f,80,638,W-160,4,RED,12);
  TXT(f,104,652,"REGULI ABSOLUTE",9,RED,true);
  const rules=["Nu umpli tăcerile — ele vând","Nu repeți beneficiile de 2 ori","Nu te scuzi pentru preț","Fiecare apel se termină cu decizie clară DA / NU / Data","Nu faci follow-up mai mult de o dată"];
  rules.forEach((r,i)=>{
    const col=i<3?0:1, row=i<3?i:i-3;
    TXT(f,104+col*640,676+row*24,"→  "+r,12,GRY,false);
  });

  RCT(f,80,760,W-160,1,BDR); TXT(f,80,772,"BUILT — Sales Call · 5/8 · 2026",11,DIM,false);
}

// ─────────────────────────────────────────────────────────────────
// FRAME 06 — OFFER ARCHITECTURE
// ─────────────────────────────────────────────────────────────────
{
  const f = FR("06 — Offer Architecture", W+G, H+G, W, H, BG);
  TXT(f,80,52,"ARHITECTURA OFERTEI",10,RED,true);
  TXT(f,80,70,"Grand Slam Offer BUILT",34,WHT,true);
  TXT(f,80,118,"Valoare percepută: 16.000 RON. Preț real: 500 EUR. Raport: 6.4×.",13,MUT,false,900);
  RCT(f,80,148,W-160,1,BDR);

  // Value equation
  RCT(f,80,164,W-160,64,CARD,12);
  TXT(f,104,178,"ECUAȚIA VALORII — Alex Hormozi",9,RED,true);
  TXT(f,104,196,"VALOARE  =  ( Rezultat Visat × Probabilitate Succes )  ÷  ( Timp Așteptare × Efort Perceput )",12,WHT,false,W-200);
  TXT(f,104,216,"Creștem numărătorul. Reducem numitorul. Asta e tot designul ofertei.",11,MUT,false,W-200);

  // Value stack
  const vsw=580;
  TXT(f,80,248,"STIVA DE VALOARE",9,GRN,true);
  const items=[
    ["Program antrenament 90 zile personalizat","3.000 RON"],
    ["Plan nutriție ca sistem (non-restrictiv)","2.000 RON"],
    ["Coaching săptămânal + ajustări live","4.000 RON"],
    ["Acces platformă BUILT + tracked progress","1.500 RON"],
    ["Bibliotecă exerciții + video demo","800 RON"],
    ["Comunitate cohortă + ritualizare","1.200 RON"],
    ["Protocol urgență (recăderi + stres)","1.500 RON"],
    ["Bonus: Ghid integrare restaurante/travel","1.000 RON"],
    ["Bonus: Protocol somn + recuperare","1.000 RON"],
  ];
  items.forEach(([it,vl],i)=>{
    const iy=264+i*38;
    RCT(f,80,iy,vsw,36,i%2===0?CARD:CARD2,0);
    TXT(f,96,iy+10,it,12,GRY,false,vsw-120);
    TXT(f,80+vsw-12,iy+10,vl,12,GRN,true);
  });
  // Total
  RCT(f,80,264+items.length*38,vsw,44,{r:0.02,g:0.1,b:0.04},8);
  TXT(f,96,264+items.length*38+12,"VALOARE TOTALĂ PERCEPUTĂ",10,GRN,true);
  TXT(f,80+vsw-12,264+items.length*38+10,"16.000 RON",16,GRN,true);

  // Right column
  const rx=80+vsw+48, rw=W-160-vsw-48;
  // Price
  RCT(f,rx,164,rw,136,{r:0.1,g:0.02,b:0.02},14);
  RCT(f,rx,164,rw,4,RED,14);
  TXT(f,rx+20,182,"PREȚUL ANCORARE",9,RED,true);
  TXT(f,rx+20,200,"500 EUR",44,WHT,true);
  TXT(f,rx+20,256,"Ferm. O dată. Fără scuze. Niciodată reducere.",12,MUT,false,rw-40);
  TXT(f,rx+20,276,"Raport valoare: 6.4× față de preț real.",12,GRY,false,rw-40);

  // ONLY statement
  RCT(f,rx,316,rw,108,CARD,12);
  RCT(f,rx,316,4,108,AMB,4);
  TXT(f,rx+20,330,"ONLY STATEMENT",9,AMB,true);
  TXT(f,rx+20,348,"BUILT e singurul program din România care",12,WHT,false,rw-40);
  TXT(f,rx+20,366,"îmbină forța, capacitatea, nutriția și mindset-ul",12,WHT,false,rw-40);
  TXT(f,rx+20,384,"într-un sistem de 90 de zile integrat în viața reală.",12,WHT,false,rw-40);
  TXT(f,rx+20,408,"Nu cursuri video. Nu plan generic. Arhitectură personalizată.",11,MUT,false,rw-40);

  // Guarantee
  RCT(f,rx,440,rw,88,CARD,12);
  RCT(f,rx,440,4,88,GRN,4);
  TXT(f,rx+20,454,"GARANȚIE",9,GRN,true);
  TXT(f,rx+20,472,"Dacă după 30 de zile, urmând protocolul,",12,WHT,false,rw-40);
  TXT(f,rx+20,490,"nu simți o diferență reală — restituim investiția.",12,WHT,false,rw-40);
  TXT(f,rx+20,512,"Riscul e la noi. Cu condiții clare, nu cu scuze.",11,MUT,false,rw-40);

  // Anchoring strategy
  RCT(f,rx,544,rw,68,CARD,12);
  RCT(f,rx,544,4,68,PUR,4);
  TXT(f,rx+20,558,"STRATEGIE ANCORARE PREȚ",9,PUR,true);
  TXT(f,rx+20,576,"300 EUR (cohortă veche)  →  400 EUR  →  500 EUR  →  700 EUR",12,WHT,false,rw-40);
  TXT(f,rx+20,596,"Grandfathering la 300 EUR = urgență reală, nu artificială.",11,MUT,false,rw-40);

  RCT(f,80,848,W-160,1,BDR); TXT(f,80,860,"BUILT — Offer Architecture · 6/8 · 2026",11,DIM,false);
}

// ─────────────────────────────────────────────────────────────────
// FRAME 07 — OBJECTION MATRIX
// ─────────────────────────────────────────────────────────────────
{
  const f = FR("07 — Objection Matrix", (W+G)*2, H+G, W, H, BG);
  TXT(f,80,52,"MATRICEA OBIECȚIILOR",10,RED,true);
  TXT(f,80,70,"Un cadru. Orice obiecție.",34,WHT,true);
  TXT(f,80,118,"Formula: Validare → Adâncire → Reîncadrare → Returnare control.",13,MUT,false,900);
  RCT(f,80,148,W-160,1,BDR);

  // Formula bar
  RCT(f,80,160,W-160,48,CARD,10);
  const fsteps=[
    {s:"1. VALIDARE",d:'"Înțeleg complet..."',c:BLU},
    {s:"2. ADÂNCIRE",d:'"Ce te îngrijorează legat de...?"',c:AMB},
    {s:"3. REÎNCADRARE",d:'"Lasă-mă să-ți arăt altfel..."',c:PUR},
    {s:"4. RETURNARE",d:'"Pe o scală 1-10, cât de important?"',c:GRN},
  ];
  const fsw=Math.floor((W-160)/fsteps.length);
  fsteps.forEach((fs,i)=>{
    const fsx=80+i*fsw;
    TXT(f,fsx+12,168,fs.s,9,fs.c,true);
    TXT(f,fsx+12,182,fs.d,10,GRY,false,fsw-24);
    if(i<fsteps.length-1) RCT(f,fsx+fsw-1,160,1,48,BDR);
  });

  // 8 objections — 2 col x 4 row
  const objs=[
    {cat:"A — PREȚ",c:RED,
     o:'"Nu am 500 EUR acum."',
     r:'V: "Înțeleg, e o investiție serioasă." A: "E vorba de acces sau de prioritate?" Î: "Clienții mei cheltuiesc 300+ EUR/lună pe sală fără rezultate = 3.600/an." → "Ce s-ar schimba dacă în 90 de zile ai corpul dorit?"'},
    {cat:"B — TIMP",c:AMB,
     o:'"Nu am timp pentru asta."',
     r:'V: "E cel mai comun blocaj — și cel mai real." A: "Câte minute pe zi crezi că ar schimba ceva?" Î: "45 min, 4 zile/săptămână. Dacă ai timp pentru Netflix, ai timp pentru asta." → "Ce s-ar schimba cu 45 min garantate/zi?"'},
    {cat:"C — SINE",c:PUR,
     o:'"Am mai încercat și am eșuat."',
     r:'V: "Apreciez că îmi spui asta sincer." A: "Ce crezi că a mers prost — voința ta sau metoda?" Î: "Fiecare eșec anterior = sistem generic pe corp specific. BUILT e construit pe eșecurile anterioare." → "Dacă eliminăm cauza exactă a eșecului — ce se schimbă?"'},
    {cat:"C — ÎNCREDERE",c:BLU,
     o:'"Nu te cunosc suficient."',
     r:'V: "E o poziție complet rațională." A: "Ce anume te-ar face să te simți în siguranță?" Î: "Uite ce au spus [Alex / Anastasia] în primele 30 de zile." (testimonial) → "Ce informație ți-ar trebui ca să poți lua o decizie?"'},
    {cat:"D — CAPACITATE",c:GRN,
     o:'"E prea intens pentru mine."',
     r:'V: "E o îngrijorare legitimă." A: "Când spui intens — ce anume îți imaginezi?" Î: "Pilonul L — Lifestyle Integration — există exact pentru asta. Programul se adaptează la viața ta, nu invers." → "Dacă intensitatea ar fi calibrată exact pe tine?"'},
    {cat:"A — PREȚ 2",c:RED,
     o:'"Mă gândesc și revin."',
     r:'V: "E OK să ai nevoie de timp." A: "La ce anume te gândești — investiție, timing, altceva?" Regula: nu umpli tăcerea. Lași întrebarea să lucreze. Dacă menționează partenerul: "Vrei să-l includem acum?"'},
    {cat:"E — CONTEXT",c:MUT,
     o:'"Am o perioadă grea acum."',
     r:'V: "Înțeleg și nu ignor asta." A: "Când crezi că va fi momentul potrivit?" Î: "Clientul perfect nu vine cu viața perfectă. BUILT e proiectat pentru viața reală cu probleme reale." → "Dacă nu acum — când? Ce se schimbă atunci?"'},
    {cat:"D — CAPACITATE 2",c:GRN,
     o:'"Vreau să mai slăbesc singur întâi."',
     r:'V: "Apreciez că ești conștient de unde ești." A: "Ce te face să crezi că singur va fi diferit de data asta?" Î: "Toți clienții mei au venit gândindu-se că nu sunt gata. Exact pentru asta există protocolul de start." → "Ce te oprește să începi de unde ești?"'},
  ];

  const ow=Math.floor((W-160-32)/2), oh=156;
  objs.forEach((obj,i)=>{
    const col=i%2, row=Math.floor(i/2);
    const ox=80+col*(ow+32), oy=220+row*(oh+10);
    RCT(f,ox,oy,ow,oh,CARD,10);
    RCT(f,ox,oy,ow,3,obj.c,10);
    TXT(f,ox+12,oy+12,obj.cat,8,obj.c,true);
    TXT(f,ox+12,oy+26,obj.o,12,WHT,false,ow-24);
    RCT(f,ox+12,oy+50,ow-24,1,BDR);
    TXT(f,ox+12,oy+58,obj.r,9,GRY,false,ow-24);
  });

  RCT(f,80,858,W-160,1,BDR); TXT(f,80,870,"BUILT — Objection Matrix · 7/8 · 2026",11,DIM,false);
}

// ─────────────────────────────────────────────────────────────────
// FRAME 08 — KPIs & DASHBOARD
// ─────────────────────────────────────────────────────────────────
{
  const f = FR("08 — KPIs Dashboard", (W+G)*3, H+G, W, H, BG);
  TXT(f,80,52,"KPIs & DASHBOARD SĂPTĂMÂNAL",10,BLU,true);
  TXT(f,80,70,"Ce măsori. Ce optimizezi.",34,WHT,true);
  TXT(f,80,118,"Dacă nu măsori, nu poți îmbunătăți. Aceștia sunt singurii indicatori care contează.",13,MUT,false,900);
  RCT(f,80,148,W-160,1,BDR);

  // Funnel conversion rates
  TXT(f,80,164,"RATE DE CONVERSIE PE FUNNEL",9,RED,true);
  const fmet=[
    {s:"Reach → DM",        curr:"0.05%",tgt:"0.15%",c:PUR},
    {s:"DM → Calificat",    curr:"33%",  tgt:"60%",  c:BLU},
    {s:"Calificat → Apel",  curr:"50%",  tgt:"80%",  c:AMB},
    {s:"Apel → Show-up",    curr:"16%",  tgt:"80%",  c:RED},
    {s:"Show-up → Client",  curr:"40%",  tgt:"50%",  c:GRN},
  ];
  const fw=Math.floor((W-160-4*16)/fmet.length);
  fmet.forEach((fm,i)=>{
    const fx=80+i*(fw+16), fy=180;
    RCT(f,fx,fy,fw,112,CARD,10);
    RCT(f,fx,fy,fw,3,fm.c,10);
    TXT(f,fx+12,fy+14,fm.s,10,MUT,false,fw-24);
    TXT(f,fx+12,fy+32,fm.curr,26,WHT,true);
    TXT(f,fx+12,fy+70,"Target: "+fm.tgt,11,fm.c,true);
    TXT(f,fx+12,fy+90,"Acum → Obiectiv",9,MUT,false);
  });

  // Weekly checklist + revenue targets — 2 col
  const cw=440, rx=80+cw+48, rw=W-160-cw-48;

  TXT(f,80,316,"CHECKLIST LUNI DIMINEAȚA",9,BLU,true);
  RCT(f,80,332,cw,1,BDR);
  const checks=["Câte DM-uri inbound am primit?","Câte conversații am calificat?","Câte apeluri am confirmat?","Câte show-up-uri au fost?","Câți clienți noi am semnat?","Revenue săptămâna asta: ___ EUR","Obiecția apărută cel mai des: ___","Content cu cele mai multe DM-uri: ___","Ce optimizez săptămâna viitoare: ___"];
  checks.forEach((ch,i)=>{
    RCT(f,80,346+i*30,14,14,CARD,2);
    RCT(f,80,346+i*30,14,14,BDR,2);
    TXT(f,104,348+i*30,ch,12,GRY,false,cw-30);
  });

  TXT(f,rx,316,"TARGET VENITURI LUNARE",9,GRN,true);
  RCT(f,rx,332,rw,1,BDR);
  const targets=[
    {l:"Minim viabil",  v:"500 EUR",   d:"1 client/lună",             c:MUT},
    {l:"Acum (5 clienți)",v:"2.500 EUR",d:"5 clienți activi × 500 EUR",c:AMB},
    {l:"Target 6 luni", v:"5.000 EUR", d:"10 clienți × 500 EUR/lună", c:GRN},
    {l:"Target 12 luni",v:"10.000 EUR",d:"Scale + cohortă grup",       c:BLU},
  ];
  targets.forEach((tg,i)=>{
    const ty=346+i*64;
    RCT(f,rx,ty,rw,56,CARD,10);
    RCT(f,rx,ty,3,56,tg.c,3);
    TXT(f,rx+16,ty+8,tg.l,9,tg.c,true);
    TXT(f,rx+16,ty+24,tg.v,20,WHT,true);
    TXT(f,rx+16,ty+48,tg.d,10,MUT,false,rw-32);
  });

  // Daily non-negotiables
  TXT(f,80,616,"NON-NEGOCIABILELE ZILNICE",9,RED,true);
  RCT(f,80,632,W-160,1,BDR);
  const daily=[
    {t:"DIMINEAȚA",tasks:["1 reel postat sau filmat","Check DM-uri active","Răspuns la lead-uri în max 4h"]},
    {t:"PRÂNZ",   tasks:["Procesare DM-uri noi","Calificare lead-uri inbound","Follow-up 24h dacă e cazul"]},
    {t:"SEARA",   tasks:["Review KPIs zilnice","Pregătit content mâine","Check-in clienți activi"]},
  ];
  const dw2=Math.floor((W-160-2*32)/daily.length);
  daily.forEach((d,i)=>{
    const dx=80+i*(dw2+32), dy=648;
    RCT(f,dx,dy,dw2,112,CARD,10);
    RCT(f,dx,dy,dw2,3,RED,10);
    TXT(f,dx+12,dy+14,d.t,9,RED,true);
    RCT(f,dx+12,dy+30,dw2-24,1,BDR);
    d.tasks.forEach((tk,j)=> TXT(f,dx+12,dy+42+j*26,"→  "+tk,11,GRY,false,dw2-24));
  });

  RCT(f,80,788,W-160,1,BDR);
  TXT(f,80,800,"BUILT — KPIs & Dashboard · 8/8 · 2026",11,DIM,false);
}

// ── Done ─────────────────────────────────────────────────────────
figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
figma.closePlugin("✅ BUILT Sales Strategy — 8 frame-uri generate!");

})().catch(err => figma.closePlugin("❌ " + err.message));
