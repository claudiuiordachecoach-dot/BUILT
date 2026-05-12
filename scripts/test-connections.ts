#!/usr/bin/env -S npx tsx
/**
 * Test rapid: API key Anthropic + conexiunea Supabase + dacă schema e rulată.
 * Rulează: npm run test:connections
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

async function testAnthropic() {
  console.log("\n━━━ ANTHROPIC ━━━");
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log("❌ ANTHROPIC_API_KEY lipsește din .env.local");
    return false;
  }
  try {
    const client = new Anthropic({ apiKey });
    const r = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 50,
      messages: [{ role: "user", content: "Spune doar 'BUILT API merge' în română." }],
    });
    const text = r.content.find((b) => b.type === "text");
    if (text && text.type === "text") {
      console.log(`✅ ${text.text.trim()}`);
      console.log(`📊 Tokens: ${r.usage.input_tokens} in / ${r.usage.output_tokens} out`);
    }
    return true;
  } catch (e) {
    console.log("❌", e instanceof Error ? e.message : e);
    return false;
  }
}

async function testSupabase() {
  console.log("\n━━━ SUPABASE ━━━");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.log("❌ Lipsesc URL sau anon key din .env.local");
    return false;
  }
  const supabase = createClient(url, anonKey);
  const { error, count } = await supabase
    .from("creier_sections")
    .select("*", { count: "exact", head: true });

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist") || error.message.includes("schema cache")) {
      console.log("⚠️  Tabelul creier_sections NU există încă.");
      console.log("   → Deschide Supabase → SQL Editor → New query → rulează supabase/schema.sql");
      console.log(`   Eroare: ${error.message}`);
      return false;
    }
    console.log("❌", error);
    return false;
  }
  console.log(`✅ Conectat. Tabelul creier_sections există (${count ?? 0} rânduri).`);
  return true;
}

async function main() {
  const a = await testAnthropic();
  const s = await testSupabase();
  console.log(`\n━━━ REZULTAT ━━━`);
  console.log(`Anthropic: ${a ? "✅" : "❌"}    Supabase: ${s ? "✅" : "⚠️"}`);
  if (a && s) {
    console.log("\n🚀 Totul gata. Pot rula migrarea.");
  } else if (a && !s) {
    console.log("\n📋 Pas următor: rulează schema în Supabase, apoi npm run migrate:creier");
  }
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
