"use client";

import { useEffect, useRef } from "react";
import { WagmiProvider, createConfig, http, cookieStorage, createStorage } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { bsc } from "viem/chains";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://bsc-dataseed.binance.org";
const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "";

// Важное: никаких импортов @web3modal/* на верхнем уровне!
// Все — только внутри useEffect + в браузере.

const isServer = typeof window === "undefined";

export const wagmiConfig = createConfig({
  chains: [bsc],
  transports: { [bsc.id]: http(RPC_URL) },
  ssr: true,
  storage: createStorage({
    storage: isServer ? cookieStorage : window.localStorage, // на сервере — cookie, в браузере — localStorage
  }),
});

const queryClient = new QueryClient();

export default function Web3Providers({ children }: { children: React.ReactNode }) {
  const initedRef = useRef(false);

  useEffect(() => {
    // строго в браузере и только один раз
    if (initedRef.current) return;
    if (typeof window === "undefined") return;
    if (!PROJECT_ID) return;

    initedRef.current = true;

    (async () => {
      const { createWeb3Modal } = await import("@web3modal/wagmi"); // ленивый импорт
      createWeb3Modal({
        wagmiConfig,
        projectId: PROJECT_ID,
        enableAnalytics: false,
      });
    })();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
