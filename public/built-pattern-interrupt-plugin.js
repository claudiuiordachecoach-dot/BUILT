// ═══════════════════════════════════════════════════════════════
// BUILT — Pattern Interrupt Flowchart · Figma Plugin
// Structura exactă din video: flowchart ORIZONTAL Miro-style
// ═══════════════════════════════════════════════════════════════

(async function () {

await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Bold" });

// ── Helpers ──────────────────────────────────────────────────────
function rgb(h) {
  return { r: parseInt(h.slice(1,3),16)/255, g: parseInt(h.slice(3,5),16)/255, b: parseInt(h.slice(5,7),16)/255 };
}
function solid(c, a) {
  return [{ type:"SOLID", color:c, opacity: a ?? 1 }];
}
function FR(name, x, y, w, h, bg) {
  const f = figma.createFrame();
  f.name = name; f.x = x; f.y = y;
  f.resize(Math.max(w,1), Math.max(h,1));
  f.fills = solid(bg); f.clipsContent = false;
  figma.currentPage.appendChild(f); return f;
}
function RCT(p, x, y, w, h, c, r, a) {
  const s = figma.createRectangle();
  s.x=x; s.y=y; s.resize(Math.max(w,1),Math.max(h,1));
  s.fills = solid(c, a ?? 1);
  if(r) s.cornerRadius=r;
  if(p) p.appendChild(s); return s;
}
function TXT(p, x, y, str, sz, c, bold, mw, center) {
  if(!str||!str.length) str=" ";
  const t = figma.createText();
  t.fontName={family:"Inter",style:bold?"Bold":"Regular"};
  t.fontSize=sz; t.fills=solid(c);
  if(mw){ t.textAutoResize="HEIGHT"; t.resize(mw, sz+4); }
  if(center) t.textAlignHorizontal="CENTER";
  t.characters=str; t.x=x; t.y=y;
  if(p) p.appendChild(t); return t;
}

// ── Colors ───────────────────────────────────────────────────────
const BG   = rgb("#080808");
const CARD  = rgb("#0F0F0F");
const BDR   = rgb("#1E1E1E");
const WHT   = rgb("#FFFFFF");
const GRY   = rgb("#A1A1AA");
const MUT   = rgb("#52525B");
const DIM   = rgb("#27272A");
const RED   = rgb("#C0392B");
const GRN   = rgb("#059669");
const BLU   = rgb("#0891B2");
const PUR   = rgb("#7C3AED");
const AMB   = rgb("#D97706");
const ORG   = rgb("#EA580C");

// ═══════════════════════════════════════════════════════════════
// FRAME 01 — FLOWCHART ORIZONTAL (structura exactă din video)
// ═══════════════════════════════════════════════════════════════
{
  const FW = 3200, FH = 1000;
  const f = FR("01 — Pattern Interrupt Flowchart", 0, 0, FW, FH, BG);

  // Title
  TXT(f, 80, 40, "PATTERN INTERRUPT — FLOWCHART COMPLET", 10, RED, true);
  TXT(f, 80, 58, "Structura unui Reel BUILT care ține oamenii de la primul până la ultimul secund", 13, MUT, false, 900);

  // ── Node drawing helpers ──────────────────────────────────────
  // Action node (galben în original → amber în BUILT)
  function actionNode(px, py, w, h, label, color) {
    RCT(f, px, py, w, h, CARD, 12);
    RCT(f, px, py, w, 3, color, 12);
    RCT(f, px, py+h-3, w, 3, color, 12);
    RCT(f, px, py, 3, h, color, 3);
    RCT(f, px+w-3, py, 3, h, color, 3);
    const lines = label.split("\n");
    const lineH = 16;
    const totalH = lines.length * lineH;
    const startY = py + (h - totalH) / 2;
    lines.forEach((line, i) => {
      TXT(f, px + 6, startY + i * lineH, line, 11, WHT, true, w - 12, false);
    });
  }

  // Decision node (albastru în original)
  function decisionNode(px, py, w, h, label, color) {
    RCT(f, px, py, w, h, {r: color.r*0.08, g: color.g*0.08, b: color.b*0.08}, 12);
    RCT(f, px, py, w, h, color, 12, 0.15);
    RCT(f, px, py, w, 3, color, 12);
    RCT(f, px, py+h-3, w, 3, color, 12);
    RCT(f, px, py, 3, h, color, 3);
    RCT(f, px+w-3, py, 3, h, color, 3);
    const lines = label.split("\n");
    const lineH = 16;
    const totalH = lines.length * lineH;
    const startY = py + (h - totalH) / 2;
    lines.forEach((line, i) => {
      TXT(f, px + 6, startY + i * lineH, line, 11, color, true, w - 12, false);
    });
  }

  // Annotation sticky (portocaliu în original)
  function stickyNote(px, py, w, label, color) {
    const lines = label.split("\n");
    const h = 16 + lines.length * 18 + 12;
    RCT(f, px, py, w, h, {r: color.r*0.08, g: color.g*0.08, b: color.b*0.08}, 8);
    RCT(f, px, py, 3, h, color, 4);
    lines.forEach((line, i) => {
      TXT(f, px + 10, py + 10 + i * 18, line, 10, color, false, w - 20);
    });
    return h;
  }

  // Arrow →
  function arrow(px, py, w, color) {
    RCT(f, px, py + 1, w - 8, 2, color, 0);
    // arrowhead
    TXT(f, px + w - 12, py - 5, "›", 14, color, true);
  }

  // ── MAIN FLOW (Y center = 400) ────────────────────────────────
  const NY = 360;  // Node Y
  const NH = 80;   // Node Height
  const AW = 52;   // Arrow Width

  // Node widths
  const nodes = [
    { w: 180 }, // 1 Hook
    { w: 200 }, // arrow
    { w: 210 }, // 2 Deliver value
    { w: 200 }, // arrow
    { w: 210 }, // 3 Attention fading?
    { w: 200 }, // arrow
    { w: 230 }, // 4 Insert PI
    { w: 200 }, // arrow
    { w: 210 }, // 5 Deliver value
    { w: 200 }, // arrow
    { w: 230 }, // 6 Attention fading again?
    { w: 200 }, // arrow
    { w: 230 }, // 7 Add another interrupt
    { w: 200 }, // arrow
    { w: 260 }, // 8 Build anticipation
    { w: 200 }, // arrow
    { w: 230 }, // 9 Deliver payoff
    { w: 200 }, // arrow
    { w: 180 }, // 10 CTA
  ];

  let cx = 80;

  // 1. HOOK (verde — start)
  const n1x = cx, n1w = 200;
  actionNode(n1x, NY, n1w, NH, "START\nCU HOOK", GRN);
  TXT(f, n1x, NY - 28, "01", 9, GRN, true);
  // Sticky below
  stickyNote(n1x - 20, NY + NH + 12, n1w + 40,
    "Angajezi audiența în\nprimele 3 secunde.\nHook vizual + verbal simultan.", AMB);
  cx += n1w;

  // Arrow 1
  arrow(cx, NY + NH/2 - 1, AW, GRY);
  cx += AW;

  // 2. DELIVER VALUE
  const n2x = cx, n2w = 220;
  actionNode(n2x, NY, n2w, NH, "Livrezi\nvaloare/context", AMB);
  TXT(f, n2x, NY - 28, "02", 9, AMB, true);
  // Red annotation above
  TXT(f, n2x, NY - 48, "Acum dai valoarea — aici pierd atenția.", 9, RED, false, n2w);
  stickyNote(n2x - 10, NY + NH + 12, n2w + 20,
    "Explici mecanismul.\nSpecificitate extremă.\nZero generalități.", GRY);
  cx += n2w;

  // Arrow 2
  arrow(cx, NY + NH/2 - 1, AW, GRY);
  cx += AW;

  // 3. ATTENTION FADING?
  const n3x = cx, n3w = 220;
  decisionNode(n3x, NY, n3w, NH, "Atenția\nscade?", BLU);
  TXT(f, n3x, NY - 28, "03", 9, BLU, true);
  // Loop back annotation
  TXT(f, n3x + 10, NY + NH + 14, "DA →", 9, BLU, true);
  TXT(f, n3x + 10, NY + NH + 28, "Inserezi Pattern Interrupt", 9, GRY, false, n3w - 20);
  TXT(f, n3x + 10, NY + NH + 44, "NU → Continui cu valoare", 9, GRY, false, n3w - 20);
  cx += n3w;

  // Arrow 3
  arrow(cx, NY + NH/2 - 1, AW, RED);
  TXT(f, cx, NY + NH/2 - 18, "DA", 8, RED, true);
  cx += AW;

  // 4. INSERT PATTERN INTERRUPT
  const n4x = cx, n4w = 240;
  actionNode(n4x, NY, n4w, NH, "Inserezi\nPattern Interrupt", PUR);
  TXT(f, n4x, NY - 28, "04", 9, PUR, true);
  RCT(f, n4x, NY - 14, n4w, 12, {r:PUR.r*0.15, g:PUR.g*0.15, b:PUR.b*0.15}, 4);
  TXT(f, n4x + 4, NY - 13, "⚡ RE-ENGAGEMENT", 7, PUR, true);
  const piTypesStr = "• Schimbare unghi cameră\n• Întoarcere cap/corp\n• Text bold pe ecran\n• Prop/obiect fizic\n• Zoom in/out brusc\n• Pauza intenționată 1s";
  stickyNote(n4x - 10, NY + NH + 12, n4w + 20,
    "Snaps them back in.\nCreează curiozitate/surpriză.\nÎi dai un motiv să rămână.", PUR);
  cx += n4w;

  // Arrow 4
  arrow(cx, NY + NH/2 - 1, AW, GRY);
  cx += AW;

  // 5. DELIVER VALUE (again)
  const n5x = cx, n5w = 220;
  actionNode(n5x, NY, n5w, NH, "Livrezi\nvaloare/context", AMB);
  TXT(f, n5x, NY - 28, "05", 9, AMB, true);
  stickyNote(n5x - 10, NY + NH + 12, n5w + 20,
    "Continui cu informația.\nAtenția va scădea din nou\ndupă 3-5 secunde.", GRY);
  cx += n5w;

  // Arrow 5
  arrow(cx, NY + NH/2 - 1, AW, GRY);
  cx += AW;

  // 6. ATTENTION FADING AGAIN?
  const n6x = cx, n6w = 240;
  decisionNode(n6x, NY, n6w, NH, "Atenția scade\ndin nou?", BLU);
  TXT(f, n6x, NY - 28, "06", 9, BLU, true);
  TXT(f, n6x + 10, NY + NH + 14, "Un ultim re-engagement", 9, AMB, true);
  TXT(f, n6x + 10, NY + NH + 30, "înainte de final", 9, GRY, false);
  cx += n6w;

  // Arrow 6
  arrow(cx, NY + NH/2 - 1, AW, RED);
  TXT(f, cx, NY + NH/2 - 18, "DA", 8, RED, true);
  cx += AW;

  // 7. ADD ANOTHER INTERRUPT
  const n7x = cx, n7w = 240;
  actionNode(n7x, NY, n7w, NH, "Adaugi alt\nPattern Interrupt", PUR);
  TXT(f, n7x, NY - 28, "07", 9, PUR, true);
  RCT(f, n7x, NY - 14, n7w, 12, {r:PUR.r*0.15, g:PUR.g*0.15, b:PUR.b*0.15}, 4);
  TXT(f, n7x + 4, NY - 13, "⚡ RE-ENGAGEMENT", 7, PUR, true);
  stickyNote(n7x - 10, NY + NH + 12, n7w + 20,
    "Schimbi unghiul sau\nintroduci un element nou.\nÎi aduci atenția înapoi.", PUR);
  cx += n7w;

  // Arrow 7
  arrow(cx, NY + NH/2 - 1, AW, GRY);
  cx += AW;

  // 8. BUILD ANTICIPATION
  const n8x = cx, n8w = 260;
  actionNode(n8x, NY, n8w, NH, "Construiești\nanticipation/tease", ORG);
  TXT(f, n8x, NY - 28, "08", 9, ORG, true);
  stickyNote(n8x - 10, NY + NH + 12, n8w + 20,
    "Reamintești de ce să rămână.\nSpui ce urmează.\nTeaser pentru payoff.", ORG);
  cx += n8w;

  // Arrow 8
  arrow(cx, NY + NH/2 - 1, AW, GRY);
  cx += AW;

  // 9. DELIVER PAYOFF
  const n9x = cx, n9w = 240;
  actionNode(n9x, NY, n9w, NH, "Livrezi\nPayoff-ul", GRN);
  TXT(f, n9x, NY - 28, "09", 9, GRN, true);
  stickyNote(n9x - 10, NY + NH + 12, n9w + 20,
    "Dai ce ai promis.\nAici se construiește trust-ul.\nOamenii văd că ești consecvent.", GRN);
  cx += n9w;

  // Arrow 9
  arrow(cx, NY + NH/2 - 1, AW, GRY);
  cx += AW;

  // 10. CTA (roșu — end)
  const n10x = cx, n10w = 200;
  actionNode(n10x, NY, n10w, NH, "CTA\nO singură acțiune", RED);
  TXT(f, n10x, NY - 28, "10", 9, RED, true);
  stickyNote(n10x - 10, NY + NH + 12, n10w + 20,
    "Spui ce să facă next.\nFollow, DM, click —\norice e obiectivul tău.", RED);

  // ── LOOP BACK ARROW (PI → back to value) ─────────────────────
  // Visual indicator of the loop at the bottom
  const loopY = NY + NH + 160;
  RCT(f, n4x + n4w/2 - 2, loopY, 4, 20, PUR, 0);
  RCT(f, n4x - 60, loopY + 20, n4x + n4w/2 - n4x + 60 + 2, 3, PUR, 0);
  RCT(f, n4x - 60, loopY + 20, 3, -70, PUR, 0);
  TXT(f, n4x - 120, loopY + 25, "← Loop: atenția scade din nou → inserezi alt PI", 9, PUR, false, 400);

  // ── TIMING RULER ─────────────────────────────────────────────
  const rulerY = NY - 80;
  RCT(f, 80, rulerY, cx + n10w - 80, 2, DIM, 0);
  const timeMarkers = [
    {x: 80, t: "0s"},
    {x: 80 + 200, t: "3s"},
    {x: 80 + 200 + 52 + 220, t: "8s"},
    {x: 80 + 200 + 52 + 220 + 52 + 220 + 52, t: "~13s"},
    {x: 80 + 200 + 52 + 220 + 52 + 220 + 52 + 240, t: "~18s"},
  ];
  timeMarkers.forEach(m => {
    RCT(f, m.x, rulerY - 6, 2, 14, DIM, 0);
    TXT(f, m.x - 8, rulerY - 18, m.t, 8, MUT, false);
  });
  TXT(f, 80, rulerY - 32, "TIMING (short form: PI la fiecare 3–5s)", 9, MUT, true);

  // ── KEY INSIGHT BOX ───────────────────────────────────────────
  RCT(f, 80, 840, FW - 160, 60, CARD, 12);
  RCT(f, 80, 840, FW - 160, 3, RED, 12);
  TXT(f, 104, 854, "REGULA DE AUR:", 10, RED, true);
  TXT(f, 220, 854, "Short form (Reels ≤60s) → PI la fiecare 3–5 secunde.   Long form (YT, Podcast) → PI la fiecare 15–20 secunde.   Dacă nu urmăresc, nu convertesc.", 12, WHT, false, FW - 340);
  TXT(f, 80, 876, "BUILT — Pattern Interrupt Flowchart · 1/3 · 2026", 11, DIM, false);
}

// ═══════════════════════════════════════════════════════════════
// FRAME 02 — RETENTION GRAPHS: ÎNAINTE vs DUPĂ
// ═══════════════════════════════════════════════════════════════
{
  const f = FR("02 — Retention: Înainte vs După", 0, 1080, 1440, 900, BG);

  TXT(f, 80, 52, "GRAFICE DE RETENȚIE — CE SE ÎNTÂMPLĂ CU ȘI FĂRĂ PI", 10, RED, true);
  TXT(f, 80, 70, "Datele reale din YouTube Analytics", 32, WHT, true);
  TXT(f, 80, 114, "Fiecare cerc roșu din grafic = un Pattern Interrupt inserat.", 13, MUT, false, 900);
  RCT(f, 80, 140, 1280, 1, BDR);

  const gw = 560, gh = 260, gy = 200;

  // ── GRAPH 1: FĂRĂ PI (pică brusc) ────────────────────────────
  RCT(f, 80, gy, gw, gh, rgb("#1a1a1a"), 12);
  RCT(f, 80, gy, gw, 3, RED, 12);
  TXT(f, 80, gy - 28, "❌  FĂRĂ PATTERN INTERRUPT", 11, RED, true);
  TXT(f, 80, gy - 14, "Retenție medie: ~12%", 10, MUT, false);

  // Grid lines
  [0,25,50,75,100].forEach((pct, i) => {
    const lineY = gy + gh - Math.round(gh * pct / 100);
    RCT(f, 80, lineY, gw, 1, DIM, 0);
    TXT(f, 86, lineY - 10, pct + "%", 8, MUT, false);
  });

  // Bad retention curve — drops sharply
  const badPts = [100, 85, 60, 38, 28, 20, 16, 14, 12, 11, 11, 10, 10, 9, 9, 8, 8, 7, 7, 6];
  const bSegW = Math.floor((gw - 60) / badPts.length);
  badPts.forEach((pct, i) => {
    const bh = Math.round((gh - 20) * pct / 100);
    const bx = 100 + i * bSegW;
    const by = gy + gh - bh - 10;
    RCT(f, bx, by, Math.max(bSegW - 2, 1), bh, RED, 0, 0.7);
  });
  TXT(f, 100, gy + gh - 28, "0:00", 8, MUT, false);
  TXT(f, 80 + gw - 40, gy + gh - 28, "0:33", 8, MUT, false);

  // Drop annotation
  RCT(f, 200, gy + 60, 120, 40, rgb("#2a0a0a"), 8);
  TXT(f, 208, gy + 68, "⬇ Pică imediat", 9, RED, true);
  TXT(f, 208, gy + 82, "după hook", 9, MUT, false);

  // ── GRAPH 2: CU PI (rămâne sus) ──────────────────────────────
  const g2x = 80 + gw + 80;
  RCT(f, g2x, gy, gw, gh, rgb("#0a1a0a"), 12);
  RCT(f, g2x, gy, gw, 3, GRN, 12);
  TXT(f, g2x, gy - 28, "✓  CU PATTERN INTERRUPT", 11, GRN, true);
  TXT(f, g2x, gy - 14, "Retenție medie: ~65%", 10, GRN, false);

  // Grid lines
  [0,25,50,75,100].forEach(pct => {
    const lineY = gy + gh - Math.round(gh * pct / 100);
    RCT(f, g2x, lineY, gw, 1, DIM, 0);
    TXT(f, g2x + 6, lineY - 10, pct + "%", 8, MUT, false);
  });

  // Good retention with bumps at PI moments
  const goodPts = [100, 92, 78, 68, 74, 68, 60, 66, 60, 54, 60, 55, 50, 55, 52, 48, 50, 48, 46, 44];
  const gSegW = Math.floor((gw - 60) / goodPts.length);
  goodPts.forEach((pct, i) => {
    const bh = Math.round((gh - 20) * pct / 100);
    const bx = g2x + 40 + i * gSegW;
    const by = gy + gh - bh - 10;
    RCT(f, bx, by, Math.max(gSegW - 2, 1), bh, GRN, 0, 0.7);
  });
  TXT(f, g2x + 40, gy + gh - 28, "0:00", 8, MUT, false);
  TXT(f, g2x + gw - 40, gy + gh - 28, "0:33", 8, MUT, false);

  // PI markers — cerculete roșii la momentele PI
  [4, 8, 13].forEach((idx, i) => {
    const bx = g2x + 40 + idx * gSegW + gSegW/2 - 10;
    const pct = goodPts[idx];
    const by = gy + gh - Math.round((gh - 20) * pct / 100) - 30;
    RCT(f, bx, by, 20, 20, rgb("#1a1a1a"), 10);
    RCT(f, bx, by, 20, 20, RED, 10, 0.2);
    RCT(f, bx+1, by+1, 18, 18, BDR, 9);
    TXT(f, bx + 4, by + 4, "PI", 7, RED, true);
    TXT(f, bx - 10, by - 16, "Pattern Interrupt " + (i+1), 8, PUR, false, 120);
  });

  // ── COMPARISON ROW ────────────────────────────────────────────
  const compY = gy + gh + 60;
  const metrics = [
    { label: "Retenție medie", before: "~12%",  after: "~65%",  c: GRN },
    { label: "Watch time",     before: "4s",     after: "28s",   c: AMB },
    { label: "Reach algoritm", before: "limitat",after: "amplificat", c: BLU },
    { label: "Conversie",      before: "0%",     after: "real",  c: RED },
  ];
  const mw = Math.floor(1280 / metrics.length);
  metrics.forEach((m, i) => {
    const mx = 80 + i * mw;
    RCT(f, mx, compY, mw - 8, 110, CARD, 10);
    TXT(f, mx + 12, compY + 12, m.label, 10, MUT, false, mw - 32);
    TXT(f, mx + 12, compY + 32, m.before, 18, RED, true);
    TXT(f, mx + 12, compY + 56, "→  " + m.after, 16, GRN, true);
    RCT(f, mx, compY, mw - 8, 3, m.c, 10);
  });

  // ── QUOTE ─────────────────────────────────────────────────────
  RCT(f, 80, compY + 128, 1280, 60, CARD, 12);
  RCT(f, 80, compY + 128, 4, 60, RED, 4);
  TXT(f, 104, compY + 142, '"Dacă nu urmăresc, nu convertesc. Atenția este singurul drum spre rezultate."', 14, WHT, false, 1240);
  TXT(f, 104, compY + 164, "— Pattern Interrupt Walkthrough · principiu core", 11, MUT, false);

  RCT(f, 80, 840, 1280, 1, BDR);
  TXT(f, 80, 852, "BUILT — Retention Graphs · 2/3 · 2026", 11, DIM, false);
}

// ═══════════════════════════════════════════════════════════════
// FRAME 03 — APLICAT PE BUILT: SCRIPT TEMPLATE + BEFORE/AFTER
// ═══════════════════════════════════════════════════════════════
{
  const f = FR("03 — Aplicat pe BUILT", 1520, 1080, 1440, 900, BG);

  TXT(f, 80, 52, "APLICAT PE BUILT — SCRIPT TEMPLATE + REZULTATE", 10, RED, true);
  TXT(f, 80, 70, "Cum folosești Pattern Interrupt în reels-urile tale.", 32, WHT, true);
  TXT(f, 80, 114, "Completezi [parantezele]. Structura e gata, validată de video.", 13, MUT, false, 900);
  RCT(f, 80, 140, 1280, 1, BDR);

  // Script nodes — compact horizontal
  const scriptNodes = [
    { t:"0-3s",  c:GRN, label:"HOOK",           built:'"De ce bărbații cu job bun tot nu slăbesc — deși au încercat tot."' },
    { t:"3-8s",  c:AMB, label:"VALOARE #1",     built:'"Nu e lipsă de voință. E biologie: stresul cronic → cortizol → grăsime."' },
    { t:"8-11s", c:PUR, label:"PI #1 ⚡",        built:"Schimbi unghiul. Cut în timp ce te miști. Text bold apare: SISTEMUL BATE VOINȚA." },
    { t:"11-16s",c:AMB, label:"VALOARE #2",     built:'"Pilonul I — Intelligent Fueling: mănânci strategic, nu te înfometezi."' },
    { t:"16-19s",c:PUR, label:"PI #2 ⚡",        built:"Zoom in pe față. Pauza intenționată 1 secundă înainte de revelație." },
    { t:"19-24s",c:ORG, label:"BUILD ANTICIP.", built:'"Clientul meu Alex a pierdut 8kg în 6 săptămâni fără să renunțe la weekend-uri."' },
    { t:"24-27s",c:GRN, label:"PAYOFF",         built:'"Soluția nu e mai multă voință. E un sistem proiectat pe viața ta reală."' },
    { t:"27-30s",c:RED, label:"CTA",            built:'"Dacă te regăsești, scrie-mi SISTEM în DM."' },
  ];

  const snw = Math.floor(1280 / scriptNodes.length);
  scriptNodes.forEach((sn, i) => {
    const sx = 80 + i * snw;
    const isPI = sn.label.includes("PI");
    RCT(f, sx, 160, snw - 6, 300, isPI ? {r:PUR.r*0.06,g:PUR.g*0.06,b:PUR.b*0.06} : CARD, 10);
    RCT(f, sx, 160, snw - 6, 4, sn.c, 10);
    TXT(f, sx + 8, 172, sn.t, 8, sn.c, true);
    TXT(f, sx + 8, 186, sn.label, 10, sn.c, true, snw - 20);
    RCT(f, sx + 8, 204, snw - 22, 1, BDR);
    TXT(f, sx + 8, 212, sn.built, 9, isPI ? WHT : GRY, false, snw - 20);
    if(isPI) {
      RCT(f, sx, 442, snw - 6, 18, {r:PUR.r*0.15,g:PUR.g*0.15,b:PUR.b*0.15}, 4);
      TXT(f, sx + 6, 444, "Re-engagement", 8, PUR, true);
    }
  });

  // Types of PI for BUILT
  TXT(f, 80, 482, "8 TIPURI DE PATTERN INTERRUPT PENTRU REELS BUILT", 9, RED, true);
  RCT(f, 80, 498, 1280, 1, BDR);

  const piList = [
    { n:"01", c:RED,  t:"Schimbare unghi",    d:"Filmezi din 2 unghiuri. Tai mid-mișcare." },
    { n:"02", c:PUR,  t:"Întoarcere cap/corp", d:"90° turn. Smooth cut." },
    { n:"03", c:BLU,  t:"Text bold pe ecran", d:"Cuvânt cheie apare brusc." },
    { n:"04", c:AMB,  t:"Prop fizic",         d:"Introduci obiect → curiozitate." },
    { n:"05", c:GRN,  t:"Zoom in brusc",      d:"Wide → Close-up direct." },
    { n:"06", c:ORG,  t:"B-roll intercalat",  d:"Clip scurt ilustrativ." },
    { n:"07", c:PUR,  t:"Teaser verbal",      d:'"Și asta nu e tot..."' },
    { n:"08", c:BLU,  t:"Pauza de 1s",       d:"Taci. Creează tensiune." },
  ];

  const piw = Math.floor(1280 / piList.length);
  piList.forEach((pi, i) => {
    const px = 80 + i * piw;
    RCT(f, px, 508, piw - 6, 88, CARD, 8);
    RCT(f, px, 508, piw - 6, 3, pi.c, 8);
    TXT(f, px + 8, 518, pi.n, 8, pi.c, true);
    TXT(f, px + 8, 532, pi.t, 10, WHT, true, piw - 16);
    TXT(f, px + 8, 552, pi.d, 9, GRY, false, piw - 16);
  });

  // Before / After results (din video)
  TXT(f, 80, 618, "BEFORE / AFTER — REZULTATE REALE DIN VIDEO", 9, RED, true);
  RCT(f, 80, 634, 1280, 1, BDR);

  // Before
  RCT(f, 80, 644, 580, 130, {r:0.08,g:0.02,b:0.02}, 12);
  RCT(f, 80, 644, 580, 3, RED, 12);
  TXT(f, 104, 658, "❌  BEFORE — Fără PI", 11, RED, true);
  TXT(f, 104, 678, "202 views / 119 views / 114 views", 22, RED, true);
  TXT(f, 104, 710, "Reels cu hook bun dar fără re-engagement.", 12, GRY, false, 520);
  TXT(f, 104, 730, "Oamenii pleacă după primele 3-5 secunde.", 12, GRY, false, 520);
  TXT(f, 104, 750, "Algoritmul nu distribuie. Zero reach.", 12, GRY, false, 520);

  // After
  RCT(f, 700, 644, 660, 130, {r:0.02,g:0.1,b:0.04}, 12);
  RCT(f, 700, 644, 660, 3, GRN, 12);
  TXT(f, 724, 658, "✓  AFTER — Cu PI", 11, GRN, true);
  TXT(f, 724, 678, "341K / 1.8M / 10.5K views", 22, GRN, true);
  TXT(f, 724, 710, "Același creator, același nișă.", 12, GRY, false, 600);
  TXT(f, 724, 730, "Diferența: Pattern Interrupt-uri sistematice.", 12, GRY, false, 600);
  TXT(f, 724, 750, "Algoritmul vede watch time → distribuie masiv.", 12, GRY, false, 600);

  // Key numbers from revenue proof (video)
  RCT(f, 80, 792, 1280, 68, CARD, 12);
  RCT(f, 80, 792, 1280, 3, AMB, 12);
  TXT(f, 104, 806, "REVENUE PROOF DIN VIDEO:", 9, AMB, true);
  TXT(f, 260, 806, "$1,000 Completed  ·  $1,500 Completed  ·  $3,000 Completed  ·  $1,500 Completed", 12, GRN, false, 1100);
  TXT(f, 104, 826, "Același sistem de PI aplicat pe content = audiență care urmărește → are încredere → cumpără.", 12, GRY, false, 1240);
  TXT(f, 104, 844, "Atenția este singurul drum spre vânzare. Fiecare secundă în plus = trust în plus.", 12, GRY, false, 1240);

  RCT(f, 80, 876, 1280, 1, BDR);
  TXT(f, 80, 882, "BUILT — Pattern Interrupt Applied · 3/3 · 2026", 11, DIM, false);
}

// ── Done ──────────────────────────────────────────────────────────
figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
figma.closePlugin("✅ BUILT Pattern Interrupt — 3 frame-uri generate (flowchart exact din video)!");

})().catch(err => figma.closePlugin("❌ " + err.message));
