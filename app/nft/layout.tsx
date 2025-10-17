import type { Metadata } from "next";
import NftProvider from "./providers/NftProvider";

export const metadata: Metadata = {
  title: "GAD — NFT",
  description: "NFT features for GAD",
};

export default function NftLayout({ children }: { children: React.ReactNode }) {
  // Серверный layout → рендерит клиентский провайдер (внутри уже есть "use client")
  return <NftProvider>{children}</NftProvider>;
}
