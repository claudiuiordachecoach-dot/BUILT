import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { scrapeCompetitors } = await import("@/app/dashboard/content/actions");
    const result = await scrapeCompetitors();
    return NextResponse.json({ success: true, scraped: result.scraped });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
