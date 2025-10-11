import Link from "next/link";

export default function PortfolioGrid({
  items,
}: { items: { nft: string; tokenId: string }[] }) {
  if (!items?.length) return <div className="opacity-60">No NFTs found.</div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((i) => (
        <Link key={`${i.nft}-${i.tokenId}`} href={`/nft/asset/${i.nft}/${i.tokenId}`} className="border rounded p-3 hover:bg-gray-50">
          <div className="text-sm opacity-70">{i.nft.slice(0, 6)}…{i.nft.slice(-4)}</div>
          <div className="font-semibold">Token #{i.tokenId}</div>
        </Link>
      ))}
    </div>
  );
}
