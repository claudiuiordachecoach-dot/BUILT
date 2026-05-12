#!/usr/bin/env -S npx tsx
/**
 * Migrare creierul-claudiu.json → Supabase.
 *
 * Folosește service role key (bypass RLS) ca să poată face upsert.
 *
 * Pași:
 * 1. Asigură-te că ai rulat schema.sql în Supabase SQL Editor.
 * 2. Verifică că .env.local conține SUPABASE_SERVICE_ROLE_KEY.
 * 3. Rulează: npm run migrate:creier
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const CREIER_PATH = path.resolve(
  process.cwd(),
  "..",
  "CREIERUL_CLAUDIU",
  "creierul-claudiu.json"
);

const SECTION_DEFINITIONS = [
  { key: "section_1_cine_esti", order: 1, title: "Cine ești" },
  { key: "section_2_povestea_ta", order: 2, title: "Povestea ta" },
  { key: "section_3_filosofia_built", order: 3, title: "Filosofia BUILT" },
  { key: "section_4_clientul_ideal", order: 4, title: "Clientul ideal" },
  { key: "section_5_vocea_ta", order: 5, title: "Vocea ta" },
  { key: "section_6_dovezi_sociale", order: 6, title: "Dovezi sociale" },
  { key: "section_7_obiective", order: 7, title: "Obiective" },
  { key: "section_8_oferta", order: 8, title: "Oferta" },
  { key: "section_9_linii_rosii", order: 9, title: "Linii roșii" },
  {
    key: "section_10_intrebari_calificare_dm",
    order: 10,
    title: "Întrebări calificare DM",
  },
  {
    key: "section_11_memorii_clienti",
    order: 11,
    title: "Memorii Clienți & Studii de Caz",
  },
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL lipsește din .env.local.");
    process.exit(1);
  }

  // Preferă service role (bypass RLS), cade pe anon dacă nu e (merge cu RLS single-user).
  const key = serviceKey ?? anonKey;
  if (!key) {
    console.error(
      "❌ Lipsesc atât SUPABASE_SERVICE_ROLE_KEY cât și NEXT_PUBLIC_SUPABASE_ANON_KEY din .env.local."
    );
    process.exit(1);
  }

  const usingServiceRole = !!serviceKey;
  console.log(
    `🔑 Folosesc ${usingServiceRole ? "service_role (bypass RLS)" : "anon (via RLS policies)"}`
  );

  console.log(`📖 Citesc ${CREIER_PATH}`);
  const raw = await readFile(CREIER_PATH, "utf8");
  const creier = JSON.parse(raw);

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  // 1. Migrare metadata
  console.log("📤 Upload metadata creier...");
  const metaError = await supabase
    .from("creier_metadata")
    .upsert(
      [
        { key: "creier_metadata", value: creier.metadata ?? {} },
        { key: "footnote_proces", value: creier.FOOTNOTE_PROCES ?? {} },
      ],
      { onConflict: "key" }
    )
    .then((r) => r.error);

  if (metaError) {
    console.error("❌ Eroare metadata:", metaError);
    process.exit(1);
  }

  // 2. Migrare cele 10 secțiuni
  console.log("📤 Upload cele 10 secțiuni...");

  const sectionsToInsert = SECTION_DEFINITIONS.map((def) => {
    const sectionData = creier[def.key];
    const status =
      sectionData && (sectionData.status === "completed" || sectionData.status === "draft")
        ? sectionData.status
        : sectionData
        ? "completed"
        : "pending";

    return {
      key: def.key,
      order_index: def.order,
      title: def.title,
      content: sectionData ?? {},
      status,
    };
  });

  const { error: sectionsError } = await supabase
    .from("creier_sections")
    .upsert(sectionsToInsert, { onConflict: "key" });

  if (sectionsError) {
    console.error("❌ Eroare secțiuni:", sectionsError);
    process.exit(1);
  }

  console.log(`✅ Migrate ${sectionsToInsert.length} secțiuni + metadata.`);

  // 3. Sumar
  const completed = sectionsToInsert.filter((s) => s.status === "completed").length;
  console.log(`\n📊 Status: ${completed}/${sectionsToInsert.length} secțiuni completate.`);
  for (const s of sectionsToInsert) {
    const icon = s.status === "completed" ? "✅" : s.status === "draft" ? "🟡" : "⚪️";
    console.log(`   ${icon} ${s.order_index}. ${s.title}`);
  }
}

main().catch((e) => {
  console.error("❌ Migrare eșuată:", e);
  process.exit(1);
});
