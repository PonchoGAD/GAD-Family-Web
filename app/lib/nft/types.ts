export type CurrencyKind = "BNB" | "USDT";

export type Listing = {
  nft: string;
  tokenId: string;
  seller: string;
  currency: CurrencyKind;
  priceWei: bigint;
  priceHuman: string;
  blockNumber?: number;
};
