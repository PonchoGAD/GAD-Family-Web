/**
 * DAO Liquidity Scanner — updates vault stats
 * Run: npx tsx tools/dao-liquidity.ts
 */
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { liquidityVaultAbi } from "../app/lib/nft/abis/liquidityVault";
import { ADDR } from "../app/lib/nft/config";

const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL);
const vault = new ethers.Contract(ADDR.VAULT, liquidityVaultAbi, provider);

const OUT_FILE = path.resolve("./data/dao-stats.json");

async function update() {
  console.log("🔍 Fetching DAO LiquidityVault stats...");

  const [total, users] = await vault.getVaultInfo();
  const totalBNB = ethers.formatEther(total);

  const stats = {
    timestamp: Date.now(),
    totalBNB,
    users: Number(users),
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(stats, null, 2));
  console.log("✅ DAO stats updated:", stats);
}

update().catch(console.error);
