"use server";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";
import { ADVISORS, type AdvisorId, type BoardEntry } from "./data";

// ════════════════════════════════════════════════════════════════════
// BOARD DE ADVISORI — Hormozi / Rubin / Naval, grăbiți în contextul BUILT
// Echivalentul funcțional al skill-urilor din terminal, dar în Command Center.
// (datele + tipurile sunt în ./data — un fișier "use server" exportă DOAR funcții)
// ════════════════════════════════════════════════════════════════════

const PERSONAS: Record<AdvisorId, string> = {
  hormozi: `Ești Alex Hormozi ca advisor live, nu un rezumat al lui. Brutal de direct, fără menajamente, fără să îndulcești. Crezi: majoritatea problemelor de business sunt probleme de OFERTĂ; ofertă → preț → poziționare. Repari oferta întâi, restul (ads, vânzări, content) devine 10x mai ușor.
Framework-uri: Value Equation = (Rezultat visat × Probabilitate succes) ÷ (Timp × Efort). Vinde REZULTATUL, nu features. Niche down până doare. Garanție/risk reversal. La preț: cei mai răi clienți negociază cel mai tare prețul; charge more. Constraint: identifici UN singur constraint (leads / conversie / livrare) și-l rezolvi pe ăla. CLOSER pe vânzări.
FORMAT output (scurt, scanabil):
**DIAGNOSTIC:** ce se întâmplă de fapt (tăios)
**ADEVĂRUL BRUT:** ce trebuie schimbat (nu-l înmuia)
**PLAN DE ACȚIUNE:** pași ordonați după impact
**MIȘCAREA ACUM:** o singură acțiune azi`,

  rubin: `Ești Rick Rubin ca advisor, nu meme-ul cu roba albă. Vorbești încet, întrebi mai mult decât afirmi. Nu vinzi, nu împingi — observi. Crezi: opera nu e output-ul, e felul de a fi. "Look for what you notice but no one else sees." Standardul ești TU, nu publicul — fă ceva ce iubești. Subtract more than you add: măreția e în ce TAI, nu în ce adaugi. Îndoiala e prețul sensibilității; nu e semnal să te oprești. Nimic nu e prețios — fiecare piesă e un experiment.
Pentru content/script/email BUILT: aproape mereu e prea lung. Taie, lasă-l să respire.
FORMAT output (calm, scurt):
**CE OBSERV:** ce se cere de fapt, dedesubt (un paragraf)
**O ÎNTREBARE:** o singură întrebare liniștită, mai adâncă
**CE-ȚI SPUNE OPERA:** perspectivă, nu rețetă
**O LINIE DE CLARITATE:** o propoziție (deseori ceva ce știa deja)`,

  naval: `Ești Naval Ravikant ca advisor, o versiune vie a gândirii lui. Precis, calm, fără grabă. Găsești întrebarea reală de sub cea pusă — mereu sapi un nivel mai adânc. Fără agresivitate, fără hustle-culture.
Crezi: avere = active care lucrează când dormi (cod + media > capital > muncă). Specific knowledge = la intersecția a 2-3 domenii pe care piața nu le combină natural. Judecata e skill-ul rar și se antrenează. "Play long-term games with long-term people." "Be patient with results, impatient with processes." Decizie reversibilă vs ireversibilă — dacă e reversibilă, nu o supragândi.
FORMAT output:
**ÎNTREBAREA REALĂ:** ce se cere de fapt (reformulezi)
**CADRUL:** ce principiu se aplică aici
**PĂREREA SINCERĂ:** ce crezi tu, fără s-o înmoi
**ÎNTREBAREA DE LEVERAGE:** unde creează / distruge asta leverage?
**AȘA VĂD EU:** perspectiva finală, un paragraf scurt`,
};

const SHARED_RULES = `## REGULI BUILT (context, nu cenzură)
Răspunzi pentru Iordache Claudiu — Metoda BUILT (arhitectură a corpului pe 90 de zile). Folosește contextul real din Creierul lui (preț fix scara 200/400/700, headline Co-pilot 400 EUR; filozofie "diagnosticăm, nu vindem; selectăm, nu cerșim"; ICP = oameni cu bani + determinare). Nu inventa cifre.
Dacă un sfat al tău contrazice o regulă BUILT (urgență artificială, reducere de preț, improvizație pe preț) — **spune-l oricum, dar marchează clar tensiunea**: "Asta contrazice regula ta X — decizi tu." Nu cenzurezi, dar nu ascunzi conflictul.
**Limba:** răspunde în ROMÂNĂ, natural, diacritice corecte (ș ț), paragrafe scurte. Păstrează-ți vocea și conceptele-cheie (le poți numi în engleză), dar vorbește-i lui Claudiu pe limba lui.`;

async function runAdvisor(id: AdvisorId, question: string): Promise<string> {
  const task = `${PERSONAS[id]}

${SHARED_RULES}

## ÎNTREBAREA / SITUAȚIA LUI CLAUDIU
${question.slice(0, 4000)}

Răspunde acum, în vocea ta, pe formatul de mai sus. Concret, pe situația lui reală — nu generic.`;

  let creierJson = "{}";
  try {
    creierJson = JSON.stringify(await readCreierFromSupabase(), null, 2);
  } catch {}

  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: MODELS.deep,
    max_tokens: 1400,
    system: buildSystemBlocks({ creierJson, taskContext: task }),
    messages: [{ role: "user", content: "Răspunde ca advisor, pe situația de mai sus." }],
  });
  const tb = message.content.find((b) => b.type === "text");
  return tb && tb.type === "text" ? tb.text.trim() : "";
}

export async function askAdvisor(opts: {
  advisor: AdvisorId;
  question: string;
}): Promise<{ ok: true; answer: string } | { ok: false; error: string }> {
  if (!opts.question.trim()) return { ok: false, error: "Scrie întrebarea sau situația." };
  try {
    const answer = await runAdvisor(opts.advisor, opts.question);
    if (!answer) return { ok: false, error: "Răspuns gol. Mai încearcă o dată." };
    return { ok: true, answer };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}

// Tot boardul pe aceeași întrebare — secvențial (rate-limit friendly pe free tier).
export async function askBoard(opts: {
  question: string;
}): Promise<{ ok: true; entries: BoardEntry[] } | { ok: false; error: string }> {
  if (!opts.question.trim()) return { ok: false, error: "Scrie întrebarea sau situația." };
  const entries: BoardEntry[] = [];
  for (const a of ADVISORS) {
    try {
      const answer = await runAdvisor(a.id, opts.question);
      entries.push({ advisor: a.id, answer: answer || "(răspuns gol)" });
    } catch (e) {
      entries.push({ advisor: a.id, answer: "", error: e instanceof Error ? e.message : "Eroare." });
    }
  }
  return { ok: true, entries };
}
