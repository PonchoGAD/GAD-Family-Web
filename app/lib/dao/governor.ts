// app/lib/dao/governor.ts
import { ethers } from "ethers";
import { ADDR } from "../nft/config";
import { governorAbi } from "./abis/governor";
import { getReadProvider, getSigner } from "../nft/eth";

export async function govRead() {
  const p = await getReadProvider();
  return new ethers.Contract(ADDR.GOVERNOR, governorAbi, p);
}
export async function govWrite() {
  const s = await getSigner();
  return new ethers.Contract(ADDR.GOVERNOR, governorAbi, s);
}

export async function governorParams() {
  const g = await govRead();
  const [name, version, threshold, vDelay, vPeriod, clockMode] = await Promise.all([
    g.name(), g.version(), g.proposalThreshold(), g.votingDelay(), g.votingPeriod(), g.CLOCK_MODE()
  ]);
  const clk = await g.clock();
  const qur = await g.quorum(clk);
  return { name, version, threshold, vDelay, vPeriod, quorum: qur, clock: clk, clockMode };
}

export async function proposeSimpleTransferBNB(treasury: string, to: string, amountWei: bigint, description: string) {
  const g = await govWrite();
  const targets = [treasury];
  const values  = [0];
  const data    = [new ethers.Interface(["function execute(address,uint256,bytes)"])
    .encodeFunctionData("execute", [to, amountWei, "0x"])];
  const tx = await g.propose(targets, values, data, description);
  return tx.wait();
}

export async function castVote(proposalId: bigint, support: 0|1|2, reason?: string) {
  const g = await govWrite();
  const tx = reason
    ? await g.castVoteWithReason(proposalId, support, reason)
    : await g.castVote(proposalId, support);
  return tx.wait();
}

export async function queueAndExecute(
  proposalId: bigint,
  targets: string[], values: number[], calldatas: string[], description: string
) {
  const g = await govWrite();
  const descHash = ethers.id(description);
  await (await g.queue(targets, values, calldatas, descHash)).wait();
  return (await g.execute(targets, values, calldatas, descHash)).wait();
}
