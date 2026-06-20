// Diagnostic erori reale pe toate rutele din sidebar (remote, 1 pass).
// Prinde: status HTTP, pageerror, console.error, text de error-boundary.
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
const EMAIL = `qa-err-${Date.now()}@built.local`;
const PASSWORD = "QaTest!12345";

const admin = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false } });
let userId;

const ROUTES = [
  "/dashboard/azi", "/dashboard/analytics", "/dashboard/content", "/dashboard/calendar",
  "/dashboard/outreach", "/dashboard/knowledge-base", "/dashboard/repurpose",
  "/carusele", "/stories", "/dashboard/hooks", "/vanzare", "/dashboard/reel-copy",
  "/dashboard/profile-audit", "/dashboard/onboarding", "/dashboard/flow", "/dashboard/figma",
  "/dashboard/clients", "/dashboard/progress-reports", "/dashboard/advisors",
  "/dashboard/prospects", "/dashboard/profil",
];

const ERR_TEXT = ["Application error", "client-side exception",
  "This page could not be found", "Unhandled Runtime Error"];

async function setup() {
  const { data: u, error: ue } = await admin.auth.admin.createUser({
    email: EMAIL, password: PASSWORD, email_confirm: true,
  });
  if (ue) throw new Error("create user: " + ue.message);
  userId = u.user.id;
  await admin.from("profiles").upsert({ id: userId, role: "admin" });
  console.log(`setup ok: ${userId}`);
}
async function teardown() {
  if (userId) await admin.auth.admin.deleteUser(userId).catch(() => {});
  const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
  for (const u of (data?.users || []).filter((x) => /qa-err-\d+@built\.local/.test(x.email || "")))
    await admin.auth.admin.deleteUser(u.id).catch(() => {});
  console.log("teardown ok");
}

async function run() {
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

  const report = [];
  for (const route of ROUTES) {
    const consoleErrors = [];
    const pageErrors = [];
    const badResponses = [];
    const onConsole = (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 160)); };
    const onPageErr = (err) => pageErrors.push(String(err.message || err).slice(0, 160));
    const onResp = (resp) => { if (resp.status() >= 400) badResponses.push(`${resp.status()} ${resp.url().replace(PROD, "").slice(0, 90)}`); };
    const onReqFail = (req) => { const f = req.failure(); if (f) badResponses.push(`FAIL ${f.errorText} ${req.url().replace(PROD, "").slice(0, 80)}`); };
    page.on("console", onConsole);
    page.on("pageerror", onPageErr);
    page.on("response", onResp);
    page.on("requestfailed", onReqFail);
    let status = "?";
    try {
      const resp = await page.goto(`${PROD}${route}`, { waitUntil: "networkidle2", timeout: 60000 });
      status = resp ? resp.status() : "no-resp";
      await new Promise((r) => setTimeout(r, 1800));
    } catch (e) {
      pageErrors.push("NAV: " + e.message.slice(0, 120));
    }
    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 3000) || "");
    const errHit = ERR_TEXT.filter((t) => bodyText.includes(t));
    page.off("console", onConsole);
    page.off("pageerror", onPageErr);
    page.off("response", onResp);
    page.off("requestfailed", onReqFail);
    report.push({ route, status, consoleErrors, pageErrors, errHit, badResponses: [...new Set(badResponses)] });
  }
  await browser.close();

  console.log("\n===== DIAGNOSTIC ERORI =====");
  for (const r of report) {
    const bad = r.status >= 400 || r.pageErrors.length || r.errHit.length;
    const flag = bad ? "❌ PROBLEMĂ" : ((r.badResponses.length || r.consoleErrors.length) ? "⚠ resurse" : "✓ ok");
    console.log(`\n[${r.route}] ${flag} (status ${r.status})`);
    if (r.errHit.length) console.log("   text-eroare: " + r.errHit.join(", "));
    r.pageErrors.forEach((e) => console.log("   pageerror: " + e));
    r.badResponses.slice(0, 5).forEach((e) => console.log("   resursă: " + e));
  }
}

(async () => {
  try { await setup(); await run(); }
  catch (e) { console.error("FATAL:", e.message); }
  finally { await teardown(); }
})();
