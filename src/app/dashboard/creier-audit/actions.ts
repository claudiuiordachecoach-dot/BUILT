"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getAnthropicClient, MODELS, stripLoneSurrogates } from "@/lib/anthropic";

const FACTS_KEY = "_FAPTE_CURENTE_LA_ZI";
const FACTS_SECTION = "section_1_cine_esti";

export interface CreierSectionView {
  key: string;
  title: string;
  preview: string;
  updated_at: string | null;
}

export interface StaleFlag {
  section: string;
  fact: string;
  current_value: string;
  why: string;
  severity: "high" | "medium" | "low";
}

function contentToText(content: unknown): string {
  if (content == null) return "";
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return String(content);
  }
}

export async function getCreierSections(): Promise<CreierSectionView[]> {
  const sb = getSupabaseServer();
  const { data, error } = await sb
    .from("creier_sections")
    .select("key, title, content, updated_at, order_index")
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((s) => ({
    key: s.key,
    title: s.title,
    preview: contentToText(s.content).replace(/\s+/g, " ").slice(0, 220),
    updated_at: s.updated_at,
  }));
}

export async function getCurrentFacts(): Promise<string> {
  const sb = getSupabaseServer();
  const { data } = await sb
    .from("creier_sections")
    .select("content")
    .eq("key", FACTS_SECTION)
    .single();
  const content = data?.content;
  if (content && typeof content === "object" && !Array.isArray(content)) {
    const v = (content as Record<string, unknown>)[FACTS_KEY];
    return typeof v === "string" ? v : "";
  }
  return "";
}

export async function updateCurrentFacts(
  text: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = getSupabaseServer();
  const { data, error: readErr } = await sb
    .from("creier_sections")
    .select("content")
    .eq("key", FACTS_SECTION)
    .single();
  if (readErr) return { ok: false, error: readErr.message };

  const base =
    data?.content && typeof data.content === "object" && !Array.isArray(data.content)
      ? (data.content as Record<string, unknown>)
      : {};
  const value = text.trim()
    ? `ACESTEA SUNT FAPTELE CURENTE LA ZI ale lui Claudiu/BUILT. Unde contrazic orice altă secțiune din Creier, ELE CÂȘTIGĂ. Folosește-le ca sursă de adevăr pentru numere, ofertă, stadiu, dovezi:\n${text.trim()}`
    : "";

  const updated = { ...base, [FACTS_KEY]: value };
  const { error } = await sb
    .from("creier_sections")
    .update({ content: updated, updated_at: new Date().toISOString() })
    .eq("key", FACTS_SECTION);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/creier-audit");
  return { ok: true };
}

export async function auditCreier(): Promise<
  { ok: true; data: StaleFlag[] } | { ok: false; error: string }
> {
  const sb = getSupabaseServer();
  const { data: sections, error } = await sb
    .from("creier_sections")
    .select("key, title, content")
    .order("order_index", { ascending: true });
  if (error) return { ok: false, error: error.message };

  const today = new Date().toISOString().slice(0, 10);
  const dump = (sections ?? [])
    .map((s) => `### ${s.title} [${s.key}]\n${contentToText(s.content).slice(0, 2500)}`)
    .join("\n\n");

  const task = stripLoneSurrogates(`# TASK: Audit de prospețime al Creierului BUILT
Azi e ${today}. Scanează contextul de mai jos și identifică FAPTELE care par ÎNVECHITE sau perisabile (se schimbă în timp) și ar trebui verificate de Claudiu.
Țintește: numere (followeri, clienți, kg, vârstă, reach), prețuri/ofertă, date/termene, stadiul business-ului, dovezi sociale concrete, orice afirmație factuală care îmbătrânește.
NU flaga: filozofia, vocea, povestea personală, principiile, liniile roșii (alea sunt stabile).
NU inventa. Dacă nu pari sigur că un fapt e perisabil, nu-l include.

## CONTEXT (Creierul, pe secțiuni)
${dump}

## Format JSON STRICT (fără markdown, fără text înainte/după):
{"flags":[{"section":"titlul secțiunii","fact":"ce fapt anume","current_value":"valoarea exactă din Creier acum","why":"de ce pare învechit/perisabil","severity":"high|medium|low"}]}
Ordonează după severity (high întâi). Maxim 18 flag-uri, cele mai importante.`);

  try {
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: MODELS.deep,
      max_tokens: 3000,
      system: [
        {
          type: "text",
          text: "Ești un auditor rece și precis. Identifici doar fapte verificabile care îmbătrânesc, nu opinii sau stil. Răspunzi exclusiv în JSON valid.",
        },
      ],
      messages: [{ role: "user", content: task }],
    });
    const tb = message.content.find((b) => b.type === "text");
    if (!tb || tb.type !== "text") return { ok: false, error: "Răspuns gol." };
    const t = tb.text.trim();
    const a = t.indexOf("{");
    const b = t.lastIndexOf("}");
    if (a === -1 || b <= a) return { ok: false, error: "JSON invalid." };
    const parsed = JSON.parse(t.slice(a, b + 1)) as { flags: StaleFlag[] };
    return { ok: true, data: parsed.flags ?? [] };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}
