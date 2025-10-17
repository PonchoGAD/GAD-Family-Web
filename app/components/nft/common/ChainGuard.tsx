"use client";

import { useEffect, useState } from "react";
import { DEFAULT_CHAIN } from "../../../lib/nft/chains";

export default function ChainGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ok, setOk] = useState(true);

  useEffect(() => {
    const anyWin = window as any;
    const eth = anyWin?.ethereum;
    if (!eth) return;

    const check = async () => {
      try {
        const chainHex = await eth.request({ method: "eth_chainId" });
        const current = parseInt(chainHex, 16);
        setOk(current === DEFAULT_CHAIN.id);
      } catch {
        setOk(true);
      }
    };

    check();
    eth?.on?.("chainChanged", check);
    return () => eth?.removeListener?.("chainChanged", check);
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
