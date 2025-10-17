"use client";

import React from "react";
import { ethers } from "ethers";

export default function WalletConnect() {
  const [account, setAccount] = React.useState<string | null>(null);
  const [chainId, setChainId] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const eth = (globalThis as any)?.ethereum;
    if (!eth) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      setAccount(accounts?.[0] ?? null);
    };
    const handleChainChanged = (hexId: string) => {
      const id = Number(hexId);
      setChainId(isNaN(id) ? null : id);
    };

    eth.request({ method: "eth_accounts" })
      .then((acc: string[]) => setAccount(acc?.[0] ?? null))
      .catch(() => {});
    eth.request({ method: "eth_chainId" })
      .then((id: string) => handleChainChanged(id))
      .catch(() => {});

    eth.on?.("accountsChanged", handleAccountsChanged);
    eth.on?.("chainChanged", handleChainChanged);
    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged);
      eth.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const connect = async () => {
    const eth = (globalThis as any)?.ethereum;
    if (!eth) return alert("Please install MetaMask");
    try {
      setBusy(true);
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      setAccount(accounts?.[0] ?? null);

      // (опционально) переключиться на BSC mainnet (56)
      try {
        await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x38" }] });
      } catch {/* ignore */}
    } catch (e: any) {
      alert(e?.message ?? "Failed to connect");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = () => {
    // настоящего disconnect в EIP-1193 нет — просто чистим локальный стейт
    setAccount(null);
  };

  return (
    <div className="flex items-center gap-3">
      {account ? (
        <>
          <span className="text-sm text-white/70">
            {account.slice(0, 6)}…{account.slice(-4)}{chainId ? ` · chain ${chainId}` : ""}
          </span>
          <button
            onClick={disconnect}
            className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-white text-sm"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={connect}
          disabled={busy}
          className="px-4 py-2 rounded bg-[#ffd166] text-[#0b0f17] font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Connecting…" : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}
