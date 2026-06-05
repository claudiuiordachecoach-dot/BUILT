// ═══════════════════════════════════════════════════════════════
// BUILT — Sales Funnel Flowchart · Figma Plugin
// Același stil ca Pattern Interrupt: flowchart ORIZONTAL
// Run once → 4 frame-uri pe canvas
// ═══════════════════════════════════════════════════════════════

(async function () {

await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Bold" });

function rgb(h) {
  return { r: parseInt(h.slice(1,3),16)/255, g: parseInt(h.slice(3,5),16)/255, b: parseInt(h.slice(5,7),16)/255 };
}
function solid(c, a) { return [{ type:"SOLID", color:c, opacity: a ?? 1 }]; }

function FR(name, x, y, w, h, bg) {
  const f = figma.createFrame();
  f.name=name; f.x=x; f.y=y;
  f.resize(Math.max(w,1), Math.max(h,1));
  f.fills=solid(bg); f.clipsContent=false;
  figma.currentPage.appendChild(f); return f;
}
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
const WHT=rgb("#FFFFFF"), GRY=rgb("#A1A1AA"), MUT=rgb("#52525B"), DIM=rgb("#27272A");
const RED=rgb("#C0392B"), GRN=rgb("#059669"), BLU=rgb("#0891B2");
const PUR=rgb("#7C3AED"), AMB=rgb("#D97706"), ORG=rgb("#EA580C");

// ── Shared drawing helpers ────────────────────────────────────────
function actionNode(f, px, py, w, h, lines, color) {
  RCT(f, px, py, w, h, CARD, 12);
  RCT(f, px, py, w, 3, color, 12);
  RCT(f, px, py+h-3, w, 3, color, 12);
  RCT(f, px, py, 3, h, color, 3);
  RCT(f, px+w-3, py, 3, h, color, 3);
  const lh=16, total=lines.length*lh;
  const sy = py + (h-total)/2;
  lines.forEach((l,i) => TXT(f, px+8, sy+i*lh, l, 11, WHT, true, w-16));
}

function decisionNode(f, px, py, w, h, lines, color) {
  RCT(f, px, py, w, h, color, 12, 0.1);
  RCT(f, px, py, w, 3, color, 12);
  RCT(f, px, py+h-3, w, 3, color, 12);
  RCT(f, px, py, 3, h, color, 3);
  RCT(f, px+w-3, py, 3, h, color, 3);
  const lh=16, total=lines.length*lh;
  const sy = py + (h-total)/2;
  lines.forEach((l,i) => TXT(f, px+8, sy+i*lh, l, 11, color, true, w-16));
}

function sticky(f, px, py, w, lines, color) {
  const h = 14 + lines.length * 18 + 10;
  RCT(f, px, py, w, h, color, 8, 0.08);
  RCT(f, px, py, 3, h, color, 4);
  lines.forEach((l,i) => TXT(f, px+10, py+10+i*18, l, 10, color, false, w-20));
  return h;
}

function arrow(f, px, py, w, color) {
  RCT(f, px, py, w-10, 2, color, 0);
  TXT(f, px+w-14, py-6, "›", 14, color, true);
}

// ═══════════════════════════════════════════════════════════════
// FRAME 01 — FUNNEL ORIZONTAL COMPLET
// ═══════════════════════════════════════════════════════════════
{
  const f = FR("01 — Sales Funnel Flowchart", 0, 0, 3400, 1000, BG);

  TXT(f, 80, 40, "BUILT — FUNNEL DE VÂNZARE COMPLET", 10, RED, true);
  TXT(f, 80, 58, "De la Vizualizare la Client Plătitor · Fiecare pas cu script și regulă", 13, MUT, false, 1200);

  const NY=370, NH=88, AW=50;
  let cx=80;

  // ─────────────────────────────────────────────────────────────
  // 1. CONTENT / REEL
  const n1w=200;
  actionNode(f, cx, NY, n1w, NH, ["CONTENT", "Reel cu PI"], RED);
  TXT(f, cx, NY-28, "01", 9, RED, true);
  sticky(f, cx-10, NY+NH+12, n1w+20, [
    "Hook 0-3s: cifră + durere",
    "PI la fiecare 3-5s",
    "CTA keyword la final",
    "Ex: 'Scrie SISTEM în DM'",
  ], RED);
  cx += n1w;

  arrow(f, cx, NY+NH/2-1, AW, GRY);
  cx += AW;

  // ─────────────────────────────────────────────────────────────
  // 2. DM INBOUND
  const n2w=200;
  actionNode(f, cx, NY, n2w, NH, ["DM INBOUND", "Keyword trigger"], PUR);
  TXT(f, cx, NY-28, "02", 9, PUR, true);
  sticky(f, cx-10, NY+NH+12, n2w+20, [
    "M1: 'Ce te-a făcut să",
    "comentezi chiar azi?'",
    "Verbalizezi durerea reală.",
  ], PUR);
  cx += n2w;

  arrow(f, cx, NY+NH/2-1, AW, GRY);
  cx += AW;

  // ─────────────────────────────────────────────────────────────
  // 3. CALIFICAT?
  const n3w=220;
  decisionNode(f, cx, NY, n3w, NH, ["CALIFICAT?", "3 Întrebări Magice"], BLU);
  TXT(f, cx, NY-28, "03", 9, BLU, true);
  // YES branch annotation
  TXT(f, cx+n3w+10, NY+NH/2-18, "DA →", 9, GRN, true);
  TXT(f, cx+n3w+10, NY+NH/2-4, "Spre apel", 9, GRN, false);
  // NO branch
  sticky(f, cx-10, NY+NH+12, n3w+20, [
    "NU → Stop.",
    "Red flags: 30kg în 2 luni,",
    "răspunsuri monosilabice,",
    "lipsă totală angajament.",
  ], RED);
  cx += n3w;

  arrow(f, cx, NY+NH/2-1, AW, GRN);
  TXT(f, cx+4, NY+NH/2-18, "DA", 8, GRN, true);
  cx += AW;

  // ─────────────────────────────────────────────────────────────
  // 4. TRANZIȚIE APEL
  const n4w=220;
  actionNode(f, cx, NY, n4w, NH, ["TRANZIȚIE", "Setezi apelul"], BLU);
  TXT(f, cx, NY-28, "04", 9, BLU, true);
  sticky(f, cx-10, NY+NH+12, n4w+20, [
    "'15 min diagnostic —",
    "nu o prezentare de vânzare.'",
    "Follow-up o singură dată",
    "la 24-48h dacă nu răspunde.",
  ], BLU);
  cx += n4w;

  arrow(f, cx, NY+NH/2-1, AW, GRY);
  cx += AW;

  // ─────────────────────────────────────────────────────────────
  // 5. APEL DIAGNOSTIC
  const n5w=240;
  actionNode(f, cx, NY, n5w, NH, ["APEL DIAGNOSTIC", "20-30 min · 5 faze"], AMB);
  TXT(f, cx, NY-28, "05", 9, AMB, true);
  sticky(f, cx-10, NY+NH+12, n5w+20, [
    "F1: Setezi cadrul",
    "F2: Diagnostic adânc",
    "F3: Challenger Reframe",
    "F4: Prezinți soluția",
    "F5: 500 EUR ferm",
  ], AMB);
  cx += n5w;

  arrow(f, cx, NY+NH/2-1, AW, GRY);
  cx += AW;

  // ─────────────────────────────────────────────────────────────
  // 6. DECIZIE?
  const n6w=220;
  decisionNode(f, cx, NY, n6w, NH, ["DECIZIE?", "Client sau follow-up"], BLU);
  TXT(f, cx, NY-28, "06", 9, BLU, true);
  TXT(f, cx+n6w+10, NY+NH/2-18, "DA →", 9, GRN, true);
  TXT(f, cx+n6w+10, NY+NH/2-4, "500 EUR", 9, GRN, false);
  sticky(f, cx-10, NY+NH+12, n6w+20, [
    "NU → Follow-up o dată",
    "la 24-48h. Dacă tace: close.",
    "Tăcerea după preț e normală.",
    "Nu umpli. Nu te scuzi.",
  ], AMB);
  cx += n6w;

  arrow(f, cx, NY+NH/2-1, AW, GRN);
  TXT(f, cx+4, NY+NH/2-18, "DA", 8, GRN, true);
  cx += AW;

  // ─────────────────────────────────────────────────────────────
  // 7. PLATĂ 500 EUR
  const n7w=200;
  actionNode(f, cx, NY, n7w, NH, ["PLATĂ", "500 EUR"], GRN);
  TXT(f, cx, NY-28, "07", 9, GRN, true);
  sticky(f, cx-10, NY+NH+12, n7w+20, [
    "Ferm, o dată, fără scuze.",
    "Niciodată reducere ca",
    "tactică de convingere.",
    "Raport valoare: 6.4×",
  ], GRN);
  cx += n7w;

  arrow(f, cx, NY+NH/2-1, AW, GRY);
  cx += AW;

  // ─────────────────────────────────────────────────────────────
  // 8. ONBOARDING 7 ZILE
  const n8w=230;
  actionNode(f, cx, NY, n8w, NH, ["ONBOARDING", "7 Zile Apple-style"], ORG);
  TXT(f, cx, NY-28, "08", 9, ORG, true);
  sticky(f, cx-10, NY+NH+12, n8w+20, [
    "Z1: Acces + prim pas simbolic",
    "Z2: Prima victorie în 48h",
    "Z3: Integrare în cohortă",
    "Z7: Check-in + recalibrare",
  ], ORG);
  cx += n8w;

  arrow(f, cx, NY+NH/2-1, AW, GRY);
  cx += AW;

  // ─────────────────────────────────────────────────────────────
  // 9. 90 ZILE BUILT
  const n9w=210;
  actionNode(f, cx, NY, n9w, NH, ["90 ZILE", "Arhitectura Corpului"], RED);
  TXT(f, cx, NY-28, "09", 9, RED, true);
  sticky(f, cx-10, NY+NH+12, n9w+20, [
    "B: Base Strength",
    "U: Unbreakable Capacity",
    "I: Intelligent Fueling",
    "L: Lifestyle Integration",
    "T: Tough Mindset",
  ], RED);
  cx += n9w;

  arrow(f, cx, NY+NH/2-1, AW, GRY);
  cx += AW;

  // ─────────────────────────────────────────────────────────────
  // 10. AMBASADOR
  const n10w=200;
  actionNode(f, cx, NY, n10w, NH, ["AMBASADOR", "Flywheel"], PUR);
  TXT(f, cx, NY-28, "10", 9, PUR, true);
  sticky(f, cx-10, NY+NH+12, n10w+20, [
    "Testimonial video/text",
    "Referral activ",
    "Re-înscriere cohortă",
    "→ Reia din Step 01",
  ], PUR);
  cx += n10w;

  // ── FLYWHEEL LOOP ─────────────────────────────────────────────
  const loopY = NY + NH + 200;
  RCT(f, 80, loopY, cx - 80, 2, DIM, 0);
  RCT(f, 80, loopY, 2, -50, DIM, 0);
  RCT(f, cx - 2, loopY, 2, -50, DIM, 0);
  TXT(f, 80 + (cx-80)/2 - 200, loopY + 8, "↑ FLYWHEEL: Client → Rezultat vizibil → Povestit → Referral → Client nou → Comunitate mai mare → Reia", 10, DIM, false, 700);

  // ── CONVERSION RATES (ruler deasupra) ─────────────────────────
  const rulerY = NY - 90;
  RCT(f, 80, rulerY + 20, cx - 80, 1, DIM, 0);

  const stages2 = [
    {x: 80,                  rate: "900k reach",  label: "Reach"},
    {x: 80+200+50,           rate: "~0.1%",        label: "→ DM"},
    {x: 80+200+50+200+50,    rate: "60%+",         label: "Calificat"},
    {x: 80+200+50+200+50+220+50+220+50, rate: "80%+", label: "Show-up"},
    {x: 80+200+50+200+50+220+50+220+50+240+50+220+50, rate: "40%+", label: "Client"},
  ];
  stages2.forEach(s => {
    RCT(f, s.x, rulerY + 14, 2, 12, MUT, 0);
    TXT(f, s.x - 20, rulerY, s.rate, 9, GRN, true, 80);
    TXT(f, s.x - 20, rulerY - 14, s.label, 8, MUT, false, 80);
  });
  TXT(f, 80, rulerY - 30, "RATE DE CONVERSIE TARGET PE FUNNEL", 9, MUT, true);

  // ── KEY RULE ──────────────────────────────────────────────────
  RCT(f, 80, 880, cx - 80, 60, CARD, 12);
  RCT(f, 80, 880, cx - 80, 3, RED, 12);
  TXT(f, 104, 894, "REGULA FUNDAMENTALĂ:", 10, RED, true);
  TXT(f, 280, 894, "Nu vindem. Diagnosticăm. Nu convingem. Calificăm. Nu cerșim clienți. Selectăm. Prețul: 500 EUR — ferm, o dată, fără scuze.", 12, WHT, false, cx - 380);
  TXT(f, 80, 922, "BUILT — Sales Funnel Flowchart · 1/4 · 2026", 11, DIM, false);
}

// ═══════════════════════════════════════════════════════════════
// FRAME 02 — DM QUALIFICATION: CELE 4 MESAJE
// ═══════════════════════════════════════════════════════════════
{
  const f = FR("02 — DM Qualification", 0, 1080, 1440, 900, BG);

  TXT(f, 80, 52, "DM QUALIFICATION — CELE 4 MESAJE MAGICE", 10, PUR, true);
  TXT(f, 80, 70, "Nu vindem în DM. Diagnosticăm.", 32, WHT, true);
  TXT(f, 80, 114, "Fiecare mesaj diagnostichează un nivel mai adânc. Primul mesaj nu vinde nimic.", 13, MUT, false, 900);
  RCT(f, 80, 140, 1280, 1, BDR);

  // 4 messages — horizontal like flowchart
  const msgs = [
    {
      n:"M1", c:PUR, goal:"VERBALIZEZI DUREREA",
      script:'"Ce te-a făcut să comentezi chiar azi?"',
      why:"Forțezi verbalizarea durerii reale. 'Azi' specifică momentul — nu intenția generală.",
      listen:"Răspuns specific + emoțional = verde. Generic = sondezi mai adânc.",
      time:"0-24h"
    },
    {
      n:"M2", c:BLU, goal:"PROFILEZI",
      script:'"Unde ești acum, concret?\nNu ca să te judec — ca să\nînțeleg de unde plecăm."',
      why:"Identifici: Saltu direct / Ciclist cronic / Atlet blocat. Fiecare = abordare diferită.",
      listen:"Cât timp au eșuat, câte tentative, ce au încercat anterior.",
      time:"24-48h"
    },
    {
      n:"M3", c:AMB, goal:"DEZARMEZI APĂRAREA",
      script:'"Ce te-a oprit până acum?\nNu mă refer la timp sau bani —\nla asta ajungem noi."',
      why:"Excluderea 'timp și bani' forțează bariera reală: frică de eșec, lipsă sistem, blocare.",
      listen:"Bariera reală = proxy pentru angajament. Dacă nu o poate articula = nu e gata.",
      time:"48-72h"
    },
    {
      n:"M4", c:GRN, goal:"TENSIUNEA EMOȚIONALĂ",
      script:'"Dacă în 90 de zile ai fi exact\nomul pe care ți-l dorești —\ncum arată ziua ta? Concret."',
      why:"Creezi tensiunea emoțională pozitivă. Se imaginează în viitorul dorit.",
      listen:"Detalii specifice (orar, energie, haine) = candidat serios. Vag = fără urgență.",
      time:"72h+"
    },
  ];

  const mw = Math.floor(1280/msgs.length);
  msgs.forEach((m, i) => {
    const mx = 80 + i * mw, my = 160;
    const mh = 480;
    RCT(f, mx, my, mw-8, mh, CARD, 12);
    RCT(f, mx, my, mw-8, 4, m.c, 12);

    TXT(f, mx+12, my+16, m.n, 9, m.c, true);
    TXT(f, mx+44, my+14, m.goal, 11, m.c, true, mw-60);
    TXT(f, mx+12, my+34, "⏱ " + m.time, 9, MUT, false);
    RCT(f, mx+12, my+52, mw-28, 1, BDR);

    // Script box
    RCT(f, mx+12, my+62, mw-28, 80, m.c, 8, 0.08);
    RCT(f, mx+12, my+62, 3, 80, m.c, 3);
    TXT(f, mx+22, my+70, m.script, 11, WHT, false, mw-44);

    RCT(f, mx+12, my+152, mw-28, 1, BDR);
    TXT(f, mx+12, my+160, "DE CE:", 8, m.c, true);
    TXT(f, mx+12, my+174, m.why, 10, GRY, false, mw-28);

    RCT(f, mx+12, my+280, mw-28, 1, BDR);
    TXT(f, mx+12, my+288, "ASCULTĂ:", 8, m.c, true);
    TXT(f, mx+12, my+302, m.listen, 10, GRY, false, mw-28);

    // Arrow between (except last)
    if(i < msgs.length-1) {
      TXT(f, mx + mw - 16, my + mh/2, "›", 20, DIM, true);
    }
  });

  // Follow-up + Red flags
  const botY = 668;
  RCT(f, 80, botY, 580, 96, CARD, 12);
  RCT(f, 80, botY, 4, 96, AMB, 4);
  TXT(f, 104, botY+12, "FOLLOW-UP PROTOCOL", 9, AMB, true);
  TXT(f, 104, botY+28, "O singură dată, la 24–48h.", 13, WHT, false, 520);
  TXT(f, 104, botY+48, "Dacă nu răspunde — nu mai contactezi.", 11, GRY, false, 520);
  TXT(f, 104, botY+66, "Fiecare mesaj în plus îți reduce autoritatea cu 50%.", 11, MUT, false, 520);

  RCT(f, 700, botY, 660, 96, CARD, 12);
  RCT(f, 700, botY, 4, 96, RED, 4);
  TXT(f, 724, botY+12, "RED FLAGS — OPREȘTI CONVERSAȚIA", 9, RED, true);
  ["Vrea 30kg în 2 luni",
   "Nu are deloc timp — niciodată",
   "Răspunsuri sub 5 cuvinte repetate",
   "Caută cel mai ieftin antrenor",
  ].forEach((fl, i) => TXT(f, 724, botY+30+i*16, "✕  "+fl, 11, {r:0.7,g:0.3,b:0.3}, false));

  // Tranziție spre apel
  RCT(f, 80, 782, 1280, 56, CARD, 12);
  RCT(f, 80, 782, 1280, 3, BLU, 12);
  TXT(f, 104, 796, "TRANZIȚIE SPRE APEL:", 9, BLU, true);
  TXT(f, 270, 796, '"Îți ofer 15 minute de diagnostic gratuit — nu o prezentare de vânzare. Vrei să înțeleg situația ta și să-ți spun sincer dacă și cum te pot ajuta."', 12, WHT, false, 1080);
  TXT(f, 104, 816, "Ton: diagnostic, nu pitch. Oferi valoare, nu timp. Nu cerșești apelul.", 11, MUT, false, 900);

  RCT(f, 80, 852, 1280, 1, BDR);
  TXT(f, 80, 860, "BUILT — DM Qualification · 2/4 · 2026", 11, DIM, false);
}

// ═══════════════════════════════════════════════════════════════
// FRAME 03 — APELUL DIAGNOSTIC + OFERTA
// ═══════════════════════════════════════════════════════════════
{
  const f = FR("03 — Sales Call + Offer", 1520, 1080, 1440, 900, BG);

  TXT(f, 80, 52, "APELUL DIAGNOSTIC — 5 FAZE + OFERTA", 10, AMB, true);
  TXT(f, 80, 70, "Challenger Sale. Conduci, nu cerșești.", 32, WHT, true);
  TXT(f, 80, 114, "Cel mai slab semnal dintr-un apel = disperarea de a vinde.", 13, MUT, false, 900);
  RCT(f, 80, 140, 1280, 1, BDR);

  // 5 phases horizontal
  const phases = [
    { n:"F1", t:"0-2 min",  c:BLU, h:"SETAREA\nCADRULUI",
      s:'"Acesta e un diagnostic,\nnu o prezentare de vânzare.\nOK?"',
      r:"Autoritate din minutul 1.\nDacă nu setezi cadrul,\nclientul intră în modul\n'convinge-mă'." },
    { n:"F2", t:"2-10 min", c:PUR, h:"DIAGNOSTICUL\nADÂNC",
      s:'"Unde ești fizic?" →\n"Cât timp ești acolo?" →\n"Cum afectează asta relația\nta / energia / încrederea?"',
      r:"TU pui întrebări.\nCLIENTUL vorbește.\nTăcerile nu se umplu\nniciodată." },
    { n:"F3", t:"10-15 min",c:AMB, h:"CHALLENGER\nREFRAME",
      s:'"Problema nu e lipsa\nde voință. E că ai aplicat\nsoluții pentru altă problemă\ndecât cea pe care o ai."',
      r:"Contrazici constructiv\ncredința falsă.\nMuți responsabilitatea\nla metodă, nu la om." },
    { n:"F4", t:"15-22 min",c:ORG, h:"PREZINȚI\nSOLUȚIA",
      s:"Legi fiecare element BUILT\nde o durere pe care EL\ntocmai a verbalizat-o.\n'Ai zis că... Exact pentru\nasta avem Pilonul [X].'",
      r:"Nu features.\nSoluții la dureri specifice,\nîn ordinea în care\nLE-A MENȚIONAT EL." },
    { n:"F5", t:"22-30 min",c:RED, h:"PREȚUL +\nOBIECȚII",
      s:'"Investiția pentru 90 de\nzile este 500 EUR.\nCum vrei să procedăm?"\n(PAUZĂ — nu adaugi nimic.)',
      r:"Ferm. O dată. Fără scuze.\nFără justificare.\nCel care vorbește\nprimul pierde." },
  ];

  const pw = Math.floor(1280/phases.length);
  phases.forEach((ph, i) => {
    const px = 80 + i*pw, py = 160, ph_h = 360;
    RCT(f, px, py, pw-6, ph_h, CARD, 12);
    RCT(f, px, py, pw-6, 4, ph.c, 12);

    TXT(f, px+10, py+14, ph.n, 9, ph.c, true);
    TXT(f, px+10, py+28, ph.t, 8, MUT, false);
    TXT(f, px+10, py+44, ph.h, 11, ph.c, true, pw-20);
    RCT(f, px+10, py+76, pw-22, 1, BDR);

    RCT(f, px+10, py+86, pw-22, 120, ph.c, 8, 0.06);
    RCT(f, px+10, py+86, 2, 120, ph.c, 2);
    TXT(f, px+20, py+92, ph.s, 9, WHT, false, pw-42);

    RCT(f, px+10, py+218, pw-22, 1, BDR);
    TXT(f, px+10, py+226, "REGULĂ:", 8, ph.c, true);
    TXT(f, px+10, py+240, ph.r, 9, GRY, false, pw-22);

    if(i < phases.length-1) TXT(f, px+pw-14, py+ph_h/2, "›", 18, DIM, true);
  });

  // Offer architecture
  const offerY = 544;
  TXT(f, 80, offerY, "ARHITECTURA OFERTEI — GRAND SLAM OFFER BUILT", 9, RED, true);
  RCT(f, 80, offerY+16, 1280, 1, BDR);

  // Value stack compact
  const valueW = 580;
  RCT(f, 80, offerY+26, valueW, 240, CARD, 12);
  TXT(f, 104, offerY+38, "STIVA DE VALOARE", 9, GRN, true);
  const items = [
    ["Program 90 zile personalizat",    "3.000 RON"],
    ["Plan nutriție ca sistem",          "2.000 RON"],
    ["Coaching săptămânal + ajustări",   "4.000 RON"],
    ["Platformă BUILT + tracking",       "1.500 RON"],
    ["Comunitate cohortă",               "1.200 RON"],
    ["Protocol urgență (recăderi)",      "1.500 RON"],
    ["Bonusuri (ghid travel, somn)",     "2.000 RON"],
    ["VALOARE TOTALĂ PERCEPUTĂ",         "16.200 RON"],
  ];
  items.forEach(([it, vl], i) => {
    const isLast = i === items.length - 1;
    RCT(f, 96, offerY+56+i*22, valueW-32, 20, isLast?{r:0.02,g:0.1,b:0.04}:i%2===0?CARD:{r:0.07,g:0.07,b:0.07}, 0);
    TXT(f, 104, offerY+58+i*22, it, isLast?10:10, isLast?GRN:GRY, isLast, valueW-100);
    TXT(f, 96+valueW-100, offerY+58+i*22, vl, 10, isLast?GRN:MUT, isLast);
  });

  // Price + guarantee
  const px2 = 80 + valueW + 40;
  const pw2 = 1280 - valueW - 40;

  RCT(f, px2, offerY+26, pw2, 108, {r:0.1,g:0.02,b:0.02}, 12);
  RCT(f, px2, offerY+26, pw2, 4, RED, 12);
  TXT(f, px2+16, offerY+40, "PREȚUL ANCORARE", 9, RED, true);
  TXT(f, px2+16, offerY+58, "500 EUR", 40, WHT, true);
  TXT(f, px2+16, offerY+106, "Ferm. O dată. Fără scuze. Raport 6.4×.", 11, MUT, false, pw2-32);

  RCT(f, px2, offerY+146, pw2, 72, CARD, 12);
  RCT(f, px2, offerY+146, 4, 72, GRN, 4);
  TXT(f, px2+16, offerY+158, "GARANȚIE", 9, GRN, true);
  TXT(f, px2+16, offerY+174, "Dacă după 30 zile, urmând protocolul, nu simți o diferență reală — restituim.", 11, WHT, false, pw2-32);
  TXT(f, px2+16, offerY+194, "Riscul e la noi. Cu condiții clare, nu cu scuze.", 10, MUT, false, pw2-32);

  RCT(f, px2, offerY+230, pw2, 36, CARD, 12);
  RCT(f, px2, offerY+230, 4, 36, AMB, 4);
  TXT(f, px2+16, offerY+238, "ONLY STATEMENT:", 9, AMB, true);
  TXT(f, px2+100, offerY+238, "BUILT = singurul program din România care îmbină forța, capacitatea, nutriția și mindset-ul în 90 zile integrat în viața reală.", 9, GRY, false, pw2-120);

  RCT(f, 80, 840, 1280, 1, BDR);
  TXT(f, 80, 852, "BUILT — Sales Call + Offer · 3/4 · 2026", 11, DIM, false);
}

// ═══════════════════════════════════════════════════════════════
// FRAME 04 — KPIs + OBJECTION MATRIX + BEFORE/AFTER
// ═══════════════════════════════════════════════════════════════
{
  const f = FR("04 — KPIs + Obiecții + Rezultate", 3040, 1080, 1440, 900, BG);

  TXT(f, 80, 52, "KPIs + OBIECȚII CHEIE + REZULTATE REALE", 10, RED, true);
  TXT(f, 80, 70, "Ce măsori. Cum răspunzi. Ce urmărești.", 32, WHT, true);
  RCT(f, 80, 114, 1280, 1, BDR);

  // Funnel conversion rates
  TXT(f, 80, 124, "RATE CONVERSIE TARGET", 9, RED, true);
  const fmet = [
    {s:"Reach → DM",        c:"0.05%", t:"0.15%", col:PUR},
    {s:"DM → Calificat",    c:"33%",   t:"60%",   col:BLU},
    {s:"Calificat → Apel",  c:"50%",   t:"80%",   col:AMB},
    {s:"Apel → Show-up",    c:"16%",   t:"80%",   col:RED},
    {s:"Show-up → Client",  c:"40%",   t:"50%",   col:GRN},
  ];
  const fw = Math.floor(1280/fmet.length);
  fmet.forEach((fm, i) => {
    const fx = 80 + i*fw, fy = 140;
    RCT(f, fx, fy, fw-6, 80, CARD, 10);
    RCT(f, fx, fy, fw-6, 3, fm.col, 10);
    TXT(f, fx+10, fy+10, fm.s, 9, MUT, false, fw-20);
    TXT(f, fx+10, fy+26, fm.c, 22, RED, true);
    TXT(f, fx+10, fy+54, "→ " + fm.t, 12, fm.col, true);
  });

  // 6 key objections
  TXT(f, 80, 244, "OBIECȚIILE CHEIE — FORMULA: VALIDARE → ADÂNCIRE → REÎNCADRARE → RETURNARE", 9, RED, true);
  RCT(f, 80, 260, 1280, 1, BDR);

  const objs = [
    { cat:"A — PREȚ",     c:RED, o:'"Nu am 500 EUR acum."',
      r:'V: "Înțeleg, e o investiție serioasă." A: "E vorba de acces sau de prioritate?" Î: "Clienții cheltuiesc 300+EUR/lună pe sală fără rezultate = 3.600/an." → "Ce s-ar schimba în 90 de zile?"' },
    { cat:"B — TIMP",     c:AMB, o:'"Nu am timp pentru asta."',
      r:'V: "E cel mai comun blocaj real." A: "Câte minute pe zi ar schimba ceva?" Î: "45 min, 4 zile/săpt. Dacă ai timp pentru Netflix, ai timp pentru asta." → "Ce s-ar schimba cu 45 min garantate?"' },
    { cat:"C — SINE",     c:PUR, o:'"Am mai încercat și am eșuat."',
      r:'V: "Apreciez că îmi spui asta sincer." A: "Ce crezi că a mers prost — voința sau metoda?" Î: "Sistem generic pe corp specific = eșec garantat. BUILT e pe eșecurile tale anterioare." → "Dacă eliminăm cauza exactă?"' },
    { cat:"C — ÎNCREDERE",c:BLU, o:'"Nu te cunosc suficient."',
      r:'V: "E rațional complet." A: "Ce te-ar face să te simți în siguranță?" Î: "Uite ce a zis [Alex/Anastasia] în primele 30 zile." → "Ce informație ți-ar trebui pentru a decide?"' },
    { cat:"D — CAPACITATE",c:GRN, o:'"E prea intens pentru mine."',
      r:'V: "Îngrijorare legitimă." A: "Când spui intens — ce anume îți imaginezi?" Î: "Pilonul L există exact pentru asta. Programul se adaptează la viața ta." → "Dacă intensitatea ar fi calibrată pe tine?"' },
    { cat:"A — PREȚ 2",   c:RED, o:'"Mă gândesc și revin."',
      r:'V: "E OK să ai nevoie de timp." A: "La ce anume te gândești — investiție, timing, altceva?" Regula: Nu umpli tăcerea. Dacă menționează partenerul: "Vrei să-l includem în conversație acum?"' },
  ];

  const ow = Math.floor(1280/2);
  objs.forEach((obj, i) => {
    const col = i%2, row = Math.floor(i/2);
    const ox = 80 + col*(ow+4), oy = 272 + row*108;
    RCT(f, ox, oy, ow-4, 100, CARD, 10);
    RCT(f, ox, oy, ow-4, 3, obj.c, 10);
    TXT(f, ox+10, oy+10, obj.cat, 8, obj.c, true);
    TXT(f, ox+10, oy+24, obj.obj, 11, WHT, false, ow-24);
    RCT(f, ox+10, oy+44, ow-24, 1, BDR);
    TXT(f, ox+10, oy+50, obj.r, 9, GRY, false, ow-24);
  });

  // Revenue proof + targets
  const botY = 608;
  TXT(f, 80, botY, "REVENUE TARGETS + DOVADĂ SOCIALĂ", 9, GRN, true);
  RCT(f, 80, botY+16, 1280, 1, BDR);

  const targets = [
    {l:"Acum (5 clienți)", v:"2.500 EUR/lună", d:"5 × 500 EUR",   c:AMB},
    {l:"Target 6 luni",    v:"5.000 EUR/lună", d:"10 × 500 EUR",  c:GRN},
    {l:"Target 12 luni",   v:"10.000 EUR/lună",d:"Scale + grup",  c:BLU},
    {l:"Minim viabil",     v:"500 EUR/lună",   d:"1 client",      c:MUT},
  ];
  const tw = Math.floor(1280/targets.length);
  targets.forEach((tg, i) => {
    const tx = 80 + i*tw, ty = botY+26;
    RCT(f, tx, ty, tw-6, 76, CARD, 10);
    RCT(f, tx, ty, tw-6, 3, tg.c, 10);
    TXT(f, tx+10, ty+10, tg.l, 9, tg.c, true, tw-20);
    TXT(f, tx+10, ty+28, tg.v, 18, WHT, true);
    TXT(f, tx+10, ty+54, tg.d, 10, MUT, false, tw-20);
  });

  // Checklist
  RCT(f, 80, botY+118, 1280, 116, CARD, 12);
  RCT(f, 80, botY+118, 1280, 3, RED, 12);
  TXT(f, 104, botY+132, "CHECKLIST SĂPTĂMÂNAL — LUNI DIMINEAȚA", 9, RED, true);
  const checks = [
    "DM-uri inbound primite:",
    "Conversații calificate:",
    "Apeluri confirmate:",
    "Show-up-uri reale:",
    "Clienți semnați:",
    "Revenue săptămâna:",
    "Obiecția dominantă:",
    "Content cu cele mai multe DM-uri:",
  ];
  const ccw = Math.floor(1280/2);
  checks.forEach((ch, i) => {
    const ccol = i < 4 ? 0 : 1;
    const crow = i < 4 ? i : i - 4;
    TXT(f, 100 + ccol * ccw, botY+152 + crow*20, "□  " + ch + " ___", 11, GRY, false, ccw - 20);
  });

  RCT(f, 80, 852, 1280, 1, BDR);
  TXT(f, 80, 860, "BUILT — KPIs + Obiecții + Rezultate · 4/4 · 2026", 11, DIM, false);
}

// ── Done ──────────────────────────────────────────────────────────
figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
figma.closePlugin("✅ BUILT Sales Funnel — 4 frame-uri flowchart generate!");

})().catch(err => figma.closePlugin("❌ " + err.message));
