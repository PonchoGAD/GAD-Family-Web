// app/lib/nft/types.ts
export type ListingRow = {
  txHash: string;
  nft: string;
  tokenId: string;
  seller: string;
  currency: string; // address(0) -> BNB, иначе USDT
  price: string;    // wei при 18
  block: number;
  time: number;     // unix
};

export type ApiListingsResponse = {
  items: ListingRow[];
  nextCursor: number | null;
  latest: number;
};
