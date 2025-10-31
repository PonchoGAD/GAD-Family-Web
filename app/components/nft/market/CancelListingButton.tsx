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
  /** Next.js требует, чтобы имя callback в клиентском компоненте заканчивалось на Action */
  onDoneAction?: () => void;
} & Record<string, unknown>; // позволяем передать возможный устаревший onDone вне типа

export default function CancelListingButton(props: Props) {
  const { nft, tokenId, onDoneAction, ...rest } = props;

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "signing" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [err, setErr] = useState<string | undefined>(undefined);

  // мягкая поддержка старого имени пропа onDone (если где-то ещё используется)
  const legacy = (rest as { onDone?: () => void }).onDone;
  const onDoneSafe = onDoneAction ?? legacy;

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
      onDoneSafe?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Cancel failed";
      setStatus("error");
      setErr((e as { reason?: string }).reason || msg);
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
        onCloseAction={() => setOpen(false)}
        status={status}
        txHash={txHash}
        message="Delist your NFT from marketplace"
        errorText={err}
        explorerBase="https://bscscan.com/tx/"
      />
    </>
  );
}
