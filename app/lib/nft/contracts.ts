// app/lib/nft/contracts.ts
import { Contract, type Provider, type Signer } from "ethers";
import { ADDR } from "./constants";

import nftAbi from "./abis/nft721";
import marketplaceAbi from "./abis/marketplace";
import erc20Abi from "./abis/erc20";
import liquidityVaultAbi from "./abis/liquidityVault";

type P = Provider | Signer;

export function getNftContract(p: P, address?: string) {
  const addr = address ?? ADDR.NFT721;
  return new Contract(addr, nftAbi, p);
}

export function getMarketplaceContract(p: P) {
  return new Contract(ADDR.MARKETPLACE, marketplaceAbi, p);
}

export function getUsdtContract(p: P) {
  return new Contract(ADDR.USDT, erc20Abi as any, p);
}

// ✅ новый хелпер
export function getLiquidityVaultContract(p: P, address?: string) {
  const addr = address ?? ADDR.LIQUIDITY_VAULT;
  return new Contract(addr, liquidityVaultAbi, p);
}
