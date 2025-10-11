import type { Metadata } from "next";
import { Providers } from "./wagmi";
import NftShell from "../components/nft/layout/NftShell";

export const metadata: Metadata = { title: "GAD NFT" };

export default function NftLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <NftShell>{children}</NftShell>
    </Providers>
  );
}
