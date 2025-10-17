"use client";

import { createConfig, http } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "@wagmi/connectors";
import { QueryClient } from "@tanstack/react-query";

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo";

export const wagmiConfig = createConfig({
  chains: [bsc],
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({
      projectId: WC_PROJECT_ID,
      showQrModal: true,
    }),
    coinbaseWallet({
      appName: "GAD Family",
      preference: "smartWalletOnly", // можешь убрать, если не нужно
    }),
  ],
  transports: {
    [bsc.id]: http("https://bsc-dataseed.binance.org"),
  },
  ssr: true,
});

export const queryClient = new QueryClient();

export const DEFAULT_CHAIN_ID = bsc.id;
export const DEFAULT_NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT721_ADDR as
  | `0x${string}`
  | undefined;
