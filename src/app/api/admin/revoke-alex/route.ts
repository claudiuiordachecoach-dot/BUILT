import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const s = getSupabaseServer();
    
    // Dezactivăm statusul clientului 1 (Alexandru Petrila)
    const { data: client } = await s
      .from("clients")
      .select("id, auth_user_id")
      .eq("id", 1)
      .maybeSingle();

    await s.from("clients").update({ status: "inactive" }).eq("id", 1);
    
    if (client?.auth_user_id) {
      await s.from("profiles").update({ role: "disabled" }).eq("id", client.auth_user_id);
    }

    return NextResponse.json({ ok: true, message: "Accesul lui Alexandru Petrila a fost dezactivat, datele au fost păstrate pe site." });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Eroare" }, { status: 500 });
  }
}
