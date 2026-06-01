import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const s = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await s.rpc("exec_migration", {
    sql: `
      alter table public.client_checkins
        add column if not exists sleep_hours  numeric(4,1),
        add column if not exists hydration_l  numeric(4,1),
        add column if not exists stress_level int;
    `,
  });

  // exec_migration may not exist — fall back to direct insert trick via postgres function
  if (error) {
    // Try via raw query using pg-level access
    const results = await Promise.all([
      s.from("client_checkins").select("sleep_hours").limit(1),
      s.from("client_checkins").select("hydration_l").limit(1),
      s.from("client_checkins").select("stress_level").limit(1),
    ]);

    const missing = results.filter((r) => r.error?.message?.includes("column"));
    if (missing.length > 0) {
      return NextResponse.json({
        ok: false,
        message: "Columns missing. Run this SQL in Supabase SQL Editor:",
        sql: `alter table public.client_checkins
  add column if not exists sleep_hours  numeric(4,1),
  add column if not exists hydration_l  numeric(4,1),
  add column if not exists stress_level int;`,
      });
    }
    return NextResponse.json({ ok: true, message: "Columns already exist." });
  }

  return NextResponse.json({ ok: true, message: "Migration applied." });
}
