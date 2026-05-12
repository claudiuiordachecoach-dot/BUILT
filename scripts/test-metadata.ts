#!/usr/bin/env -S npx tsx
import { createClient } from "@supabase/supabase-js";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  console.log("1) SELECT pe creier_metadata:");
  const sel = await supabase.from("creier_metadata").select("*");
  console.log(sel.error ? `   ❌ ${sel.error.message}` : `   ✅ ${sel.data?.length ?? 0} rânduri`);

  console.log("\n2) INSERT simplu pe creier_metadata:");
  const ins = await supabase.from("creier_metadata").insert({ key: "test_ping", value: { ok: true } });
  console.log(ins.error ? `   ❌ ${ins.error.message} (code: ${ins.error.code})` : `   ✅ inserted`);

  console.log("\n3) UPSERT pe creier_metadata:");
  const ups = await supabase.from("creier_metadata").upsert({ key: "test_ping", value: { ok: true } }, { onConflict: "key" });
  console.log(ups.error ? `   ❌ ${ups.error.message} (code: ${ups.error.code})` : `   ✅ upserted`);

  console.log("\n4) Cleanup:");
  const del = await supabase.from("creier_metadata").delete().eq("key", "test_ping");
  console.log(del.error ? `   ❌ ${del.error.message}` : `   ✅ deleted test row`);
}

main();
