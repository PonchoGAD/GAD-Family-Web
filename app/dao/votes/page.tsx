"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers, Contract, type Eip1193Provider } from "ethers";
import { ADDR } from "../../lib/nft/config";
import { xc20votesAbi } from "../../lib/dao/abis/xc20votes";

type Info = {
  address: string;
  symbol: string;
  decimals: number;
  balance: string;
  votes: string;
  delegate: string;
};

type WindowWithEthereum = Window & { ethereum?: Eip1193Provider };

export default function DaoVotesPage() {
  const [info, setInfo] = useState<Info | null>(null);
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const hasWallet = useMemo(
    () =>
      typeof window !== "undefined" &&
      Boolean((window as WindowWithEthereum).ethereum),
    []
  );

  // загрузка текущего аккаунта и данных xGAD
  useEffect(() => {
    (async () => {
      try {
        if (!hasWallet) return;
        const eth = (window as WindowWithEthereum).ethereum;
        if (!eth) return;

        const provider = new ethers.BrowserProvider(eth);
        const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
        const account = accounts?.[0];
        if (!account) return;

        const signer = await provider.getSigner();
        const xgad = new Contract(ADDR.XGAD, xc20votesAbi, signer);

        const [symbol, decimals, balRaw, votesRaw, delegateAddr] = await Promise.all([
          xgad.symbol(),
          xgad.decimals(),
          xgad.balanceOf(account),
          xgad.getVotes(account),
          xgad.delegates(account),
        ]);

        setInfo({
          address: account,
          symbol,
          decimals: Number(decimals),
          balance: ethers.formatUnits(balRaw, decimals),
          votes: ethers.formatUnits(votesRaw, decimals),
          delegate: delegateAddr,
        });
      } catch {
        // ignore
      }
    })();
  }, [hasWallet]);

  const delegate = async (dst: string) => {
    setBusy(true);
    setMsg("");
    try {
      const eth = (window as WindowWithEthereum).ethereum;
      if (!eth) throw new Error("Wallet not found");
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const xgad = new Contract(ADDR.XGAD, xc20votesAbi, signer);

      if (!ethers.isAddress(dst)) throw new Error("Invalid address");
      const tx = await xgad.delegate(dst);
      await tx.wait();
      setMsg("✅ Delegation updated");

      // refresh
      const acct = await signer.getAddress();
      const [balRaw, votesRaw, delegateAddr, decimals] = await Promise.all([
        xgad.balanceOf(acct),
        xgad.getVotes(acct),
        xgad.delegates(acct),
        xgad.decimals(),
      ]);
      setInfo((prev) =>
        prev
          ? {
              ...prev,
              balance: ethers.formatUnits(balRaw, decimals),
              votes: ethers.formatUnits(votesRaw, decimals),
              delegate: delegateAddr,
            }
          : prev
      );
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const delegateToSelf = async () => {
    if (!info?.address) return;
    await delegate(info.address);
  };

  const clearDelegation = async () => {
    // Для ERC20Votes делегирование на address(0) обнуляет делегата.
    await delegate(ethers.ZeroAddress);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0E0E12] to-[#1C2025] text-white">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-extrabold">Delegate xGAD votes</h1>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          {info ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="opacity-70">Your address</div>
                <div className="font-mono">
                  {info.address.slice(0, 10)}…{info.address.slice(-8)}
                </div>

                <div className="opacity-70">Token</div>
                <div>{info.symbol}</div>

                <div className="opacity-70">Balance</div>
                <div>
                  {info.balance} {info.symbol}
                </div>

                <div className="opacity-70">Votes</div>
                <div>{info.votes}</div>

                <div className="opacity-70">Delegate</div>
                <div className="font-mono">
                  {info.delegate === ethers.ZeroAddress
                    ? "— (none)"
                    : `${info.delegate.slice(0, 10)}…${info.delegate.slice(-8)}`}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm opacity-80">Delegate to address</label>
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 font-mono"
                  placeholder="0x..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => delegate(to)}
                    disabled={busy || !to}
                    className="rounded-xl px-3 py-2 bg-[#FFD166] text-[#0B0F17] font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {busy ? "Processing…" : "Delegate"}
                  </button>
                  <button
                    onClick={delegateToSelf}
                    disabled={busy || !info.address}
                    className="rounded-xl px-3 py-2 border border-white/20 hover:border-white/40"
                  >
                    Delegate to self
                  </button>
                  <button
                    onClick={clearDelegation}
                    disabled={busy}
                    className="rounded-xl px-3 py-2 border border-white/20 hover:border-white/40"
                  >
                    Clear (0x0)
                  </button>
                </div>
              </div>

              {msg && <div className="text-sm opacity-80">{msg}</div>}
            </>
          ) : (
            <div className="text-white/70">
              Connect your wallet to view and manage delegation.
            </div>
          )}
        </div>

        <div className="text-xs text-white/60 space-y-1">
          <div>xGAD: {ADDR.XGAD}</div>
          <div>Governor: {ADDR.GOVERNOR}</div>
        </div>
      </div>
    </main>
  );
}
