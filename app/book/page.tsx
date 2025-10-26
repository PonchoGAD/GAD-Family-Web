// app/book/page.tsx
import Link from "next/link";

export const metadata = {
  title: "GAD Family — Book",
  description: "Preview page for the upcoming GAD Family book.",
  openGraph: {
    title: "GAD Family — Book",
    description: "Preview page for the upcoming GAD Family book.",
    url: "https://gad-family.com/book",
    siteName: "GAD Family",
    type: "website",
  },
  alternates: { canonical: "https://gad-family.com/book" },
};

export default function BookPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Book — Coming soon</h1>
      <p className="mt-4 text-sm opacity-80">
        Here we’ll publish chapters, previews, and audio snippets. Launch date,
        pre-orders, and reader community will be announced on this page.
      </p>
      <div className="mt-8">
        <Link href="/" className="underline opacity-90 hover:opacity-100">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
