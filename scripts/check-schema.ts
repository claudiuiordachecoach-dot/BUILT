#!/usr/bin/env -S npx tsx
import { createClient } from "@supabase/supabase-js";

const TABLES = [
  "creier_sections",
  "creier_metadata",
  "generated_outputs",
  "dm_conversations",
  "dm_messages",
];

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  console.log("Verific cele 5 tabele din schema.sql:\n");
  for (const table of TABLES) {
    const { error, count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: ${count ?? 0} rânduri`);
    }
  }
}

main();
