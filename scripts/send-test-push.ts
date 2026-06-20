import { createClient } from "@supabase/supabase-js";
import webPush from "web-push";

// Configurare Web Push
webPush.setVapidDetails(
  "mailto:claudiuiordachecoach@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log("Fetching subscriptions...");
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("*");

  if (error || !subs || subs.length === 0) {
    console.error("No subscriptions found:", error);
    return;
  }

  console.log(`Found ${subs.length} subscriptions. Sending push...`);

  for (const sub of subs) {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    try {
      await webPush.sendNotification(
        pushSubscription,
        JSON.stringify({
          title: "🔥 Sistemul BUILT AI 🔥",
          body: "Claudiu, acesta este un test live! Notificările merg perfect pe PWA!",
          url: "/client/dashboard",
        })
      );
      console.log(`✅ Push sent successfully to ${sub.endpoint}`);
    } catch (err) {
      console.error(`❌ Failed to send to ${sub.endpoint}:`, err);
    }
  }
}

main();
