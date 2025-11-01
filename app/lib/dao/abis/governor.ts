// app/lib/dao/abis/governor.ts
export const governorAbi = [
  "function name() view returns (string)",
  "function version() view returns (string)",
  "function proposalThreshold() view returns (uint256)",
  "function votingDelay() view returns (uint256)",
  "function votingPeriod() view returns (uint256)",
  "function quorum(uint256 timepoint) view returns (uint256)",
  "function clock() view returns (uint48)",
  "function CLOCK_MODE() view returns (string)",

  "function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256 proposalId)",
  "function state(uint256 proposalId) view returns (uint8)",

  "function castVote(uint256 proposalId, uint8 support) returns (uint256 balance)",
  "function castVoteWithReason(uint256 proposalId, uint8 support, string reason) returns (uint256 balance)",
  "function hasVoted(uint256 proposalId, address account) view returns (bool)",

  "function proposalSnapshot(uint256 proposalId) view returns (uint256)",
  "function proposalDeadline(uint256 proposalId) view returns (uint256)",

  "function queue(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash)",
  "function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash)",
] as const;
