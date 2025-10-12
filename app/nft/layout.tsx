import type { Metadata } from "next";
import Web3Root from "./Web3Root";
import NftShell from "../components/nft/layout/NftShell";

export const metadata: Metadata = { title: "GAD NFT" };

export default function NftLayout({ children }: { children: React.ReactNode }) {
  // Вся клиентская инициализация — внутри Web3Root (Client Component)
  return (
    <Web3Root>
      <NftShell>{children}</NftShell>
    </Web3Root>
  );
}
