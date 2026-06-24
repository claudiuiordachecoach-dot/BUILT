import Link from "next/link";

/** Marca BUILT — 3 piloni roșii (aceiași ca în splash). SVG, scalează perfect, fără imagine. */
export function BuiltPillars({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={Math.round((size * 40) / 32)}
      viewBox="0 0 32 40"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <rect x="0" y="10" width="8" height="30" rx="1" fill="#C0392B" />
      <rect x="12" y="0" width="8" height="40" rx="1" fill="#C0392B" />
      <rect x="24" y="16" width="8" height="24" rx="1" fill="#C0392B" />
    </svg>
  );
}

/** Wordmark BUILT cu „I" în roșul brandului — logo-ul tipografic principal. */
export function BuiltWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display tracking-[0.18em] leading-none ${className}`}>
      BU<span className="text-built-red">I</span>LT
    </span>
  );
}

interface BrandLogoProps {
  variant?: "full" | "icon";
}

export function BrandLogo({ variant = "full" }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 hover:opacity-80 transition-opacity press"
      aria-label="BUILT — Home"
    >
      <BuiltPillars size={variant === "icon" ? 26 : 22} />
      {variant === "full" && <BuiltWordmark className="text-2xl text-built-white" />}
    </Link>
  );
}
