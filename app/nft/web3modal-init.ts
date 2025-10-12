"use client";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { wagmiConfig } from "./wagmi";

// Прочитает ID из .env
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? "";

// Глобальный флаг, чтобы не инициализировать повторно при HMR/Навигации
declare global {
  interface Window { __W3M_INITIALIZED__?: boolean }
}

if (typeof window !== "undefined" && !window.__W3M_INITIALIZED__) {
  if (!projectId) {
    // Можно тихо не инициализировать, чтобы не падать на билде без ключа
    console.warn("WalletConnect ProjectId is empty (NEXT_PUBLIC_WALLETCONNECT_ID). Web3Modal not initialized.");
  } else {
    createWeb3Modal({
      wagmiConfig,
      projectId,
      enableAnalytics: false,
      themeMode: "dark"
    });
    window.__W3M_INITIALIZED__ = true;
  }
}
