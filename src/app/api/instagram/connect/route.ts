import { NextResponse } from "next/server";
import { getOAuthUrl } from "@/lib/instagram";
import { cookies } from "next/headers";

export async function GET() {
  const appId = process.env.INSTAGRAM_APP_ID;
  if (!appId) {
    return NextResponse.json(
      { error: "INSTAGRAM_APP_ID lipsă din .env.local" },
      { status: 500 },
    );
  }

  // CSRF state — random token salvat în cookie, verificat în callback
  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("ig_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minute
    path: "/",
  });

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`;
  const url = getOAuthUrl(redirectUri, state);

  return NextResponse.redirect(url);
}
