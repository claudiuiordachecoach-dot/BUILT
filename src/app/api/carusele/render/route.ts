// src/app/api/carusele/render/route.ts
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { getSupabaseServer } from "@/lib/supabase/server";
import { buildSlideHtml } from "@/lib/carusele/slide-template";
import type { CaruselBody, CaruselSlide } from "@/app/carusele/actions";

export async function POST(req: NextRequest) {
  let body: { caruselId: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body invalid." }, { status: 400 });
  }

  const { caruselId } = body;
  if (!caruselId || typeof caruselId !== "number") {
    return NextResponse.json({ error: "caruselId lipsește." }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Autentificare necesară." }, { status: 401 });
  }

  const { data: record, error: dbError } = await supabase
    .from("generated_outputs")
    .select("body")
    .eq("id", caruselId)
    .single();

  if (dbError || !record) {
    return NextResponse.json({ error: "Carusel negăsit." }, { status: 404 });
  }

  const caruselBody = record.body as CaruselBody;
  const slides: CaruselSlide[] = caruselBody.slides;

  if (!slides || slides.length === 0) {
    return NextResponse.json({ error: "Caruselul nu are slide-uri." }, { status: 400 });
  }

  let browser;
  try {
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
      ?? (process.env.NODE_ENV === "production"
        ? await chromium.executablePath()
        : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1080, height: 1350 },
      executablePath,
      headless: true,
    });

    const pngUrls: string[] = [];

    for (const slide of slides) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1350 });
      const html = buildSlideHtml(slide, slides.length);
      await page.setContent(html, { waitUntil: "load" });
      await page.evaluateHandle(() => document.fonts.ready);
      const buffer = await page.screenshot({ type: "png" });
      await page.close();

      const fileName = `${caruselId}/slide_${String(slide.position).padStart(2, "0")}.png`;
      const { error: uploadError } = await supabase.storage
        .from("carusele-png")
        .upload(fileName, buffer, { contentType: "image/png", upsert: true });

      if (uploadError) {
        return NextResponse.json(
          { error: `Upload eșuat slide ${slide.position}: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const { data: publicUrl } = supabase.storage
        .from("carusele-png")
        .getPublicUrl(fileName);

      pngUrls.push(publicUrl.publicUrl);
    }

    const { error: updateError } = await supabase
      .from("generated_outputs")
      .update({ png_urls: pngUrls, updated_at: new Date().toISOString() })
      .eq("id", caruselId);

    if (updateError) {
      return NextResponse.json({ error: `DB update: ${updateError.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pngUrls });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Eroare Puppeteer." },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}
