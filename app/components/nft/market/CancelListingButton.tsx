"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { marketplaceAbi } from "../../../lib/nft/abis/marketplace";
import { getSigner } from "./../../../lib/nft/eth";
import { ADDR } from "./../../../lib/nft/config";
import TransactionModal from "./../../../components/nft/common/TransactionModal";

type Props = {
  nft: string;
  tokenId: string | number;
  onDone?: () => void; // колбэк чтобы страница обновила состояние
};

export default function CancelListingButton({ nft, tokenId, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "signing" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [err, setErr] = useState<string | undefined>(undefined);

  const run = async () => {
    try {
      setErr(undefined);
      setTxHash(undefined);
      setOpen(true);
      setStatus("signing");

      const signer = await getSigner();
      const mkt = new ethers.Contract(ADDR.MARKETPLACE, marketplaceAbi, signer);
      const tx = await mkt.delist(nft, tokenId); // seller = msg.sender в контракте
      setStatus("pending");
      setTxHash(tx.hash);

      const rc = await tx.wait();
      if (rc?.status !== 1) throw new Error("Transaction reverted");

      setStatus("success");
      onDone?.();
    } catch (e: unknown) {
      setStatus("error");
      let message = "Cancel failed";
      if (e instanceof Error) {
        message = e.message;
      } else if (typeof e === "object" && e !== null) {
        const maybe = e as { reason?: unknown; message?: unknown };
        message =
          (typeof maybe.reason === "string" && maybe.reason) ||
          (typeof maybe.message === "string" && maybe.message) ||
          message;
      }
      setErr(message);
    }
  };

  return (
    <>
      <button
        className="border px-4 py-2 rounded hover:bg-black hover:text-white"
        onClick={run}
      >
        Cancel listing
      </button>

      <TransactionModal
        open={open}
        onClose={() => setOpen(false)}
        status={status}
        txHash={txHash}
        message="Delist your NFT from marketplace"
        errorText={err}
        explorerBase="https://bscscan.com/tx/"
      />
    </>
  );
}
