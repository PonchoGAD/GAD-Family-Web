"use client";

import React from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "@wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// --- настройки env ---
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID; // реальный ID (уже есть в .env)
const RPC_BSC =
  process.env.NEXT_PUBLIC_RPC_BSC ||
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://bsc-dataseed.binance.org";

// --- коннекторы ---
const connectors = [
  injected({ shimDisconnect: true }),
  coinbaseWallet({ appName: "GAD Family" }),
  ...(WC_PROJECT_ID
    ? [walletConnect({ projectId: WC_PROJECT_ID, showQrModal: true })]
    : []),
];

// предупреждение, если WC ID не задан
if (typeof window !== "undefined" && !WC_PROJECT_ID) {
  console.warn(
    "[wagmi] NEXT_PUBLIC_WC_PROJECT_ID is not set — WalletConnect disabled."
  );
}

// --- конфиг wagmi ---
export const config = createConfig({
  chains: [bsc],
  connectors,
  transports: {
    [bsc.id]: http(RPC_BSC),
  },
  ssr: true,
});

// --- провайдер ---
export const queryClient = new QueryClient();

export function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
