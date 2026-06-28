#!/usr/bin/env node
/**
 * Extrage TOT conținutul antrenamentelor din QuickRef-uri → src/lib/workout-full.json
 * Per client → zi → exercițiu: { name, order, presc, rest, start, video, cues:[{l,v}] }
 * Pentru renderul NATIV (carduri cu video + indicații + logging inline). Re-rulează la editări.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(root, "..", "public", "quickref");
const strip = (s) => (s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const SKIP_TABS = ["program", "overview", "saptamana", "warmup", "stretch", "mve", "progresie", "reguli", "ciclu", "calendar", "macros", "mindful"];
const SKIP_NAME = /încălzire|incalzire|revenire|warm|cooldown|mobilitate|stretch|activare|biciclet|rotați|cat-cow|band pull|foam|plimbare/i;

function exBlocks(seg) {
  // Template A: .ex-block cu .ex-ttl + .ex-meta(tags) + .btn-yt + .caseta
  const out = [];
  const parts = seg.split(/class="ex-block/).slice(1);
  for (const b of parts) {
    const id = (b.match(/id="([^"]+)"/) || [])[1] || "";
    if (/^(wu-|cd-)/.test(id)) continue; // warmup/cooldown
    const name = strip((b.match(/class="ex-ttl"[^>]*>([\s\S]*?)<\/div>/) || [])[1]);
    if (!name || SKIP_NAME.test(name)) continue;
    const order = strip((b.match(/class="ex-num"[^>]*>([\s\S]*?)<\/div>/) || [])[1]);
    const tagsSeg = (b.match(/class="ex-meta"[\s\S]*?<\/div>/) || [""])[0];
    const tag = (cls) => strip((tagsSeg.match(new RegExp(`tag-${cls}"[^>]*>([^<]+)<`)) || [])[1]);
    const video = (b.match(/class="btn-yt"[^>]*href="([^"]+)"/) || b.match(/href="(https:\/\/[^"]*(?:youtu|youtube)[^"]*)"/) || [])[1]
      || (b.match(/class="btn-yt"[^>]*>/) ? (b.match(/href="([^"]+)"/) || [])[1] : "");
    const cues = [...b.matchAll(/class="caseta-row"[^>]*>[\s\S]*?caseta-lbl"[^>]*>([^<]+)<[\s\S]*?caseta-val"[^>]*>([\s\S]*?)<\/span>\s*<\/div>/g)]
      .map((m) => ({ l: strip(m[1]), v: strip(m[2]) })).filter((c) => c.v);
    out.push({ name, order, presc: tag("red"), rest: tag("orange"), start: tag("green"), video: video || "", cues });
  }
  return out;
}

function exItems(seg) {
  // Template B: .phase-block label „Exerciții" → .ex-item (.ex-name/.ex-sets/.ex-cue/.ex-rest)
  const out = [];
  const blocks = seg.split(/class="phase-block"/);
  const hasLabels = /class="phase-label"/.test(seg);
  for (const pb of blocks) {
    const label = (pb.match(/class="phase-label"[^>]*>([^<]+)</) || [])[1] || "";
    if (hasLabels && !/exerci|for[țt]|principal/i.test(label)) continue;
    for (const it of pb.split(/class="ex-item"/).slice(1)) {
      const name = strip((it.match(/class="ex-name"[^>]*>([^<]+)</) || [])[1]);
      if (!name || SKIP_NAME.test(name)) continue;
      out.push({
        name, order: "",
        presc: strip((it.match(/class="ex-sets"[^>]*>([^<]+)</) || [])[1]),
        rest: strip((it.match(/class="ex-rest"[^>]*>([^<]+)</) || [])[1]),
        start: "",
        video: (it.match(/href="(https:\/\/[^"]*(?:youtu|youtube)[^"]*)"/) || [])[1] || "",
        cues: (() => { const c = strip((it.match(/class="ex-cue"[^>]*>([\s\S]*?)<\/div>/) || [])[1]); return c ? [{ l: "Execuție", v: c }] : []; })(),
      });
    }
  }
  return out;
}

const out = {};
for (const file of fs.readdirSync(dir).filter((f) => /-antrenament\.html$/.test(f))) {
  const slug = file.replace("-antrenament.html", "");
  const h = fs.readFileSync(path.join(dir, file), "utf8");
  const panels = [...h.matchAll(/id="tab-([a-zA-Z0-9-]+)"/g)].map((m) => ({ tab: m[1], start: m.index }));
  const days = {};
  for (let i = 0; i < panels.length; i++) {
    if (SKIP_TABS.includes(panels[i].tab.toLowerCase())) continue;
    const seg = h.slice(panels[i].start, panels[i + 1]?.start ?? h.length);
    let ex = exBlocks(seg);
    if (ex.length === 0) ex = exItems(seg);
    if (ex.length) days[panels[i].tab] = ex;
  }
  if (Object.keys(days).length) out[slug] = days;
}

const dest = path.join(dir, "..", "..", "src", "lib", "workout-full.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
for (const [s, d] of Object.entries(out)) {
  const sample = Object.entries(d)[0];
  const e0 = sample[1][0];
  console.log(`${s}: ${Object.keys(d).length} zile · ex.1 [${sample[0]}] "${e0.name}" presc:${e0.presc||"-"} video:${e0.video?"DA":"-"} cues:${e0.cues.length}`);
}
