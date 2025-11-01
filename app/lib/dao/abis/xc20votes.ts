export const xc20votesAbi = [
  // базовое
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",

  // Votes
  "function getVotes(address account) view returns (uint256)",
  "function delegates(address account) view returns (address)",
  "function delegate(address delegatee)",

  // (опционально, если будешь делать подписи)
  "function nonces(address owner) view returns (uint256)",
] as const;
