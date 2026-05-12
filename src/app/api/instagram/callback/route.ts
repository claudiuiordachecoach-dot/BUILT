import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForToken,
  resolveIgUserId,
  fetchProfile,
} from "@/lib/instagram";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Userul a refuzat
  if (error) {
    return NextResponse.redirect(
      new URL(`/analytics?ig_error=${encodeURIComponent(error)}`, req.nextUrl.origin),
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/analytics?ig_error=no_code", req.nextUrl.origin));
  }

  // Verifică CSRF state
  const cookieStore = await cookies();
  const savedState = cookieStore.get("ig_oauth_state")?.value;
  cookieStore.delete("ig_oauth_state");

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL("/analytics?ig_error=invalid_state", req.nextUrl.origin));
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`;

    // Exchange code → long-lived token
    const { accessToken, expiresIn } = await exchangeCodeForToken(code, redirectUri);
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Resolve IG User ID + username
    const { igUserId, username } = await resolveIgUserId(accessToken);

    // Fetch followers
    const profile = await fetchProfile(igUserId, accessToken);

    // Salvează în Supabase (upsert — 1 singur row)
    const sb = getSupabaseServer();
    const { error: dbErr } = await sb.from("instagram_account").upsert(
      {
        ig_user_id: igUserId,
        username,
        access_token: accessToken,
        token_expires_at: expiresAt,
        followers_count: profile.followers_count,
      },
      { onConflict: "ig_user_id" },
    );

    if (dbErr) {
      return NextResponse.redirect(
        new URL(`/analytics?ig_error=${encodeURIComponent(dbErr.message)}`, req.nextUrl.origin),
      );
    }

    return NextResponse.redirect(new URL("/analytics?ig_connected=1", req.nextUrl.origin));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Eroare necunoscută";
    return NextResponse.redirect(
      new URL(`/analytics?ig_error=${encodeURIComponent(msg)}`, req.nextUrl.origin),
    );
  }
}
