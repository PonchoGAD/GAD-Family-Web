"use client";

import { useEffect, useMemo, useState } from "react";
import { useChainId, useSwitchChain } from "wagmi";

// Читаем ожидаемую сеть из env (клиентская!)
const EXPECTED_CHAIN_ID =
  Number(process.env.NEXT_PUBLIC_CHAIN_ID || "56"); // BSC Mainnet по умолчанию
const EXPECTED_CHAIN_NAME =
  process.env.NEXT_PUBLIC_CHAIN_NAME || "BNB Smart Chain";

export default function ChainGuard({ children }: { children: React.ReactNode }) {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [supported, setSupported] = useState(true);

  // Если switchChain не поддержан (например, кошелёк не даёт), прячем кнопку
  useEffect(() => {
    setSupported(!!switchChain);
  }, [switchChain]);

  const ok = useMemo(() => {
    if (!chainId) return true; // до коннекта — не мешаем рендеру
    return chainId === EXPECTED_CHAIN_ID;
  }, [chainId]);

  if (!ok) {
    return (
      <div className="p-4 border rounded bg-yellow-50 text-yellow-900">
        <div className="font-semibold mb-1">Wrong network</div>
        <div className="text-sm mb-2">
          Please switch to <b>{EXPECTED_CHAIN_NAME}</b> (chainId {EXPECTED_CHAIN_ID}).
        </div>
        {supported ? (
          <button
            onClick={() => switchChain?.({ chainId: EXPECTED_CHAIN_ID })}
            className="border px-3 py-2 rounded"
          >
            Switch in wallet
          </button>
        ) : null}
      </div>
    );
  }

  return <>{children}</>;
}
