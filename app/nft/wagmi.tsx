// app/nft/wagmi.tsx
"use client";

import { PropsWithChildren, useEffect, useRef } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  avalanche,
  avalancheFuji,
  bsc,
  bscTestnet,
  sepolia,
} from "viem/chains";

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 56);
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || undefined;

// Определяем выбранную сеть
export const CHAIN =
  CHAIN_ID === bsc.id
    ? bsc
    : CHAIN_ID === bscTestnet.id
    ? bscTestnet
    : CHAIN_ID === avalanche.id
    ? avalanche
    : CHAIN_ID === avalancheFuji.id
    ? avalancheFuji
    : sepolia;

// Список поддерживаемых сетей
const ALL_CHAINS = [bsc, bscTestnet, avalanche, avalancheFuji, sepolia] as const;

// Транспорты — используем `default.http`, без `.public`
const transports = {
  [bsc.id]: http(RPC_URL || bsc.rpcUrls.default.http[0]),
  [bscTestnet.id]: http(RPC_URL || bscTestnet.rpcUrls.default.http[0]),
  [avalanche.id]: http(RPC_URL || avalanche.rpcUrls.default.http[0]),
  [avalancheFuji.id]: http(RPC_URL || avalancheFuji.rpcUrls.default.http[0]),
  [sepolia.id]: http(RPC_URL || sepolia.rpcUrls.default.http[0]),
} as const;

// Конфигурация wagmi
export const config = createConfig({
  chains: ALL_CHAINS,
  transports,
  ssr: true,
});

// Алиас для старых импортов
export const wagmiConfig = config;

const queryClient = new QueryClient();

export function Providers({ children }: PropsWithChildren) {
  const inited = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (inited.current) return;
    inited.current = true;

    (async () => {
      try {
        const { createWeb3Modal } = await import("@web3modal/wagmi/react");

        const projectId =
          process.env.NEXT_PUBLIC_WC_ID ||
          process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
          "";

        if (!projectId) {
          console.warn("WalletConnect projectId is missing");
          return;
        }

        createWeb3Modal({
          wagmiConfig: config,
          projectId,
          enableAnalytics: false,
          enableOnramp: false,
          themeMode: "dark",
        });
      } catch (e) {
        console.error("Web3Modal init failed:", e);
      }
    })();
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
