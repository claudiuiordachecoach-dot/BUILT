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
    title: "Raportul tău BUILT e gata",
    body: "Vezi cum a arătat săptămâna ta — și singurul pas pentru următoarea.",
    url: "/client/raport",
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

type PushSub = { id: string | number; client_id: number; endpoint: string; p256dh: string; auth: string };

/**
 * Nudge de inactivitate (Skill 3): clienții activi care n-au mișcat nimic
 * (daily_log / check-in / mesaj) de exact `checkpoints` zile primesc un push blând.
 * Determinist (zilele 4 și 7) → fără spam, fără tabel de throttle. Rulează zilnic din cron.
 */
export async function sendInactivityNudges(checkpoints: number[] = [4, 7]): Promise<{
  checked: number;
  nudged: { name: string; days: number }[];
}> {
  if (!ensureConfigured()) return { checked: 0, nudged: [] };
  const db = getSupabaseServer({ useServiceRole: true });

  const [clientsRes, subsRes, logsRes, checkinsRes, msgsRes] = await Promise.all([
    db.from("clients").select("id, name, status, start_date"),
    db.from("push_subscriptions").select("id, client_id, endpoint, p256dh, auth"),
    db.from("daily_logs").select("client_id, log_date"),
    db.from("client_checkins").select("client_id, created_at"),
    db.from("client_messages").select("client_id, sender, created_at"),
  ]);

  const subsByClient = new Map<number, PushSub[]>();
  for (const s of (subsRes.data ?? []) as PushSub[]) {
    const arr = subsByClient.get(s.client_id) ?? [];
    arr.push(s);
    subsByClient.set(s.client_id, arr);
  }

  // Ultima activitate per client (max peste daily_logs / check-ins / mesaje de la client).
  const last = new Map<number, number>();
  const bump = (id: number, ms: number) => {
    if (!Number.isNaN(ms) && ms > (last.get(id) ?? 0)) last.set(id, ms);
  };
  for (const l of (logsRes.data ?? []) as { client_id: number; log_date: string }[]) bump(l.client_id, Date.parse(l.log_date + "T12:00:00Z"));
  for (const c of (checkinsRes.data ?? []) as { client_id: number; created_at: string }[]) bump(c.client_id, Date.parse(c.created_at));
  for (const m of (msgsRes.data ?? []) as { client_id: number; sender: string; created_at: string }[]) if (m.sender === "client") bump(m.client_id, Date.parse(m.created_at));

  const dayMs = 86400000;
  // Diferență în zile CALENDARISTICE (UTC) — stabilă indiferent de ora la care rulează cronul.
  const dayIndex = (ms: number) => {
    const d = new Date(ms);
    return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / dayMs);
  };
  const today = dayIndex(Date.now());
  const nudged: { name: string; days: number }[] = [];
  let checked = 0;

  for (const cl of (clientsRes.data ?? []) as { id: number; name: string | null; status: string | null; start_date: string | null }[]) {
    if ((cl.status ?? "active") !== "active") continue;
    const clSubs = subsByClient.get(cl.id) ?? [];
    if (clSubs.length === 0) continue;
    checked++;
    const startMs = cl.start_date ? Date.parse(cl.start_date + "T12:00:00Z") : Date.now();
    const lastMs = last.get(cl.id) ?? startMs;
    const days = today - dayIndex(lastMs);
    if (!checkpoints.includes(days)) continue;

    const body =
      days >= 7
        ? "O săptămână de tăcere nu e un eșec — e doar un capitol. Revino azi la un singur lucru. Atât."
        : "Te-am pierdut câteva zile, și e în regulă. Sistemul te așteaptă, nu te judecă. Un singur pas azi.";
    const payload = JSON.stringify({ title: "Hai înapoi pe drum", body, url: "/client/dashboard" });

    for (const sub of clSubs) {
      try {
        await webPush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
      } catch (e: unknown) {
        if (isDeadSubscription(e)) await db.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
    nudged.push({ name: cl.name ?? String(cl.id), days });
  }

  return { checked, nudged };
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
