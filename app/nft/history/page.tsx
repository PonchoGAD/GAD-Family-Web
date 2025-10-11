"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import ConnectButton from "../../components/nft/common/ConnectButton";

type MintItem = {
  txHash: string;
  tokenId: string;
  uri: string;
};

export default function HistoryPage() {
  const { address, isConnected } = useAccount();
  const [items, setItems] = useState<MintItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) return;
    (async () => {
      setLoading(true);
      try {
        // твоя логика получения логов
        const logs: any[] = []; // <- замени на реальный вызов
        const parsed = logs.map((log: any) => ({
          txHash: log.transactionHash as string,
          tokenId: (log.args?.tokenId ?? "").toString(),
          uri: (log.args?.uri ?? ""),
        })) as MintItem[];
        setItems(parsed);
      } finally {
        setLoading(false);
      }
    })();
  }, [isConnected, address]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">History</h1>
        <ConnectButton />
      </div>

      {loading ? <div>Loading…</div> : null}
      {!loading && items.length === 0 ? <div>No items</div> : null}

      <div className="space-y-2">
        {items.map((x) => (
          <div key={x.txHash} className="border rounded p-3">
            <div className="text-sm opacity-70">Tx: {x.txHash}</div>
            <div>Token #{x.tokenId}</div>
            <div className="text-xs break-words">{x.uri}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
