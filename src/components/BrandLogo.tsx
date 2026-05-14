import Link from "next/link";

interface BrandLogoProps {
  variant?: "full" | "icon";
}

export function BrandLogo({ variant = "full" }: BrandLogoProps) {
  return (
    <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="BUILT — Home">
      {variant === "icon" ? (
        /* Icon-only: 3 piloni SVG — folosit în sidebar-ul Instagram-style */
        <svg width="28" height="32" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="0" y="8" width="6" height="24" fill="#C0392B" />
          <rect x="11" y="0" width="6" height="32" fill="#C0392B" />
          <rect x="22" y="11" width="6" height="21" fill="#C0392B" />
        </svg>
      ) : (
        /* Full: icon + wordmark */
        <div className="flex items-center gap-3">
          <svg width="22" height="26" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="0" y="8" width="6" height="24" fill="#C0392B" />
            <rect x="11" y="0" width="6" height="32" fill="#C0392B" />
            <rect x="22" y="11" width="6" height="21" fill="#C0392B" />
          </svg>
          <span className="font-display text-2xl tracking-[0.2em] text-built-white leading-none">
            BUILT
          </span>
        </div>
      )}
    </Link>
  );
}
