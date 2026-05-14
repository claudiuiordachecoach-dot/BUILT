import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  variant?: "full" | "icon";
}

export function BrandLogo({ variant = "full" }: BrandLogoProps) {
  return (
    <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="BUILT — Home">
      {variant === "icon" ? (
        <Image
          src="/built-logo.png"
          alt="BUILT"
          width={36}
          height={36}
          className="object-contain"
          priority
        />
      ) : (
        <div className="flex items-center gap-3">
          <Image
            src="/built-logo.png"
            alt="BUILT"
            width={28}
            height={28}
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
