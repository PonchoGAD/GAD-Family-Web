"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { nft721Abi } from "../../../lib/nft/abis/nft721";
import { getSigner } from "../../../lib/nft/eth";

export default function ApproveForAllButton({
  nft,
  operator,
  label = "Approve marketplace",
}: { nft: string; operator: string; label?: string }) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (busy) return;
    try {
      setBusy(true);
      const signer = await getSigner();
      const c721 = new ethers.Contract(nft, nft721Abi, signer);
      const tx = await c721.setApprovalForAll(operator, true);
      await tx.wait();
      alert("Approved");
    } catch (e: any) {
      alert(e?.message ?? "Approval failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className="border px-3 py-2 rounded" disabled={busy} onClick={run}>
      {busy ? "Approving…" : label}
    </button>
  );
}
