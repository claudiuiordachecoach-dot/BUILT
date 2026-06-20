// Date + tipuri partajate (NU "use server" — ca să poată fi importate pe client).

export type AdvisorId = "hormozi" | "rubin" | "naval";

export interface Advisor {
  id: AdvisorId;
  name: string;
  role: string;        // lentila lui, pe scurt
  tagline: string;
  accent: string;      // culoare ring (hex)
  initial: string;
}

export const ADVISORS: Advisor[] = [
  {
    id: "hormozi",
    name: "Alex Hormozi",
    role: "Ofertă · preț · vânzări",
    tagline: "Brutal de direct pe economia ofertei.",
    accent: "#C0392B",
    initial: "H",
  },
  {
    id: "rubin",
    name: "Rick Rubin",
    role: "Gust · craft · ce tai",
    tagline: "Conștiința de gust. Mai puțin, dar mai bine.",
    accent: "#6B7B8C",
    initial: "R",
  },
  {
    id: "naval",
    name: "Naval Ravikant",
    role: "Leverage · judecată · focus",
    tagline: "Sapă un nivel mai adânc. Ce merită focus.",
    accent: "#2E6F8E",
    initial: "N",
  },
];

export interface BoardEntry {
  advisor: AdvisorId;
  answer: string;
  error?: string;
}
