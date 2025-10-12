// app/nft/layout.tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: "GAD NFT" };

import ClientLayout from "./Web3Root"; // клиентский корень

export default function NftLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
