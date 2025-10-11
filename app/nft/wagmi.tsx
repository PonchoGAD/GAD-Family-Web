"use client";

import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { bsc } from "wagmi/chains";

export const CHAIN = bsc;

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
const metadata = {
  name: "GAD NFT Marketplace",
  description: "Mint, buy, and trade NFTs powered by GAD.",
  url: "https://gad-family.com/nft",
  icons: ["https://gad-family.com/logo-32.png"]
};

export const config = defaultWagmiConfig({
  chains: [CHAIN],
  projectId,
  metadata,
  enableInjected: true,
  enableWalletConnect: true,
  ssr: true
});

// алиас, чтобы не переписывать другие файлы
export const wagmiConfig = config;

createWeb3Modal({
  wagmiConfig: config,
  projectId
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
