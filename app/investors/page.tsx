// app/investors/page.tsx
import type { Metadata } from "next";
import EmailDraftForm from "./EmailDraftForm";


export const metadata: Metadata = {
  title: "Investors | GAD Family",
  description:
    "Investor relations page: project overview, token utility, roadmap, transparency, and contact.",
};

const CONTACT_EMAIL = "info@gad-family.com";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10">
        {/* soft glow */}
        <div className="pointer-events-none absolute -top-24 right-[-80px] h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-[-80px] h-72 w-72 rounded-full bg-yellow-300/10 blur-3xl" />

        {eyebrow ? (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-200/80" />
            {eyebrow}
          </div>
        ) : null}

        <h2 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>

        {subtitle ? (
          <p className="mt-3 max-w-3xl text-pretty text-sm leading-6 text-white/70 sm:text-base">
            {subtitle}
          </p>
        ) : null}

        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="text-xs font-medium text-white/60">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
      {hint ? <div className="mt-1 text-xs text-white/50">{hint}</div> : null}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
      {children}
    </span>
  );
}

function Anchor({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-amber-200 underline decoration-amber-300/30 underline-offset-4 hover:text-amber-100 hover:decoration-amber-200/60"
    >
      {children}
    </a>
  );
}

function PrimaryButton({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
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

function SecondaryButton({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
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

export default function InvestorsPage() {
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

      {/* HERO */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-12">
          <div className="pointer-events-none absolute -top-28 right-[-90px] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-[-90px] h-80 w-80 rounded-full bg-yellow-300/10 blur-3xl" />

          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center gap-2">
              <Pill>BNB Chain</Pill>
              <Pill>SocialFi</Pill>
              <Pill>Move-to-Earn</Pill>
              <Pill>DeFi + DAO</Pill>
              <Pill>NFT / AI modules</Pill>
            </div>

            <div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
                Investors Hub
                <span className="block bg-gradient-to-r from-amber-200 via-amber-100 to-yellow-100 bg-clip-text text-transparent">
                  GAD Family
                </span>
              </h1>
              <p className="mt-5 max-w-3xl text-pretty text-sm leading-6 text-white/70 sm:text-base">
                A family-centered ecosystem that combines real-world utility
                (safety + healthy lifestyle) with sustainable Web3 mechanics.
                This page is built for due diligence: vision, status, token
                utility, transparency, and direct contact.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {/* Replace these links with your real docs */}
                <PrimaryButton href={`mailto:${CONTACT_EMAIL}?subject=GAD%20Family%20Investor%20Inquiry`}>
                  Email investor relations
                </PrimaryButton>
                <SecondaryButton href="#transparency">Transparency</SecondaryButton>
                <SecondaryButton href="#roadmap">Roadmap</SecondaryButton>
                <SecondaryButton href="#contact">Contact</SecondaryButton>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Project stage" value="Active development" hint="App + Web3 infrastructure" />
              <Stat label="Governance" value="DAO-enabled" hint="On-chain voting stack" />
              <Stat label="Security" value="Audit in progress" hint="Contracts + infra review" />
              <Stat label="Fundraising" value="Preparing for IDO" hint="Launchpad applications ongoing" />
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <Section
        id="overview"
        eyebrow="Project overview"
        title="What is GAD Family?"
        subtitle="Not a speculative product. A real-use ecosystem for families with Web2-friendly onboarding."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold text-white">Core idea</div>
            <p className="mt-3 text-sm leading-6 text-white/70">
              GAD Family unites <b>family safety</b>, <b>healthy habits</b>, and{" "}
              <b>community incentives</b> with transparent DeFi infrastructure.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold text-white">Main modules</div>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Mobile app: Move-to-Earn + family features</li>
              <li>• Token utility: rewards, staking, governance</li>
              <li>• DAO: voting and long-term decentralization</li>
              <li>• NFT / AI: optional value layer (not hype-driven)</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold text-white">Design principle</div>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Build trust through <b>verifiable proof</b>: contracts, vesting
              logic, treasury controls, and a clear roadmap.
            </p>
          </div>
        </div>
      </Section>

      {/* PROBLEM / SOLUTION */}
      <Section
        id="problem-solution"
        eyebrow="Thesis"
        title="Problem & Solution"
        subtitle="Why we exist and why this can scale beyond crypto-native users."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold text-white">The problem</div>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Most Web3 projects are speculation-first, utility-later.</li>
              <li>• Families need simple safety + habit tools in one place.</li>
              <li>• Many M2E models collapse from unsustainable emissions.</li>
              <li>• Web3 onboarding is too complex for mass adoption.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-300/15 bg-gradient-to-b from-amber-200/10 to-transparent p-6">
            <div className="text-sm font-semibold text-amber-100">Our solution</div>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              <li>• Family-first product with daily use scenarios.</li>
              <li>• Sustainable incentives + long-term token design.</li>
              <li>• Clear utility: rewards, staking, governance, in-app uses.</li>
              <li>• Transparency-focused investor relations + proof links.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* TOKEN UTILITY */}
      <Section
        id="token"
        eyebrow="Token utility"
        title="How the token is used"
        subtitle="Utility-first. Incentives aligned with real behavior, staking, and governance."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold text-white">Rewards</div>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Move-to-Earn rewards, family challenges, and ecosystem participation.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold text-white">Staking</div>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Staking mechanisms to support long-term holders and stabilize demand.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold text-white">DAO governance</div>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Voting for key decisions: treasury direction, incentives, and growth initiatives.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Token economics</div>
              <p className="mt-2 text-sm text-white/70">
                Fixed supply with allocations across community, M2E rewards, ecosystem growth, team (vesting),
                treasury, and strategic partners. Vesting schedules are applied to protect long-term stability.
              </p>
            </div>

            <div className="mt-3 flex gap-3 sm:mt-0">
              {/* Replace with your real docs when ready */}
              <SecondaryButton href="/litepaper" external={false}>
                Litepaper
              </SecondaryButton>
              <SecondaryButton href="/tokenomics" external={false}>
                Tokenomics
              </SecondaryButton>
            </div>
          </div>
        </div>
      </Section>

      {/* FUNDRAISING */}
      <Section
        id="fundraising"
        eyebrow="Fundraising"
        title="Use of funds"
        subtitle="Clear allocation designed for delivery, growth, security, and liquidity."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold text-white">Planned raise</div>
            <p className="mt-3 text-sm text-white/70">
              Target range: <b>$300,000 – $500,000</b> (IDO / launchpad format).
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Stat label="App development" value="35%" hint="M2E + safety + scaling" />
              <Stat label="Marketing" value="25%" hint="Community + partnerships" />
              <Stat label="Security & audits" value="15%" hint="Contracts + infra" />
              <Stat label="DEX liquidity" value="10%" hint="Stability & trading health" />
              <Stat label="Ecosystem growth" value="10%" hint="Partners & expansion" />
              <Stat label="Ops & legal" value="5%" hint="Structure & compliance" />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-300/15 bg-gradient-to-b from-amber-200/10 to-transparent p-6">
            <div className="text-sm font-semibold text-amber-100">Why this structure works</div>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              <li>• Prioritizes shipping the product (app + infrastructure).</li>
              <li>• Budget for audits is explicit (signals seriousness).</li>
              <li>• Liquidity allocation reduces volatility risk post-IDO.</li>
              <li>• Growth allocation keeps partnerships and expansion active.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ROADMAP */}
      <Section
        id="roadmap"
        eyebrow="Roadmap"
        title="Development status & milestones"
        subtitle="A realistic plan investors can track and verify over time."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold text-white">Current</div>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Core contracts deployed on BNB Chain</li>
              <li>• DAO governance live</li>
              <li>• Staking / vesting mechanisms implemented</li>
              <li>• App development in progress</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold text-white">Next</div>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Audit completion</li>
              <li>• IDO launch</li>
              <li>• Mobile beta release</li>
              <li>• Community growth campaigns</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold text-white">Growth</div>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Strategic partnerships</li>
              <li>• Expansion of in-app utility</li>
              <li>• NFT/AI module rollout (utility-led)</li>
              <li>• Global scaling roadmap</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* TRANSPARENCY */}
      <Section
        id="transparency"
        eyebrow="Transparency"
        title="Security & proof"
        subtitle="A due-diligence section for launchpads, investors, and partners."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold text-white">Security status</div>
            <p className="mt-3 text-sm text-white/70">
              Audit: <b>in progress</b>. Treasury: multi-sig governance. Vesting mechanisms: applied to key allocations.
            </p>
            <p className="mt-3 text-sm text-white/70">
              Add proof links below as you publish them (BscScan, GitHub, audit PDF).
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold text-white">Proof links</div>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                • Website: <Anchor href="https://gad-family.com/">gad-family.com</Anchor>
              </li>
              <li>
                • Telegram: <Anchor href="https://t.me/gadfamily">t.me/gadfamily</Anchor>
              </li>
              <li>
                • Medium: <Anchor href="https://medium.com/">medium.com</Anchor> <span className="text-white/40">(set your @handle)</span>
              </li>
              <li>
                • GitHub: <Anchor href="https://github.com/">github.com</Anchor> <span className="text-white/40">(set your org)</span>
              </li>
              <li className="text-white/50">
                • Contracts (BscScan): add verified links here
              </li>
              <li className="text-white/50">
                • Audit report: add PDF link here
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* CONTACT */}
      <Section
        id="contact"
        eyebrow="Investor contact"
        title="Write to investor relations"
        subtitle={`Email us at ${CONTACT_EMAIL} or use the form below to generate a pre-filled email.`}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold text-white">Direct email</div>
            <p className="mt-3 text-sm text-white/70">
              <Anchor href={`mailto:${CONTACT_EMAIL}?subject=GAD%20Family%20Investor%20Inquiry`}>
                {CONTACT_EMAIL}
              </Anchor>
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryButton
                href={`mailto:${CONTACT_EMAIL}?subject=GAD%20Family%20Investor%20Inquiry&body=Hello%20GAD%20Family%20team%2C%0A%0AI%27m%20interested%20in%20learning%20more%20about%20your%20project.%20Please%20share%20the%20latest%20pitch%20deck%2C%20tokenomics%2C%20and%20relevant%20links.%0A%0ABest%20regards%2C%0A%5BYour%20Name%5D`}
              >
                Open email draft
              </PrimaryButton>

              {/* Replace with your pitch PDF later */}
              <SecondaryButton href="/pitch" external={false}>
                View Pitch (coming)
              </SecondaryButton>
            </div>

            <p className="mt-6 text-xs text-white/50">
              Tip: when pitch deck is ready, place it at <b>/pitch</b> and add a downloadable PDF link.
            </p>
          </div>

          <EmailDraftForm />
        </div>
      </Section>

      {/* footer spacing */}
      <div className="relative h-16" />
    </main>
  );
}


