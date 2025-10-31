import type { Metadata } from "next";
import CollectionClient from "./CollectionClient";

export const metadata: Metadata = {
  title: "GAD — NFT Collection",
  description: "Explore NFTs from a specific collection on BNB Chain.",
};

export default function CollectionPage({
  params,
}: {
  params: { address: string };
}) {
  return <CollectionClient addressProp={params.address} />;
}
