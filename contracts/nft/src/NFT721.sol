// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

interface ILiquidityVault { function depositBNB() external payable; }

contract NFT721 is ERC721URIStorage, AccessControl, Pausable, IERC2981 {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    address private royaltyReceiver;
    uint96  private royaltyBps;
    ILiquidityVault public vault;
    uint256 public tokenIdTracker;

    uint256 public mintFeeWei = 0.001 ether;

    event Minted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event MintFeeChanged(uint256 oldFee, uint256 newFee);
    event RoyaltyChanged(address receiver, uint96 bps);
    event VaultChanged(address indexed oldVault, address indexed newVault);

    constructor(string memory name_, string memory symbol_, address admin_, address _royaltyReceiver, uint96 _royaltyBps, address vault_)
    ERC721(name_, symbol_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        royaltyReceiver = _royaltyReceiver; royaltyBps = _royaltyBps;
        vault = ILiquidityVault(vault_);
    }

    function setMintFeeWei(uint256 fee) external onlyRole(DEFAULT_ADMIN_ROLE) { emit MintFeeChanged(mintFeeWei, fee); mintFeeWei = fee; }
    function setVault(address v) external onlyRole(DEFAULT_ADMIN_ROLE) { emit VaultChanged(address(vault), v); vault = ILiquidityVault(v); }
    function setRoyalty(address receiver, uint96 bps) external onlyRole(DEFAULT_ADMIN_ROLE) { royaltyReceiver = receiver; royaltyBps = bps; emit RoyaltyChanged(receiver,bps); }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    function mintWithFee(address to, string memory uri) external payable whenNotPaused returns (uint256) {
        require(msg.value >= mintFeeWei, "fee required");
        uint256 id = ++tokenIdTracker;
        _safeMint(to, id); _setTokenURI(id, uri);
        emit Minted(to, id, uri);
        vault.depositBNB{value: msg.value}();
        return id;
    }

    function royaltyInfo(uint256, uint256 salePrice) external view returns (address, uint256) {
        uint256 amount = (salePrice * royaltyBps) / 10000;
        return (royaltyReceiver, amount);
    }
    function supportsInterface(bytes4 iid) public view override(ERC721URIStorage,AccessControl,IERC165) returns(bool){
        return iid==type(IERC2981).interfaceId || super.supportsInterface(iid);
    }
}
