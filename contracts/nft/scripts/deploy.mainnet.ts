import hre from "hardhat";
// типизация плагина не критична, берём как any
const { ethers } = hre as any;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", await deployer.getAddress());

  // твои адреса (либо из process.env)
  const vaultAddr   = "0x86500D900db7424E9D93DEd334C3165A82C10783";
  const nftAddr     = "0xa1a72398bcDed7D40f26c2679dC35E5A73dA3948";
  const marketAddr  = "0x8117b368f5C620BE0D7173F12a0Fa25729A5fEEd";

  console.log("using existing:", { vaultAddr, nftAddr, marketAddr });

  // MINTER_ROLE для marketplace
  const nft = await ethers.getContractAt("NFT721", nftAddr);
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

  const hasMinter: boolean = await nft.hasRole(MINTER_ROLE, marketAddr);
  if (!hasMinter) {
    console.log("Grant MINTER_ROLE to Marketplace…");
    const tx = await nft.grantRole(MINTER_ROLE, marketAddr);
    await tx.wait();
    console.log("Granted ✅");
  } else {
    console.log("Marketplace already has MINTER_ROLE ✅");
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
