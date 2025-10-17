import AssetClient from "./AssetClient";

export default async function Page({
  params,
}: {
  params: { address: string; tokenId: string };
}) {
  const { address, tokenId } = params;
  return <AssetClient addressProp={address} tokenIdProp={tokenId} />;
}
