// app/nft/collections/[address]/page.tsx
import type { Metadata } from "next";

type PageParams = { address: string };
type PageProps = { params: Promise<PageParams> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { address } = await params;
  return {
    title: `Collection ${address}`,
    description: `NFT collection ${address}`,
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { address } = await params;

  // твоя логика страницы ниже — не трогаю имен переменных
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Collection</h1>
      <p className="opacity-70">Address: {address}</p>
      {/* ...остальной JSX который у тебя уже был... */}
    </main>
  );
}
