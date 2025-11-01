"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ethers, Contract } from "ethers";
import { ADDR } from "../../../lib/nft/config";
import { governorAbi } from "../../../lib/dao/abis/governor";

type GovInfo = {
  state: string;
  snapshot: string;
  deadline: string;
  quorum: string;
  clock: string;
};

// Узкий интерфейс для Governor с методами по proposalId (если они есть)
type GovWithIdOps = {
  queue?: (proposalId: string | bigint) => Promise<{ wait: () => Promise<unknown> }>;
  execute?: (proposalId: string | bigint) => Promise<{ wait: () => Promise<unknown> }>;
};

export default function ProposalPage() {
  const params = useParams<{ id: string }>();
  const proposalId = params?.id || "";

  const [info, setInfo] = useState<GovInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [voteBusy, setVoteBusy] = useState(false);
  const [opMsg, setOpMsg] = useState("");

  // Advanced queue/execute inputs
  const [desc, setDesc] = useState("");
  const [targets, setTargets] = useState<string>("");
  const [values, setValues] = useState<string>("");
  const [calldatas, setCalldatas] = useState<string>("");

  const canOperate = useMemo(() => proposalId && proposalId.length > 0, [proposalId]);

  useEffect(() => {
    if (!proposalId) return;
    (async () => {
      try {
        const RPC =
          process.env.NEXT_PUBLIC_RPC_URL ||
          "https://bsc-dataseed1.binance.org";
        const provider = new ethers.JsonRpcProvider(RPC);
        const gov = new Contract(ADDR.GOVERNOR, governorAbi, provider);

        const [clock, stateNum, snap, ddl] = await Promise.all([
          gov.clock(),
          gov.state(proposalId),
          gov.proposalSnapshot(proposalId),
          gov.proposalDeadline(proposalId),
        ]);
        const quorum = await gov.quorum(clock);

        const stateStr = typeof stateNum === "number" ? stateNum.toString() : String(stateNum);
        setInfo({
          clock: String(clock),
          quorum: quorum.toString(),
          snapshot: String(snap),
          deadline: String(ddl),
          state: stateStr,
        });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [proposalId]);

  const vote = async (support: 0 | 1 | 2, reason?: string) => {
    setVoteBusy(true);
    setOpMsg("");
    try {
      const eth = (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum;
      if (!eth) throw new Error("Wallet not found");
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const gov = new Contract(ADDR.GOVERNOR, governorAbi, signer);

      try {
        const tx = await gov.castVoteWithReason(proposalId, support, reason ?? "");
        await tx.wait();
      } catch {
        const tx = await gov.castVote(proposalId, support);
        await tx.wait();
      }
      setOpMsg("✅ Vote submitted");
    } catch (e: unknown) {
      setOpMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setVoteBusy(false);
    }
  };

  // queue by id (если поддерживается)
  const queueById = async () => {
    setOpMsg("");
    try {
      const eth = (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum;
      if (!eth) throw new Error("Wallet not found");
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const gov = new Contract(ADDR.GOVERNOR, governorAbi, signer) as unknown as GovWithIdOps;

      if (!gov.queue) throw new Error("queue(uint256) not supported by this Governor");
      const tx = await gov.queue(proposalId);
      await tx.wait();
      setOpMsg("✅ Queued");
    } catch (e: unknown) {
      setOpMsg(e instanceof Error ? e.message : String(e));
    }
  };

  // execute by id (если поддерживается)
  const executeById = async () => {
    setOpMsg("");
    try {
      const eth = (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum;
      if (!eth) throw new Error("Wallet not found");
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const gov = new Contract(ADDR.GOVERNOR, governorAbi, signer) as unknown as GovWithIdOps;

      if (!gov.execute) throw new Error("execute(uint256) not supported by this Governor");
      const tx = await gov.execute(proposalId);
      await tx.wait();
      setOpMsg("✅ Executed");
    } catch (e: unknown) {
      setOpMsg(e instanceof Error ? e.message : String(e));
    }
  };

  // Advanced: queue/execute через массивы + description hash
  const queueAdvanced = async () => {
    setOpMsg("");
    try {
      const t = targets.split(",").map(s => s.trim()).filter(Boolean);
      const v = values.split(",").map(s => s.trim()).filter(Boolean).map(s => BigInt(s));
      const c = calldatas.split(",").map(s => s.trim()).filter(Boolean);
      if (!(t.length && t.length === v.length && v.length === c.length)) {
        throw new Error("Targets/values/calldatas length mismatch");
      }
      const dhash = ethers.id(desc);

      const eth = (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum;
      if (!eth) throw new Error("Wallet not found");
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const gov = new Contract(ADDR.GOVERNOR, governorAbi, signer);

      const tx = await gov.queue(t, v, c, dhash);
      await tx.wait();
      setOpMsg("✅ Queued (advanced)");
    } catch (e: unknown) {
      setOpMsg(e instanceof Error ? e.message : String(e));
    }
  };

  const executeAdvanced = async () => {
    setOpMsg("");
    try {
      const t = targets.split(",").map(s => s.trim()).filter(Boolean);
      const v = values.split(",").map(s => s.trim()).filter(Boolean).map(s => BigInt(s));
      const c = calldatas.split(",").map(s => s.trim()).filter(Boolean);
      if (!(t.length && t.length === v.length && v.length === c.length)) {
        throw new Error("Targets/values/calldatas length mismatch");
      }
      const dhash = ethers.id(desc);

      const eth = (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum;
      if (!eth) throw new Error("Wallet not found");
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const gov = new Contract(ADDR.GOVERNOR, governorAbi, signer);

      const tx = await gov.execute(t, v, c, dhash);
      await tx.wait();
      setOpMsg("✅ Executed (advanced)");
    } catch (e: unknown) {
      setOpMsg(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0E0E12] to-[#1C2025] text-white">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-extrabold">Proposal #{proposalId}</h1>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          {loading ? (
            <div className="text-white/70">Loading…</div>
          ) : info ? (
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="opacity-70">State</div><div>{info.state}</div>
              <div className="opacity-70">Snapshot</div><div>{info.snapshot}</div>
              <div className="opacity-70">Deadline</div><div>{info.deadline}</div>
              <div className="opacity-70">Quorum @clock</div><div>{info.quorum}</div>
              <div className="opacity-70">Clock</div><div>{info.clock}</div>
            </div>
          ) : (
            <div className="text-white/70">No info</div>
          )}
        </div>

        {/* Voting */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <h2 className="text-xl font-semibold">Vote</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => vote(1, "For")}
              disabled={!canOperate || voteBusy}
              className="rounded-xl px-3 py-2 bg-emerald-400 text-black font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {voteBusy ? "…" : "For"}
            </button>
            <button
              onClick={() => vote(0, "Against")}
              disabled={!canOperate || voteBusy}
              className="rounded-xl px-3 py-2 border border-white/20 hover:border-white/40"
            >
              Against
            </button>
            <button
              onClick={() => vote(2, "Abstain")}
              disabled={!canOperate || voteBusy}
              className="rounded-xl px-3 py-2 border border-white/20 hover:border-white/40"
            >
              Abstain
            </button>
          </div>
        </section>

        {/* Queue / Execute */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <h2 className="text-xl font-semibold">Queue / Execute</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              onClick={queueById}
              disabled={!canOperate}
              className="rounded-xl px-3 py-2 bg-yellow-400 text-black font-semibold hover:opacity-90 disabled:opacity-50"
            >
              Queue by ID
            </button>
            <button
              onClick={executeById}
              disabled={!canOperate}
              className="rounded-xl px-3 py-2 bg-yellow-400 text-black font-semibold hover:opacity-90 disabled:opacity-50"
            >
              Execute by ID
            </button>
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer opacity-80">Advanced (targets/values/calldatas + description)</summary>
            <div className="mt-3 space-y-2">
              <label className="block text-sm opacity-80">Description (exact same string)</label>
              <input
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Payout from Treasury"
              />
              <label className="block text.sm opacity-80">Targets (comma-separated)</label>
              <input
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                value={targets}
                onChange={(e) => setTargets(e.target.value)}
                placeholder={ADDR.TREASURY}
              />
              <label className="block text-sm opacity-80">Values (comma-separated, wei)</label>
              <input
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                value={values}
                onChange={(e) => setValues(e.target.value)}
                placeholder="0"
              />
              <label className="block text-sm opacity-80">Calldatas (comma-separated hex)</label>
              <input
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                value={calldatas}
                onChange={(e) => setCalldatas(e.target.value)}
                placeholder="0x..."
              />
              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                <button
                  onClick={queueAdvanced}
                  className="rounded-xl px-3 py-2 border border-white/20 hover:border-white/40"
                >
                  Queue (advanced)
                </button>
                <button
                  onClick={executeAdvanced}
                  className="rounded-xl px-3 py-2 border border-white/20 hover:border-white/40"
                >
                  Execute (advanced)
                </button>
              </div>
            </div>
          </details>

          {opMsg && <div className="text-sm opacity-80">{opMsg}</div>}
        </section>

        <div className="text-xs text-white/60">
          Governor: {ADDR.GOVERNOR}
        </div>
      </div>
    </main>
  );
}
