// app/nft/hooks/useWallet.ts
"use client";
import { useCallback, useEffect, useState } from "react";
import { connectWallet, Web3State } from "../wallet/safeWeb3";

const EMPTY: Web3State = { provider: null, signer: null, account: null, chainId: null };

export function useWallet() {
  const [state, setState] = useState<Web3State>(EMPTY);

  const connect = useCallback(async () => {
    const next = await connectWallet();
    setState(next);
  }, []);

  const disconnect = useCallback(() => {
    // У «инжектед» дисконнект — это по сути очистка локального состояния.
    setState(EMPTY);
  }, []);

  // подписки на события кошелька
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    const eth = (window as any).ethereum;

    const handleAccounts = (accounts: string[]) =>
      setState((s) => ({ ...s, account: accounts[0] ?? null }));

    const handleChain = async () => {
      // Обновим chainId (и по желанию signer)
      try {
        const next = await connectWallet();
        setState((s) => ({ ...s, chainId: next.chainId, provider: next.provider, signer: next.signer }));
      } catch {
        setState((s) => ({ ...s, chainId: null }));
      }
    };

    eth.on?.("accountsChanged", handleAccounts);
    eth.on?.("chainChanged", handleChain);

    return () => {
      eth.removeListener?.("accountsChanged", handleAccounts);
      eth.removeListener?.("chainChanged", handleChain);
    };
  }, []);

  return { ...state, connect, disconnect };
}
