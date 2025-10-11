export default function RenderGrid({
  urls,
  onPick,
}: { urls: string[]; onPick?: (u: string) => void }) {
  if (!urls?.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
      {urls.map((u, i) => (
        <button key={i} className="border rounded overflow-hidden" onClick={() => onPick?.(u)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={u} alt={`gen-${i}`} className="w-full h-40 object-cover" />
        </button>
      ))}
    </div>
  );
}
