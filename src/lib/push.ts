import "server-only";
import webPush from "web-push";
import { getSupabaseServer } from "@/lib/supabase/server";

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  webPush.setVapidDetails(
    "mailto:claudiuiordache.coach@gmail.com",
    publicKey,
    privateKey
  );
  configured = true;
  return true;
}

/**
 * Trimite o notificare push către toate abonamentele unui client.
 * Silentios: nu aruncă erori, doar le loghează. Curăță abonamentele moarte.
 */
export async function sendPushToClient(
  clientId: number,
  title: string,
  body: string,
  url: string = "/client/mesaje"
): Promise<void> {
  if (!ensureConfigured()) return;

  const db = getSupabaseServer();
  const { data: subs } = await db
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("client_id", clientId);

  if (!subs || subs.length === 0) return;

  const payload = JSON.stringify({ title, body, url });

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
      } catch (e: unknown) {
        const statusCode = (e as { statusCode?: number })?.statusCode;
        // 404/410 = abonament expirat → îl ștergem ca să nu reîncercăm
        if (statusCode === 404 || statusCode === 410) {
          await db.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          console.error("Push failed for client", clientId, e);
        }
      }
    })
  );
}
