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

/** Decide dacă o eroare înseamnă abonament mort permanent (de șters), nu doar o pană temporară. */
function isDeadSubscription(e: unknown): boolean {
  const statusCode = (e as { statusCode?: number })?.statusCode;
  if (statusCode === 404 || statusCode === 410) return true; // expirat / dezabonat
  const msg = (e as { message?: string })?.message ?? "";
  // chei corupte (ex: „p256dh value should be 65 bytes long") → nu va funcționa niciodată
  return /should be|bytes long|invalid|malformed|p256dh|InvalidAccess/i.test(msg);
}

/**
 * Trimite nudge-ul de check-in către TOATE abonamentele (toți clienții).
 * Curăță automat abonamentele moarte. Folosit de butonul admin „Trimite check-in acum".
 */
export async function sendCheckinReminderToAll(): Promise<{
  attempted: number;
  sent: number;
  reachedClientIds: number[];
  cleaned: number;
}> {
  if (!ensureConfigured()) return { attempted: 0, sent: 0, reachedClientIds: [], cleaned: 0 };

  const db = getSupabaseServer({ useServiceRole: true });
  const { data: subs } = await db
    .from("push_subscriptions")
    .select("id, client_id, endpoint, p256dh, auth");
  if (!subs || subs.length === 0) return { attempted: 0, sent: 0, reachedClientIds: [], cleaned: 0 };

  const payload = JSON.stringify({
    title: "Check-in BUILT",
    body: "Cum a mers săptămâna? 2 minute de check-in țin sistemul pe drum.",
    url: "/client/checkin",
  });

  let sent = 0;
  let cleaned = 0;
  const reached = new Set<number>();

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
        reached.add(sub.client_id as number);
      } catch (e: unknown) {
        if (isDeadSubscription(e)) {
          await db.from("push_subscriptions").delete().eq("id", sub.id);
          cleaned++;
        }
      }
    })
  );

  return { attempted: subs.length, sent, reachedClientIds: [...reached], cleaned };
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
        // expirat / dezabonat / cheie coruptă → îl ștergem ca să nu reîncercăm
        if (isDeadSubscription(e)) {
          await db.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          console.error("Push failed for client", clientId, e);
        }
      }
    })
  );
}
