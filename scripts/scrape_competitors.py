#!/usr/bin/env python3
"""
BUILT M6 — Competitor Reels Scraper

Pentru fiecare competitor activ:
  1. Fetch ultimele 7 zile de reels (instaloader, fără auth — public only)
  2. Skip reels deja scrape-uite (deduplicare pe shortcode)
  3. Download video → transcribe cu Whisper local (model "base")
  4. Upsert în Supabase: competitor_reels + update last_scraped_at

Rulare locală: npm run scrape:competitors
Rulare cron: invocat din .github/workflows/scrape.yml săptămânal.

Variabile env necesare (.env.local):
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
"""

from __future__ import annotations

import argparse
import os
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

import instaloader
import whisper
from dotenv import load_dotenv
from supabase import Client, create_client


WHISPER_MODEL = "base"          # ~140MB, rezonabil pentru limba RO
DAYS_BACK = 7
MAX_REELS_PER_COMPETITOR = 15   # safety net, tipic 5-10/săpt


def log(msg: str) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def load_env() -> tuple[str, str]:
    project_root = Path(__file__).parent.parent
    load_dotenv(project_root / ".env.local")
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        log("EROARE: NEXT_PUBLIC_SUPABASE_URL sau SUPABASE_SERVICE_ROLE_KEY lipsă.")
        sys.exit(1)
    return url, key


def fetch_active_competitors(sb: Client) -> list[dict]:
    res = sb.table("competitors").select("*").eq("is_active", True).execute()
    return res.data or []


def existing_shortcodes(sb: Client, competitor_id: int) -> set[str]:
    res = (
        sb.table("competitor_reels")
        .select("shortcode")
        .eq("competitor_id", competitor_id)
        .execute()
    )
    return {row["shortcode"] for row in (res.data or [])}


def transcribe(model, video_path: Path) -> str:
    try:
        result = model.transcribe(str(video_path), language="ro", fp16=False)
        return (result.get("text") or "").strip()
    except Exception as exc:
        log(f"  ⚠ Transcribe eșuat: {exc}")
        return ""


def scrape_one(
    L: instaloader.Instaloader,
    whisper_model,
    sb: Client,
    competitor: dict,
) -> int:
    handle = competitor["handle"].lstrip("@")
    log(f"→ @{handle}")

    try:
        profile = instaloader.Profile.from_username(L.context, handle)
    except Exception as exc:
        log(f"  ⚠ Profile fetch eșuat: {exc}")
        return 0

    sb.table("competitors").update({
        "followers_count": profile.followers,
        "display_name": profile.full_name or handle,
    }).eq("id", competitor["id"]).execute()

    cutoff = datetime.now(timezone.utc) - timedelta(days=DAYS_BACK)
    seen = existing_shortcodes(sb, competitor["id"])
    saved = 0
    processed = 0

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)
        L.dirname_pattern = str(tmp)

        for post in profile.get_posts():
            if processed >= MAX_REELS_PER_COMPETITOR:
                break
            processed += 1

            if post.date_utc.replace(tzinfo=timezone.utc) < cutoff:
                break  # postări mai vechi de 7 zile, oprire

            if not post.is_video:
                continue
            if post.shortcode in seen:
                continue

            log(f"  • {post.shortcode} ({post.video_view_count or 0} views)")

            transcript = ""
            try:
                L.download_post(post, target=handle)
                video_files = list(tmp.glob(f"{handle}/*.mp4"))
                if video_files:
                    transcript = transcribe(whisper_model, video_files[0])
                    for f in video_files:
                        f.unlink(missing_ok=True)
            except Exception as exc:
                log(f"  ⚠ Download/transcribe failed: {exc}")

            sb.table("competitor_reels").insert({
                "competitor_id": competitor["id"],
                "shortcode": post.shortcode,
                "url": f"https://www.instagram.com/p/{post.shortcode}/",
                "posted_at": post.date_utc.isoformat(),
                "caption": (post.caption or "")[:5000],
                "transcript": transcript,
                "thumbnail_url": post.url,
                "video_url": post.video_url,
                "views": post.video_view_count,
                "likes": post.likes,
                "comments_count": post.comments,
                "duration_seconds": int(post.video_duration or 0) if post.video_duration else None,
            }).execute()
            saved += 1

    sb.table("competitors").update({
        "last_scraped_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", competitor["id"]).execute()

    log(f"  ✓ {saved} reels noi (din {processed} procesate)")
    return saved


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--handle", help="Scrape doar acest handle (debug)")
    args = parser.parse_args()

    url, key = load_env()
    sb = create_client(url, key)

    competitors = fetch_active_competitors(sb)
    if args.handle:
        wanted = args.handle.lstrip("@").lower()
        competitors = [c for c in competitors if c["handle"].lstrip("@").lower() == wanted]

    if not competitors:
        log("Niciun competitor activ. Adaugă unul prin UI (/competitors).")
        return 0

    log(f"Loading Whisper '{WHISPER_MODEL}'...")
    whisper_model = whisper.load_model(WHISPER_MODEL)

    L = instaloader.Instaloader(
        download_videos=True,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        post_metadata_txt_pattern="",
        compress_json=False,
        quiet=True,
    )

    total = 0
    for c in competitors:
        try:
            total += scrape_one(L, whisper_model, sb, c)
        except KeyboardInterrupt:
            log("Întrerupt manual.")
            break
        except Exception as exc:
            log(f"  ✖ Eroare neașteptată pentru {c['handle']}: {exc}")

    log(f"Total: {total} reels noi salvate.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
