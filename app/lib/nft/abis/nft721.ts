export const nft721Abi = [
  // ERC721
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function setApprovalForAll(address operator, bool approved)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",

  // ERC2981
  "function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address receiver, uint256 royaltyAmount)",

  // ТВОИ public/externals (добавили!)
  "function mintFeeWei() view returns (uint256)",
  "function paused() view returns (bool)",
  "function vault() view returns (address)",

  // mint с фикс-ценой
  "function mintWithFee(address to, string uri) payable returns (uint256 tokenId)",
] as const;
