"use client";

import NftProvider from "./providers/NftProvider";
import WalletConnectButton from "../components/WalletConnectButton";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <NftProvider>
      <header className="w-full flex items-center justify-between p-4 border-b border-white/10">
        <h1 className="text-lg font-bold text-white">GAD NFT Marketplace</h1>
        <WalletConnectButton />
      </header>

      <main>{children}</main>
    </NftProvider>
  );
}
