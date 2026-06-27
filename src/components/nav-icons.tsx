import type { ReactNode } from "react";

/* Set unic de iconițe line BUILT — reutilizat de ClientNav + dashboard-ul clientului.
   Stil consistent: viewBox 24, stroke 1.8, currentColor, dimensiune via 1em (font-size pe părinte). */
function I({ children }: { children: ReactNode }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export const NAV_ICONS: Record<string, ReactNode> = {
  dashboard: <I><path d="M3 11l9-8 9 8" /><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" /></I>,
  profil: <I><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></I>,
  antrenamente: <I><path d="m6.5 6.5 11 11" /><path d="m21 21-1-1" /><path d="m3 3 1 1" /><path d="m18 22 4-4" /><path d="m2 6 4-4" /><path d="m3 10 7-7" /><path d="m14 21 7-7" /></I>,
  nutritie: <I><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" /><path d="M10 2c1 .5 2 2 2 5" /></I>,
  module: <I><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></I>,
  checkin: <I><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></I>,
  bonusuri: <I><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8" /><path d="M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8" /></I>,
  mesaje: <I><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></I>,
  forta: <I><path d="M6.5 6.5 17.5 17.5" /><path d="M21 21l-1-1" /><path d="M3 3l1 1" /><path d="M18 22l4-4" /><path d="M2 6l4-4" /></I>,
  raport: <I><path d="M3 3v18h18" /><rect x="7" y="11" width="3" height="6" rx="0.5" /><rect x="12" y="7" width="3" height="10" rx="0.5" /><rect x="17" y="13" width="3" height="4" rx="0.5" /></I>,
};
