"use client";

import { type ReactNode } from "react";
import { WagmiProvider, http, createStorage, cookieStorage } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

export const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

const chains = [bsc, bscTestnet] as const;

export const wagmiConfig = defaultWagmiConfig({
  projectId,
  chains,
  transports: {
    [bsc.id]: http("https://bsc-dataseed.binance.org"),
    [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.bnbchain.org:8545"),
  },
  metadata: {
    name: "GAD dApp",
    description: "GAD web app",
    url: "https://example.com", // замени при желании
    icons: ["https://example.com/icon.png"], // замени при желании
  },
  // чтобы не падал SSR: храним состояние в cookie
  ssr: true,
  storage: createStorage({ storage: cookieStorage })
});

const queryClient = new QueryClient();

/** Глобальные провайдеры для /app/nft */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

// (опционально) default-экспорт если где-то импортят по умолчанию
export default wagmiConfig;
