#!/usr/bin/env python3
"""
BUILT M6 — Competitor Reels Scraper (via Apify)

Pentru fiecare competitor activ:
  1. Apify instagram-reel-scraper → ultimele 20 reels
  2. Deduplicare pe shortcode
  3. Upsert în Supabase competitor_reels

Rulare locală: npm run scrape:competitors
"""

from __future__ import annotations

import argparse
import os
import sys
import time
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client


APIFY_ACTOR = "apify~instagram-reel-scraper"
MAX_REELS = 20


def log(msg: str) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def load_env() -> tuple[str, str, str]:
    project_root = Path(__file__).parent.parent
    load_dotenv(project_root / ".env.local")
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    apify = os.environ.get("APIFY_API_KEY", "")
    if not url or not key:
        log("EROARE: NEXT_PUBLIC_SUPABASE_URL sau SUPABASE_SERVICE_ROLE_KEY lipsă.")
        sys.exit(1)
    if not apify:
        log("EROARE: APIFY_API_KEY lipsă în .env.local")
        sys.exit(1)
    return url, key, apify


def apify_get(path: str, apify_key: str) -> dict | list:
    sep = "&" if "?" in path else "?"
    url = f"https://api.apify.com/v2{path}{sep}token={apify_key}"
    req = urllib.request.Request(url, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read())


def apify_post(path: str, apify_key: str, body: dict) -> dict:
    url = f"https://api.apify.com/v2{path}?token={apify_key}"
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read())


def scrape_via_apify(handle: str, apify_key: str) -> list[dict]:
    clean = handle.lstrip("@")
    log(f"  Apify → @{clean} ...")

    run_resp = apify_post(f"/acts/{APIFY_ACTOR}/runs", apify_key, {"username": [clean], "resultsLimit": MAX_REELS})
    run_id = run_resp.get("data", {}).get("id")
    if not run_id:
        log(f"  ⚠ Apify run pornire eșuată: {run_resp}")
        return []

    log(f"  Run ID: {run_id} — aștept finalizare (max 5 min)...")
    status_resp: dict = {}
    for i in range(60):  # 60 × 5s = 5 min
        time.sleep(5)
        status_resp = apify_get(f"/actor-runs/{run_id}", apify_key)  # type: ignore[assignment]
        status = status_resp.get("data", {}).get("status", "")
        if i % 6 == 0:
            log(f"  ... {status} ({i * 5}s)")
        if status == "SUCCEEDED":
            break
        if status in ("FAILED", "ABORTED", "TIMED-OUT"):
            log(f"  ⚠ Apify run {status}")
            return []
    else:
        log("  ⚠ Apify timeout după 5 min")
        return []

    dataset_id = status_resp.get("data", {}).get("defaultDatasetId", "")
    items_resp = apify_get(f"/datasets/{dataset_id}/items?limit={MAX_REELS}", apify_key)
    return items_resp if isinstance(items_resp, list) else []


def existing_shortcodes(sb: Client, competitor_id: int) -> set[str]:
    res = (
        sb.table("competitor_reels")
        .select("shortcode")
        .eq("competitor_id", competitor_id)
        .execute()
    )
    return {row["shortcode"] for row in (res.data or [])}


def shortcode_from_url(url: str) -> str:
    """Extrage shortcode din URL-ul Instagram."""
    parts = [p for p in url.rstrip("/").split("/") if p]
    return parts[-1] if parts else url


def scrape_one(sb: Client, competitor: dict, apify_key: str) -> int:
    handle = competitor["handle"].lstrip("@")
    log(f"→ @{handle}")

    reels = scrape_via_apify(handle, apify_key)
    if not reels:
        log(f"  ⚠ 0 reels returnate de Apify")
        return 0

    seen = existing_shortcodes(sb, competitor["id"])
    saved = 0

    for r in reels:
        url = r.get("url") or r.get("shortCode") or ""
        shortcode = r.get("shortCode") or shortcode_from_url(url)
        if not shortcode or shortcode in seen:
            continue

        ig_url = f"https://www.instagram.com/reel/{shortcode}/" if shortcode else url
        posted_raw = r.get("timestamp") or r.get("takenAtTs")
        try:
            posted_at = datetime.fromisoformat(str(posted_raw).replace("Z", "+00:00")).isoformat() if posted_raw else None
        except Exception:
            posted_at = None

        row = {
            "competitor_id": competitor["id"],
            "shortcode": shortcode,
            "url": ig_url,
            "posted_at": posted_at,
            "caption": (r.get("caption") or "")[:5000],
            "thumbnail_url": r.get("thumbnailUrl") or r.get("displayUrl"),
            "views": r.get("videoViewCount") or r.get("viewsCount") or 0,
            "likes": r.get("likesCount") or r.get("likes") or 0,
            "comments_count": r.get("commentsCount") or r.get("comments") or 0,
        }

        try:
            sb.table("competitor_reels").insert(row).execute()
            saved += 1
            log(f"  • {shortcode} ({row['views']} views)")
        except Exception as exc:
            log(f"  ⚠ Insert eșuat {shortcode}: {exc}")

    sb.table("competitors").update({
        "last_scraped_at": datetime.now(timezone.utc).isoformat(),
        "display_name": handle,
    }).eq("id", competitor["id"]).execute()

    log(f"  ✓ {saved} reels noi salvate")
    return saved


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--handle", help="Scrape doar acest handle (debug)")
    args = parser.parse_args()

    url, key, apify_key = load_env()
    sb = create_client(url, key)

    res = sb.table("competitors").select("*").eq("is_active", True).execute()
    competitors = res.data or []

    if args.handle:
        wanted = args.handle.lstrip("@").lower()
        competitors = [c for c in competitors if c["handle"].lstrip("@").lower() == wanted]

    if not competitors:
        log("Niciun competitor activ. Adaugă unul prin UI (/competitors).")
        return 0

    total = 0
    for c in competitors:
        try:
            total += scrape_one(sb, c, apify_key)
        except KeyboardInterrupt:
            log("Întrerupt manual.")
            break
        except Exception as exc:
            log(f"  ✖ Eroare neașteptată pentru {c['handle']}: {exc}")

    log(f"Total: {total} reels noi salvate.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
