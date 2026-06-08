import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
async function run() {
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-reel-scraper/runs?token=${process.env.APIFY_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: ["iordacheclaudiu_"], resultsLimit: 2 }),
    }
  );
  const run = await runRes.json();
  console.log("Run started:", run.data?.id);
  // wait a bit
  await new Promise(r => setTimeout(r, 15000));
  const dataRes = await fetch(`https://api.apify.com/v2/actor-runs/${run.data.id}/dataset/items?token=${process.env.APIFY_API_KEY}`);
  const items = await dataRes.json();
  console.log("Items count:", items.length);
  if(items.length > 0) {
    const first = items[0];
    console.log("Extracted ID:", String(first.shortCode ?? first.id ?? ""));
  }
}
run();
