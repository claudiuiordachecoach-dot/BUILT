"use server";

import { getAnthropicClient, buildSystemBlocks, MODELS } from "@/lib/anthropic";
import { readCreierFromFile } from "@/lib/creier";

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
    const creier = await readCreierFromFile();
    const creierJson = JSON.stringify(creier, null, 2);

    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({
      creierJson,
      taskContext: `Ești Creierul BUILT — AI-ul personal al lui Iordache Claudiu, antrenat pe filozofia, metodologia și vocea lui. Răspunzi la întrebări despre conținut Instagram, DM-uri, clienți, strategie BUILT, apeluri de diagnostic, obiecții. Ești direct, matur, fără clișee. Folosești vocabularul BUILT: sistem, arhitectură, reconstrucție, protocol, piloni, execuție. Scrii în română, paragrafe scurte, bold pe cuvintele de impact.`,
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
