// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/* ---------- Minimal interfaces ---------- */
interface IERC20 {
    function transfer(address to, uint256 amt) external returns (bool);
    function transferFrom(address from, address to, uint256 amt) external returns (bool);
    function approve(address spender, uint256 amt) external returns (bool);
}
interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
}
interface IRoyalty {
    function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address, uint256);
}
interface ILiquidityVaultLike {
    function depositBNB() external payable;
    function depositToken(address token, uint256 amount) external;
}

/* ---------- Reentrancy guard (light) ---------- */
contract ReentrancyGuardLite {
    uint256 private _locked;
    modifier nonReentrant() {
        require(_locked == 0, "reentrancy");
        _locked = 1;
        _;
        _locked = 0;
    }
}

/* ---------- Marketplace ---------- */
contract Marketplace is ReentrancyGuardLite {
    struct Listing {
        address nft;
        uint256 tokenId;
        address seller;
        address currency; // address(0)=BNB, or USDT token address
        uint256 price;
        bool active;
    }

    address public owner;
    uint96  public platformFeeBps = 250; // 2.5%
    address public immutable USDT;
    ILiquidityVaultLike public vault;
    mapping(bytes32 => Listing) public listings;

    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event PlatformFeeChanged(uint96 oldBps, uint96 newBps);
    event VaultChanged(address indexed oldVault, address indexed newVault);

    event Listed(address indexed nft, uint256 indexed tokenId, address seller, address currency, uint256 price);
    event Delisted(address indexed nft, uint256 indexed tokenId, address seller);
    event Bought(
        address indexed nft,
        uint256 indexed tokenId,
        address buyer,
        address seller,
        address currency,
        uint256 price,
        uint256 feeToVault,
        uint256 royaltyToCreator
    );

    modifier onlyOwner { require(msg.sender == owner, "not owner"); _; }

    constructor(address _usdt, address _vault) {
        require(_usdt != address(0) && _vault != address(0), "zero");
        owner = msg.sender;
        USDT = _usdt;
        vault = ILiquidityVaultLike(_vault);
    }

    /* ----- Admin ----- */
    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero");
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }
    function setPlatformFeeBps(uint96 bps) external onlyOwner {
        require(bps <= 1000, "too high"); // <= 10%
        emit PlatformFeeChanged(platformFeeBps, bps);
        platformFeeBps = bps;
    }
    function setVault(address v) external onlyOwner {
        require(v != address(0), "zero");
        emit VaultChanged(address(vault), v);
        vault = ILiquidityVaultLike(v);
    }

    /* ----- Listings ----- */
    function list(address nft, uint256 tokenId, address currency, uint256 price) external {
        require(IERC721(nft).ownerOf(tokenId) == msg.sender, "not owner");
        require(price > 0, "zero price");
        require(currency == address(0) || currency == USDT, "unsupported currency");
        require(
            IERC721(nft).getApproved(tokenId) == address(this) ||
            IERC721(nft).isApprovedForAll(msg.sender, address(this)),
            "approve marketplace"
        );
        bytes32 key = keccak256(abi.encode(nft, tokenId, msg.sender));
        listings[key] = Listing(nft, tokenId, msg.sender, currency, price, true);
        emit Listed(nft, tokenId, msg.sender, currency, price);
    }

    function delist(address nft, uint256 tokenId) external {
        bytes32 key = keccak256(abi.encode(nft, tokenId, msg.sender));
        Listing storage l = listings[key];
        require(l.active && l.seller == msg.sender, "no listing");
        l.active = false;
        emit Delisted(nft, tokenId, msg.sender);
    }

    /* ----- Buy ----- */
    function buy(address nft, uint256 tokenId, address seller) external payable nonReentrant {
        bytes32 key = keccak256(abi.encode(nft, tokenId, seller));
        Listing storage l = listings[key];
        require(l.active, "inactive");
        l.active = false;

        uint256 price = l.price;

        // Payment in BNB or USDT
        if (l.currency == address(0)) {
            require(msg.value == price, "bad value");
        } else {
            require(IERC20(l.currency).transferFrom(msg.sender, address(this), price), "pay fail");
        }

        // Royalty per EIP-2981
        (address rcv, uint256 roy) = IRoyalty(nft).royaltyInfo(tokenId, price);

        // Platform fee -> LiquidityVault
        uint256 fee = (price * platformFeeBps) / 10000;

        // Seller amount
        uint256 toSeller = price - roy - fee;

        // Payouts
        _pay(l.currency, rcv, roy);
        if (l.currency == address(0)) {
            vault.depositBNB{value: fee}();
        } else {
            require(IERC20(l.currency).approve(address(vault), fee), "approve vault");
            vault.depositToken(l.currency, fee);
        }
        _pay(l.currency, l.seller, toSeller);

        // Transfer NFT
        IERC721(nft).safeTransferFrom(l.seller, msg.sender, tokenId);

        emit Bought(nft, tokenId, msg.sender, l.seller, l.currency, price, fee, roy);
    }

    function _pay(address currency, address to, uint256 amount) internal {
        if (amount == 0) return;
        if (currency == address(0)) {
            (bool ok, ) = payable(to).call{value: amount}("");
            require(ok, "pay bnb fail");
        } else {
            require(IERC20(currency).transfer(to, amount), "pay erc20 fail");
        }
    }

    receive() external payable {}
}
