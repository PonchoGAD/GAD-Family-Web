// components/InvestButton.tsx
import Link from "next/link";

export default function InvestButton() {
  return (
    <section className="w-full text-center py-10">
      <h2 className="text-2xl font-bold mb-2">Invest in GAD Family</h2>
      <p className="mb-6">
        Minimum entry $10 (BNB/USDT BEP20). Submit your TX details in the form.
      </p>
      <Link
        href="https://docs.google.com/forms/d/e/1FAIpQLScnYggks4ikZA3buSLazXkZiWhrQz6WT50aukkHQIFI3rUp9g/viewform?usp=header"
        target="_blank"
        className="inline-block px-6 py-3 rounded-xl bg-black text-white hover:opacity-90"
      >
        Open Investment Form
      </Link>
    </section>
  );
}
