'use client';

import AssetClient from './AssetClient';

interface PageParams {
  address: string;
  tokenId: string;
}

// ✅ Убираем async и Promise, чтобы не ломалось при билде
export default function Page({ params }: { params: PageParams }) {
  const { address, tokenId } = params;

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white flex flex-col items-center justify-center p-6">
      <AssetClient addressProp={address} tokenIdProp={tokenId} />
    </main>
  );
}
