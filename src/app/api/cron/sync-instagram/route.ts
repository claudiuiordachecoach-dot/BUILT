import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Nudge zilnic de inactivitate (piggyback pe cron-ul zilnic — fără cron nou).
  let nudge: { checked: number; nudged: { name: string; days: number }[] } = { checked: 0, nudged: [] };
  try {
    const { sendInactivityNudges } = await import("@/lib/push");
    nudge = await sendInactivityNudges();
  } catch { /* nu blocăm sync-ul */ }

  try {
    const { syncRecentReels } = await import("@/app/dashboard/analytics/actions");
    const result = await syncRecentReels();
    return NextResponse.json({ success: result.ok, synced: result.ok ? result.synced : 0, nudge });
  } catch (e) {
    return NextResponse.json({ error: String(e), nudge }, { status: 500 });
  }
}
