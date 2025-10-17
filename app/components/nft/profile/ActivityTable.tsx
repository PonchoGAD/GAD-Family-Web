"use client";

import { useEffect, useState } from "react";
import { DEFAULT_CHAIN } from "../../../lib/nft/chains";
import { shorten } from "../../../lib/nft/utils";

type Activity = {
  tx: string;
  event: string;
  tokenId: string;
  price: string;
  currency: string;
  time: string;
};

export default function ActivityTable({ address }: { address: string }) {
  const [list, setList] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    (async () => {
      setLoading(true);
      // demo-данные — позже подключим on-chain event logs
      const dummy: Activity[] = [
        {
          tx: "0xabc123...",
          event: "Bought",
          tokenId: "12",
          price: "0.25",
          currency: "BNB",
          time: "2 days ago",
        },
        {
          tx: "0xdef456...",
          event: "Listed",
          tokenId: "14",
          price: "0.30",
          currency: "USDT",
          time: "5 days ago",
        },
      ];
      setList(dummy);
      setLoading(false);
    })();
  }, [address]);

  return (
    <div className="border rounded bg-[#0E0E12]/60 p-3 text-white">
      <div className="font-semibold mb-2 text-lg">Recent Activity</div>
      {loading ? (
        <div className="opacity-70 text-sm">Loading on-chain data…</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="opacity-70 border-b border-gray-700">
            <tr>
              <th align="left">Event</th>
              <th>Token ID</th>
              <th>Price</th>
              <th>Time</th>
              <th>Tx</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a, i) => (
              <tr key={i} className="border-b border-gray-800">
                <td>{a.event}</td>
                <td align="center">#{a.tokenId}</td>
                <td align="center">
                  {a.price} {a.currency}
                </td>
                <td align="center">{a.time}</td>
                <td>
                  <a
                    href={`${DEFAULT_CHAIN.explorer}/tx/${a.tx}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline opacity-80 hover:opacity-100"
                  >
                    {shorten(a.tx)}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
