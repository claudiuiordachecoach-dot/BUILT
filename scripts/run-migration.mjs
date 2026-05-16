/**
 * Run Blueprint 2.0 migration against Supabase.
 * Usage: DB_PASSWORD=<your-db-password> node scripts/run-migration.mjs
 *
 * Find password: Supabase Dashboard → Project Settings → Database → Database password
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kedfvtqbdlwhqmzggbls.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZGZ2dHFiZGx3aHFtemdnYmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAwNzgyOCwiZXhwIjoyMDkzNTgzODI4fQ.X2XU7JmfGXLKN_c30G-NGcMT7vkKuh5J1yAx3mNeg2E";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Verifică tabele existente
async function checkTable(name) {
  const { data, error } = await supabase.from(name).select("id").limit(1);
  return !error;
}

async function main() {
  console.log("Verificând tabele...");

  const ciExists = await checkTable("competitor_intel");
  const paExists = await checkTable("profile_audits");

  console.log(`competitor_intel: ${ciExists ? "✅ există" : "❌ lipsă"}`);
  console.log(`profile_audits: ${paExists ? "✅ există" : "❌ lipsă"}`);

  if (ciExists && paExists) {
    console.log("\nToate tabelele există deja! Verificând coloana ai_analysis...");
    const { data } = await supabase
      .from("instagram_media")
      .select("ai_analysis")
      .limit(1);
    console.log(data !== null ? "✅ ai_analysis există" : "❌ ai_analysis lipsă");
    return;
  }

  console.log("\n⚠️  Tabele lipsă. Rulează SQL-ul din:");
  console.log("supabase/migrations/20260515_blueprint_tables.sql");
  console.log("\nîn Supabase Dashboard → SQL Editor");
}

main().catch(console.error);
