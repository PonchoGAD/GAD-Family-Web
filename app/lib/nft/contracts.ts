import { ethers, type ContractRunner } from "ethers";
import { nft721Abi } from "./abis/nft721";
import { marketplaceAbi } from "./abis/marketplace";
import { ADDR } from "./config";

export function getMarketplaceContract(providerOrSigner: ContractRunner) {
  return new ethers.Contract(ADDR.MARKETPLACE, marketplaceAbi, providerOrSigner);
}

export function getNftContract(providerOrSigner: ContractRunner, address?: string) {
  return new ethers.Contract(address || ADDR.NFT721, nft721Abi, providerOrSigner);
}

export function getUsdtContract(providerOrSigner: ContractRunner) {
  return new ethers.Contract(
    ADDR.USDT,
    ["function approve(address spender,uint256 value) external returns (bool)"],
    providerOrSigner
  );
}
