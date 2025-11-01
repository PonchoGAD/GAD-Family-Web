import { ethers } from "ethers";

const RPC = process.env.BSC_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || "https://bsc-dataseed.binance.org";

const ADDR = {
  NFT721: "0xa1a72398bCded7D40f26c2679dC35E5A73dA3948",
  VAULT:  "0x86500D900db7424E9D93DEd334C3165A82C10783",
};

const nft721Abi = [
  "function mintFeeWei() view returns (uint256)",
  "function paused() view returns (bool)",
  "function vault() view returns (address)",
];

const vaultAbi = [
  "function allowedDepositors(address) view returns (bool)",
  "function bnbBalance() view returns (uint256)",
];

async function main() {
  const p = new ethers.JsonRpcProvider(RPC, 56);
  const nft = new ethers.Contract(ADDR.NFT721, nft721Abi, p);
  const vault = new ethers.Contract(ADDR.VAULT, vaultAbi, p);

  const [fee, paused, vaultAddr] = await Promise.all([
    nft.mintFeeWei().catch(() => 0n),
    nft.paused().catch(() => false),
    nft.vault().catch(() => "0x"),
  ]);

  const [isAllowed, bnbBal, code] = await Promise.all([
    vault.allowedDepositors(ADDR.NFT721).catch(() => false),
    vault.bnbBalance().catch(() => 0n),
    p.getCode(ADDR.VAULT).catch(() => "0x"),
  ]);

  console.log("mintFeeWei:", fee.toString());
  console.log("paused:", paused);
  console.log("NFT721.vault():", vaultAddr);
  console.log("Vault code:", code && code !== "0x" ? "CONTRACT OK" : "NO CODE (!!)");
  console.log("Vault.allowedDepositors[NFT721]:", isAllowed);
  console.log("Vault.bnbBalance:", bnbBal.toString());
}

main().catch(console.error);
