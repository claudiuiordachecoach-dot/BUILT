// src/lib/carusele/slide-template.ts

import type { CaruselSlide } from "@/app/carusele/actions";

export function buildSlideHtml(slide: CaruselSlide, totalSlides: number): string {
  const isCta = slide.position === totalSlides;
  const isHook = slide.position === 1;

  const bgColor = isCta ? "#C0392B" : "#0A0A0A";
  const titleColor = isCta ? "#F5F5F5" : (isHook ? "#C0392B" : "#F5F5F5");
  const bodyColor = isCta ? "rgba(245,245,245,0.9)" : "rgba(245,245,245,0.75)";
  const titleSize = isHook ? "96px" : "72px";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px;
    height: 1350px;
    background: ${bgColor};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 80px 90px;
    font-family: 'Barlow', sans-serif;
    overflow: hidden;
  }
  .top-bar {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    color: ${isCta ? "#F5F5F5" : "#C0392B"};
    letter-spacing: 4px;
  }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 40px;
  }
  .title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: ${titleSize};
    color: ${titleColor};
    line-height: 1.0;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .divider {
    width: 60px;
    height: 3px;
    background: ${isCta ? "#F5F5F5" : "#C0392B"};
  }
  .body-text {
    font-size: 38px;
    color: ${bodyColor};
    line-height: 1.5;
    font-weight: 400;
    max-width: 900px;
  }
  .bottom-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .slide-number {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    color: rgba(245,245,245,0.3);
    letter-spacing: 3px;
  }
  .handle {
    font-family: 'Barlow', sans-serif;
    font-size: 22px;
    color: rgba(245,245,245,0.4);
    font-weight: 500;
    letter-spacing: 1px;
  }
</style>
</head>
<body>
  <div class="top-bar">
    <span class="logo">BUILT</span>
  </div>
  <div class="content">
    <h1 class="title">${escapeHtml(slide.title)}</h1>
    <div class="divider"></div>
    <p class="body-text">${escapeHtml(slide.body).replace(/\n/g, "<br>")}</p>
  </div>
  <div class="bottom-bar">
    <span class="slide-number">${String(slide.position).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}</span>
    <span class="handle">@iordacheclaudiu_</span>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
