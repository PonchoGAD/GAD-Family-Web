// app/proof/contracts.ts
export type ContractStatus = "Live" | "Locked" | "Planned" | "Deprecated";

export type ContractItem = {
  name: string;                 // Display name
  address: `0x${string}`;       // 0x...
  purpose: string;              // Short annotation (EN)
  bscscanPath?: "address" | "token"; // Which BscScan page to open
  note?: string;                // Extra note (EN), optional
  status: ContractStatus;
};

export const CONTRACTS: ContractItem[] = [
  {
    name: "GAD Token (BEP-20)",
    address: "0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62",
    purpose: "Primary utility token powering the GAD ecosystem.",
    bscscanPath: "token",
    status: "Live",
    note: "Total supply, holders, and transfers are verifiable on-chain."
  },
  {
    name: "Vault NFT",
    address: "0x86500D900db7424E9D93DEd334C3165A82C10783",
    purpose: "Vault contract for NFT storage/escrow mechanics within GAD apps.",
    bscscanPath: "address",
    status: "Live"
  },
  {
    name: "NFT Marketplace",
    address: "0x8117b368f5C620BE0D7173F12a0Fa25729A5fEEd",
    purpose: "Core marketplace enabling listing, buying, and selling NFTs.",
    bscscanPath: "address",
    status: "Live",
    note: "Marketplace fees are designed to support ecosystem sustainability."
  },
  {
    name: "NFT721",
    address: "0xa1a72398bCded7D40f26c2679dC35E5A73dA3948",
    purpose: "ERC-721 compliant collection contract for GAD NFTs.",
    bscscanPath: "address",
    status: "Live",
    note: "Base collection used by marketplace and app modules."
  },
  {
    name: "Single Staking — stake GAD, earn GAD",
    address: "0x0271167c2b1b1513434ECe38f024434654781594",
    purpose: "Single-asset GAD staking with reward emissions in GAD.",
    bscscanPath: "address",
    status: "Live",
    note: "Sustainable rewards model aligned with treasury policy."
  },
  {
    name: "Airdrop Distributor v1",
    address: "0x022cE9320Ea1AB7E03F14D8C0dBD14903A940F79",
    purpose: "Merkle/claim distributor for community and early supporters.",
    bscscanPath: "address",
    status: "Live",
    note: "One-time claims; proof-based eligibility."
  },
  {
    name: "LP Staking — stake LP, earn GAD",
    address: "0x5C5c0b9eE66CC106f90D7b1a3727dc126C4eF188",
    purpose: "Liquidity mining: stake GAD-pair LP to earn GAD rewards.",
    bscscanPath: "address",
    status: "Live",
    note: "Incentivizes deep liquidity and tighter spreads."
  },
  {
    name: "GAD ZAP",
    address: "0x15Acdc7636FB0214aEfa755377CE5ab3a9Cc99BC",
    purpose: "Zapper for one-click LP provisioning and balanced adds/removes.",
    bscscanPath: "address",
    status: "Live",
    note: "Simplifies entering/exiting LP positions."
  },
  {
    name: "GADSingleStakeLock (xGAD Source)",
    address: "0x2479158bFA2a0F164E7a1B9b7CaF8d3Ea2307ea1",
    purpose: "Staking & voting-power aggregation contract (xGAD source).",
    bscscanPath: "address",
    status: "Live",
    note: "Locks GAD and mints/derives voting weight for governance."
  },
  {
    name: "GADVoting xGAD",
    address: "0x279F375f6CCB85Cc276D38d2b6669736a020Eb7B",
    purpose: "xGAD voting weight / checkpointing interface for DAO.",
    bscscanPath: "address",
    status: "Live",
    note: "Reads/reflects voting balances from the staking/lock contract."
  },
  {
    name: "GADGovernor (DAO)",
    address: "0x6b07d69A2bE398e353f1877b81E116603837D556",
    purpose: "On-chain governance: proposal lifecycle and execution.",
    bscscanPath: "address",
    status: "Live",
    note: "Works with xGAD voting power for quorum and outcomes."
  },
  {
    name: "DAO Treasury (Safe Multisig)",
    address: "0xbd66442e64D505dDFF6c4749cc9d6C158887A93C",
    purpose: "Multi-sig treasury that custodies ecosystem funds and reserves.",
    bscscanPath: "address",
    status: "Live",
    note: "Enhances security with multi-party approvals."
  },
  {
    name: "LPTokenLocker",
    address: "0xF40B3dE6822837E0c4d937eF20D67B944aE39163",
    purpose: "LP tokens lock contract — public proof against rug-pulls.",
    bscscanPath: "address",
    status: "Live",
    note: "Lock schedules are visible and verifiable."
  },
  {
    name: "VestingVault",
    address: "0x9653Cb1fc5daD8A384c2dAD18A4223b77eCF4A15",
    purpose: "Vesting/lock vault for allocations with transparent unlocks.",
    bscscanPath: "address",
    status: "Live",
    note: "Supports linear and milestone-based schedules."
  },
  {
    name: "LaunchpadSale",
    address: "0xcf9f7ce8243eD3e402307f2f07BA950a6CB566EF",
    purpose: "Launchpad contract for public sales and allocations.",
    bscscanPath: "address",
    status: "Live",
    note: "Replaces earlier sale versions; auditable inflows/outflows."
  },
];
