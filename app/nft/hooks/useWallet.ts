// app/nft/hooks/useWallet.ts
"use client";

import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";

export type Web3State = {
  provider: null;      // оставляем поля для совместимости со старым кодом
  signer: null;
  account: `0x${string}` | null;
  chainId: number | null;
};

const EMPTY: Web3State = { provider: null, signer: null, account: null, chainId: null };

export function useWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const state: Web3State = isConnected
    ? { ...EMPTY, account: address ?? null, chainId: chainId ?? null }
    : EMPTY;

  return {
    ...state,
    connect: () => {
      if (connectors.length === 0) throw new Error("No connectors configured");
      return connect({ connector: connectors[0] });
    },
    disconnect,
    isConnecting: isPending,
    isConnected
  };
}
