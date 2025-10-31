"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { nft721Abi } from "../../../lib/nft/abis/nft721";
import { ADDR } from "../../../lib/nft/config";
import { getSigner } from "../../../lib/nft/eth";
import TransactionModal from "../common/TransactionModal";

export default function ApproveForAllButton({ nft }: { nft: string }) {
  const [approved, setApproved] = useState(false);
  const [status, setStatus] = useState<"idle" | "signing" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string>();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        const signer = await getSigner();
        const me = await signer.getAddress();
        const c = new ethers.Contract(nft, nft721Abi, signer);
        const isAppr = await c.isApprovedForAll(me, ADDR.MARKETPLACE);
        setApproved(isAppr);
      } catch {
        // ignore
      }
    })();
  }, [nft]);

  const run = async () => {
    try {
      setErr(undefined);
      setOpen(true);
      setStatus("signing");
      const signer = await getSigner();
      const c = new ethers.Contract(nft, nft721Abi, signer);
      const tx = await c.setApprovalForAll(ADDR.MARKETPLACE, true);
      setStatus("pending");
      setTxHash(tx.hash);
      await tx.wait();
      setApproved(true);
      setStatus("success");
    } catch (e: unknown) {
      setStatus("error");
      const message =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Approval failed";
      setErr(message);
    }
  };

  return (
    <>
      <button
        onClick={run}
        disabled={approved}
        className={`border rounded px-4 py-2 ${approved ? "opacity-60" : "hover:bg-black hover:text-white"}`}
      >
        {approved ? "Approved ✅" : "Approve Marketplace"}
      </button>

      <TransactionModal
        open={open}
        onCloseAction={() => setOpen(false)}
        status={status}
        txHash={txHash}
        message="Approving marketplace to manage your NFTs"
        errorText={err}
      />
    </>
  );
}
