// contracts/nft/scripts/verify.ts
// @ts-nocheck

import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function main(hre: HardhatRuntimeEnvironment) {
  const { run } = hre;

  const address = process.env.NFT_ADDRESS!;
  const constructorArgs = [
    "GAD NFT",
    "GAD",
    process.env.ADMIN!,
    process.env.ROYALTY_RECEIVER!,
    500,
    process.env.VAULT!,
  ];

  await run("verify:verify", {
    address,
    constructorArguments: constructorArgs,
  });
}

// поддержка запуска через `npx hardhat run`
if (require.main === module) {
  const hre = require("hardhat");
  main(hre).catch((e: any) => {
    console.error(e);
    process.exit(1);
  });
}
