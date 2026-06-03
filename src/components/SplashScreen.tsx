"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Check if we already showed it in this session to prevent annoyance on every navigation
    const hasSeenSplash = sessionStorage.getItem("built_splash_seen");
    if (hasSeenSplash) {
      setShow(false);
      return;
    }
    
    // Set flag
    sessionStorage.setItem("built_splash_seen", "true");

    // Hide splash after 2.2 seconds
    const timer = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0A0A]"
      style={{
        animation: "splashFadeOut 0.5s ease-in forwards",
        animationDelay: "1.8s",
      }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animated Bars that "unite" */}
        <svg
          width="48"
          height="60"
          viewBox="0 0 32 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Left bar */}
          <rect
            x="0"
            y="10"
            width="8"
            height="30"
            rx="1"
            fill="#C0392B"
            style={{
              animation: "barUnite1 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          />
          {/* Center bar */}
          <rect
            x="12"
            y="0"
            width="8"
            height="40"
            rx="1"
            fill="#C0392B"
            style={{
              animation: "barUnite2 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              animationDelay: "0.1s",
              opacity: 0,
            }}
          />
          {/* Right bar */}
          <rect
            x="24"
            y="16"
            width="8"
            height="24"
            rx="1"
            fill="#C0392B"
            style={{
              animation: "barUnite3 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              animationDelay: "0.2s",
              opacity: 0,
            }}
          />
        </svg>

        {/* Text */}
        <span
          className="font-display text-4xl tracking-[0.2em] text-white leading-none"
          style={{
            animation: "wordFadeIn 0.8s ease-out forwards",
            animationDelay: "0.6s",
            opacity: 0,
          }}
        >
          BUILT
        </span>
      </div>
    </div>
  );
}
