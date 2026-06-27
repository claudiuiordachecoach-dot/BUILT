import { notFound } from "next/navigation";
import Link from "next/link";
import { getConversation, getMessages } from "../actions";
import { STAGE_LABELS } from "@/lib/dm-constants";
import { ConversationClient } from "./ConversationClient";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!numId) notFound();

  const [conversation, messages] = await Promise.all([
    getConversation(numId).catch(() => null),
    getMessages(numId).catch(() => []),
  ]);

  if (!conversation) notFound();

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dm" className="font-condensed text-[10px] text-built-gray-text hover:text-built-red transition-colors">← DM</Link>
        <span className="text-built-gray-text">/</span>
        <p className="font-condensed text-[10px] text-built-red uppercase tracking-wider">@{conversation.prospect_handle}</p>
      </div>
      <div className="flex items-end justify-between mb-6">
        <h1 className="font-display text-4xl tracking-[0.06em] text-built-white">@{conversation.prospect_handle}</h1>
        <span className="font-condensed text-xs text-built-gray-text border border-built-gray-2 px-3 py-1">
          {STAGE_LABELS[conversation.stage]}
        </span>
      </div>
      <ConversationClient conversation={conversation} initialMessages={messages} />
    </div>
  );
}
