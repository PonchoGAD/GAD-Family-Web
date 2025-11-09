export const launchpadAbi = [
  // reads
  { "inputs": [], "name": "GAD", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability":"view","type":"function" },
  { "inputs": [], "name": "USDT","outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability":"view","type":"function" },
  { "inputs": [], "name": "owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function" },
  { "inputs": [], "name": "pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function" },

  { "inputs": [], "name": "startTime","outputs":[{"type":"uint256","name":""}],"stateMutability":"view","type":"function" },
  { "inputs": [], "name": "endTime","outputs":[{"type":"uint256","name":""}],"stateMutability":"view","type":"function" },

  { "inputs": [], "name": "hardCapUsd","outputs":[{"type":"uint256","name":""}],"stateMutability":"view","type":"function" },
  { "inputs": [], "name": "minBnbWei","outputs":[{"type":"uint256","name":""}],"stateMutability":"view","type":"function" },
  { "inputs": [], "name": "maxBnbWei","outputs":[{"type":"uint256","name":""}],"stateMutability":"view","type":"function" },
  { "inputs": [], "name": "minUsdt","outputs":[{"type":"uint256","name":""}],"stateMutability":"view","type":"function" },
  { "inputs": [], "name": "maxUsdt","outputs":[{"type":"uint256","name":""}],"stateMutability":"view","type":"function" },

  { "inputs": [], "name": "liquidityBps","outputs":[{"type":"uint256","name":""}],"stateMutability":"view","type":"function" },
  { "inputs": [], "name": "tgeBps","outputs":[{"type":"uint256","name":""}],"stateMutability":"view","type":"function" },
  { "inputs": [], "name": "sliceSeconds","outputs":[{"type":"uint256","name":""}],"stateMutability":"view","type":"function" },
  { "inputs": [], "name": "slicesCount","outputs":[{"type":"uint256","name":""}],"stateMutability":"view","type":"function" },

  { "inputs": [], "name": "ratesSet","outputs":[{"type":"bool","name":""}],"stateMutability":"view","type":"function" },
  { "inputs": [], "name": "isFinalized","outputs":[{"type":"bool","name":""}],"stateMutability":"view","type":"function" },
  { "inputs": [], "name": "paused","outputs":[{"type":"bool","name":""}],"stateMutability":"view","type":"function" },

  { "inputs": [{"internalType":"address","name":"a","type":"address"}], "name": "contributedBnbWei", "outputs":[{"type":"uint256","name":""}], "stateMutability":"view","type":"function" },
  { "inputs": [{"internalType":"address","name":"a","type":"address"}], "name": "contributedUsdt",   "outputs":[{"type":"uint256","name":""}], "stateMutability":"view","type":"function" },

  // writes
  { "inputs": [{"internalType":"uint256","name":"bnbUsd","type":"uint256"}, {"internalType":"uint256","name":"gadPerUsd","type":"uint256"}], "name": "setStartRates","outputs":[],"stateMutability":"nonpayable","type":"function" },
  { "inputs": [], "name": "buyWithBNB","outputs":[],"stateMutability":"payable","type":"function" },
  { "inputs": [{"internalType":"uint256","name":"usdt","type":"uint256"}], "name": "buyWithUSDT","outputs":[],"stateMutability":"nonpayable","type":"function" },
  { "inputs": [], "name": "claim","outputs":[],"stateMutability":"nonpayable","type":"function" },

  { "inputs": [], "name": "pause","outputs":[],"stateMutability":"nonpayable","type":"function" },
  { "inputs": [], "name": "unpause","outputs":[],"stateMutability":"nonpayable","type":"function" },
  { "inputs": [], "name": "finalize","outputs":[],"stateMutability":"nonpayable","type":"function" },

  // ownership (Ownable2Step)
  { "inputs": [{"internalType":"address","name":"newOwner","type":"address"}], "name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function" },
  { "inputs": [], "name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function" }
] as const;
