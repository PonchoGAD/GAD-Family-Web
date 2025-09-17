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

export default function AirdropPage() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold">🚀 GAD Airdrop</h1>
      <p className="text-white/70 mt-2">
        10,000 GAD × 100 winners · Network: BNB Smart Chain (BEP-20)
      </p>

      {/* форма в iframe */}
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
    </section>
  );
}
