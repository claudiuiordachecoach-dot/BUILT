import { NextResponse } from "next/server";
import { fetchMedia, fetchMediaInsights, fetchProfile } from "@/lib/instagram";
import { getSupabaseServer } from "@/lib/supabase/server";

// POST /api/instagram/sync — fetch ultimele 50 media + insights, upsert în Supabase
export async function POST() {
  const sb = getSupabaseServer();

  // Ia contul conectat
  const { data: account, error: accErr } = await sb
    .from("instagram_account")
    .select("ig_user_id, access_token, token_expires_at")
    .single();

  if (accErr || !account) {
    return NextResponse.json({ error: "Niciun cont Instagram conectat." }, { status: 400 });
  }

  // Avertizează dacă tokenul expiră în < 7 zile
  const expiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null;
  const daysLeft = expiresAt
    ? Math.floor((expiresAt.getTime() - Date.now()) / 86400_000)
    : null;

  try {
    // Fetch + update followers
    const profile = await fetchProfile(account.ig_user_id, account.access_token);
    await sb
      .from("instagram_account")
      .update({ followers_count: profile.followers_count })
      .eq("ig_user_id", account.ig_user_id);

    // Fetch media (50 cele mai recente)
    const media = await fetchMedia(account.ig_user_id, account.access_token, 50);

    let synced = 0;
    let failed = 0;

    for (const m of media) {
      try {
        const insights = await fetchMediaInsights(m.id, m.media_type, account.access_token);

        await sb.from("instagram_media").upsert(
          {
            ig_media_id: m.id,
            media_type: m.media_type,
            timestamp: m.timestamp,
            caption: (m.caption ?? "").slice(0, 5000),
            permalink: m.permalink,
            thumbnail_url: m.thumbnail_url ?? m.media_url ?? null,
            plays: insights.plays ?? null,
            likes: insights.likes ?? null,
            comments: insights.comments ?? null,
            saves: insights.saved ?? null,
            shares: insights.shares ?? null,
            reach: insights.reach ?? null,
            impressions: insights.impressions ?? null,
            synced_at: new Date().toISOString(),
          },
          { onConflict: "ig_media_id" },
        );
        synced++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({
      ok: true,
      synced,
      failed,
      total: media.length,
      tokenDaysLeft: daysLeft,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Eroare sync";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
