
import React from "react";

export const metadata = {
  title: "GAD — Airdrop",
  description: "Apply for the GAD airdrop (BNB Chain, BEP-20).",
  openGraph: {
    title: "GAD — Airdrop",
    description: "10,000 GAD × 100 winners. Apply now.",
    url: "https://gad-family.com/airdrop",
    siteName: "GAD",
    type: "website",
  },
};

// Компонент для обратного отсчёта
function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = React.useState("");

  React.useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance <= 0) {
        setTimeLeft("✅ Claim is LIVE!");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return <span className="font-mono text-lg text-[#ffd166]">{timeLeft}</span>;
}

export default function AirdropPage() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold">🚀 GAD Airdrop</h1>
      <p className="text-white/70 mt-2">
        10,000 GAD × 100 winners · Network: BNB Smart Chain (BEP-20)
      </p>

      {/* Счётчик до старта клейма */}
      <div className="mt-4">
        Countdown to claim start:&nbsp;
        <Countdown targetDate={new Date("2025-09-25T12:00:00Z")} />
      </div>

      {/* Форма Google */}
      <div className="mt-6 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
        <iframe
          src="https://forms.gle/EjpwBCTrJiRh4fdX6"
          className="w-full h-[1100px] md:h-[1000px] bg-white"
        />
      </div>

      {/* запасная ссылка если iframe заблокирован */}
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

      <div className="mt-8 text-xs text-white/50">
        Please double-check your wallet address (BEP-20, starts with 0x). Wrong addresses won’t receive rewards.
      </div>

      {/* Описание дропа и проекта */}
      <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold">About Airdrop Season 1</h2>
        <p className="text-white/80 mt-2">
          In our first airdrop, <b>100M GAD</b> are allocated for early supporters.
          Each participant can receive <b>10,000 GAD</b>, and <b>100 winners</b> will
          earn an additional <b>30,000 GAD</b>.
        </p>
        <p className="text-white/70 mt-3">
          GAD Family is more than just a token. It is the ecosystem where families
          stay safe, track activities, and earn together. Our app integrates
          <b> move-to-earn mechanics, shared wallets, AI safety features</b>, and a
          transparent DeFi layer to make crypto simple for everyday people.
        </p>
        <p className="text-white/70 mt-3">
          By joining now, you support a project that connects <b>real utility</b> with{" "}
          <b>transparent tokenomics</b>. This is only the beginning — together, we will
          grow GAD Family into a global platform for families worldwide.
        </p>
      </div>
    </section>
  );
}
