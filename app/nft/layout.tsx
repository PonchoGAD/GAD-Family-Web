// app/nft/layout.tsx
import React from "react";
import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "GAD NFT Marketplace",
  description: "Mint, list and collect GAD NFTs on BNB Chain."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
