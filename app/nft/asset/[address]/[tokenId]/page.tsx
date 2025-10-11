import AssetClient from "./AssetClient";

export default async function Page({ params }:{ params: Promise<{ address:string; tokenId:string }> }) {
  const { address, tokenId } = await params;
  return <AssetClient address={address} tokenId={tokenId} />;
}
