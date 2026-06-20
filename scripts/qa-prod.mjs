import { createClient } from "@supabase/supabase-js";
import puppeteer from "puppeteer-core";
import fs from "node:fs";

// ── env din .env.local ──
const env = {};
for (const line of fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const PROD = process.env.PROD_URL || "https://built-ai-command-center.vercel.app";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const EMAIL = `qa-mobil-${Date.now()}@built.local`;
const PASSWORD = "QaTest!12345";

const admin = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false } });

const ROUTES = [
  ["dashboard", "/client/dashboard"],
  ["profil", "/client/profil"],
  ["antrenamente", "/client/antrenamente"],
  ["nutritie", "/client/nutritie"],
  ["module", "/client/module"],
  ["checkin", "/client/checkin"],
  ["bonusuri", "/client/bonusuri"],
  ["mesaje", "/client/mesaje"],
];

let clientId, userId;

async function setup() {
  const today = new Date();
  const start = new Date(today); start.setDate(today.getDate() - 80);
  const d1 = new Date(today); d1.setDate(today.getDate() - 70);
  const gallery = [
    { id: "a", label: "Ziua 1", weight_kg: 88, photo_url: "https://picsum.photos/id/1062/300/400", date: d1.toISOString() },
    { id: "b", label: "Acum", weight_kg: 81, photo_url: "https://picsum.photos/id/1025/300/400", date: today.toISOString() },
  ];
  const { data: c, error: ce } = await admin.from("clients").insert({
    name: "QA Mobil", email: EMAIL, start_date: start.toISOString().slice(0, 10),
    status: "active", objectives: "Test QA mobil - reconstructie 90 zile.",
    progress_gallery: gallery,
  }).select("id").single();
  if (ce) throw new Error("insert client: " + ce.message);
  clientId = c.id;

  const { data: u, error: ue } = await admin.auth.admin.createUser({
    email: EMAIL, password: PASSWORD, email_confirm: true, user_metadata: { client_id: clientId },
  });
  if (ue) throw new Error("create user: " + ue.message);
  userId = u.user.id;

  await admin.from("clients").update({ auth_user_id: userId }).eq("id", clientId);
  console.log(`setup ok: client=${clientId} user=${userId}`);
}

async function teardown() {
  if (clientId) { try { await admin.from("clients").delete().eq("id", clientId); } catch (e) { console.log("del client err", e.message); } }
  // retry deleteUser — eșuează tranzitoriu uneori
  for (let i = 0; i < 4 && userId; i++) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (!error) { userId = null; break; }
    console.log(`del user try ${i + 1} err:`, error.message || error);
    await new Promise((r) => setTimeout(r, 1000));
  }
  // verificare finală
  const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
  const leftover = (data?.users || []).filter((u) => /qa-mobil-\d+@built\.local/.test(u.email || ""));
  for (const u of leftover) await admin.auth.admin.deleteUser(u.id).catch(() => {});
  console.log(`teardown ok (leftover curățat: ${leftover.length})`);
}

async function run() {
  fs.mkdirSync("/tmp/qa", { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  // login
  await page.goto(`${PROD}/login`, { waitUntil: "networkidle2", timeout: 60000 });
  await page.type('input[name="email"]', EMAIL);
  await page.type('input[name="password"]', PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await new Promise((r) => setTimeout(r, 2500));
  console.log("after login url:", page.url());

  const report = [];
  for (const [name, route] of ROUTES) {
    try {
      await page.goto(`${PROD}${route}`, { waitUntil: "networkidle2", timeout: 60000 });
      await new Promise((r) => setTimeout(r, 1800));
      const res = await page.evaluate(() => {
        const vw = window.innerWidth;
        const docW = document.documentElement.scrollWidth;
        const offenders = [];
        document.querySelectorAll("*").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && (r.right > vw + 2 || r.left < -2)) {
            const cls = (el.className && el.className.toString) ? el.className.toString().slice(0, 60) : "";
            offenders.push(`<${el.tagName.toLowerCase()}> ${cls} [right=${Math.round(r.right)}]`);
          }
        });
        return { vw, docW, overflow: docW > vw + 2, offenders: offenders.slice(0, 6) };
      });
      await page.screenshot({ path: `/tmp/qa/${name}.png`, fullPage: true });
      report.push({ name, url: page.url(), ...res });
    } catch (e) {
      report.push({ name, error: e.message });
    }
  }

  await browser.close();
  console.log("\n===== RAPORT QA MOBIL (390px) =====");
  for (const r of report) {
    if (r.error) { console.log(`\n[${r.name}] EROARE: ${r.error}`); continue; }
    const flag = r.overflow ? `⚠ OVERFLOW docW=${r.docW} > vw=${r.vw}` : "✓ fără overflow orizontal";
    console.log(`\n[${r.name}] ${flag}`);
    if (r.offenders.length) r.offenders.forEach((o) => console.log("   ↳ " + o));
  }
}

(async () => {
  try {
    await setup();
    await run();
  } catch (e) {
    console.error("FATAL:", e.message);
  } finally {
    await teardown();
  }
})();
