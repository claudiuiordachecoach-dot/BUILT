// QA mobil pe PORTALUL DE CLIENT (ce văd clienții pe telefon).
// Login admin → cookie admin_view_client_id=9 (Andy) → screenshot fiecare rută @390px.
import { createClient } from "@supabase/supabase-js";
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const env = {};
for (const line of fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const PROD = process.env.PROD_URL || "https://built-ai-command-center.vercel.app";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const EMAIL = `qa-cli-${Date.now()}@built.local`;
const PASSWORD = "QaTest!12345";
const VIEW_CLIENT = process.env.VIEW_CLIENT || "9"; // Andy Lisac

const admin = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false } });
let userId;

const ROUTES = [
  ["dashboard", "/client/dashboard"],
  ["antrenamente", "/client/antrenamente"],
  ["antrenamente-acasa", "/client/antrenamente/acasa"],
  ["nutritie", "/client/nutritie"],
  ["forta", "/client/forta"],
  ["checkin", "/client/checkin"],
  ["mesaje", "/client/mesaje"],
  ["module", "/client/module"],
  ["raport", "/client/raport"],
  ["bonusuri", "/client/bonusuri"],
  ["profil", "/client/profil"],
];

async function setup() {
  const { data: u, error: ue } = await admin.auth.admin.createUser({
    email: EMAIL, password: PASSWORD, email_confirm: true,
  });
  if (ue) throw new Error("create user: " + ue.message);
  userId = u.user.id;
  await admin.from("profiles").upsert({ id: userId, role: "admin" });
  console.log(`setup ok: ${userId} | view client=${VIEW_CLIENT}`);
}
async function teardown() {
  if (userId) await admin.auth.admin.deleteUser(userId).catch(() => {});
  const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
  for (const u of (data?.users || []).filter((x) => /qa-cli-\d+@built\.local/.test(x.email || "")))
    await admin.auth.admin.deleteUser(u.id).catch(() => {});
  console.log("teardown ok");
}

async function run() {
  fs.mkdirSync("/tmp/qa-client", { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  await page.goto(`${PROD}/login`, { waitUntil: "networkidle2", timeout: 60000 });
  await page.type('input[name="email"]', EMAIL);
  await page.type('input[name="password"]', PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await new Promise((r) => setTimeout(r, 2000));

  // impersonează clientul Andy
  await page.setCookie({
    name: "admin_view_client_id", value: VIEW_CLIENT,
    domain: new URL(PROD).hostname, path: "/", sameSite: "Lax",
  });

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
            const parent = el.parentElement;
            const pStyle = parent ? getComputedStyle(parent) : null;
            const scrollable = pStyle && (pStyle.overflowX === "auto" || pStyle.overflowX === "scroll");
            if (!scrollable) {
              const cls = (el.className && el.className.toString) ? el.className.toString().slice(0, 55) : "";
              offenders.push(`<${el.tagName.toLowerCase()}> ${cls} [r=${Math.round(r.right)}]`);
            }
          }
        });
        return { vw, docW, url: location.pathname, overflow: docW > vw + 2, offenders: [...new Set(offenders)].slice(0, 6) };
      });
      await page.screenshot({ path: `/tmp/qa-client/${name}.png`, fullPage: true });
      report.push({ name, ...res });
    } catch (e) {
      report.push({ name, error: e.message });
    }
  }
  await browser.close();

  console.log("\n===== QA PORTAL CLIENT MOBIL (390px) — Andy =====");
  for (const r of report) {
    if (r.error) { console.log(`\n[${r.name}] EROARE: ${r.error}`); continue; }
    console.log(`\n[${r.name}] (${r.url}) ${r.overflow ? `⚠ OVERFLOW docW=${r.docW}>vw=${r.vw}` : "✓ lățime ok"}`);
    if (r.offenders.length) r.offenders.forEach((o) => console.log("   ↳ " + o));
  }
}

(async () => {
  try { await setup(); await run(); }
  catch (e) { console.error("FATAL:", e.message); }
  finally { await teardown(); }
})();
