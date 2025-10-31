import AssetClient from "./AssetClient";

export default function Page({
  params,
}: {
  params: { address: string; tokenId: string };
}) {
  const { address, tokenId } = params;

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white">
      <AssetClient addressProp={address} tokenIdProp={tokenId} />
    </main>
  );
}
