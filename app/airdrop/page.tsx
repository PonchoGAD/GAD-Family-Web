import type { Metadata } from 'next';
import Countdown from '../components/Countdown';

export const metadata: Metadata = {
  title: 'GAD — Airdrop',
  description: 'Apply for the GAD airdrop (BNB Chain, BEP-20).',
  openGraph: {
    title: 'GAD — Airdrop',
    description: '10,000 GAD × 100 winners. Apply now.',
    url: 'https://gad-family.com/airdrop',
    siteName: 'GAD',
    type: 'website',
  },
};

// если хочешь выключить кеш страницы целиком:
// export const revalidate = 0;

export default function AirdropPage() {
  const claimStartIso = '2025-09-25T12:00:00Z';

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold">🚀 GAD Airdrop</h1>
      <p className="text-white/70 mt-2">
        10,000 GAD × 100 winners · Network: BNB Smart Chain (BEP-20)
      </p>

      {/* таймер сверху */}
      <div className="mt-3 text-lg text-[#ffd166]">
        Countdown to claim start: <Countdown iso={claimStartIso} />
      </div>

      {/* форма в iframe */}
      <div className="mt-6 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
        <iframe
          src="https://forms.gle/EjpwBCTrJiRh4fdX6"
          className="w-full h-[1100px] md:h-[1000px] bg-white"
        />
      </div>

      {/* запасная ссылка */}
      <div className="mt-4 text-sm text-white/70">
        If the form doesn’t load, open it directly:&nbsp;
        <a
          href="https://forms.gle/EjpwBCTrJiRh4fdX6"
          target="_blank"
          rel="noreferrer"
          className="underline hover:opacity-80"
        >
          Google Form
        </a>
      </div>

      {/* описание проекта и первого дропа внизу */}
      <div className="mt-10 text-sm text-white/70 space-y-3">
        <p>
          <b>Season 1 Airdrop.</b> We’re rewarding early community members who support the launch of the
          GAD Family ecosystem. Submit a valid BEP-20 wallet (starts with 0x). Incorrect addresses won’t receive tokens.
        </p>
        <p>
          <b>About GAD:</b> a family-first app with private circles, healthy-habit rewards (move-to-earn),
          shared wallet, and an AI safety assistant. The GAD token powers in-app rewards and future utilities.
        </p>
        <p className="text-white/50 text-xs">
          Note: Submitting the form doesn’t guarantee a reward. Anti-bot checks and duplicate filtering apply.
        </p>
      </div>
    </section>
  );
}
