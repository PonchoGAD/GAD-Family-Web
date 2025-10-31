"use client";

import React from "react";
import { ethers } from "ethers";

type EIP1193 = {
  request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
};

type Props = {
  className?: string;
  onConnectedAction?: (address: string, signer: ethers.Signer) => void;
  onDisconnectedAction?: () => void;
};

function getEth(): EIP1193 | undefined {
  return (window as unknown as { ethereum?: EIP1193 }).ethereum;
}

export default function AiMintClient({ className, onConnectedAction, onDisconnectedAction }: Props) {
  const [account, setAccount] = React.useState<string | null>(null);
  const [chainId, setChainId] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string>("");

  React.useEffect(() => {
    const eth = getEth();
    if (!eth) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts?.length) {
        const addr = accounts[0];
        setAccount(addr);
        try {
          const provider = new ethers.BrowserProvider(eth);
          const signer = await provider.getSigner();
          onConnectedAction?.(addr, signer);
        } catch { /* ignore */ }
      } else {
        setAccount(null);
        onDisconnectedAction?.();
      }
    };

    const handleChainChanged = (hexId: string) => {
      const id = Number(hexId);
      setChainId(Number.isNaN(id) ? null : id);
    };

    void eth.request({ method: "eth_accounts" }).then((res) => {
      handleAccountsChanged(res as string[]);
    }).catch(() => {});

    void eth.request({ method: "eth_chainId" }).then((res) => {
      handleChainChanged(String(res));
    }).catch(() => {});

    eth.on?.("accountsChanged", handleAccountsChanged);
    eth.on?.("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged);
      eth.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [onConnectedAction, onDisconnectedAction]);

  const connect = async () => {
    const eth = getEth();
    if (!eth) {
      setMsg("Please install MetaMask");
      return;
    }

    try {
      setBusy(true);
      setMsg("");
      const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[];
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
      } catch { /* user may reject, ignore */ }

      onConnectedAction?.(addr, signer);
    } catch (e: unknown) {
      const er = e as { message?: string };
      setMsg(er?.message ?? "Failed to connect");
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
      <div className="flex items-center justify-center gap-3 mt-2">
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
      {msg && <div className="text-xs text-red-400 text-center mt-2">{msg}</div>}
    </div>
  );
}
