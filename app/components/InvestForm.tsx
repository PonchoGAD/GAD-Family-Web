// components/InvestForm.tsx
export default function InvestForm() {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-center mb-4">Invest in GAD Family</h2>
      <p className="text-center mb-6">
        Minimum entry: $10 in USDT (BEP20) or BNB on BSC. Submit your TX details below.
      </p>
      <div className="w-full">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLScnYggks4ikZA3buSLazXkZiWhrQz6WT50aukkHQIFI3rUp9g/viewform?embedded=true"
          className="w-full"
          // подстрой высоту под свой макет
          style={{ height: "1400px", border: 0 }}
          loading="lazy"
        />
      </div>
    </section>
  );
}
