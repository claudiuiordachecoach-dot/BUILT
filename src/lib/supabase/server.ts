import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase pentru server-side (API routes, Server Components).
 * Folosește service role key DOAR dacă e prezent — altfel cade pe anon.
 * Service role bypass-ează RLS, deci doar pentru operații de admin (migrări, etc).
 */
export function getSupabaseServer(opts?: { useServiceRole?: boolean }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL lipsește.");

  const key = opts?.useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(
      opts?.useServiceRole
        ? "SUPABASE_SERVICE_ROLE_KEY lipsește din .env.local (necesar pentru migrări)."
        : "NEXT_PUBLIC_SUPABASE_ANON_KEY lipsește din .env.local."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
