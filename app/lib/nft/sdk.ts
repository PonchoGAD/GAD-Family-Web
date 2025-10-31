// lib/nft/sdk.ts
import { ethers } from "ethers";
import { getReadProvider, getSigner } from "./eth";
import { ADDR } from "./config";
import { nft721Abi } from "./abis/nft721";
import { marketplaceAbi } from "./abis/marketplace";

export const ZERO_ADDRESS = ethers.ZeroAddress;

/* ---------------------------------- READ ---------------------------------- */
export const getMarketplaceContractRead = async () => {
  const provider = await getReadProvider();
  return new ethers.Contract(ADDR.MARKETPLACE, marketplaceAbi, provider);
};

export const getNftContractRead = async () => {
  const provider = await getReadProvider();
  return new ethers.Contract(ADDR.NFT721, nft721Abi, provider);
};

/* --------------------------------- WRITE ---------------------------------- */
export const getMarketplaceContractWrite = async () => {
  const signer = await getSigner();
  return new ethers.Contract(ADDR.MARKETPLACE, marketplaceAbi, signer);
};

export const getNftContractWrite = async () => {
  const signer = await getSigner();
  return new ethers.Contract(ADDR.NFT721, nft721Abi, signer);
};

/* --------------------------- MARKETPLACE METHODS -------------------------- */

export const listItem = async (
  nft: string,
  tokenId: string,
  currency: "BNB" | "USDT",
  priceHuman: string
) => {
  const mkt = await getMarketplaceContractWrite();
  const priceWei = ethers.parseEther(priceHuman);
  const currAddr = currency === "BNB" ? ZERO_ADDRESS : ADDR.USDT;
  const tx = await mkt.list(nft, tokenId, currAddr, priceWei);
  return await tx.wait();
};

export const cancelListing = async (nft: string, tokenId: string) => {
  const mkt = await getMarketplaceContractWrite();
  const tx = await mkt.cancel(nft, tokenId);
  return await tx.wait();
};

export const buyItem = async (
  nft: string,
  tokenId: string,
  seller: string,
  currency: "BNB" | "USDT",
  priceWei: bigint
) => {
  const mkt = await getMarketplaceContractWrite();
  const signer = await getSigner();

  if (currency === "BNB") {
    const tx = await mkt.buy(nft, tokenId, seller, { value: priceWei });
    return await tx.wait();
  } else {
    const erc20 = new ethers.Contract(
      ADDR.USDT,
      ["function approve(address spender,uint256 value) external returns (bool)"],
      signer
    );
    const approveTx = await erc20.approve(ADDR.MARKETPLACE, priceWei);
    await approveTx.wait();
    const tx = await mkt.buy(nft, tokenId, seller);
    return await tx.wait();
  }
};

/* ------------------------------ NFT METHODS ------------------------------- */

export const setApprovalForAll = async (operator: string, approved: boolean) => {
  const c = await getNftContractWrite();
  const tx = await c.setApprovalForAll(operator, approved);
  return await tx.wait();
};

export const isApprovedForAll = async (owner: string, operator: string) => {
  const c = await getNftContractRead();
  return (await c.isApprovedForAll(owner, operator)) as boolean;
};

/** Минт с оплатой комиссии.
 * Возвращаем TransactionResponse, чтобы UI мог сразу показать tx.hash.
 */
export const mintWithFee = async (to: string, tokenURI: string, feeEth = "0.01") => {
  const c = await getNftContractWrite();
  const value = ethers.parseEther(feeEth);
  const tx = await c.mintWithFee(to, tokenURI, { value });
  return tx as import("ethers").TransactionResponse;
};
