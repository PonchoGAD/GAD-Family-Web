"use client";

import { useEffect, useState, type ReactNode } from "react";
import { DEFAULT_CHAIN } from "../../../lib/nft/chains";

type EIP1193 = {
  request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
};

function getEth(): EIP1193 | undefined {
  return (window as unknown as { ethereum?: EIP1193 }).ethereum;
}

export default function ChainGuard({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(true);

  useEffect(() => {
    const eth = getEth();
    if (!eth) return;

    const check = async () => {
      try {
        const chainHex = (await eth.request({ method: "eth_chainId" })) as string;
        const current = parseInt(chainHex, 16);
        setOk(current === DEFAULT_CHAIN.id);
      } catch {
        setOk(true);
      }
    };

    void check();
    eth.on?.("chainChanged", check);
    return () => eth.removeListener?.("chainChanged", check);
  }, []);

  if (!ok) {
    return (
      <div className="p-4 border rounded bg-yellow-50 text-yellow-900">
        You are connected to a wrong network. Please switch to <b>{DEFAULT_CHAIN.name}</b>.
      </div>
    );
  }

  return <>{children}</>;
}
