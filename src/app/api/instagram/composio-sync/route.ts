import { NextResponse } from "next/server";
import {
  fetchComposioMedia,
  fetchComposioInsights,
  fetchComposioProfile,
} from "@/lib/composio-instagram";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST() {
  const sb = getSupabaseServer();

  try {
    // Fetch profil
    const profile = await fetchComposioProfile();
    const username = profile?.username ?? "iordacheclaudiu_";
    const followers = profile?.followers_count ?? null;

    // Upsert cont în instagram_account (pentru UI existent)
    await sb.from("instagram_account").upsert(
      {
        ig_user_id: "composio_" + username,
        username,
        followers_count: followers,
        access_token: "composio",
        token_expires_at: null,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "ig_user_id" },
    );

    // Fetch media
    const media = await fetchComposioMedia(50);
    let synced = 0;
    let failed = 0;

    for (const m of media) {
      try {
        const insights = await fetchComposioInsights(m.id, m.media_type);

        await sb.from("instagram_media").upsert(
          {
            ig_media_id:         m.id,
            media_type:          m.media_type,
            format_type:         "OTHER",
            timestamp:           m.timestamp,
            caption:             (m.caption ?? "").slice(0, 5000),
            permalink:           m.permalink,
            thumbnail_url:       m.thumbnail_url ?? m.media_url ?? null,
            plays:               insights.plays              ?? null,
            likes:               insights.likes              ?? null,
            comments:            insights.comments           ?? null,
            saves:               insights.saved              ?? null,
            shares:              insights.shares             ?? null,
            reach:               insights.reach              ?? null,
            impressions:         null,
            avg_watch_time_ms:   insights.avg_watch_time_ms  ?? null,
            total_watch_time_ms: insights.total_watch_time_ms ?? null,
            replays:             insights.replays             ?? null,
            follows:             insights.follows             ?? null,
            profile_visits:      insights.profile_visits      ?? null,
            synced_at:           new Date().toISOString(),
          },
          { onConflict: "ig_media_id" },
        );
        synced++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({ ok: true, synced, failed, total: media.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Eroare sync Composio";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
