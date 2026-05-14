"use server";

import { getAnthropicClient, buildSystemBlocks, buildUnifiedContext, MODELS } from "@/lib/anthropic";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatResult =
  | { ok: true; reply: string }
  | { ok: false; error: string };

export async function sendChatMessage(
  messages: ChatMessage[]
): Promise<ChatResult> {
  try {
    const unifiedContext = await buildUnifiedContext();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({
      unifiedContext,
      taskContext: `Ești Creierul BUILT — AI-ul personal al lui Iordache Claudiu, antrenat pe filozofia, metodologia, vocea, profilul live și datele reale ale lui. Ai acces la: Creierul lui Claudiu (fundație), profilul de onboarding completat, clienții activi și conținutul recent generat. Răspunzi la întrebări despre conținut Instagram, DM-uri, clienți, strategie BUILT, apeluri de diagnostic, obiecții. Ești direct, matur, fără clișee. Folosești vocabularul BUILT: sistem, arhitectură, reconstrucție, protocol, piloni, execuție. Scrii în română, paragrafe scurte, bold pe cuvintele de impact.`,
    });

    const response = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 1024,
      system: systemBlocks,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const reply =
      response.content[0]?.type === "text" ? response.content[0].text : "";
    return { ok: true, reply };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return { ok: false, error: message };
  }
}
