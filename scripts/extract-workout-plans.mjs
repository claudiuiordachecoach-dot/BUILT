#!/usr/bin/env node
/**
 * Extrage exercițiile per zi din QuickRef-urile HTML → src/lib/workout-plans.json.
 * Astfel loggerul de seturi (inline în Antrenamente) are exercițiile gata, fără iframe.
 * Re-rulează când modifici un QuickRef: node scripts/extract-workout-plans.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(new URL("../", import.meta.url)));
const qrDir = path.join(root, "built-ai-command-center", "public", "quickref");
// rulat din built-ai-command-center → ajustăm dacă nu există
const dir = fs.existsSync(qrDir) ? qrDir : path.join(process.cwd(), "public", "quickref");

const SKIP = /încălzire|incalzire|revenire|warm|cooldown|stretch|mobilitate|cardio|recuperare|biciclet|rotați|band pull|cat-cow|cat cow|plimbare|elastic|activare|foam/i;
const SKIP_TABS = ["program", "overview", "saptamana", "warmup", "stretch", "mve", "progresie", "reguli", "ciclu", "calendar"];

function namesFromSegment(seg) {
  // Template A: .ex-ttl (claudia/george/letitia/andrei)
  let names = [...seg.matchAll(/class="ex-ttl"[^>]*>([^<]+)</g)].map((m) => m[1]);
  if (names.length === 0) {
    // Template B: .ex-name, doar din fazele de „Exerciții" dacă există phase-label-uri
    const blocks = seg.split(/class="phase-block"/);
    const hasLabels = /class="phase-label"/.test(seg);
    for (const b of blocks) {
      const label = b.match(/class="phase-label"[^>]*>([^<]+)</)?.[1] || "";
      if (hasLabels && !/exerci|for[țt]|principal/i.test(label)) continue; // sar mobilitate/cardio
      for (const m of b.matchAll(/class="ex-name"[^>]*>([^<]+)</g)) names.push(m[1]);
    }
  }
  return names.map((n) => n.replace(/\s+/g, " ").trim()).filter((n) => n && !SKIP.test(n));
}

const out = {};
for (const file of fs.readdirSync(dir).filter((f) => /-antrenament\.html$/.test(f))) {
  const slug = file.replace("-antrenament.html", "");
  const h = fs.readFileSync(path.join(dir, file), "utf8");
  const panels = [...h.matchAll(/id="tab-([a-zA-Z0-9-]+)"/g)].map((m) => ({ tab: m[1], start: m.index }));
  const days = {};
  for (let i = 0; i < panels.length; i++) {
    const tab = panels[i].tab;
    if (SKIP_TABS.includes(tab.toLowerCase())) continue;
    const seg = h.slice(panels[i].start, panels[i + 1]?.start ?? h.length);
    const names = namesFromSegment(seg);
    if (names.length) days[tab] = names;
  }
  if (Object.keys(days).length) out[slug] = days;
}

const dest = path.join(dir, "..", "..", "src", "lib", "workout-plans.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
const total = Object.entries(out).map(([s, d]) => `${s}:${Object.keys(d).length}zile`).join(" · ");
console.log("Scris", path.relative(process.cwd(), dest));
console.log(total);
