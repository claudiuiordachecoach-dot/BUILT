import { NextRequest, NextResponse } from "next/server";

// Pixel PNG transparent 1x1 — fallback când imaginea Instagram a expirat sau e blocată.
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

// Niciodată eroare. Pe orice eșec → pixel transparent (containerul dark se vede curat).
function placeholder() {
  return new NextResponse(TRANSPARENT_PNG, {
    status: 200,
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=300" },
  });
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return placeholder();

  // Permite doar CDN-ul Instagram și Facebook
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return placeholder();
  }
  if (!parsed.hostname.endsWith(".cdninstagram.com") && !parsed.hostname.endsWith(".fbcdn.net")) {
    return placeholder();
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.instagram.com/",
      },
      next: { revalidate: 86400 }, // cache 24h pe edge
    });

    if (!upstream.ok) return placeholder();

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch {
    return placeholder();
  }
}
