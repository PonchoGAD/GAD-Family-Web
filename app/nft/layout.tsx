// app/nft/ClientLayout.tsx
"use client";

import NftProvider from "./providers/NftProvider";
import WalletConnectButton from "../components/WalletConnectButton";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <NftProvider>
      {/* Простая верхняя панель — можешь стилизовать под твой UI */}
      <div className="w-full flex items-center justify-end gap-3 p-4">
        <WalletConnectButton />
      </div>

      {children}
    </NftProvider>
  );
}
