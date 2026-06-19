import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { sendPushToClient } from "@/lib/push";
import { getSetting } from "@/lib/settings";

// Cron Vercel: sâmbătă dimineața. Trimite un nudge de check-in tuturor
// clienților activi cu notificări pornite. Securizat cu CRON_SECRET.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  const db = getSupabaseServer({ useServiceRole: true });
  const { data: subs } = await db.from("push_subscriptions").select("client_id");
  const clientIds = [...new Set((subs ?? []).map((s) => s.client_id as number))];

  const body =
    (await getSetting("saturday_message").catch(() => null)) ||
    "Cum a mers săptămâna? 2 minute de check-in țin sistemul pe drum.";

  let sent = 0;
  for (const id of clientIds) {
    try {
      await sendPushToClient(id, "Check-in de weekend", body, "/client/checkin");
      sent++;
    } catch {
      // continuă
    }
  }

  return NextResponse.json({ ok: true, clients: clientIds.length, sent });
}
