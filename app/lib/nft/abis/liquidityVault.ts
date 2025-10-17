export const liquidityVaultAbi = [
  "event Deposited(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "function deposit() payable",
  "function withdraw(uint256 amount)",
  "function totalBalance() view returns (uint256)",
  "function userBalance(address user) view returns (uint256)",
  "function getVaultInfo() view returns (uint256 total, uint256 users)"
] as const;
