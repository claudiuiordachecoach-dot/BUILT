/**
 * Catalog complet al celor 12 module BUILT AI Command Center.
 * Status reflectă starea reală de construcție — actualizează când termini un modul.
 */

export type ModuleStatus = "active" | "in_progress" | "planned";

export type ModuleId =
  | "M1"
  | "M2"
  | "M3"
  | "M4"
  | "M5"
  | "M6"
  | "M7"
  | "M8"
  | "M9"
  | "M10"
  | "M11"
  | "M12";

export interface BuiltModule {
  id: ModuleId;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  status: ModuleStatus;
}

export const MODULES: BuiltModule[] = [
  {
    id: "M1",
    slug: "creier",
    title: "Creierul lui Claudiu",
    subtitle: "Onboarding Hub",
    description:
      "Sursa de adevăr pentru AI. 10 secțiuni: cine ești, povestea ta, filosofia BUILT, ICP, vocea, dovezi sociale, obiective, oferta, linii roșii, întrebări de calificare.",
    status: "active",
  },
  {
    id: "M2",
    slug: "reels",
    title: "Generator Reels",
    subtitle: "7 / săptămână",
    description:
      "Scripturi reels în vocea ta, cu structura BUILT obligatorie: hook → problemă → sistem → CTA. Editor cu învățare.",
    status: "active",
  },
  {
    id: "M3",
    slug: "stories",
    title: "Generator Stories",
    subtitle: "21 / săptămână",
    description:
      "Stories diferite de reels: întrebări directe, behind the scenes, mini-lecții, recap, vulnerabilitate scurtă.",
    status: "active",
  },
  {
    id: "M4",
    slug: "carusele",
    title: "Generator Carusele",
    subtitle: "2 / săptămână",
    description:
      "8-10 slides cu text + brief de design. Hook → problemă → sistem → aplicare → reframe → CTA.",
    status: "active",
  },
  {
    id: "M5",
    slug: "",
    title: "Daily Brief",
    subtitle: "Calendar & operare",
    description:
      "Pagina principală. Ce ai de făcut azi, vedere săptămânală, performanță ieri, drag & drop pe calendar.",
    status: "active",
  },
  {
    id: "M6",
    slug: "competitors",
    title: "Competitor Intelligence",
    subtitle: "Analiză manuală",
    description:
      "Analizează competitori: lipești hook-urile și bio-ul, AI identifică pattern-uri, slăbiciuni și unghiul BUILT de contraatac.",
    status: "active",
  },
  {
    id: "M7",
    slug: "dm",
    title: "Sistem DM",
    subtitle: "Outreach & calificare",
    description:
      "Răspunsuri DM antrenat pe metodologia BUILT. Cele 3 Întrebări de Calificare, detector red flags, stats conversie.",
    status: "active",
  },
  {
    id: "M8",
    slug: "analizor",
    title: "Analizor Reel",
    subtitle: "Scor + brief adaptare",
    description:
      "Script / transcript → scor 0-100 pe Hook/Mesaj/CTA/Voce BUILT, hook alternativ sugerat.",
    status: "active",
  },
  {
    id: "M9",
    slug: "knowledge",
    title: "Knowledge Base",
    subtitle: "Chat cu creierul BUILT",
    description:
      "Chat direct cu tot ce știi: ofertă, obiecții, skill-uri, ICP, voce. Răspunsuri exacte, nu generice.",
    status: "active",
  },
  {
    id: "M10",
    slug: "audit",
    title: "Audit Profil Instagram",
    subtitle: "Scor pe 6 elemente",
    description:
      "Bio + posturi + highlights → audit pe 6 criterii, prioritate #1 și quick wins implementabile azi.",
    status: "active",
  },
  {
    id: "M11",
    slug: "analytics",
    title: "Analytics & Performance Loop",
    subtitle: "Tracking engagement",
    description:
      "Adaugă views/likes/saves per reel. Top performers vizibili. Loop de reantrenare M2.",
    status: "active",
  },
  {
    id: "M12",
    slug: "clienti",
    title: "Clienți & Retenție",
    subtitle: "Check-in + MVR AI",
    description:
      "Tracking clienți activi, check-in săptămânal cu slidere, feedback AI Skill 3, alertă clienți la risc.",
    status: "active",
  },
];

export function getModuleBySlug(slug: string): BuiltModule | undefined {
  return MODULES.find((m) => m.slug === slug);
}
