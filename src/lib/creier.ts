import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Tipuri pentru cele 10 secțiuni ale creierului.
 * Schema reflectă structura din creierul-claudiu.json (v1).
 */

export interface CreierMetadata {
  created: string;
  version: string;
  owner: string;
  session_status: string;
  purpose: string;
}

export interface CreierSection {
  key: string;
  order: number;
  title: string;
  description: string;
  status: "completed" | "draft" | "pending";
  data: unknown;
}

export interface Creier {
  metadata: CreierMetadata;
  sections: CreierSection[];
}

const SECTION_DEFINITIONS: Array<{
  key: string;
  order: number;
  title: string;
  description: string;
}> = [
  {
    key: "section_1_cine_esti",
    order: 1,
    title: "Cine ești",
    description:
      "Date factuale: vârstă, origine, studii, job, frate, experiență antrenament, competiții, etichete personale.",
  },
  {
    key: "section_2_povestea_ta",
    order: 2,
    title: "Povestea ta",
    description:
      "Arcul complet, etape marcante, momente specifice (bullying, accident, primul binge, decizia OGLINDA), expresii din voce.",
  },
  {
    key: "section_3_filosofia_built",
    order: 3,
    title: "Filosofia BUILT",
    description:
      "Cei 5 piloni B/U/I/L/T în vocea ta, minciuna industriei, pilonul ignorat, convingerea care face/desface programul.",
  },
  {
    key: "section_4_clientul_ideal",
    order: 4,
    title: "Clientul ideal",
    description:
      "Bărbatul BUILT + femeia BUILT, profile profesionale, triggere de acțiune, cine NU e BUILT (filtre de descalificare).",
  },
  {
    key: "section_5_vocea_ta",
    order: 5,
    title: "Vocea ta",
    description:
      "Expresii recurente, ritm oral, lista neagră de clișee, diferența scris vs vorbit, ce înseamnă carisma pentru tine.",
  },
  {
    key: "section_6_dovezi_sociale",
    order: 6,
    title: "Dovezi sociale",
    description:
      "Client online actual (Alex), clienți sală, testimoniale video, auto-dovada competiții, gap-uri de acoperit.",
  },
  {
    key: "section_7_obiective",
    order: 7,
    title: "Obiective",
    description:
      "90 zile (followers, venit, primul testimonial video), termen mediu (5K EUR/lună, full-time BUILT, Bali).",
  },
  {
    key: "section_8_oferta",
    order: 8,
    title: "Oferta",
    description:
      "Preț curent (300 EUR), strategia de pret progresiv, ce primește clientul, garanția, bonusurile, ce mai e de construit.",
  },
  {
    key: "section_9_linii_rosii",
    order: 9,
    title: "Linii roșii",
    description:
      "Branduri/coachi de evitat, conținut interzis, promisiuni interzise, subiecte tabu, suplimente recomandate.",
  },
  {
    key: "section_10_intrebari_calificare_dm",
    order: 10,
    title: "Întrebări calificare DM",
    description:
      "Opener-ul, cele 3 Întrebări Magice (context, mecanism apărare, viziune), tranziție spre apel, red flags, profile dominante.",
  },
  {
    key: "section_11_memorii_clienti",
    order: 11,
    title: "Memorii Clienți & Studii de Caz",
    description:
      "Logica conversațiilor reale, obiecții specifice rezolvate, profiluri de clienți dificili și strategiile BUILT aplicate.",
  },
];

const CREIER_JSON_PATH = path.resolve(
  process.cwd(),
  "..",
  "CREIERUL_CLAUDIU",
  "creierul-claudiu.json"
);

/**
 * Citește creierul direct din fișierul JSON sursă (până avem Supabase wired).
 * Server-only — nu expune calea sau conținutul către client.
 */
export async function readCreierFromFile(): Promise<Creier> {
  const raw = await readFile(CREIER_JSON_PATH, "utf8");
  const parsed = JSON.parse(raw) as Record<string, unknown>;

  const metadata = (parsed.metadata as CreierMetadata) ?? {
    created: "unknown",
    version: "unknown",
    owner: "Iordache Claudiu",
    session_status: "unknown",
    purpose: "",
  };

  const sections: CreierSection[] = SECTION_DEFINITIONS.map((def) => {
    const raw = parsed[def.key] as
      | { status?: string; [k: string]: unknown }
      | undefined;
    const status =
      raw?.status === "completed" || raw?.status === "draft"
        ? raw.status
        : raw
        ? "completed"
        : "pending";
    return {
      ...def,
      status: status as CreierSection["status"],
      data: raw ?? null,
    };
  });

  return { metadata, sections };
}

export function getSectionDefinitions() {
  return SECTION_DEFINITIONS;
}

/**
 * Citește creierul din Supabase — sursa de adevăr live (DB).
 * Dacă o secțiune lipsește din DB, o întoarce ca `pending` cu definiția statică.
 * Acceptă lipsa metadatei fără să arunce — pune valori default.
 */
export async function readCreierFromSupabase(): Promise<Creier> {
  const supabase = getSupabaseServer();

  const [sectionsRes, metaRes] = await Promise.all([
    supabase
      .from("creier_sections")
      .select("key, order_index, title, content, status")
      .order("order_index", { ascending: true }),
    supabase
      .from("creier_metadata")
      .select("value")
      .eq("key", "creier_metadata")
      .maybeSingle(),
  ]);

  if (sectionsRes.error) {
    throw new Error(
      `Supabase creier_sections: ${sectionsRes.error.message}`
    );
  }

  type DbSection = {
    key: string;
    order_index: number;
    title: string;
    content: unknown;
    status: string;
  };
  const dbSections = (sectionsRes.data ?? []) as DbSection[];
  const byKey = new Map(dbSections.map((s) => [s.key, s]));

  const sections: CreierSection[] = SECTION_DEFINITIONS.map((def) => {
    const row = byKey.get(def.key);
    const status: CreierSection["status"] =
      row?.status === "completed" || row?.status === "draft" || row?.status === "pending"
        ? row.status
        : "pending";
    return {
      ...def,
      status,
      data: row?.content ?? null,
    };
  });

  const metaValue = (metaRes.data?.value ?? {}) as Partial<CreierMetadata>;
  const metadata: CreierMetadata = {
    created: metaValue.created ?? "unknown",
    version: metaValue.version ?? "unknown",
    owner: metaValue.owner ?? "Iordache Claudiu",
    session_status: metaValue.session_status ?? "unknown",
    purpose: metaValue.purpose ?? "",
  };

  return { metadata, sections };
}
