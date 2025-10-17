import AssetClient from "./AssetClient";

export default async function Page({
  params,
}: {
  params: Promise<{ address: string; tokenId: string }>;
}) {
  const { address, tokenId } = await params;

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white">
      <AssetClient addressProp={address} tokenIdProp={tokenId} />
    </main>
  );
}
