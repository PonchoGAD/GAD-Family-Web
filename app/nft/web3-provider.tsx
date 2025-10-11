"use client";

import { useEffect, useRef } from "react";
import { WagmiProvider, createConfig, http, cookieStorage, createStorage } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWeb3Modal } from "@web3modal/wagmi";
import { bsc } from "viem/chains";

// === ваш RPC и projectId из .env ===
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://bsc-dataseed.binance.org";
const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "";

// Wagmi config с корректным storage для SSR/CSR
const isServer = typeof window === "undefined";

const wagmiConfig = createConfig({
  chains: [bsc],
  transports: { [bsc.id]: http(RPC_URL) },
  ssr: true,
  // storage: cookieStorage на сервере (без IndexedDB), localStorage в браузере
  storage: createStorage({
    storage: isServer ? cookieStorage : window.localStorage,
  }),
});

const queryClient = new QueryClient();

export default function Web3Providers({ children }: { children: React.ReactNode }) {
  const initedRef = useRef(false);

  useEffect(() => {
    if (initedRef.current) return;             // не допустить повторной инициализации
    if (typeof window === "undefined") return; // только в браузере
    if (!PROJECT_ID) return;                   // если не задан — пропускаем

    initedRef.current = true;

    createWeb3Modal({
      wagmiConfig,
      projectId: PROJECT_ID,
      enableAnalytics: false,
      // никакого SSR-рендера модалки
      // можно добавить UI-настройки по желанию
    });
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
