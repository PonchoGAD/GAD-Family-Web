import type { Metadata } from "next";
import NftShell from "../components/nft/layout/NftShell";
import ClientProviders from "./ClientProviders";

export const metadata: Metadata = { title: "GAD NFT" };

export default function NftLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <NftShell>{children}</NftShell>
    </ClientProviders>
  );
}
