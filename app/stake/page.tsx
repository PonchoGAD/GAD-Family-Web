import GADStaking from '../components/GADStaking';

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0b0f17] text-white">
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <h1 className="text-3xl font-extrabold">Stake GAD</h1>
        <p className="text-white/70 mt-2">Stake your GAD in flexible or locked pools and earn rewards.</p>
      </div>
      <GADStaking />
    </main>
  );
}
