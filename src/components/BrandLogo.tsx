import Link from "next/link";

interface BrandLogoProps {
  variant?: "full" | "compact";
  showTagline?: boolean;
}

export function BrandLogo({
  variant = "full",
  showTagline = false,
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 hover:opacity-90 transition-opacity"
    >
      {/* Iconul: 3 piloni stilizați (B + U + T) */}
      <div className="flex items-end gap-[3px]" aria-hidden="true">
        <span className="block w-[6px] h-6 bg-built-red" />
        <span className="block w-[6px] h-8 bg-built-red" />
        <span className="block w-[6px] h-5 bg-built-red" />
      </div>

      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-2xl tracking-[0.2em] text-built-white">
            BUILT
          </span>
          {showTagline && (
            <span className="font-condensed text-[9px] text-built-gray-text mt-1">
              Hybrid Athlete · Iordache Claudiu
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
