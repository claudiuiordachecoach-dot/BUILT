import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { syncMyReels } = await import("@/app/dashboard/analytics/actions");
    const result = await syncMyReels();
    return NextResponse.json({ success: result.ok, synced: result.ok ? result.synced : 0 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
