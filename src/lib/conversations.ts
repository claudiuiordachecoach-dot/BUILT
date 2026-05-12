import { getSupabaseAuth } from "@/lib/supabase/auth-server";

export type ConvMessage = { role: "user" | "assistant"; content: string; created_at: string };

export async function saveConversation(opts: {
  source: string;
  title: string;
  messages: ConvMessage[];
  summary?: string;
  tags?: string[];
}) {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({
      user_id: user.id,
      source: opts.source,
      title: opts.title,
      messages: opts.messages,
      summary: opts.summary ?? null,
      tags: opts.tags ?? [],
    })
    .select("id")
    .single();

  return error ? null : data;
}

export async function appendMessage(conversationId: number, message: ConvMessage) {
  const supabase = await getSupabaseAuth();
  const { data: existing } = await supabase
    .from("ai_conversations")
    .select("messages")
    .eq("id", conversationId)
    .single();

  const messages = [...((existing?.messages as ConvMessage[]) ?? []), message];
  await supabase
    .from("ai_conversations")
    .update({ messages, updated_at: new Date().toISOString() })
    .eq("id", conversationId);
}

export async function listConversations(source?: string, limit = 20) {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("ai_conversations")
    .select("id, source, title, summary, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (source) query = query.eq("source", source);
  const { data } = await query;
  return data ?? [];
}

export async function getConversation(id: number) {
  const supabase = await getSupabaseAuth();
  const { data } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function getRecentContext(limit = 5): Promise<string> {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "";

  const { data } = await supabase
    .from("ai_conversations")
    .select("title, summary, messages")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data?.length) return "";
  return data.map(c =>
    `[Conversație: ${c.title}]\n${c.summary ?? (c.messages as ConvMessage[]).slice(-2).map((m: ConvMessage) => `${m.role}: ${m.content}`).join('\n')}`
  ).join('\n\n');
}
