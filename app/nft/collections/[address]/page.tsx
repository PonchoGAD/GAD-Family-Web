import CollectionClient from "./CollectionClient";

export default function Page({ params }: { params: { address: string } }) {
  const { address } = params;
  return <CollectionClient address={address} />;
}
