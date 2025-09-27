import type { Metadata } from 'next';
import Countdown from '../components/Countdown'; // <-- просто прямой импорт клиентского компонента, без dynamic

export const metadata: Metadata = {
  title: 'GAD — Airdrop',
  description: 'Apply for the GAD airdrop (BNB Chain, BEP-20).',
  openGraph: {
    title: 'GAD — Airdrop',
    description: '15,000 GAD × 1,224 (base) + 30,000 GAD × 339 (bonus). Claim window 14 days.',
    url: 'https://gad-family.com/airdrop',
    siteName: 'GAD',
    type: 'website',
  },
};

type Pack = {
  root: string;
  count: number;
  map?: Record<string, { amount: string; amountWei: string; proof: string[] }>;
};

function short(addr: string) {
  if (!addr) return '';
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

function WinnersList({
  title,
  pack,
  note,
  maxPreview = 300,
}: {
  title: string;
  pack: Pack | null;
  note?: string;
  maxPreview?: number;
}) {
  if (!pack) {
    return (
      <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
        <div className="text-white/80">Loading {title}…</div>
      </div>
    );
  }

  const entries = pack.map ? Object.entries(pack.map) : [];

  return (
    <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="text-sm text-white/70">Total: {pack.count}</div>
      </div>

      {note && <div className="mt-1 text-xs text-white/60">{note}</div>}

      <div className="mt-2 text-xs text-white/60 break-all">
        Root: <span className="font-mono">{pack.root}</span>
      </div>

      <div className="mt-4 max-h-96 overflow-auto border border-white/10 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-white/10">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Address</th>
              <th className="px-3 py-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {entries.slice(0, maxPreview).map(([addr, info], i) => (
              <tr key={addr} className="odd:bg-white/0 even:bg-white/5">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2 font-mono">{short(addr)}</td>
                <td className="px-3 py-2">{info.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entries.length > maxPreview && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-white/80 hover:underline">
            Show all ({entries.length})
          </summary>
          <div className="mt-3 max-h-96 overflow-auto border border-white/10 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Address</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(([addr, info], i) => (
                  <tr key={addr} className="odd:bg-white/0 even:bg-white/5">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2 font-mono">{short(addr)}</td>
                    <td className="px-3 py-2">{info.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}

export default async function AirdropPage() {
  const claimStartIso = '2025-09-25T12:00:00Z';

  // Берём пакеты напрямую с бэкенда
  const origin =
    process.env.NEXT_PUBLIC_SITE_ORIGIN ??
    (typeof window === 'undefined' ? '' : window.location.origin);

  const [basePack, bonusPack] = await Promise.all([
    fetch(`${origin}/api/airdrop-proof?kind=base`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null),
    fetch(`${origin}/api/airdrop-proof?kind=bonus`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold">🚀 GAD Airdrop</h1>
      <p className="text-white/70 mt-2">
        <b>Base:</b> 15,000&nbsp;GAD × <b>1,224</b> winners,&nbsp;
        <b>Bonus:</b> 30,000&nbsp;GAD × <b>339</b> winners · Network: BNB Smart Chain (BEP-20)
        <br />
        <span className="text-white/60">Claim window: <b>14 days</b> from the start time.</span>
      </p>

      {/* таймер сверху */}
      <div className="mt-3 text-lg text-[#ffd166]">
        Countdown to claim start: <Countdown iso={claimStartIso} />
      </div>

      {/* списки победителей */}
      <div className="mt-8 space-y-6">
        <WinnersList
          title="Winners — BASE (15,000 GAD)"
          pack={basePack}
          note="Main list of eligible wallets for the base reward."
        />
        <WinnersList
          title="Winners — BONUS (30,000 GAD)"
          pack={bonusPack}
          note="Additional bonus winners (randomly selected)."
        />

        <div className="rounded-2xl p-4 bg-[#ffd166] text-[#0b0f17] border border-yellow-300/40">
          You can stake GAD with boosted APR (from <b>100% APY</b>). Go to <b>Earn / Stake</b> to participate.
        </div>
      </div>

      {/* описание проекта и первого дропа внизу */}
      <div className="mt-10 text-sm text-white/70 space-y-3">
        <p>
          <b>Season 1 Airdrop.</b> We’re rewarding early community members who support the
          launch of the GAD Family ecosystem. Submit a valid BEP-20 wallet (starts with 0x).
          Incorrect addresses won’t receive tokens.
        </p>
        <p>
          <b>About GAD:</b> a family-first app with private circles, healthy-habit rewards (move-to-earn),
          shared wallet, and an AI safety assistant. The GAD token powers in-app rewards and future utilities.
        </p>
        <p className="text-white/50 text-xs">
          Note: anti-bot checks and duplicate filtering apply.
        </p>
      </div>
    </section>
  );
}
