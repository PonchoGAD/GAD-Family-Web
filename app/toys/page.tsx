// app/toys/page.tsx
import Link from "next/link";

export const metadata = {
  title: "GAD Family — Toys",
  description: "Preview page for upcoming GAD Family Toys.",
  openGraph: {
    title: "GAD Family — Toys",
    description: "Preview page for upcoming GAD Family Toys.",
    url: "https://gad-family.com/toys",
    siteName: "GAD Family",
    type: "website",
  },
  alternates: { canonical: "https://gad-family.com/toys" },
};

export default function ToysPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Toys — Coming soon</h1>
      <p className="mt-4 text-sm opacity-80">
        This section will host our eco-friendly, glowing toys collection with AR
        interactions and collectible NFTs. Details, specs, and pre-launch will
        appear here.
      </p>
      <div className="mt-8">
        <Link href="/" className="underline opacity-90 hover:opacity-100">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
