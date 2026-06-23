"use client";
import { usePathname } from "next/navigation";

/**
 * Intrare lină a conținutului la fiecare schimbare de rută.
 * Cheia pe pathname face animația să se reia la navigare, dar NU remontează
 * navigația (e plasat sub layout-ul de segment, nu la rădăcină).
 * Doar opacity + translate — fără impact pe layout. Respectă prefers-reduced-motion.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="anim-fade-up">
      {children}
    </div>
  );
}
