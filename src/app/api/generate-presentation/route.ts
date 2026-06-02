import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getAnthropicClient, MODELS } from "@/lib/anthropic";
const PRESENTATION_TEMPLATE = `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{prenume}} — Planul Tău BUILT</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;overflow:hidden;background:#0A0A0A;color:#F5F5F5;font-family:'Barlow',sans-serif}
.deck{width:100%;height:100vh;position:relative}
.slide{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:80px;opacity:0;pointer-events:none;transition:opacity .35s ease}
.slide.active{opacity:1;pointer-events:all}
.eyebrow{font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#C0392B;font-weight:600;margin-bottom:20px}
h1{font-family:'Bebas Neue',sans-serif;font-size:76px;line-height:.95;color:#F5F5F5;margin-bottom:28px}
h2{font-family:'Bebas Neue',sans-serif;font-size:56px;line-height:1;color:#F5F5F5;margin-bottom:32px}
.red{color:#C0392B}
.bar{width:56px;height:3px;background:#C0392B;margin-bottom:32px}
p.body{font-size:22px;line-height:1.65;color:#CCCCCC;max-width:680px}
p.sub{font-size:18px;line-height:1.6;color:#888;margin-top:20px;max-width:620px}
ul.items{list-style:none;margin-top:8px}
ul.items li{font-size:20px;color:#CCCCCC;padding:11px 0;border-bottom:1px solid #1C1C1C;display:flex;align-items:baseline;gap:12px}
ul.items li:last-child{border-bottom:none}
ul.items li::before{content:"\\2192";color:#C0392B;flex-shrink:0}
.cards{display:flex;gap:20px;margin-top:40px;align-items:flex-start}
.card{flex:1;border:1px solid #1E1E1E;padding:36px 32px;position:relative}
.card.rec{border-color:#C0392B}
.card.rec::before{content:'RECOMANDAT';position:absolute;top:-12px;left:24px;background:#C0392B;color:#fff;font-size:10px;letter-spacing:3px;padding:3px 10px}
.price{font-family:'Bebas Neue',sans-serif;font-size:58px;line-height:1;margin-bottom:4px}
.plabel{font-size:12px;color:#555;margin-bottom:24px;letter-spacing:1px}
.feat{font-size:15px;color:#CCCCCC;padding:9px 0;border-bottom:1px solid #161616;display:flex;gap:10px}
.feat:last-child{border-bottom:none}
.feat .chk{color:#C0392B}
blockquote{font-style:italic;font-size:21px;line-height:1.6;color:#CCCCCC;max-width:660px;border-left:3px solid #C0392B;padding-left:28px}
.author{font-size:14px;color:#555;margin-top:16px;padding-left:32px}
.cta{display:inline-block;margin-top:48px;background:#C0392B;color:#fff;padding:18px 48px;font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:3px;text-decoration:none}
nav{position:fixed;bottom:36px;right:52px;display:flex;align-items:center;gap:16px;z-index:100}
nav button{background:transparent;border:1px solid #2A2A2A;color:#888;padding:10px 22px;cursor:pointer;font-family:'Barlow',sans-serif;font-size:13px;letter-spacing:2px;transition:all .2s;text-transform:uppercase}
nav button:hover{border-color:#C0392B;color:#C0392B}
.ct{font-size:12px;color:#444;letter-spacing:2px;min-width:44px;text-align:center}
.prog{position:fixed;top:0;left:0;height:2px;background:#C0392B;transition:width .35s ease}
</style>
</head>
<body>
<div class="prog" id="prog"></div>
<div class="deck">
<div class="slide active">
  <div class="eyebrow">Plan personalizat BUILT</div>
  <h1>{{prenume}}<br><span class="red">90 de Zile.</span></h1>
  <div class="bar"></div>
  <p class="body">Pregătit pe baza diagnosticului din {{data_generare}}.</p>
</div>
<div class="slide">
  <div class="eyebrow">Diagnosticul tău</div>
  <h2>Unde Ești <span class="red">Acum</span></h2>
  <div class="bar"></div>
  <p class="body">{{situatie_actuala}}</p>
</div>
<div class="slide">
  <div class="eyebrow">Ce am identificat</div>
  <h2>Ce Te-a Ținut <span class="red">pe Loc</span></h2>
  <div class="bar"></div>
  <ul class="items">{{obstacole_list}}</ul>
</div>
<div class="slide">
  <div class="eyebrow">Obiectivul tău</div>
  <h2>Unde Vrei <span class="red">Să Fii</span></h2>
  <div class="bar"></div>
  <p class="body">{{obiectiv_90_zile}}</p>
</div>
<div class="slide">
  <div class="eyebrow">Adevărul despre trecut</div>
  <h2>De Ce N-a <span class="red">Mers Înainte</span></h2>
  <div class="bar"></div>
  <p class="body">{{motiv_esec}}</p>
  <p class="sub">Nu a fost lipsă de voință. A fost lipsă de sistem.</p>
</div>
<div class="slide">
  <div class="eyebrow">Sistemul</div>
  <h2>Cum Funcționează <span class="red">BUILT</span></h2>
  <div class="bar"></div>
  <ul class="items">
    <li>Base Strength — forță compusă, progresie logaritmică</li>
    <li>Unbreakable Capacity — rezistență cardiovasculară, Zone 2</li>
    <li>Intelligent Fueling — nutriție ca sistem, 80/20, fără înfometare</li>
    <li>Lifestyle Integration — integrat în viața ta reală cu job și familie</li>
    <li>Tough Mindset — identitate de om echilibrat, nu de om la dietă</li>
  </ul>
</div>
<div class="slide">
  <div class="eyebrow">Despre mine</div>
  <h2>Cine <span class="red">Sunt Eu</span></h2>
  <div class="bar"></div>
  <p class="body">Iordache Claudiu — Hybrid Athlete, +7 ani experiență. Am trecut de la 120kg la vicecampion. Nu vând motivație — am construit un sistem reproductibil aplicat mai întâi pe mine, apoi pe clienții mei.</p>
</div>
<div class="slide">
  <div class="eyebrow">Dovadă reală</div>
  <h2>Oameni Care Au <span class="red">Trecut Prin Asta</span></h2>
  <div class="bar"></div>
  <blockquote>"Am 39 de ani, job de PM, doi copii. Credeam că nu am timp. În 90 de zile am slăbit 12kg și am mai multă energie decât la 30 de ani."</blockquote>
  <p class="author">— Alex, 39 ani, Project Manager IT</p>
</div>
<div class="slide">
  <div class="eyebrow">Investiția ta</div>
  <h2>Ce Primești + <span class="red">Cât Costă</span></h2>
  <div class="bar"></div>
  <div class="cards">
    <div class="card rec">
      <div class="price">500 EUR</div>
      <div class="plabel">Standard — 90 de zile</div>
      <div class="feat"><span class="chk">✓</span> Plan personalizat complet</div>
      <div class="feat"><span class="chk">✓</span> Ghidaj 1:1 pe toată durata</div>
      <div class="feat"><span class="chk">✓</span> Ajustări săptămânale</div>
      <div class="feat"><span class="chk">✓</span> Acces comunitate BUILT</div>
    </div>
    <div class="card">
      <div class="price">750 EUR</div>
      <div class="plabel">Premium — 90 de zile</div>
      <div class="feat"><span class="chk">✓</span> Tot ce include Standard</div>
      <div class="feat"><span class="chk">✓</span> Apel săptămânal 1:1 (30 min)</div>
      <div class="feat"><span class="chk">✓</span> Prioritate la răspunsuri</div>
      <div class="feat"><span class="chk">✓</span> Acces cohortă exclusivă</div>
    </div>
  </div>
</div>
<div class="slide">
  <div class="eyebrow">Pasul următor</div>
  <h2>Hai Să <span class="red">Construim</span></h2>
  <div class="bar"></div>
  <p class="body">Dacă ce ai citit în acest plan rezonează cu situația ta — știi ce e de făcut. BUILT nu convinge pe nimeni. Selectăm oameni gata să se reconstruiască.</p>
  <a href="mailto:claudiuiordache.coach@gmail.com" class="cta">Confirm participarea</a>
</div>
</div>
<nav>
  <button onclick="prev()">← Înapoi</button>
  <span class="ct" id="ct">1/10</span>
  <button onclick="next()">Înainte →</button>
</nav>
<script>
let cur=0;const slides=document.querySelectorAll('.slide');const ct=document.getElementById('ct');const prog=document.getElementById('prog');
function show(n){slides[cur].classList.remove('active');cur=(n+slides.length)%slides.length;slides[cur].classList.add('active');ct.textContent=(cur+1)+'/'+slides.length;prog.style.width=((cur+1)/slides.length*100)+'%'}
function next(){show(cur+1)}function prev(){show(cur-1)}
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key===' ')next();if(e.key==='ArrowLeft')prev()});
prog.style.width=(1/slides.length*100)+'%';
</script>
</body>
</html>`;

interface ExtractedData {
  prenume: string;
  situatie_actuala: string;
  obstacole: string[];
  obiectiv_90_zile: string;
  motiv_esec: string;
}

async function extractFromTranscript(transcript: string): Promise<ExtractedData> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: MODELS.routine,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: `Ești un asistent care analizează transcripturi de discovery call-uri pentru coaching fitness BUILT.
Extrage câmpurile cerute direct din transcript. Scrie în română, concret, folosind cuvintele reale ale persoanei.
Dacă un câmp nu e clar în transcript, formulează ceva credibil pe baza contextului.
Returnează DOAR JSON valid, fără alte explicații sau markdown.`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Transcript:\n${transcript}\n\nReturnează JSON cu exact această structură:\n{"prenume":"prenumele prospectului","situatie_actuala":"situația lui acum în 2-3 propoziții, în cuvintele lui","obstacole":["obstacol 1","obstacol 2","obstacol 3"],"obiectiv_90_zile":"ce vrea să obțină în 90 de zile, 1-2 propoziții","motiv_esec":"de ce n-a mers înainte, reîncadrat ca problemă de sistem, 1-2 propoziții"}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("Răspuns AI fără text.");
  const text = textBlock.text.trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("JSON invalid.");
  return JSON.parse(text.slice(start, end + 1)) as ExtractedData;
}

function populateTemplate(data: ExtractedData): string {
  const dataRo = new Date().toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });
  const obstacoleList = data.obstacole.map((o) => `<li>${o}</li>`).join("");
  return PRESENTATION_TEMPLATE
    .replace(/{{prenume}}/g, data.prenume)
    .replace(/{{situatie_actuala}}/g, data.situatie_actuala)
    .replace(/{{obstacole_list}}/g, obstacoleList)
    .replace(/{{obiectiv_90_zile}}/g, data.obiectiv_90_zile)
    .replace(/{{motiv_esec}}/g, data.motiv_esec)
    .replace(/{{data_generare}}/g, dataRo);
}

function generateSlug(): string {
  return Math.random().toString(36).substring(2, 10);
}

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json() as { transcript: string };
    if (!transcript?.trim()) {
      return NextResponse.json({ error: "Transcriptul este gol." }, { status: 400 });
    }

    const extracted = await extractFromTranscript(transcript.trim());
    const html = populateTemplate(extracted);
    const slug = generateSlug();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const supabase = getSupabaseServer({ useServiceRole: true });
    const { error } = await supabase.from("presentations").insert({
      slug,
      prospect_name: extracted.prenume,
      html_content: html,
      expires_at: expiresAt,
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
