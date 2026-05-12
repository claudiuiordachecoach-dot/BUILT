"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSectionDefinitions, readCreierFromSupabase } from "@/lib/creier";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";

export type SaveSectionResult =
  | { ok: true }
  | { ok: false; error: string };

const VALID_KEYS = new Set(getSectionDefinitions().map((d) => d.key));
const VALID_STATUSES = new Set(["completed", "draft", "pending"] as const);

export async function saveSection(
  key: string,
  content: unknown,
  status: "completed" | "draft" | "pending"
): Promise<SaveSectionResult> {
  if (!VALID_KEYS.has(key)) {
    return { ok: false, error: `Cheie necunoscută: ${key}` };
  }
  if (!VALID_STATUSES.has(status)) {
    return { ok: false, error: `Status invalid: ${status}` };
  }

  const supabase = getSupabaseServer();
  const def = getSectionDefinitions().find((d) => d.key === key)!;

  const { error } = await supabase
    .from("creier_sections")
    .upsert(
      {
        key,
        order_index: def.order,
        title: def.title,
        content: content ?? {},
        status,
      },
      { onConflict: "key" }
    );

  if (error) {
    return { ok: false, error: `Supabase: ${error.message}` };
  }

  revalidatePath("/creier");
  return { ok: true };
}

export type CacheTestResult =
  | {
      ok: true;
      usage: {
        input_tokens: number;
        output_tokens: number;
        cache_creation_input_tokens: number;
        cache_read_input_tokens: number;
      };
      creierBytes: number;
    }
  | { ok: false; error: string };

/**
 * Trimite un request minim la Anthropic cu creierul din DB ca system block cached.
 * Returnează cifrele de usage — cache_read_input_tokens > 0 la al doilea click = caching merge.
 */
export async function testAICache(): Promise<CacheTestResult> {
  try {
    const creier = await readCreierFromSupabase();
    const creierJson = JSON.stringify(creier, null, 2);
    const creierBytes = new TextEncoder().encode(creierJson).length;

    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({ creierJson });

    const message = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 32,
      system: systemBlocks,
      messages: [
        {
          role: "user",
          content:
            "Răspunde cu exact 'cache test ok' și nimic altceva.",
        },
      ],
    });

    return {
      ok: true,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
        cache_creation_input_tokens:
          message.usage.cache_creation_input_tokens ?? 0,
        cache_read_input_tokens:
          message.usage.cache_read_input_tokens ?? 0,
      },
      creierBytes,
    };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : "Eroare necunoscută la Anthropic.",
    };
  }
}
