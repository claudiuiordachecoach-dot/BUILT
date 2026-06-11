#!/usr/bin/env -S npx tsx
/**
 * Verifică ce date au aterizat în competitor_reels.
 * Rulează: npm run verify:competitors
 */
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(path.resolve(process.cwd(), ".env.local"));
} catch {
  // .env.local opțional dacă env e deja în shell
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  if (!url || !key) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY lipsesc din .env.local");
    process.exit(1);
  }
  const sb = createClient(url, key);

  const { count: competitors } = await sb
    .from("competitors")
    .select("id", { count: "exact", head: true });

  const { data: reels, count: reelsCount } = await sb
    .from("competitor_reels")
    .select("id, views, caption, transcript, posted_at", { count: "exact" })
    .order("views", { ascending: false, nullsFirst: false })
    .limit(5);

  console.log("─── VERIFICARE CONDUCTĂ COMPETITOR ───");
  console.log(`Competitori în DB:        ${competitors ?? 0}`);
  console.log(`Total reels în DB:        ${reelsCount ?? 0}`);
  const withCaption = (reels ?? []).filter((r) => (r.caption ?? "").length > 0).length;
  const withTranscript = (reels ?? []).filter((r) => (r.transcript ?? "").length > 0).length;
  console.log(`Top 5 — cu caption:       ${withCaption}/${(reels ?? []).length}`);
  console.log(`Top 5 — cu transcript:    ${withTranscript}/${(reels ?? []).length}`);
  console.log("");
  console.log("Top 5 reels după views:");
  for (const r of reels ?? []) {
    const cap = (r.caption ?? "").slice(0, 50).replace(/\n/g, " ");
    console.log(`  • ${r.views ?? "?"} views · "${cap}..." · postat ${r.posted_at ?? "?"}`);
  }

  if ((reelsCount ?? 0) === 0) {
    console.log("\n⚠ ZERO reels. Adaugă competitori și rulează `npm run scrape:competitors`.");
    process.exit(1);
  }
  console.log("\n✓ Conducta livrează date.");
}

main().catch((e) => {
  console.error("Eroare:", e);
  process.exit(1);
});
