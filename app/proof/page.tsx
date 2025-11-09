// app/proof/page.tsx
import React from "react";
import Link from "next/link";
import { CONTRACTS } from "./contracts";
import type { Metadata } from "next";

function short(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function statusColor(status: string) {
  switch (status) {
    case "Live": return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30";
    case "Locked": return "bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30";
    case "Planned": return "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30";
    case "Deprecated": return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30";
    default: return "bg-neutral-700 text-neutral-200";
  }
}

export const metadata: Metadata = {
  title: "Proof of Contracts — GAD Family",
  description:
    "Verifiable list of smart contracts, responsibilities, and BscScan links across the GAD ecosystem.",
};

export default function ProofPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Proof of Contracts</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Transparent, verifiable list of smart contracts used across the GAD ecosystem.
          Each entry links to BscScan for on-chain proof and accountability.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900/60">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium text-neutral-300">Contract</th>
              <th className="px-4 py-3 font-medium text-neutral-300">Address</th>
              <th className="px-4 py-3 font-medium text-neutral-300">Purpose</th>
              <th className="px-4 py-3 font-medium text-neutral-300">Status</th>
              <th className="px-4 py-3 font-medium text-neutral-300">BscScan</th>
              <th className="px-4 py-3 font-medium text-neutral-300">Copy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {CONTRACTS.map((c) => {
              const scanType = c.bscscanPath ?? "address";
              const scanUrl =
                scanType === "token"
                  ? `https://bscscan.com/token/${c.address}`
                  : `https://bscscan.com/address/${c.address}`;
              return (
                <tr key={c.address} className="align-top">
                  <td className="px-4 py-4">
                    <div className="font-medium text-neutral-100">{c.name}</div>
                    {c.note ? (
                      <div className="text-xs text-neutral-400 mt-1">{c.note}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-mono text-neutral-200">{c.address}</div>
                    <div className="text-xs text-neutral-500">{short(c.address)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-neutral-200">{c.purpose}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs ${statusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={scanUrl}
                      target="_blank"
                      className="inline-flex items-center rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800"
                    >
                      Open on BscScan
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => navigator.clipboard.writeText(c.address)}
                      className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800"
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Compact list of raw links */}
      <section className="mt-8">
        <h2 className="text-lg font-medium text-neutral-100">Direct BscScan Links</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {CONTRACTS.map((c) => {
            const scanType = c.bscscanPath ?? "address";
            const scanUrl =
              scanType === "token"
                ? `https://bscscan.com/token/${c.address}`
                : `https://bscscan.com/address/${c.address}`;
            return (
              <li key={c.address} className="text-sm">
                <a
                  href={scanUrl}
                  target="_blank"
                  className="text-sky-300 hover:underline"
                >
                  {c.name} — {c.address}
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      {/* About the project */}
<section className="mt-12">
  <h2 className="text-lg font-medium text-neutral-100">About the Project</h2>
  <p className="mt-3 text-sm text-neutral-300">
    <strong>GAD Family</strong> is a next-generation Web3 ecosystem designed to connect real-life value
    with digital ownership. Built around the GAD token, it merges <strong>Move-to-Earn mechanics,
    DAO governance, and NFT utilities</strong> into a single transparent framework that empowers families,
    investors, and communities to grow together.
  </p>
  <p className="mt-3 text-sm text-neutral-300">
    The core vision of GAD is to create a self-sustaining, family-oriented digital economy
    where <strong>health, participation, and ownership</strong> become rewarding. Every step, vote, and
    contribution inside the ecosystem generates measurable impact—reflected through token rewards,
    DAO participation, and NFT-driven digital assets.
  </p>
  <p className="mt-3 text-sm text-neutral-300">
    The ecosystem operates through verifiable smart contracts on the <strong>BNB Smart Chain</strong>,
    including staking modules, DAO governance (Governor + xGAD), the Launchpad for early investors,
    and a full NFT infrastructure (Marketplace, Vault, and Collection contracts). All key operations,
    from liquidity locks to vesting schedules, are fully visible on-chain.
  </p>
  <p className="mt-3 text-sm text-neutral-300">
    <strong>Roadmap focus:</strong> 2025–2026 will see the integration of the <strong>GAD App</strong> (Move-to-Earn + Family Map),
    cross-chain bridge expansion, multi-token farming, and AI-driven personalization of user goals.
    Each release builds toward a scalable, transparent, and community-owned financial ecosystem
    ready for mainstream adoption.
  </p>
  <p className="mt-3 text-sm text-neutral-400">
    Transparency is not just a feature — it is the foundation of trust. Every smart contract,
    transaction, and treasury action can be verified directly through the links above.
  </p>
</section>

      <footer className="mt-8 text-xs text-neutral-500">
        Last updated: November 2025 • Network: BNB Smart Chain (BSC)
      </footer>
    </div>
  );
}
