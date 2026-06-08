// Schema Fișei de Start — sursă unică, folosită de formular ȘI de panoul admin.
export type IntakeFieldType = "text" | "number" | "textarea";

export interface IntakeField {
  key: string;
  label: string;
  type: IntakeFieldType;
  placeholder?: string;
}

export interface IntakeGroup {
  title: string;
  /** secțiunea de content — muniție de marketing */
  accent?: boolean;
  fields: IntakeField[];
}

export const INTAKE_GROUPS: IntakeGroup[] = [
  {
    title: "Corpul acum",
    fields: [
      { key: "greutate", label: "Greutate actuală (kg)", type: "number", placeholder: "ex: 78" },
      { key: "inaltime", label: "Înălțime (cm)", type: "number", placeholder: "ex: 172" },
      { key: "talie", label: "Talie (cm)", type: "number", placeholder: "cu metru de croitorie" },
      { key: "sold", label: "Șold (cm)", type: "number", placeholder: "cu metru de croitorie" },
      { key: "brat", label: "Braț (cm)", type: "number", placeholder: "cu metru de croitorie" },
      { key: "analize", label: "Analize recente", type: "textarea", placeholder: "Scrie ce ai sau „am poză, o trimit pe WhatsApp”." },
      { key: "medical", label: "Condiții medicale / operații / medicație / status hormonal", type: "textarea", placeholder: "Tot ce contează — sau „nimic”." },
    ],
  },
  {
    title: "Mâncare & viața reală",
    fields: [
      { key: "alimente_iubite", label: "Alimente la care NU vrei să renunți", type: "textarea", placeholder: "Pe alea le integrez în plan." },
      { key: "alergii", label: "Alergii / ce nu-ți priește", type: "text", placeholder: "Scrie „nimic” dacă e cazul." },
      { key: "mese", label: "Câte mese pe zi + mănânci acasă sau pe fugă?", type: "text", placeholder: "ex: 3 mese, mai mult pe fugă" },
      { key: "zi_normala", label: "Cum arată o zi normală (program, ture, familie)", type: "textarea", placeholder: "Ca să integrăm planul în viața ta reală." },
    ],
  },
  {
    title: "Antrenament",
    fields: [
      { key: "experienta", label: "Experiența ta cu antrenamentul", type: "textarea", placeholder: "De la zero / am mai făcut / sunt constant(ă)." },
      { key: "unde_antrenez", label: "Unde te antrenezi + ce echipament ai", type: "text", placeholder: "ex: sală / acasă cu gantere" },
      { key: "zile_timp", label: "Câte zile/săptămână realist + cât timp/ședință", type: "text", placeholder: "ex: 3 zile, 40 min" },
      { key: "accidentari", label: "Accidentări / dureri / zone sensibile", type: "text", placeholder: "Scrie „nimic” dacă e cazul." },
    ],
  },
  {
    title: "De ce de data asta",
    fields: [
      { key: "incercat_inainte", label: "Ce ai încercat înainte și nu a mers", type: "textarea", placeholder: "Sincer — fără asta repetăm greșeala." },
      { key: "obiectiv_90", label: "Obiectivul real la 90 de zile", type: "textarea", placeholder: "Concret. Nu „să slăbesc”." },
    ],
  },
  {
    title: "Ultimele întrebări",
    accent: true,
    fields: [
      { key: "de_ce_acum", label: "De ce ai zis DA acum, concret?", type: "textarea" },
      { key: "ce_postare", label: "Ce postare / ce am spus te-a făcut să-mi scrii?", type: "textarea" },
      { key: "moment_declic", label: "Momentul în care ți-ai zis „gata, trebuie să schimb ceva”", type: "textarea" },
      { key: "cum_te_simti", label: "Cum te simți în corpul tău acum, sincer?", type: "textarea" },
      { key: "ce_te_a_oprit", label: "Ce te-a oprit până acum să începi?", type: "textarea" },
      { key: "ce_se_schimba", label: "Ce se schimbă în viața ta dacă reușești în 90 de zile?", type: "textarea" },
      { key: "de_ce_incredere", label: "Ce te-a făcut să ai încredere în mine?", type: "textarea" },
      { key: "ce_le_ai_spune", label: "Ce le-ai spune celor care ezită să lucreze cu mine?", type: "textarea" },
    ],
  },
];

export const ALL_INTAKE_FIELDS: IntakeField[] = INTAKE_GROUPS.flatMap((g) => g.fields);
