export const marketplaceAbi = [
  "event Listed(address indexed nft, uint256 indexed tokenId, address indexed seller, address currency, uint256 price)",
  "event Cancelled(address indexed nft, uint256 indexed tokenId, address indexed seller)",
  "event Bought(address indexed nft, uint256 indexed tokenId, address indexed buyer, address seller, address currency, uint256 price)",
  "function list(address nft, uint256 tokenId, address currency, uint256 price) external",
  "function cancel(address nft, uint256 tokenId) external",
  "function buy(address nft, uint256 tokenId, address seller) payable external",
  "function isListed(address nft, uint256 tokenId) view returns (bool)",
  "function getListing(address nft, uint256 tokenId) view returns (address seller, address currency, uint256 price)"
] as const;
