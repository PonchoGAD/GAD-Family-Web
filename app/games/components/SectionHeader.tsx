export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-semibold">{title}</h1>
      {subtitle && <p className="mt-2 opacity-80">{subtitle}</p>}
    </header>
  );
}
