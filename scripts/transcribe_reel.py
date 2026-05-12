#!/usr/bin/env python3
"""
Transcrie un singur reel Instagram dintr-un URL.
Output: transcriptul pe stdout (doar textul, fără log-uri).
Erori: pe stderr, exit code != 0.

Folosit de: /api/reel/transcribe (Next.js → subprocess).
"""

import sys
import tempfile
import os
from pathlib import Path

import instaloader
import whisper
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env.local")

def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: transcribe_reel.py <instagram_url>", file=sys.stderr)
        return 1

    url = sys.argv[1].strip()

    # Extrage shortcode din URL (https://www.instagram.com/p/SHORTCODE/...)
    parts = [p for p in url.split("/") if p]
    try:
        p_idx = parts.index("p")
        shortcode = parts[p_idx + 1].split("?")[0]
    except (ValueError, IndexError):
        try:
            reel_idx = parts.index("reel")
            shortcode = parts[reel_idx + 1].split("?")[0]
        except (ValueError, IndexError):
            print(f"URL invalid — nu găsesc shortcode-ul: {url}", file=sys.stderr)
            return 1

    L = instaloader.Instaloader(
        download_videos=True,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        post_metadata_txt_pattern="",
        quiet=True,
    )

    with tempfile.TemporaryDirectory() as tmpdir:
        L.dirname_pattern = tmpdir
        try:
            post = instaloader.Post.from_shortcode(L.context, shortcode)
            if not post.is_video:
                print("Post-ul nu este video.", file=sys.stderr)
                return 1
            L.download_post(post, target="reel")
        except Exception as exc:
            print(f"Download eșuat: {exc}", file=sys.stderr)
            return 1

        video_files = list(Path(tmpdir).glob("**/*.mp4"))
        if not video_files:
            print("Nu s-a găsit fișier video.", file=sys.stderr)
            return 1

        try:
            model = whisper.load_model("base")
            result = model.transcribe(str(video_files[0]), language="ro", fp16=False)
            transcript = (result.get("text") or "").strip()
        except Exception as exc:
            print(f"Whisper eșuat: {exc}", file=sys.stderr)
            return 1

    print(transcript, end="")
    return 0

if __name__ == "__main__":
    sys.exit(main())
