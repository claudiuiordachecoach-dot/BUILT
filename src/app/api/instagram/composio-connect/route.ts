import { NextResponse } from "next/server";
import { getComposioConnectUrl } from "@/lib/composio-instagram";

export async function GET() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const callbackUrl = `${appUrl}/analytics?ig_connected=1`;
    const redirectUrl = await getComposioConnectUrl(callbackUrl);
    if (!redirectUrl) {
      return NextResponse.json({ error: "Nu s-a putut genera URL de conectare." }, { status: 500 });
    }
    return NextResponse.redirect(redirectUrl);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Eroare conectare Composio";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
