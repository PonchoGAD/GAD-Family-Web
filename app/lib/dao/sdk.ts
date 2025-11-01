import { ethers } from "ethers";
import { ADDR } from "../nft/config";
import { governorAbi } from "./abis/governor";
import { getReadProvider, getSigner } from "../nft/eth";

export async function governorRead() {
  const p = await getReadProvider();
  return new ethers.Contract(ADDR.GOVERNOR, governorAbi, p);
}
export async function governorWrite() {
  const s = await getSigner();
  return new ethers.Contract(ADDR.GOVERNOR, governorAbi, s);
}

// Создать предложение без вызова контрактов (текстовое):
export async function proposeText(description: string) {
  const gov = await governorWrite();
  const tx = await gov.propose([], [], [], description);
  return tx.wait();
}

export async function cast(proposalId: string | bigint, support: 0|1|2, reason?: string) {
  const gov = await governorWrite();
  if (reason) {
    const tx = await gov.castVoteWithReason(proposalId, support, reason);
    return tx.wait();
  } else {
    const tx = await gov.castVote(proposalId, support);
    return tx.wait();
  }
}
