// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function balanceOf(address a) external view returns (uint256);
    function transfer(address to, uint256 amt) external returns (bool);
    function transferFrom(address from, address to, uint256 amt) external returns (bool);
    function approve(address spender, uint256 amt) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}
interface IPancakeRouterV2 {
    function addLiquidityETH(
        address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin,
        address to, uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function addLiquidity(
        address tokenA, address tokenB,
        uint amountADesired, uint amountBDesired,
        uint amountAMin, uint amountBMin,
        address to, uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
}

contract LiquidityVault {
    address public immutable GAD;
    address public immutable USDT;
    address public immutable WBNB;
    IPancakeRouterV2 public immutable ROUTER;

    address public owner;
    address public lpReceiver;
    mapping(address => bool) public allowedDepositors; // NFT721, Marketplace

    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event LpReceiverChanged(address indexed oldReceiver, address indexed newReceiver);
    event DepositorAllowed(address indexed depositor, bool allowed);
    event DepositBNB(address indexed from, uint256 amount);
    event DepositToken(address indexed token, address indexed from, uint256 amount);
    event AddLiquidityGadBnb(uint256 gadIn, uint256 bnbIn, uint256 lpOut);
    event AddLiquidityGadUsdt(uint256 gadIn, uint256 usdtIn, uint256 lpOut);

    modifier onlyOwner { require(msg.sender == owner, "not owner"); _; }
    modifier onlyAllowed { require(allowedDepositors[msg.sender], "not allowed"); _; }

    constructor(address _gad, address _usdt, address _wbnb, address _router, address _owner, address _lpReceiver) {
        require(_gad != address(0) && _usdt != address(0) && _wbnb != address(0) && _router != address(0), "zero addr");
        require(_owner != address(0) && _lpReceiver != address(0), "zero admin");
        GAD = _gad; USDT = _usdt; WBNB = _wbnb; ROUTER = IPancakeRouterV2(_router);
        owner = _owner; lpReceiver = _lpReceiver;
    }

    receive() external payable { emit DepositBNB(msg.sender, msg.value); }

    function setOwner(address newOwner) external onlyOwner { require(newOwner != address(0),"zero"); emit OwnerChanged(owner,newOwner); owner = newOwner; }
    function setLpReceiver(address newReceiver) external onlyOwner { require(newReceiver != address(0),"zero"); emit LpReceiverChanged(lpReceiver,newReceiver); lpReceiver = newReceiver; }
    function setDepositor(address depositor, bool allowed) external onlyOwner { allowedDepositors[depositor]=allowed; emit DepositorAllowed(depositor,allowed); }

    // deposits
    function depositBNB() external payable onlyAllowed { require(msg.value>0,"zero"); emit DepositBNB(msg.sender,msg.value); }
    function depositToken(address token, uint256 amount) external onlyAllowed {
        require(amount>0,"zero"); require(token==USDT || token==GAD,"token not allowed");
        require(IERC20(token).transferFrom(msg.sender,address(this),amount),"transferFrom failed");
        emit DepositToken(token,msg.sender,amount);
    }

    // views
    function bnbBalance() public view returns(uint256){ return address(this).balance; }
    function usdtBalance() public view returns(uint256){ return IERC20(USDT).balanceOf(address(this)); }
    function gadBalance()  public view returns(uint256){ return IERC20(GAD).balanceOf(address(this)); }

    // add liquidity (only owner)
    function addLiquidityGadBnb(
        uint256 amountGadDesired, uint256 amountGadMin, uint256 amountBnbMin, uint256 deadline
    ) external onlyOwner returns (uint256 aGAD, uint256 aBNB, uint256 lp) {
        require(amountGadDesired>0,"zero gad");
        _safeApprove(GAD,address(ROUTER),0);
        _safeApprove(GAD,address(ROUTER),amountGadDesired);
        (aGAD,aBNB,lp)=ROUTER.addLiquidityETH{value: amountBnbMin}(GAD,amountGadDesired,amountGadMin,amountBnbMin,lpReceiver,deadline);
        emit AddLiquidityGadBnb(aGAD,aBNB,lp);
        _safeApprove(GAD,address(ROUTER),0);
    }
    function addLiquidityGadUsdt(
        uint256 amountGadDesired, uint256 amountUsdtDesired, uint256 amountGadMin, uint256 amountUsdtMin, uint256 deadline
    ) external onlyOwner returns (uint256 aGAD, uint256 aUSDT, uint256 lp) {
        require(amountGadDesired>0 && amountUsdtDesired>0,"zero");
        _safeApprove(GAD,address(ROUTER),0); _safeApprove(USDT,address(ROUTER),0);
        _safeApprove(GAD,address(ROUTER),amountGadDesired);
        _safeApprove(USDT,address(ROUTER),amountUsdtDesired);
        (aGAD,aUSDT,lp)=ROUTER.addLiquidity(GAD,USDT,amountGadDesired,amountUsdtDesired,amountGadMin,amountUsdtMin,lpReceiver,deadline);
        emit AddLiquidityGadUsdt(aGAD,aUSDT,lp);
        _safeApprove(GAD,address(ROUTER),0); _safeApprove(USDT,address(ROUTER),0);
    }

    function _safeApprove(address token, address spender, uint256 amount) internal {
        IERC20 t = IERC20(token);
        uint256 cur = t.allowance(address(this), spender);
        if (cur != 0) { require(t.approve(spender,0),"approve reset fail"); }
        require(t.approve(spender,amount),"approve fail");
    }
}
