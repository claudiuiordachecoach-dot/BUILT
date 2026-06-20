import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const clientId = 5; // Andrei Stamate
  const modulesDir = "/Users/iordacheclaudiu/Claude - BUILT Cowork/CLIENTS/Andrei Stamate/MODULE";
  
  const files = [
    { name: "M1_Tough_Mindset.html", num: 1, title: "Tough Mindset" },
    { name: "M2_Intelligent_Fueling.html", num: 2, title: "Intelligent Fueling" },
    { name: "M3_Base_Strength.html", num: 3, title: "Base Strength" },
    { name: "M4_Unbreakable_Capacity.html", num: 4, title: "Unbreakable Capacity" },
    { name: "M5_Lifestyle_Integration.html", num: 5, title: "Lifestyle Integration" }
  ];

  for (const file of files) {
    const filePath = path.join(modulesDir, file.name);
    const contentHtml = fs.readFileSync(filePath, "utf-8");

    // Check if it already exists
    const { data: existing } = await supabase
      .from("client_modules")
      .select("id")
      .eq("client_id", clientId)
      .eq("module_number", file.num)
      .single();

    const payload = {
      client_id: clientId,
      module_number: file.num,
      title: file.title,
      content_html: contentHtml,
      is_published: true
    };

    if (existing) {
      console.log(`Updating Module ${file.num}...`);
      const { error } = await supabase
        .from("client_modules")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) console.error("Error updating:", error);
    } else {
      console.log(`Inserting Module ${file.num}...`);
      const { error } = await supabase
        .from("client_modules")
        .insert(payload);
      if (error) console.error("Error inserting:", error);
    }
  }
  
  console.log("Done uploading modules!");
}

run().catch(console.error);
