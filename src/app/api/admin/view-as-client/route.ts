import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("clientId");
  if (!clientId || isNaN(Number(clientId))) {
    return NextResponse.json({ error: "Invalid clientId" }, { status: 400 });
  }

  const response = NextResponse.redirect(new URL("/client/dashboard", request.url));
  response.cookies.set("admin_view_client_id", clientId, {
    path: "/",
    maxAge: 60 * 60 * 24,
    httpOnly: false,
    sameSite: "lax",
  });
  return response;
}
