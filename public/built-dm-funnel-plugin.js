// ═══════════════════════════════════════════════════════════════
// BUILT — Funnel DM-to-Client · Figma Plugin
// Run once → 1 frame: 5 faze + gating + obiecții CAR
// Pe baza BUILT_DM_Sales_Playbook (rafinat)
// ═══════════════════════════════════════════════════════════════

(async function () {

await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Bold" });

function rgb(h) { return { r: parseInt(h.slice(1,3),16)/255, g: parseInt(h.slice(3,5),16)/255, b: parseInt(h.slice(5,7),16)/255 }; }
function solid(c, a) { return [{ type:"SOLID", color:c, opacity: a ?? 1 }]; }
function RCT(p, x, y, w, h, c, r, a) {
  const s = figma.createRectangle();
  s.x=x; s.y=y; s.resize(Math.max(w,1),Math.max(h,1));
  s.fills=solid(c, a??1); if(r) s.cornerRadius=r;
  if(p) p.appendChild(s); return s;
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

const BG=rgb("#080808"), CARD=rgb("#0F0F0F"), BDR=rgb("#1E1E1E");
const WHT=rgb("#FFFFFF"), GRY=rgb("#A1A1AA"), DIM=rgb("#27272A");
const RED=rgb("#C0392B"), GRN=rgb("#059669"), BLU=rgb("#0891B2"), PUR=rgb("#7C3AED"), AMB=rgb("#D97706");

const f = figma.createFrame();
f.name="BUILT — Funnel DM-to-Client";
f.x=0; f.y=0; f.resize(2560, 1100); f.fills=solid(BG); f.clipsContent=false;
figma.currentPage.appendChild(f);

// ── Titlu ──
TXT(f, 80, 56, "BUILT — FUNNEL DM-TO-CLIENT", 34, WHT, true);
TXT(f, 80, 102, "De la comentariu la client. Diagnostic, nu vânzare. Califici, nu convingi.", 15, GRY, false);

// ── GATING callout ──
RCT(f, 80, 148, 2400, 70, RED, 12, 0.12);
RCT(f, 80, 148, 5, 70, RED, 2);
TXT(f, 108, 164, "⬢  REGULA DE AUR — GATING", 12, RED, true);
TXT(f, 108, 186, "Nu propui apelul până arcul de descoperire nu e complet: Situație + Dorință verbalizată de EL + Decalaj recunoscut ('nu știu cum') + calificat VERDE. După 2 întrebări NU ești gata de apel — a grăbi puntea = 'nu ține'.", 13.5, WHT, false, 2350);

// ── Cele 5 faze (flux orizontal) ──
const phases = [
  { n:"01", t:"ADU-I ÎN DM", c:RED, lines:["Keyword trigger:","  'comentează PLATOU'","Story: poll / question box","Invitație directă în carusel","ManyChat la volum mare"] },
  { n:"02", t:"DESCHIDEREA", c:PUR, lines:["Fără pitch. Fă-l om, nu lead.","Nume + referință specifică","TERMINĂ cu o întrebare","Scurt (3-4 rânduri)","ZERO link plată / ziduri text"] },
  { n:"03", t:"DESCOPERIREA  (inima)", c:AMB, lines:["A) Situația — 2-3 întrebări","  alarmă: 'am încercat tot' → sistem","  'mănânc puțin/epuizat' → reconstrucție","B) Dorința: '6 luni înainte,","  cum arată corpul tău?'","C) Decalaj: reflectă +","  'ce te oprește?' → 'nu știu cum'"] },
  { n:"04", t:"PUNTEA", c:BLU, lines:["DOAR după arc complet + verde","Niciodată preț pe chat","'Ai 15-20 min săpt. asta?'","DA → 2 opțiuni de zi","'mă gândesc' → ce analizezi?","'nu-s pregătit' → cum arată?"] },
  { n:"05", t:"CONFIRMARE / ANTI-NO-SHOW", c:GRN, lines:["Aici pierzi 50% (33% → 16%)","Confirmare imediată +","  ce pregătește el","Reminder cu 1 zi înainte","Reminder dimineața apelului","Țintă: să vină PREGĂTIT"] },
];

const PY=240, PW=448, GAP=40, PH=380;
let px=80;
phases.forEach((p, i) => {
  RCT(f, px, PY, PW, PH, CARD, 14);
  RCT(f, px, PY, PW, 4, p.c, 14);
  TXT(f, px+22, PY+20, p.n, 13, p.c, true);
  TXT(f, px+22, PY+44, p.t, 16, WHT, true, PW-44);
  RCT(f, px+22, PY+76, PW-44, 1, BDR);
  p.lines.forEach((l, j) => TXT(f, px+22, PY+92+j*27, l, 12.5, GRY, false, PW-44));
  if (i < phases.length-1) {
    TXT(f, px+PW+8, PY+PH/2-16, "→", 26, p.c, true);
  }
  px += PW + GAP;
});

// ── OBIECȚII (CAR) ──
const oy = PY + PH + 56;
RCT(f, 80, oy, 1180, 280, CARD, 14);
RCT(f, 80, oy, 1180, 4, RED, 14);
TXT(f, 108, oy+20, "OBIECȚII — FRAMEWORK CAR", 15, RED, true);
const car = [
  ["C — Calibrează", "etichetezi emoția înainte să răspunzi ('Sună ca și cum...'). NU argumenta."],
  ["A — Articulează", "reîncadrezi: prețul = COST AL INACȚIUNII, timpul = LIPSĂ DE SISTEM, eșecul = METODĂ."],
  ["R — Returnezi", "închizi cu o ÎNTREBARE care pune decizia înapoi la el, nu cu o afirmație."],
];
car.forEach((row, i) => {
  TXT(f, 108, oy+56+i*52, row[0], 13.5, WHT, true);
  TXT(f, 108, oy+74+i*52, row[1], 12.5, GRY, false, 1130);
});
TXT(f, 108, oy+222, "Preț: 500 EUR ferm, fără reduceri.  Calificare: VERDE (vrea ACUM + minte deschisă) → apel · ROȘU (trucuri/garanții/defensiv) → stop.", 12.5, AMB, false, 1130);

// ── FOLLOW-UP & VOCE ──
RCT(f, 1300, oy, 1180, 280, CARD, 14);
RCT(f, 1300, oy, 1180, 4, AMB, 14);
TXT(f, 1328, oy+20, "FOLLOW-UP & VOCE", 15, AMB, true);
const fu = [
  "O SINGURĂ re-invitație (ziua 21), FĂRĂ urgență falsă:",
  "  'Salut [Nume], mă gândeam la tine — mai e [obiectivul] activ acum?'",
  "  NU inventa 'locuri eliberate' dacă nu e adevărat.",
  "",
  "Voce: română, direct, matur, structural.",
  "Empatic cu situația, tăios cu scuzele.",
  "Fără clișee de fitness. Max 3-4 propoziții per mesaj.",
];
fu.forEach((l, i) => TXT(f, 1328, oy+56+i*27, l, 12.5, GRY, false, 1130));

// ── Footer ──
RCT(f, 80, oy+316, 2400, 1, BDR);
TXT(f, 80, oy+328, "BUILT — Funnel DM-to-Client · pe baza BUILT_DM_Sales_Playbook · 2026", 11, DIM, false);

figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
figma.closePlugin("✅ BUILT — Funnel DM-to-Client generat!");

})().catch(err => figma.closePlugin("❌ " + err.message));
