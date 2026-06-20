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
const EMAIL = `qa-admin-${Date.now()}@built.local`;
const PASSWORD = "QaTest!12345";

const admin = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false } });
let userId, sampleClientId;

async function setup() {
  const { data: u, error: ue } = await admin.auth.admin.createUser({
    email: EMAIL, password: PASSWORD, email_confirm: true,
  });
  if (ue) throw new Error("create user: " + ue.message);
  userId = u.user.id;
  // trigger creează profil cu role 'client' — îl ridicăm la admin
  await admin.from("profiles").upsert({ id: userId, role: "admin" });
  const { data: c } = await admin.from("clients").select("id").limit(1).single();
  sampleClientId = c?.id;
  console.log(`setup ok: admin user=${userId} sampleClient=${sampleClientId}`);
}

async function teardown() {
  for (let i = 0; i < 4 && userId; i++) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (!error) { userId = null; break; }
    console.log(`del user try ${i + 1} err:`, error.message || error);
    await new Promise((r) => setTimeout(r, 1000));
  }
  const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
  const leftover = (data?.users || []).filter((u) => /qa-admin-\d+@built\.local/.test(u.email || ""));
  for (const u of leftover) await admin.auth.admin.deleteUser(u.id).catch(() => {});
  console.log(`teardown ok (leftover curățat: ${leftover.length})`);
}

async function run() {
  fs.mkdirSync("/tmp/qa-admin", { recursive: true });
  const routes = [
    ["azi", "/dashboard/azi"],
    ["analytics", "/dashboard/analytics"],
    ["content", "/dashboard/content"],
    ["calendar", "/dashboard/calendar"],
    ["outreach", "/dashboard/outreach"],
    ["prospects", "/dashboard/prospects"],
    ["knowledge", "/dashboard/knowledge-base"],
    ["clients", "/dashboard/clients"],
    ["client-detail", sampleClientId ? `/dashboard/clients/${sampleClientId}` : "/dashboard/clients"],
    ["progress-reports", "/dashboard/progress-reports"],
    ["profil-coach", "/dashboard/profil"],
    ["repurpose", "/dashboard/repurpose"],
    ["hooks", "/dashboard/hooks"],
    ["reel-copy", "/dashboard/reel-copy"],
    ["profile-audit", "/dashboard/profile-audit"],
    ["onboarding", "/dashboard/onboarding"],
    ["advisors", "/dashboard/advisors"],
    ["flow", "/dashboard/flow"],
  ];

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
  await new Promise((r) => setTimeout(r, 2500));
  console.log("after login url:", page.url());

  const report = [];
  for (const [name, route] of routes) {
    try {
      await page.goto(`${PROD}${route}`, { waitUntil: "networkidle2", timeout: 60000 });
      await new Promise((r) => setTimeout(r, 2000));
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
              const cls = (el.className && el.className.toString) ? el.className.toString().slice(0, 50) : "";
              offenders.push(`<${el.tagName.toLowerCase()}> ${cls} [r=${Math.round(r.right)}]`);
            }
          }
        });
        return { vw, docW, overflow: docW > vw + 2, offenders: [...new Set(offenders)].slice(0, 5) };
      });
      await page.screenshot({ path: `/tmp/qa-admin/${name}.png`, fullPage: true });
      report.push({ name, ...res });
    } catch (e) {
      report.push({ name, error: e.message });
    }
  }
  await browser.close();

  console.log("\n===== RAPORT QA ADMIN MOBIL (390px) =====");
  for (const r of report) {
    if (r.error) { console.log(`\n[${r.name}] EROARE: ${r.error}`); continue; }
    console.log(`\n[${r.name}] ${r.overflow ? `⚠ OVERFLOW docW=${r.docW}>vw=${r.vw}` : "✓ ok"}`);
    if (r.offenders.length) r.offenders.forEach((o) => console.log("   ↳ " + o));
  }
}

(async () => {
  try { await setup(); await run(); }
  catch (e) { console.error("FATAL:", e.message); }
  finally { await teardown(); }
})();
