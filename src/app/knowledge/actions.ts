"use server";
import { getAnthropicClient, MODELS } from "@/lib/anthropic";
import { getRecentContext, saveConversation, appendMessage, listConversations, getConversation } from "@/lib/conversations";
import { getSupabaseServer } from "@/lib/supabase/server";

const client = getAnthropicClient();

export async function sendMessage(conversationId: number | null, userMessage: string) {
  const recentContext = await getRecentContext(5);
  const supabase = getSupabaseServer();
  const { data: creierSections } = await supabase
    .from("creier_sections")
    .select("title, content")
    .eq("status", "completed")
    .order("order_index");

  const creierContext = creierSections?.map(s =>
    `## ${s.title}\n${JSON.stringify(s.content)}`
  ).join('\n\n') ?? "";

  const systemPrompt = `Ești BUILT AI — asistentul personal al lui Iordache Claudiu, construit pe baza sistemului BUILT (Arhitectura Corpului pe 90 de zile).

CUNOȘTINȚELE TALE DESPRE CLAUDIU:
${creierContext}

CONVERSAȚII RECENTE (context):
${recentContext}

Răspunzi în română, direct, fără clișee motivaționale. Folosești vocabularul BUILT: sistem, arhitectură, reconstrucție, protocol, piloni, execuție, diagnostic.`;

  let messages: { role: "user" | "assistant"; content: string }[] = [];

  if (conversationId) {
    const conv = await getConversation(conversationId);
    messages = ((conv?.messages ?? []) as { role: string; content: string }[]).map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  }

  messages.push({ role: "user", content: userMessage });

  const response = await client.messages.create({
    model: MODELS.deep,
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const assistantMessage = response.content[0].type === "text" ? response.content[0].text : "";
  const now = new Date().toISOString();

  if (!conversationId) {
    const title = userMessage.slice(0, 60) + (userMessage.length > 60 ? "..." : "");
    const saved = await saveConversation({
      source: "ask_built_ai",
      title,
      messages: [
        { role: "user", content: userMessage, created_at: now },
        { role: "assistant", content: assistantMessage, created_at: now },
      ],
    });
    return { reply: assistantMessage, conversationId: saved?.id ?? null };
  } else {
    await appendMessage(conversationId, { role: "user", content: userMessage, created_at: now });
    await appendMessage(conversationId, { role: "assistant", content: assistantMessage, created_at: now });
    return { reply: assistantMessage, conversationId };
  }
}

export async function importConversation(text: string, source: "claude_import" | "gemini_import") {
  const lines = text.split('\n').filter(l => l.trim());
  const messages: { role: "user" | "assistant"; content: string; created_at: string }[] = [];
  const now = new Date().toISOString();
  let current: { role: "user" | "assistant"; content: string[] } | null = null;

  for (const line of lines) {
    if (/^(Human|User|Claudiu|Tu):/i.test(line)) {
      if (current) messages.push({ role: current.role, content: current.content.join('\n'), created_at: now });
      current = { role: "user", content: [line.replace(/^[^:]+:\s*/, '')] };
    } else if (/^(Assistant|Claude|AI|Gemini):/i.test(line)) {
      if (current) messages.push({ role: current.role, content: current.content.join('\n'), created_at: now });
      current = { role: "assistant", content: [line.replace(/^[^:]+:\s*/, '')] };
    } else if (current) {
      current.content.push(line);
    }
  }
  if (current) messages.push({ role: current.role, content: current.content.join('\n'), created_at: now });

  if (!messages.length) return { error: "Nu am putut parsa conversația. Asigură-te că fiecare mesaj începe cu 'Human:' sau 'Assistant:'." };

  const title = messages[0]?.content.slice(0, 60) ?? "Conversație importată";
  const saved = await saveConversation({ source, title, messages });
  return { success: true, id: saved?.id };
}

export { listConversations };
