// app/lib/dao/abis/treasury.ts
export const treasuryAbi = [
  // Казначейский вызов, исполняемый только владельцем (Governor)
  // Отправляет value (BNB) и выполняет calldata на адресе `to`
  "function execute(address to, uint256 value, bytes data) external returns (bytes)"
] as const;
