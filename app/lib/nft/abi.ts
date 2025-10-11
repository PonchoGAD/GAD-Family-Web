export const nft721Abi = [
  "function mintWithFee(address to, string uri) payable returns (uint256)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)"
];

export const marketplaceAbi = [
  "function list(address nft,uint256 tokenId,address currency,uint256 price)",
  "function buy(address nft,uint256 tokenId,address seller) payable",
  "function setPlatformFeeBps(uint96 bps)",
  "event Listed(address indexed nft,uint256 indexed tokenId,address seller,address currency,uint256 price)",
  "event Bought(address indexed nft,uint256 indexed tokenId,address buyer,address seller,address currency,uint256 price,uint256 fee,uint256 royalty)"
];

export const erc721Abi = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)"
];

export const erc20Abi = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address a) view returns (uint256)",
  "function decimals() view returns (uint8)"
];
