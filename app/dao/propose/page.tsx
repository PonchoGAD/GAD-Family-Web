"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers, Contract, Interface } from "ethers";
import { ADDR } from "../../lib/nft/config";
import { governorAbi } from "../../lib/dao/abis/governor";
import { treasuryAbi } from "../../lib/dao/abis/treasury";

const erc20AbiMin = [
  "function decimals() view returns (uint8)",
  "function transfer(address to,uint256 amount) returns (bool)",
] as const;

type PayoutKind = "BNB" | "USDT";

export default function DaoProposePage() {
  const [kind, setKind] = useState<PayoutKind>("BNB");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("0.1");
  const [desc, setDesc] = useState("Payout from Treasury");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const ok = useMemo(() => {
    try {
      return ethers.isAddress(to) && Number(amount) > 0 && desc.trim().length > 0;
    } catch {
      return false;
    }
  }, [to, amount, desc]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const eth = (window as unknown as { ethereum?: unknown }).ethereum;
    if (!eth) console.warn("MetaMask not found");
  }, []);

  const propose = async () => {
    setBusy(true);
    setMsg("");
    try {
      const eth = (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum;
      if (!eth) throw new Error("Wallet not found");
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();

      const governor = new Contract(ADDR.GOVERNOR, governorAbi, signer);

      const targets: string[] = [];
      const values: bigint[] = [];
      const calldatas: string[] = [];

      if (kind === "BNB") {
        const valueWei = ethers.parseEther(amount);
        const treasuryIf = new Interface(treasuryAbi);
        const data = treasuryIf.encodeFunctionData("execute", [to, valueWei, "0x"]);
        targets.push(ADDR.TREASURY);
        values.push(0n);
        calldatas.push(data);
      } else {
        const usdt = new Contract(ADDR.USDT, erc20AbiMin, signer);
        const dec = await usdt.decimals().catch(() => 18);
        const amt = ethers.parseUnits(amount, dec);
        const ercIf = new Interface(erc20AbiMin);
        const xfer = ercIf.encodeFunctionData("transfer", [to, amt]);

        const treasuryIf = new Interface(treasuryAbi);
        const data = treasuryIf.encodeFunctionData("execute", [ADDR.USDT, 0n, xfer]);

        targets.push(ADDR.TREASURY);
        values.push(0n);
        calldatas.push(data);
      }

      const tx = await governor.propose(targets, values, calldatas, desc);
      const rc = await tx.wait();

      let proposalId: string | null = null;
      for (const lg of rc.logs) {
        try {
          const parsed = governor.interface.parseLog(lg);
          if (parsed?.name === "ProposalCreated") {
            proposalId = parsed.args?.proposalId?.toString?.() ?? null;
            break;
          }
        } catch {
          /* ignore */
        }
      }
      setMsg(proposalId ? `✅ Proposal created: #${proposalId}` : "✅ Proposal tx mined");
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : String(e);
      setMsg(m);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0E0E12] to-[#1C2025] text-white">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-extrabold">Create Proposal</h1>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setKind("BNB")}
              className={`rounded-xl px-3 py-2 border ${kind === "BNB" ? "border-yellow-400 bg-yellow-400/10" : "border-white/10 hover:border-white/30"}`}
            >
              💰 Payout BNB
            </button>
            <button
              onClick={() => setKind("USDT")}
              className={`rounded-xl px-3 py-2 border ${kind === "USDT" ? "border-emerald-400 bg-emerald-400/10" : "border-white/10 hover:border-white/30"}`}
            >
              💵 Payout USDT
            </button>
          </div>

          <label className="block text-sm opacity-80">Recipient</label>
          <input
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
            placeholder="0x..."
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />

          <label className="block text-sm opacity-80">Amount {kind}</label>
          <input
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
            placeholder={kind === "BNB" ? "0.10" : "100.0"}
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(",", "."))}
          />

          <label className="block text-sm opacity-80">Description</label>
          <textarea
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
            rows={3}
            placeholder="Brief description..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <button
            onClick={propose}
            disabled={!ok || busy}
            className="w-full rounded-xl px-4 py-3 bg-[#FFD166] text-[#0B0F17] font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Submit Proposal"}
          </button>

          {msg && <div className="text-sm opacity-80">{msg}</div>}
        </div>

        <div className="text-xs text-white/60 space-y-1">
          <div>Governor: {ADDR.GOVERNOR}</div>
          <div>Treasury: {ADDR.TREASURY}</div>
          <div>USDT: {ADDR.USDT}</div>
        </div>
      </div>
    </main>
  );
}
