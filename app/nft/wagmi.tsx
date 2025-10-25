// app/nft/wagmi.tsx
"use client";

import { createConfig, http, WagmiProvider } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "@wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo";

export const config = createConfig({
  chains: [bsc],
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({ projectId: WC_PROJECT_ID, showQrModal: true }),
    coinbaseWallet({ appName: "GAD Family" })
  ],
  transports: {
    [bsc.id]: http("https://bsc-dataseed.binance.org")
  },
  ssr: true
});

export const queryClient = new QueryClient();

export function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
