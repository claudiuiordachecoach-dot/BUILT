import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Citește mai multe setări din app_settings. Întoarce {} dacă tabelul lipsește. */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  try {
    const db = getSupabaseServer({ useServiceRole: true });
    const { data } = await db.from("app_settings").select("key, value").in("key", keys);
    const out: Record<string, string> = {};
    for (const row of data ?? []) {
      if (row.value != null) out[row.key as string] = row.value as string;
    }
    return out;
  } catch {
    return {};
  }
}

export async function getSetting(key: string): Promise<string | null> {
  const all = await getSettings([key]);
  return all[key] ?? null;
}

/** Scrie/actualizează mai multe setări (upsert). */
export async function setSettings(values: Record<string, string>): Promise<void> {
  const db = getSupabaseServer({ useServiceRole: true });
  const rows = Object.entries(values).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));
  await db.from("app_settings").upsert(rows, { onConflict: "key" });
}
