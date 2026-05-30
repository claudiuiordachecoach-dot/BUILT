import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("clientId");
  if (!clientId || isNaN(Number(clientId))) {
    return NextResponse.json({ error: "Invalid clientId" }, { status: 400 });
  }
  // Redirectam la dashboard cu clientId in URL — simplu si garantat
  return NextResponse.redirect(new URL(`/client/dashboard?clientId=${clientId}`, request.url));
}
