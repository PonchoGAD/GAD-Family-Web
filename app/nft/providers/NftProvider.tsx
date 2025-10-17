"use client";

import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { wagmiConfig } from "../wagmi";
import { useEffect } from "react";
import { initWeb3ModalOnce } from "../safe-web3";

const queryClient = new QueryClient();

export default function NftProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      initWeb3ModalOnce();
    } catch (e) {
      console.warn("⚠️ Web3Modal init failed", e);
    }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
