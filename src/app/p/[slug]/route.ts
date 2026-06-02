import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const EXPIRED_HTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{background:#0A0A0A;color:#F5F5F5;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:16px}p{font-size:18px;color:#666}span{color:#C0392B;font-size:13px;letter-spacing:3px;text-transform:uppercase}</style></head><body><span>BUILT</span><p>Acest link a expirat.</p></body></html>`;

const NOT_FOUND_HTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{background:#0A0A0A;color:#F5F5F5;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:16px}p{font-size:18px;color:#666}span{color:#C0392B;font-size:13px;letter-spacing:3px;text-transform:uppercase}</style></head><body><span>BUILT</span><p>Prezentarea nu a fost găsită.</p></body></html>`;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("presentations")
    .select("html_content, expires_at")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return new NextResponse(NOT_FOUND_HTML, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (new Date(data.expires_at) < new Date()) {
    return new NextResponse(EXPIRED_HTML, {
      status: 410,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new NextResponse(data.html_content as string, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
