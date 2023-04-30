pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Splitter {
    struct Deposit {
        uint256 amount;
        uint256 releaseInterval;
        uint256 nextRelease;
        uint256 releasedAmount;
    }

    address private owner;
    mapping(address => mapping(address => uint256)) private ethSplits;
    mapping(address => mapping(address => Deposit[])) private ethDeposits;
    mapping(address => mapping(address => mapping(address => uint256))) private tokenSplits;
    mapping(address => mapping(address => mapping(address => Deposit[]))) private tokenDeposits;

    IERC20 private _dai;
    IERC20 private _usdc;
    IERC20 private _usdt;

    constructor(address dai, address usdc, address usdt) {
        owner = msg.sender;
        _dai = IERC20(dai);
        _usdc = IERC20(usdc);
        _usdt = IERC20(usdt);
    }

    modifier onlyDepositor(address depositor, bool isEth, address token) {
        require(msg.sender == depositor, "Caller is not the depositor");
        _;
    }

    //deposit functions
    function depositEth(
        address[] calldata recipients,
        uint256[] calldata percentages,
        uint256 releaseInterval
    ) external payable {
        require(msg.value > 0, "ETH amount must be greater than 0");
        _deposit(msg.sender, address(0), msg.value, recipients, percentages, releaseInterval);
    }

    function depositToken(
        address token,
        uint256 amount,
        address[] calldata recipients,
        uint256[] calldata percentages,
        uint256 releaseInterval
    ) external {
        require(amount > 0, "Token amount must be greater than 0");
        IERC20 currency = _getCurrency(token);
        currency.transferFrom(msg.sender, address(this), amount);
        _deposit(msg.sender, token, amount, recipients, percentages, releaseInterval);
    }

    function _deposit(
        address depositor,
        address token,
        uint256 amount,
        address[] calldata recipients,
        uint256[] calldata percentages,
        uint256 releaseInterval
    ) private {
        require(recipients.length == percentages.length, "Recipients and percentages length mismatch");

        uint256 remaining = amount;
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 splitAmount = (amount * percentages[i]) / 100;
            if (token == address(0)) {
                ethSplits[depositor][recipients[i]] = splitAmount;
                ethDeposits[depositor][recipients[i]].push(Deposit(splitAmount, releaseInterval, block.timestamp + releaseInterval, 0));
            } else {
                tokenSplits[depositor][token][recipients[i]] = splitAmount;
                tokenDeposits[depositor][token][recipients[i]].push(Deposit(splitAmount, releaseInterval, block.timestamp + releaseInterval, 0));
            }
            remaining -= splitAmount;
        }

        require(remaining == 0, "Percentages do not add up to 100");
    }

    //claim functions
    function claimEth(address depositor) external {
        _claim(msg.sender, address(0));
    }

    function claimToken(address depositor, address token) external {
        _claim(msg.sender, token);
    }

    function _claim(address depositor, address token) private {
        Deposit[] storage userDeposits;
        if (token == address(0)) {
            userDeposits = ethDeposits[depositor][msg.sender];
        } else {
            userDeposits = tokenDeposits[depositor][token][msg.sender];
        }

        uint256 totalClaimable = 0;

        for (uint256 i = 0; i < userDeposits.length; i++) {
            if (block.timestamp >= userDeposits[i].nextRelease) {
                uint256 claimable = (userDeposits[i].amount * (block.timestamp - userDeposits[i].nextRelease + userDeposits[i].releaseInterval - 1)) / userDeposits[i].releaseInterval;
                claimable = claimable - userDeposits[i].releasedAmount;
                totalClaimable += claimable;
                userDeposits[i].releasedAmount += claimable;
                userDeposits[i].nextRelease += userDeposits[i].releaseInterval;
            }
        }

        require(totalClaimable > 0, "No claimable amount");

        if (token == address(0)) {
            payable(msg.sender).transfer(totalClaimable);
        } else {
            IERC20 currency = _getCurrency(token);
            currency.transfer(msg.sender, totalClaimable);
        }
    }

    //withdraw functions
    function withdrawEth(uint256 amount) external onlyDepositor(msg.sender, true, address(0)) {
        _withdraw(msg.sender, address(0), amount);
    }

    function withdrawToken(address token, uint256 amount) external onlyDepositor(msg.sender, false, token) {
        _withdraw(msg.sender, token, amount);
    }

    function _withdraw(address depositor, address token, uint256 amount) private {
        uint256 totalUnreleased = 0;
        Deposit[] storage depositorDeposits;

        if (token == address(0)) {
            depositorDeposits = ethDeposits[depositor][depositor];
        } else {
            depositorDeposits = tokenDeposits[depositor][token][depositor];
        }

        for (uint256 i = 0; i < depositorDeposits.length; i++) {
            totalUnreleased += depositorDeposits[i].amount - depositorDeposits[i].releasedAmount;
        }

        require(totalUnreleased >= amount, "Insufficient funds to withdraw");

        if (token == address(0)) {
            payable(depositor).transfer(amount);
        } else {
            IERC20 currency = _getCurrency(token);
            currency.transfer(depositor, amount);
        }
    }

    function _getCurrency(address token) private view returns (IERC20) {
        if (token == address(_dai)) {
            return _dai;
        } else if (token == address(_usdc)) {
            return _usdc;
        } else if (token == address(_usdt)) {
            return _usdt;
        } else {
            revert("Unsupported token");
        }
    }

    function getBalance(address depositor, address token) external view returns (uint256) {
    uint256 balance = 0;
    Deposit[] storage depositorDeposits;

    if (token == address(0)) {
        depositorDeposits = ethDeposits[depositor][depositor];
    } else {
        depositorDeposits = tokenDeposits[depositor][token][depositor];
    }

    for (uint256 i = 0; i < depositorDeposits.length; i++) {
        balance += depositorDeposits[i].amount - depositorDeposits[i].releasedAmount;
    }

    return balance;
}

}
