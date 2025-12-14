// app/pitch/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pitch | GAD Family",
  description: "GAD Family pitch deck for investors, launchpads, and partners.",
};

const PDF_URL = "/pitch/GAD_Family_Pitch_Deck.pdf";
const CONTACT_EMAIL = "info@gad-family.com";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
      {children}
    </span>
  );
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3",
        "border border-amber-300/25 bg-gradient-to-b from-amber-200/15 to-amber-400/5",
        "text-sm font-semibold text-amber-100 shadow-[0_0_0_1px_rgba(255,215,128,0.08)]",
        "hover:from-amber-200/20 hover:to-amber-400/10 hover:border-amber-200/40",
        "transition"
      )}
    >
      {children}
      <span aria-hidden className="text-amber-200/80">
        →
      </span>
    </a>
  );
}

function SecondaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3",
        "border border-white/10 bg-white/5",
        "text-sm font-semibold text-white/80",
        "hover:bg-white/8 hover:border-white/20",
        "transition"
      )}
    >
      {children}
    </a>
  );
}

export default function PitchPage() {
  return (
    <main className="relative min-h-screen bg-[#07070A] text-white">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute top-40 right-[-180px] h-[520px] w-[520px] rounded-full bg-yellow-200/8 blur-3xl" />
        <div className="absolute bottom-[-200px] left-[-220px] h-[520px] w-[520px] rounded-full bg-amber-300/8 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,128,0.06),transparent_45%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.05),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      {/* header */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-6 pt-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-10">
          <div className="pointer-events-none absolute -top-28 right-[-90px] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-[-90px] h-80 w-80 rounded-full bg-yellow-300/10 blur-3xl" />

          <div className="flex flex-wrap items-center gap-2">
            <Pill>BNB Chain</Pill>
            <Pill>SocialFi</Pill>
            <Pill>Move-to-Earn</Pill>
            <Pill>DeFi + DAO</Pill>
          </div>

          <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Pitch Deck
            <span className="block bg-gradient-to-r from-amber-200 via-amber-100 to-yellow-100 bg-clip-text text-transparent">
              GAD Family
            </span>
          </h1>

          <p className="mt-4 max-w-3xl text-pretty text-sm leading-6 text-white/70 sm:text-base">
            Use this deck for launchpads, strategic partners, and investors. It is aligned with the /investors transparency page.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <PrimaryButton href={PDF_URL}>Open PDF</PrimaryButton>
            <PrimaryButton href={`${PDF_URL}`} >
              Download PDF
            </PrimaryButton>
            <SecondaryButton href={`/investors`}>Investors Hub</SecondaryButton>
            <SecondaryButton href={`mailto:${CONTACT_EMAIL}?subject=GAD%20Family%20Pitch%20Request`}>
              Email: {CONTACT_EMAIL}
            </SecondaryButton>
          </div>

          <p className="mt-5 text-xs text-white/45">
            Tip: keep the filename stable so launchpads don’t lose the link.
          </p>
        </div>
      </section>

      {/* viewer */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div className="text-sm font-semibold text-white">Deck preview</div>
            <div className="text-xs text-white/55">
              If preview fails on some browsers, use “Open PDF”.
            </div>
          </div>

          {/* PDF embed */}
          <div className="aspect-[16/9] w-full">
            <iframe
              src={`${PDF_URL}#view=FitH`}
              className="h-full w-full"
              title="GAD Family Pitch Deck"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
