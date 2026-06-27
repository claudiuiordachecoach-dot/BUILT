#!/usr/bin/env node
/**
 * Aplică automat migrațiile SQL din supabase/migrations/ prin Supabase Management API.
 * Nu mai e nevoie de copy-paste manual în SQL Editor.
 *
 * - Token: process.env.SUPABASE_ACCESS_TOKEN (sau din .env.local)
 * - Ref proiect: din NEXT_PUBLIC_SUPABASE_URL
 * - Ține evidența în public.schema_migrations → rulează DOAR fișierele noi.
 *
 * Folosire: node scripts/apply-migrations.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ── env (process.env are prioritate; fallback pe .env.local pentru rulare locală) ──
const env = { ...process.env };
try {
  for (const line of fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* în CI nu există .env.local — ok */ }

const TOKEN = env.SUPABASE_ACCESS_TOKEN;
const REF = (env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([a-z0-9]+)\.supabase/)?.[1];
if (!TOKEN || !REF) {
  console.error("Lipsește SUPABASE_ACCESS_TOKEN sau NEXT_PUBLIC_SUPABASE_URL.");
  process.exit(1);
}

async function runSql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 500)}`);
  return text;
}

const migDir = fileURLToPath(new URL("../supabase/migrations/", import.meta.url));
const files = fs.readdirSync(migDir).filter((f) => f.endsWith(".sql")).sort();
const BASELINE = process.argv.includes("--baseline");

await runSql(
  "create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz default now());",
);
const appliedRaw = await runSql("select name from public.schema_migrations;");
const applied = new Set(JSON.parse(appliedRaw).map((r) => r.name));

// Baseline: DB-ul existent are deja toate migrațiile vechi (multe ne-idempotente).
// Le marcăm ca aplicate FĂRĂ să le rulăm. Rulează o singură dată, la adoptare.
if (BASELINE) {
  let marked = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    await runSql(`insert into public.schema_migrations (name) values ('${file.replace(/'/g, "''")}') on conflict do nothing;`);
    marked++;
  }
  console.log(`Baseline: ${marked} migrație(i) marcate ca aplicate (fără rulare). De acum, doar fișierele NOI se aplică automat.`);
  process.exit(0);
}

let ran = 0;
for (const file of files) {
  if (applied.has(file)) continue;
  const sql = fs.readFileSync(path.join(migDir, file), "utf8");
  process.stdout.write(`→ aplic ${file} … `);
  try {
    await runSql(sql);
    await runSql(`insert into public.schema_migrations (name) values ('${file.replace(/'/g, "''")}') on conflict do nothing;`);
    console.log("ok");
    ran++;
  } catch (e) {
    console.log("EȘUAT");
    console.error(`   ${e.message}`);
    process.exit(1);
  }
}

if (ran > 0) await runSql("notify pgrst, 'reload schema';");
console.log(ran === 0 ? "Nimic nou de aplicat — DB la zi." : `Gata: ${ran} migrație(i) aplicate + cache reîmprospătat.`);
