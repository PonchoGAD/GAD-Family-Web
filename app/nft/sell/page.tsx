import SellClient from './SellClient';
export default async function Page({ params }:{ params: Promise<{address:string; tokenId:string}> }) {
  const { address, tokenId } = await params;
  return <SellClient address={address} tokenId={tokenId}/>;
}
