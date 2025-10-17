"use client";

import React from "react";
import { ethers } from "ethers";

type Props = {
  className?: string;
  onConnectedAction?: (address: string, signer: ethers.Signer) => void;
  onDisconnectedAction?: () => void;
};

export default function AiMintClient({ className, onConnectedAction, onDisconnectedAction }: Props) {
  const [account, setAccount] = React.useState<string | null>(null);
  const [chainId, setChainId] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const eth = (window as any)?.ethereum;
    if (!eth) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts?.length) {
        const addr = accounts[0];
        setAccount(addr);
        try {
          const provider = new ethers.BrowserProvider(eth);
          const signer = await provider.getSigner();
          onConnectedAction?.(addr, signer);
        } catch {}
      } else {
        setAccount(null);
        onDisconnectedAction?.();
      }
    };

    const handleChainChanged = (hexId: string) => {
      const id = Number(hexId);
      setChainId(isNaN(id) ? null : id);
    };

    eth.request({ method: "eth_accounts" }).then(handleAccountsChanged).catch(() => {});
    eth.request({ method: "eth_chainId" }).then(handleChainChanged).catch(() => {});
    eth.on?.("accountsChanged", handleAccountsChanged);
    eth.on?.("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged);
      eth.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [onConnectedAction, onDisconnectedAction]);

  const connect = async () => {
    const eth = (window as any)?.ethereum;
    if (!eth) return alert("Please install MetaMask");

    try {
      setBusy(true);
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      if (!accounts?.length) return;

      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);

      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }],
        });
      } catch {}

      onConnectedAction?.(addr, signer);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Failed to connect");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    onDisconnectedAction?.();
  };

  return (
    <div className={className ?? ""}>
      <div className="flex items-center justify-center gap-3 mt-6">
        {account ? (
          <>
            <span className="text-sm text-white/70">
              {account.slice(0, 6)}…{account.slice(-4)}
              {chainId ? ` · Chain ${chainId}` : ""}
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
            className="px-5 py-3 rounded-lg bg-[#FFD166] text-[#0B0F17] font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Connecting…" : "Connect Wallet"}
          </button>
        )}
      </div>
    </div>
  );
}
