import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Import here to avoid circular deps
    const { generateWeeklyPackage } = await import("@/app/dashboard/content/actions");
    const result = await generateWeeklyPackage();
    return NextResponse.json({ success: true, scripts: (result?.scripts as unknown[])?.length ?? 0 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
