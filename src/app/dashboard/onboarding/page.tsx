"use client";

import { useState, useEffect, useTransition } from "react";
import {
  saveOnboarding,
  loadOnboarding,
  generateAiSummary,
  type OnboardingData,
  type AiSummary,
} from "./actions";

const EMPTY: OnboardingData = {
  full_name: "", age: "", location: "", experience_years: "",
  coaching_since: "", instagram_handle: "", current_monthly_revenue: "",
  revenue_goal_90_days: "", revenue_goal_12_months: "", followers_now: "",
  followers_goal_90_days: "", niche: "", transformation_promise: "",
  three_words: "", built_personal_meaning: "", life_outside_fitness: "",
  typical_day_now: "", proudest_achievement: "", biggest_personal_weakness: "",
  how_people_describe_you: "",
  content_formats: "", posting_frequency: "", best_performing_content: "",
  content_topics: "", tone_of_voice: "", content_that_failed: "",
  best_hook_ever: "", favourite_topic: "", avoided_topic: "",
  content_inspiration_source: "", creator_you_admire: "",
  content_creation_process: "", biggest_content_win: "", content_goal_next_90_days: "",
  client_pain_1: "", client_pain_2: "", client_pain_3: "",
  client_tried_before: "", client_objection_1: "", client_objection_2: "",
  client_objection_3: "", why_client_stays: "", why_client_quits: "",
  client_transformation_story: "", client_age_range: "", client_income_level: "",
  client_daily_struggle: "", client_secret_desire: "", client_before_after: "",
  offer_30_sec_pitch: "", why_500_eur: "", offer_what_included: "",
  offer_what_not_included: "", hardest_part_of_call: "", price_objection_response: "",
  best_dm_opener: "", qualify_or_disqualify: "", follow_up_strategy: "",
  close_rate_estimate: "", what_makes_client_say_yes: "", what_makes_client_say_no: "",
  biggest_challenge: "", what_tried: "", bottleneck: "",
  fear_about_content: "", why_not_growing: "", biggest_frustration: "",
  biggest_time_waster: "", task_you_hate: "", last_major_doubt: "",
  recurring_negative_thought: "", imposter_syndrome_trigger: "", comparison_trap: "",
  ideal_outcome_90_days: "", ideal_client: "", dream_day: "",
  income_goal_why: "", what_success_looks_like: "",
  philosophy: "", differentiator: "", things_disagree_with: "", controversial_take: "",
  morning_routine: "", how_handle_failure: "", motivation_vs_discipline: "",
  biggest_mindset_shift: "", book_that_changed_you: "", mentor_or_model: "",
  built_in_3_years: "", impact_on_romanian_fitness: "", legacy_you_want: "",
  if_money_not_issue: "", why_this_work_matters: "", world_without_built: "",
  values_non_negotiable: "", what_would_stop_you: "",
  origin_story: "", biggest_transformation: "", credibility: "",
  defining_moment: "", failure_story: "", why_this_niche: "",
  darkest_moment: "", turning_point: "", first_client_story: "",
  moment_you_almost_quit: "", unexpected_lesson: "",
};

type FieldDef = {
  key: keyof OnboardingData;
  label: string;
  placeholder: string;
  textarea?: boolean;
};

type SectionDef = {
  id: string;
  num: number;
  title: string;
  description: string;
  fields: FieldDef[];
};

const SECTIONS: SectionDef[] = [
  {
    id: "who_you_are", num: 1,
    title: "Cine Ești",
    description: "Bazele. Spune-ne despre tine ca persoană, nu doar ca coach.",
    fields: [
      { key: "full_name", label: "Nume complet", placeholder: "Iordache Claudiu" },
      { key: "age", label: "Vârstă", placeholder: "25" },
      { key: "location", label: "Unde ești bazat", placeholder: "Botoșani, România" },
      { key: "experience_years", label: "Ani de experiență în fitness", placeholder: "7" },
      { key: "coaching_since", label: "De când faci coaching online", placeholder: "2023" },
      { key: "instagram_handle", label: "Handle Instagram", placeholder: "@iordacheclaudiu_" },
      { key: "current_monthly_revenue", label: "Revenue actual/lună (EUR)", placeholder: "900" },
      { key: "revenue_goal_90_days", label: "Revenue goal în 90 zile (EUR/lună)", placeholder: "2500" },
      { key: "revenue_goal_12_months", label: "Revenue goal în 12 luni (EUR/lună)", placeholder: "5000" },
      { key: "followers_now", label: "Followeri actuali", placeholder: "2780" },
      { key: "followers_goal_90_days", label: "Followeri goal în 90 zile", placeholder: "5000" },
      { key: "niche", label: "Nișa ta în 1 propoziție", placeholder: "Reconstrucție corporală pentru bărbați ocupați 28-42 ani" },
      { key: "transformation_promise", label: "Promisiunea ta de transformare", placeholder: "90 zile. Corp reconstruit. Sistem predictibil.", textarea: true },
      { key: "three_words", label: "Descrie-te în 3 cuvinte", placeholder: "Direct. Structural. Autentic." },
      { key: "built_personal_meaning", label: "Ce înseamnă BUILT pentru tine la nivel personal", placeholder: "E dovada că poți reconstrui orice dacă ai un sistem.", textarea: true },
      { key: "life_outside_fitness", label: "Ce faci în afara fitness-ului", placeholder: "Citesc, ascult podcasturi, stau cu familia, alerg dimineața" },
      { key: "typical_day_now", label: "Cum arată o zi normală a ta acum", placeholder: "Trezit 6:30, antrenament, conținut 3h, DM-uri, seară cu familia", textarea: true },
      { key: "proudest_achievement", label: "Realizarea de care ești cel mai mândru (în afara fitness-ului)", placeholder: "Am depășit bâlbâiala și vorbesc în public fără frică" },
      { key: "biggest_personal_weakness", label: "Cea mai mare slăbiciune a ta ca om", placeholder: "Tind să izoleze când sunt stresat. Nu cer ajutor ușor." },
      { key: "how_people_describe_you", label: "Cum te descriu oamenii care te cunosc bine", placeholder: "Serios, consecvent, uneori prea dur cu ei înșiși" },
    ],
  },
  {
    id: "your_content", num: 2,
    title: "Conținutul Tău",
    description: "Cum creezi acum și ce a funcționat.",
    fields: [
      { key: "content_formats", label: "Formate principale", placeholder: "Talking Head, Rant, Tutorial" },
      { key: "posting_frequency", label: "Frecvența postărilor actuale", placeholder: "4-5 reels/săptămână" },
      { key: "best_performing_content", label: "Cel mai bun conținut de până acum (descrie)", placeholder: "Reelul despre cortizol — 14k views", textarea: true },
      { key: "content_topics", label: "Topicele principale despre care postezi", placeholder: "Cortizol, nutriție simplă, mindset, dovezi clienți", textarea: true },
      { key: "tone_of_voice", label: "Tonul tău — cum ești tu autentic", placeholder: "Direct, matur, fără clișee, empatic cu situația dar tăios cu scuzele" },
      { key: "content_that_failed", label: "Ce tip de conținut nu a funcționat", placeholder: "Reels cu animații și CapCut templates — prea fabricat", textarea: true },
      { key: "best_hook_ever", label: "Cel mai bun hook pe care l-ai folosit vreodată", placeholder: "\"Dacă faci cardio în fiecare zi și tot nu slăbești, ăsta e motivul\"" },
      { key: "favourite_topic", label: "Subiectul care te pasionează cel mai mult", placeholder: "Psihologia identității și de ce oamenii sabotează propriul progres" },
      { key: "avoided_topic", label: "Subiectul pe care îl eviți și de ce", placeholder: "Nutriție detaliată — mi-e teamă că intru în bro-science" },
      { key: "content_inspiration_source", label: "De unde îți vine inspirația pentru conținut", placeholder: "Din conversațiile cu clienții, din propriile antrenamente, din cărți" },
      { key: "creator_you_admire", label: "Un creator pe care îl admiri și de ce", placeholder: "Alex Hormozi — claritate extremă, fără bullshit, educație reală" },
      { key: "content_creation_process", label: "Cum creezi un reel — procesul tău real", placeholder: "Mă gândesc la o problemă reală, scriu hook-ul, filmez brut, editez 20min", textarea: true },
      { key: "biggest_content_win", label: "Cea mai mare victorie a ta pe conținut până acum", placeholder: "Reelul cu cortizolul — 900k reach, 3 clienți noi direct din el" },
      { key: "content_goal_next_90_days", label: "Ce vrei să obții prin conținut în următoarele 90 zile", placeholder: "5 clienți noi direct din conținut organic, 2K followeri noi" },
    ],
  },
  {
    id: "ideal_client", num: 3,
    title: "Clientul Ideal",
    description: "Cu cât știi mai exact cine e clientul tău, cu atât conținutul și DM-urile convertesc mai bine.",
    fields: [
      { key: "client_pain_1", label: "Durerea #1 a clientului tău (cea mai adâncă)", placeholder: "Se simte invizibil. Reușește la serviciu dar nu și în corp. Asta îl doare cel mai tare.", textarea: true },
      { key: "client_pain_2", label: "Durerea #2 — frustrarea practică", placeholder: "A mai încercat diete, săli, programe. Nimic nu a ținut. Crede că e problema lui.", textarea: true },
      { key: "client_pain_3", label: "Durerea #3 — impactul în viața de zi cu zi", placeholder: "Energie scăzută, libido scăzut, relație tensionată, haine care nu mai merg", textarea: true },
      { key: "client_tried_before", label: "Ce a mai încercat clientul înainte să ajungă la tine", placeholder: "Dieta keto, antrenor la sală fără plan real, aplicații de fitness, YouTube random" },
      { key: "client_objection_1", label: "Obiecția #1 pe care o auzi cel mai des", placeholder: "\"E prea scump pentru mine acum\"" },
      { key: "client_objection_2", label: "Obiecția #2", placeholder: "\"Nu am timp să urmez un program structurat\"" },
      { key: "client_objection_3", label: "Obiecția #3", placeholder: "\"Vreau să mai stau pe gânduri\"" },
      { key: "why_client_stays", label: "De ce rămâne clientul în program", placeholder: "Vede rezultate în primele 2 săptămâni. Se simte ascultat. Are un sistem clar.", textarea: true },
      { key: "why_client_quits", label: "De ce renunță un client (dacă se întâmplă)", placeholder: "Suprasolicitare la serviciu, expectative nerealiste, lipsă de comunicare din partea lui" },
      { key: "client_transformation_story", label: "Povestea de transformare a unui client real (concret)", placeholder: "Alex, 39 ani, PM IT. -8kg în 11 săptămâni. Acum doarme mai bine și are energie pentru familie.", textarea: true },
      { key: "client_age_range", label: "Vârsta exactă a clientului ideal", placeholder: "30-40 ani, cu vârf la 34-38" },
      { key: "client_income_level", label: "Nivelul de venit al clientului ideal", placeholder: "3000-6000 EUR/lună net. Are bani, nu are timp să-i cheltuiască pe sănătate." },
      { key: "client_daily_struggle", label: "Cu ce se luptă zilnic clientul tău (înainte de BUILT)", placeholder: "Se trezește obosit, mănâncă haotic, nu face mișcare sistematic, seara mănâncă în exces", textarea: true },
      { key: "client_secret_desire", label: "Ce vrea clientul tău cu adevărat (dincolo de kilograme)", placeholder: "Vrea să se uite în oglindă și să se recunoască. Vrea energia de la 25 de ani. Vrea respect de sine.", textarea: true },
      { key: "client_before_after", label: "Cum arată viața clientului ÎNAINTE și DUPĂ BUILT", placeholder: "Înainte: obosit, burtos, rușinat. După: structurat, energic, prezent pentru familie.", textarea: true },
    ],
  },
  {
    id: "offer_sales", num: 4,
    title: "Oferta & Vânzare",
    description: "Claritatea ofertei și procesul de vânzare. Cu cât e mai clar în capul tău, cu atât convertești mai ușor.",
    fields: [
      { key: "offer_30_sec_pitch", label: "Pitchul ofertei în 30 de secunde", placeholder: "90 zile, sistem complet: antrenament, nutriție, psihologie. Nu dietă. Nu motivație. Arhitectură.", textarea: true },
      { key: "why_500_eur", label: "De ce 500 EUR și nu 300 sau 800", placeholder: "500 EUR = serios dar accesibil pentru cineva cu venituri de 3K+. Sub asta nu e luat serios.", textarea: true },
      { key: "offer_what_included", label: "Ce include exact programul BUILT", placeholder: "Plan antrenament personalizat, plan nutrițional, check-in săptămânal, DM direct, grup privat", textarea: true },
      { key: "offer_what_not_included", label: "Ce NU include (limite clare)", placeholder: "Nu fac antrenament în persoană. Nu ofer planuri de câte 2 săptămâni. Nu lucrez cu oricine.", textarea: true },
      { key: "hardest_part_of_call", label: "Cel mai dificil moment dintr-un apel de diagnostic", placeholder: "Când simt că persoana vrea să fie convinsă dar eu refuz să conving", textarea: true },
      { key: "price_objection_response", label: "Cum răspunzi la \"e prea scump\"", placeholder: "\"Față de ce? Față de ce costă să rămâi exact unde ești acum?\"", textarea: true },
      { key: "best_dm_opener", label: "Cel mai bun mesaj de deschidere DM care a funcționat", placeholder: "\"Ce te-a făcut să comentezi chiar azi?\" — simplu, direct, forțează verbalizarea", textarea: true },
      { key: "qualify_or_disqualify", label: "Cum califici sau descalifici un prospect în primele 3 mesaje", placeholder: "Dacă nu răspunde cu detalii sau dacă vrea ceva ieftin — nu mai continuăm", textarea: true },
      { key: "follow_up_strategy", label: "Strategia ta de follow-up", placeholder: "O singură dată, la 24-48h. Dacă nu răspunde — nu mai contact. Selectăm, nu cerșim.", textarea: true },
      { key: "close_rate_estimate", label: "Rata de conversie estimată (apeluri → clienți)", placeholder: "1 din 3 apeluri devine client. Vreau să ajung la 1 din 2." },
      { key: "what_makes_client_say_yes", label: "Ce anume îl face pe client să spună DA", placeholder: "Când simte că îl înțeleg exact și că am văzut situația lui la alții înainte", textarea: true },
      { key: "what_makes_client_say_no", label: "Ce anume îl face să spună NU sau să amâne", placeholder: "Când simte că îl vând și nu îl diagnostichez. Când nu e pregătit să se schimbe real.", textarea: true },
    ],
  },
  {
    id: "where_stuck", num: 5,
    title: "Unde Te Blochezi",
    description: "Fii sincer. Cu cât mai mult detaliu, cu atât mai bine te pot ajuta.",
    fields: [
      { key: "biggest_challenge", label: "Cel mai mare obstacol acum", placeholder: "Conversie din DM în call", textarea: true },
      { key: "what_tried", label: "Ce ai încercat și nu a funcționat", placeholder: "Cold DM, reduceri de preț, postare zilnică fără strategie", textarea: true },
      { key: "bottleneck", label: "Unde se blochează lucrurile", placeholder: "Oamenii comentează dar nu intră în DM" },
      { key: "fear_about_content", label: "Ce te blochează cel mai mult la conținut", placeholder: "Frica de cameră, nu știu dacă am ceva valoros de spus" },
      { key: "why_not_growing", label: "De ce crezi că nu crești mai repede", placeholder: "Nu am sistem, postez random, nu calific audiența", textarea: true },
      { key: "biggest_frustration", label: "Cea mai mare frustrare a ta acum", placeholder: "Mă compar cu alții care au mai puțini ani dar mai mulți clienți", textarea: true },
      { key: "biggest_time_waster", label: "Ce îți ia cel mai mult timp inutil", placeholder: "Editare video, răspunsuri la DM-uri fără calificare, research fără execuție" },
      { key: "task_you_hate", label: "Task-ul pe care îl urăști cel mai mult", placeholder: "Editare video. Îmi ia 2 ore pentru ceva ce ar trebui să dureze 30 minute." },
      { key: "last_major_doubt", label: "Ultimul moment major de îndoială despre BUILT", placeholder: "Acum 3 luni când nu am închis niciun client în 6 săptămâni" },
      { key: "recurring_negative_thought", label: "Gândul negativ recurent cu care te lupți", placeholder: "\"Poate nu sunt suficient de bun. Poate alții știu mai mult.\"" },
      { key: "imposter_syndrome_trigger", label: "Ce anume declanșează sindromul impostorului la tine", placeholder: "Când văd pe cineva mai tânăr cu mai mulți clienți. Sau când un prospect mă respinge." },
      { key: "comparison_trap", label: "Cu cine te compari cel mai des și de ce", placeholder: "Cu alți coaches români cu audiențe mari. Știu că nu ar trebui, dar se întâmplă." },
    ],
  },
  {
    id: "what_you_want", num: 6,
    title: "Ce Vrei",
    description: "Fii specific. Obiectivele vagi produc rezultate vagi.",
    fields: [
      { key: "ideal_outcome_90_days", label: "Cum arată ziua ta ideală în 90 de zile", placeholder: "10 clienți activi la 500 EUR, 2 ore de muncă/zi, sistem care rulează fără mine", textarea: true },
      { key: "ideal_client", label: "Descrie clientul ideal", placeholder: "Bărbat 30-40 ani, IT, familie, 15+ kg de dat jos, bani dar fără timp", textarea: true },
      { key: "dream_day", label: "Cum arată ziua ta perfectă (viitor)", placeholder: "Mă trezesc la 7, antrenament 1h, 3 ore pe sistemul BUILT, după-amiaza liberă" },
      { key: "income_goal_why", label: "De ce vrei acel revenue goal", placeholder: "Înseamnă libertate. Să nu depind de nimeni." },
      { key: "what_success_looks_like", label: "Cum știi că ai reușit — indicator concret", placeholder: "Când primul client mă sună și îmi zice că și-a schimbat viața", textarea: true },
    ],
  },
  {
    id: "mindset_opinions", num: 7,
    title: "Mindset & Opinii",
    description: "Perspectivele tale. Ce crezi tu. Asta diferențiază conținutul tău.",
    fields: [
      { key: "philosophy", label: "Filozofia ta despre fitness (2-3 propoziții)", placeholder: "Eșecul nu vine din lipsă de voință — vine din lipsă de sistem.", textarea: true },
      { key: "differentiator", label: "Ce face BUILT diferit de orice alt program", placeholder: "Nu vindem motivație. Vindem arhitectură.", textarea: true },
      { key: "things_disagree_with", label: "Cu ce nu ești de acord în industria fitness", placeholder: "Cardio excesiv, deficit agresiv, motivație fără sistem", textarea: true },
      { key: "controversial_take", label: "Cea mai controversată opinie a ta", placeholder: "Dacă mai dai o dietă unui om fără să-i schimbi identitatea, îl faci rău", textarea: true },
      { key: "morning_routine", label: "Rutina ta de dimineață", placeholder: "Trezit 6:30, apă, 10min meditație sau lectură, antrenament, mic-dejun proteic" },
      { key: "how_handle_failure", label: "Cum gestionezi eșecul", placeholder: "Stau cu el o zi, îl analizez, extrag lecția, continui. Nu dramatizez." },
      { key: "motivation_vs_discipline", label: "Motivație vs. disciplină — perspectiva ta", placeholder: "Motivația e un glitch. Disciplina e un sistem. Construiești sisteme, nu aștepți motivație.", textarea: true },
      { key: "biggest_mindset_shift", label: "Cel mai mare shift de mentalitate din viața ta", placeholder: "Când am înțeles că identitatea precede comportamentul. Nu faci lucruri ca să devii — devii ca să faci.", textarea: true },
      { key: "book_that_changed_you", label: "Cartea care te-a schimbat cel mai mult", placeholder: "Atomic Habits — mi-a arătat că sistemele bat voința" },
      { key: "mentor_or_model", label: "Mentorul sau modelul tău (real sau teoretic)", placeholder: "Alex Hormozi pentru business. Goggins pentru mentalitate. Tatăl meu pentru caracter." },
    ],
  },
  {
    id: "vision_mission", num: 8,
    title: "Viziune & Misiune",
    description: "Unde mergi și de ce contează. Asta face conținutul să aibă greutate.",
    fields: [
      { key: "built_in_3_years", label: "Unde vrei să fie BUILT în 3 ani", placeholder: "50 de clienți simultan, curs online cu 500 de membri, podcast cu 10K asculuri/episod", textarea: true },
      { key: "impact_on_romanian_fitness", label: "Ce impact vrei să ai în fitness-ul românesc", placeholder: "Să schimb conversația de la dietă și cardio la sistem și identitate. Să fiu referința.", textarea: true },
      { key: "legacy_you_want", label: "Ce legacy vrei să lași", placeholder: "Că am dovedit că un om din Botoșani, cu bâlbâială și fără resurse, poate construi ceva real.", textarea: true },
      { key: "if_money_not_issue", label: "Ce ai face dacă banii nu ar fi o problemă", placeholder: "Exact ce fac acum, dar cu mai multă liniște și mai mult timp pentru familie și antrenamente" },
      { key: "why_this_work_matters", label: "De ce munca asta contează cu adevărat", placeholder: "Pentru că există mii de bărbați care au uitat de ei înșiși și cred că nu mai e cale înapoi.", textarea: true },
      { key: "world_without_built", label: "Cum ar arăta lumea fără BUILT", placeholder: "Oamenii continuă să cumpere diete, să eșueze, să se învinovățească. Ciclul continuă." },
      { key: "values_non_negotiable", label: "Valorile tale non-negociabile", placeholder: "Autenticitate, sistem, rezultate reale, respect față de client, fără bullshit" },
      { key: "what_would_stop_you", label: "Ce anume te-ar putea opri (și cum îl gestionezi)", placeholder: "Burnout-ul. Îl gestionez prin granițe clare și prin a nu lucra cu oricine." },
    ],
  },
  {
    id: "your_story", num: 9,
    title: "Povestea Ta",
    description: "Originea ta, dovezile tale, credibilitatea ta. Alimentează fiecare script.",
    fields: [
      { key: "origin_story", label: "Povestea ta de origine", placeholder: "Am ajuns la 120kg, bâlbâit, fără identitate. Sportul m-a reconstruit.", textarea: true },
      { key: "biggest_transformation", label: "Cea mai mare transformare a ta", placeholder: "Am slăbit 40kg și am ajuns vicecampion național la atletism", textarea: true },
      { key: "credibility", label: "Dovezi de credibilitate (titluri, ani, clienți, rezultate)", placeholder: "7 ani experiență, hibrid athlete, Alex -8kg în 11 săptămâni", textarea: true },
      { key: "defining_moment", label: "Momentul care te-a definit ca coach", placeholder: "Prima dată când un client m-a sunat plângând că și-a schimbat viața" },
      { key: "failure_story", label: "O eșuare majoră din care ai învățat", placeholder: "Am pierdut primul client pentru că nu aveam sistem de retenție.", textarea: true },
      { key: "why_this_niche", label: "De ce bărbați 28-42 ani și nu altă nișă", placeholder: "Sunt eu acum 5 ani. Știu exact ce doare. Știu exact ce funcționează.", textarea: true },
      { key: "darkest_moment", label: "Cel mai greu moment din viața ta", placeholder: "Când la 18 ani nu puteam vorbi în public fără să bâlbâi și credeam că nu merit nimic.", textarea: true },
      { key: "turning_point", label: "Momentul de cotitură — când totul s-a schimbat", placeholder: "Prima cursă câștigată la atletism. Am înțeles că sistemul bate orice limitare.", textarea: true },
      { key: "first_client_story", label: "Povestea primului tău client online", placeholder: "Era un IT-ist din Cluj. Mi-a scris la 2 noaptea că nu mai poate cu burta aia. Am știut că pot să-l ajut.", textarea: true },
      { key: "moment_you_almost_quit", label: "Momentul în care ai vrut să renunți la coaching", placeholder: "După 3 luni fără niciun client. M-am întrebat serios dacă am ales bine.", textarea: true },
      { key: "unexpected_lesson", label: "Cea mai neașteptată lecție pe care ai primit-o", placeholder: "Că clienții nu caută un coach. Caută pe cineva care îi înțelege cu adevărat.", textarea: true },
    ],
  },
];

const TOTAL_FIELDS = SECTIONS.reduce((sum, s) => sum + s.fields.length, 0);

export default function OnboardingPage() {
  const [data, setData] = useState<OnboardingData>(EMPTY);
  const [openSection, setOpenSection] = useState<string>("who_you_are");
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, startTransition] = useTransition();

  useEffect(() => {
    loadOnboarding().then((saved) => {
      if (saved && Object.keys(saved).length > 0) {
        setData((prev) => ({ ...prev, ...saved }));
        const rec = saved as Record<string, string>;
        if (rec.ai_niche_summary) {
          setAiSummary({
            niche: rec.ai_niche_summary ?? "",
            ideal_client: rec.ai_ideal_client_summary ?? "",
          });
        }
      }
    });
  }, []);

  const filledCount = Object.values(data).filter((v) => String(v ?? "").trim().length > 0).length;
  const progressPct = Math.round((filledCount / TOTAL_FIELDS) * 100);

  const handleField = (key: keyof OnboardingData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaveStatus("saving");
    startTransition(async () => {
      const result = await saveOnboarding(data);
      setSaveStatus(result.error ? "error" : "saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    });
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    const result = await generateAiSummary(data);
    if (result.ok) setAiSummary(result.summary);
    setSummaryLoading(false);
  };

  const saveBtnLabel =
    saveStatus === "saving" ? "Se salvează..." :
    saveStatus === "saved" ? "✓ Salvat cu succes" :
    saveStatus === "error" ? "Eroare — încearcă din nou" :
    "Salvează & Actualizează AI-ul";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header — William Scott style */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-1">Onboarding Hub</h1>
        <p className="text-[13px] text-zinc-500 mb-3">
          Cu cât completezi mai mult, cu atât AI-ul tău devine mai precis. Revino oricând să actualizezi.
        </p>
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-built-red rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[12px] text-zinc-500 whitespace-nowrap shrink-0 font-mono">
            {filledCount} câmpuri completate — <strong className="text-zinc-300">{progressPct}%</strong>
          </span>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saveStatus === "saving"}
        className="w-full py-3 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-colors mb-8 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        {saveBtnLabel}
      </button>

      {/* AI Personalized Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">AI Personalizat</span>
          <button
            onClick={handleGenerateSummary}
            disabled={summaryLoading}
            className="text-[11px] text-zinc-400 hover:text-zinc-100 border border-white/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
          >
            {summaryLoading ? "Se generează..." : "↺ Regenerează"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-4">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Niche</p>
            {aiSummary ? (
              <p className="text-sm text-zinc-300 leading-relaxed">{aiSummary.niche}</p>
            ) : (
              <p className="text-sm text-zinc-600">Completează câmpurile de mai jos și apasă Regenerează.</p>
            )}
          </div>
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-4">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Client Ideal</p>
            {aiSummary ? (
              <p className="text-sm text-zinc-300 leading-relaxed">{aiSummary.ideal_client}</p>
            ) : (
              <p className="text-sm text-zinc-600">Completează câmpurile de mai jos și apasă Regenerează.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sections Accordion */}
      <div className="space-y-2">
        {SECTIONS.map((section) => {
          const filled = section.fields.filter((f) => String(data[f.key] ?? "").trim().length > 0).length;
          const isOpen = openSection === section.id;
          const allFilled = filled === section.fields.length;
          return (
            <div key={section.id} className="bg-[#111] border border-white/[0.08] rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors text-left"
                onClick={() => setOpenSection(isOpen ? "" : section.id)}
              >
                <span className="w-6 h-6 rounded-full bg-white/10 text-zinc-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                  {section.num}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-zinc-200 font-medium">{section.title}</span>
                    <span className="text-[11px] text-zinc-600">
                      {`${filled}/${section.fields.length} completate`}
                    </span>
                  </div>
                </div>
                <span className={`text-zinc-500 text-lg leading-none transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-white/[0.08] pt-4">
                  {section.fields.map((field) =>
                    field.textarea ? (
                      <div key={field.key}>
                        <label className="block text-[11px] text-zinc-500 mb-1.5 font-medium">{field.label}</label>
                        <textarea
                          value={data[field.key]}
                          onChange={(e) => handleField(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-white/20 resize-none transition-colors"
                        />
                      </div>
                    ) : (
                      <div key={field.key}>
                        <label className="block text-[11px] text-zinc-500 mb-1.5 font-medium">{field.label}</label>
                        <input
                          type="text"
                          value={data[field.key]}
                          onChange={(e) => handleField(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-white/20 transition-colors"
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save button bottom */}
      <button
        onClick={handleSave}
        disabled={saveStatus === "saving"}
        className="w-full py-3 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-colors mt-6 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        {saveBtnLabel}
      </button>
    </div>
  );
}
