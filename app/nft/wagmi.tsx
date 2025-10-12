"use client";

import React from "react";
import { createConfig, http, WagmiProvider as BaseWagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { bsc, bscTestnet, avalanche, avalancheFuji, sepolia } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [bsc, bscTestnet, avalanche, avalancheFuji, sepolia],
  transports: {
    [bsc.id]: http("https://bsc-dataseed.binance.org"),
    [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.bnbchain.org:8545"),
    [avalanche.id]: http("https://api.avax.network/ext/bc/C/rpc"),
    [avalancheFuji.id]: http("https://api.avax-test.network/ext/bc/C/rpc"),
    [sepolia.id]: http("https://sepolia.drpc.org"),
  },
  ssr: true,
});

const qc = new QueryClient();

// 👇 экспорт должен называться WagmiProvider (именно так его ждёт Web3Root)
export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseWagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </BaseWagmiProvider>
  );
}
