// app/games/page.tsx
import Link from "next/link";

export const metadata = {
  title: "GAD Family — Games",
  description: "Preview page for upcoming GAD Family games.",
  openGraph: {
    title: "GAD Family — Games",
    description: "Preview page for upcoming GAD Family games.",
    url: "https://gad-family.com/games",
    siteName: "GAD Family",
    type: "website",
  },
  alternates: { canonical: "https://gad-family.com/games" },
};

export default function GamesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Games — Coming soon</h1>
      <p className="mt-4 text-sm opacity-80">
        Move-to-Earn mini-games, family quests, and seasonal events will live
        here. Leaderboards, rewards, and integration with GAD Wallet are planned.
      </p>
      <div className="mt-8">
        <Link href="/" className="underline opacity-90 hover:opacity-100">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
