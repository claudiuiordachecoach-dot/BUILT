import Link from "next/link";
import { listConversations, type DMStage } from "./actions";
import { STAGE_LABELS, STAGE_COLOR } from "@/lib/dm-constants";
import { NewConversationButton } from "./NewConversationButton";

export const dynamic = "force-dynamic";


export default async function DMPage() {
  const conversations = await listConversations().catch(() => []);

  const active = conversations.filter((c) => !["lost", "won"].includes(c.stage));
  const closed = conversations.filter((c) => ["lost", "won"].includes(c.stage));

  return (
    <div className="p-8 max-w-4xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">M7 · Sistem DM</p>
      <h1 className="font-display text-5xl tracking-[0.06em] text-built-white mb-2">OUTREACH & CALIFICARE</h1>
      <p className="text-built-gray-text mb-8">
        Răspunsuri DM în vocea BUILT. Cele 3 Întrebări Magice, detector red flags, progres per stage.
      </p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          ["Total", conversations.length],
          ["Active", active.length],
          ["Apeluri rezervate", conversations.filter(c => c.stage === "call_booked").length],
          ["Câștigate", conversations.filter(c => c.stage === "won").length],
        ].map(([l, v]) => (
          <div key={l} className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
            <p className="font-condensed text-[10px] text-built-gray-text uppercase">{l}</p>
            <p className="font-display text-3xl text-built-red mt-1">{v}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-condensed text-[11px] text-built-gray-text uppercase tracking-wider">
          Conversații active ({active.length})
        </h3>
        <NewConversationButton />
      </div>

      {active.length === 0 ? (
        <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm text-center mb-8">
          <p className="text-built-gray-text mb-4">Nicio conversație activă. Adaugă un prospect pentru a începe calificarea.</p>
        </div>
      ) : (
        <div className="space-y-2 mb-8">
          {active.map((c) => (
            <Link key={c.id} href={`/dm/${c.id}`}
              className="flex items-center justify-between p-4 bg-built-gray-1 border border-built-gray-2 hover:border-built-red rounded-sm transition-colors">
              <div className="flex items-center gap-4">
                <span className="font-display text-lg tracking-wider text-built-white">@{c.prospect_handle}</span>
                {c.red_flags?.length > 0 && (
                  <span className="font-condensed text-[9px] text-orange-400 border border-orange-400/30 px-2 py-0.5">
                    ⚠ {c.red_flags.length} red flag{c.red_flags.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-condensed text-[10px] uppercase ${STAGE_COLOR[c.stage]}`}>
                  {STAGE_LABELS[c.stage]}
                </span>
                {c.last_message_at && (
                  <span className="font-condensed text-[10px] text-built-gray-text">
                    {new Date(c.last_message_at).toLocaleDateString("ro-RO")}
                  </span>
                )}
                <span className="text-built-gray-text">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {closed.length > 0 && (
        <details>
          <summary className="cursor-pointer font-condensed text-[11px] text-built-gray-text hover:text-built-white transition-colors mb-3 list-none">
            › Închise ({closed.length})
          </summary>
          <div className="space-y-2 mt-3">
            {closed.map((c) => (
              <Link key={c.id} href={`/dm/${c.id}`}
                className="flex items-center justify-between p-4 bg-built-gray-1 border border-built-gray-2 opacity-60 hover:opacity-100 rounded-sm transition-opacity">
                <span className="font-display text-base tracking-wider text-built-white">@{c.prospect_handle}</span>
                <span className={`font-condensed text-[10px] uppercase ${STAGE_COLOR[c.stage]}`}>{STAGE_LABELS[c.stage]}</span>
              </Link>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
