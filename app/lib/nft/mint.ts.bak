import { ethers } from "ethers";
import { getSigner } from "./eth";
import { ADDR } from "./constants";
import nft721Abi from "./abis/nft721";

export async function readMintFeeWei(): Promise<bigint> {
  const signer = await getSigner();
  const c = new ethers.Contract(ADDR.NFT721, nft721Abi, signer.provider!);
  const fee: bigint = await c.mintFeeWei();
  return fee;
}

export async function mintWithFee(recipient: string, tokenURI: string) {
  const signer = await getSigner();
  const c = new ethers.Contract(ADDR.NFT721, nft721Abi, signer);
  const fee: bigint = await c.mintFeeWei();
  const tx = await c.mintWithFee(recipient, tokenURI, { value: fee });
  return tx.wait();
}
