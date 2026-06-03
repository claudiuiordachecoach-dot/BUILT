"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Check if we already showed it in this session
    const hasSeenSplash = sessionStorage.getItem("built_splash_seen");
    if (hasSeenSplash) {
      setShow(false);
      return;
    }
    
    // Set flag
    sessionStorage.setItem("built_splash_seen", "true");

    // Hide splash after 2.8 seconds (landing page animation is longer)
    const timer = setTimeout(() => setShow(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0A0A]"
      style={{
        animation: "splashFadeOut 0.6s cubic-bezier(.7, 0, .3, 1) forwards",
        animationDelay: "2.2s",
      }}
    >
      <div className="flex flex-col items-center gap-7">
        
        {/* Animated Mark */}
        <div className="relative w-[140px] h-[140px] splash-mark">
          <div className="splash-bar splash-bar-1"></div>
          <div className="splash-bar splash-bar-2"></div>
          <div className="splash-bar splash-bar-3"></div>
          
          <div className="splash-bar-top"></div>
          <div className="splash-bar-bottom"></div>
        </div>

        {/* Wordmark */}
        <div className="splash-wordmark flex gap-1 justify-center font-display text-[64px] text-white leading-none">
          B U I L T
        </div>
        
      </div>
    </div>
  );
}
