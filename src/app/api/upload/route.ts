import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAuth } from "@/lib/supabase/auth-server";
import { getSupabaseServer } from "@/lib/supabase/server";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/heic"];
const ALLOWED_FOLDERS = ["avatars", "progress", "coach"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  // Doar utilizatori autentificați pot urca
  const auth = await getSupabaseAuth();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautentificat." }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const folderRaw = String(form.get("folder") || "avatars");
  const folder = ALLOWED_FOLDERS.includes(folderRaw) ? folderRaw : "avatars";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Lipsește fișierul." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Tip de fișier nepermis." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Fișier prea mare (max 10MB)." }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${user.id}-${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const db = getSupabaseServer({ useServiceRole: true });
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await db.storage.from("uploads").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = db.storage.from("uploads").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
