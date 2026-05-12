import { getIgAccount, listIgMedia, listReelsWithPerformance } from "./actions";
import { IgConnectPanel } from "@/components/analytics/IgConnectPanel";
import { IgMediaGrid } from "@/components/analytics/IgMediaGrid";
import { ManualPerfPanel } from "@/components/analytics/ManualPerfPanel";

export const dynamic = "force-dynamic";

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.floor((new Date(expiresAt).getTime() - Date.now()) / 86_400_000);
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const igConnected = sp.ig_connected === "1";
  const igError = sp.ig_error ?? null;

  const [account, igMedia, reels] = await Promise.all([
    getIgAccount().catch(() => null),
    listIgMedia(30).catch(() => []),
    listReelsWithPerformance().catch(() => []),
  ]);

  const totalPlays = igMedia.reduce((s, m) => s + (m.plays ?? 0), 0);
  const totalLikes = igMedia.reduce((s, m) => s + (m.likes ?? 0), 0);
  const totalSaves = igMedia.reduce((s, m) => s + (m.saves ?? 0), 0);
  const tokenDays = daysLeft(account?.token_expires_at ?? null);

  return (
    <div className="p-8 max-w-6xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">
        M11 · Analytics & Performance Loop
      </p>
      <h1 className="font-display text-5xl tracking-[0.06em] text-built-white mb-8">
        PERFORMANCE LOOP
      </h1>

      {/* NOTIFICĂRI OAUTH */}
      {igConnected && (
        <div className="mb-4 p-3 bg-emerald-900/30 border border-emerald-500/40 text-emerald-400 text-sm rounded-sm">
          ✓ Instagram conectat cu succes. Apasă <strong>Sync</strong> pentru a importa media.
        </div>
      )}
      {igError && (
        <div className="mb-4 p-3 bg-built-red/10 border border-built-red text-built-red text-sm rounded-sm">
          ⚠ Eroare conectare Instagram: {decodeURIComponent(igError)}
        </div>
      )}
      {tokenDays !== null && tokenDays < 7 && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-500/40 text-yellow-400 text-sm rounded-sm">
          ⚠ Tokenul Instagram expiră în {tokenDays} zile. Reconectează contul.
        </div>
      )}

      {/* CONNECT PANEL */}
      <IgConnectPanel account={account} />

      {/* STATS din Instagram */}
      {account && igMedia.length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-3 mb-8">
            <Stat label="Followeri" value={fmt(account.followers_count)} />
            <Stat label={`Total plays (${igMedia.length} posts)`} value={fmt(totalPlays)} />
            <Stat label="Total likes" value={fmt(totalLikes)} />
            <Stat label="Total saves" value={fmt(totalSaves)} />
          </div>

          <h2 className="font-display text-2xl tracking-wide text-built-white mb-3">
            REELS · SYNC IG
          </h2>
          <IgMediaGrid media={igMedia} />
        </>
      )}

      {/* MANUAL PERF — reels generate în M2 cu stats introduse manual */}
      <div className="mt-10">
        <h2 className="font-display text-2xl tracking-wide text-built-white mb-1">
          REELS GENERATE · STATS MANUALE
        </h2>
        <p className="text-xs text-built-gray-text mb-4">
          Reels create în M2. Adaugă stats manual până IG-ul e sincronizat, sau ca backup.
        </p>
        <ManualPerfPanel reels={reels} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-built-gray-1 border border-built-gray-2 rounded-sm p-4">
      <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="font-display text-3xl text-built-white tracking-wide">{value}</p>
    </div>
  );
}
