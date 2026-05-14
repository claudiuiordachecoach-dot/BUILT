import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  variant?: "full" | "icon";
}

export function BrandLogo({ variant = "full" }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className="flex items-center justify-center hover:opacity-80 transition-opacity"
      aria-label="BUILT — Home"
    >
      {variant === "icon" ? (
        /* Sidebar icon: 3 piloni SVG roșii, mari și clari */
        <svg
          width="32"
          height="36"
          viewBox="0 0 32 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Pilon stânga — mediu */}
          <rect x="0" y="10" width="8" height="30" rx="1" fill="#C0392B" />
          {/* Pilon centru — cel mai înalt */}
          <rect x="12" y="0" width="8" height="40" rx="1" fill="#C0392B" />
          {/* Pilon dreapta — cel mai scurt */}
          <rect x="24" y="16" width="8" height="24" rx="1" fill="#C0392B" />
        </svg>
      ) : (
        /* Full: PNG logo + wordmark */
        <div className="flex items-center gap-3">
          <Image
            src="/built-logo.png"
            alt="BUILT"
            width={32}
            height={32}
            className="object-contain"
            priority
          />
          <span className="font-display text-2xl tracking-[0.2em] text-built-white leading-none">
            BUILT
          </span>
        </div>
      )}
    </Link>
  );
}
