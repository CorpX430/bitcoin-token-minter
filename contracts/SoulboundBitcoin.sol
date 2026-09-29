// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SoulboundBitcoin
 * @notice A mint-only, non-transferable ERC-20-shaped token.
 *         The owner can mint; all transfer/approval paths revert.
 */
contract SoulboundBitcoin {
    string public constant name = "Bitcoin";
    string public constant symbol = "BTC";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    address public owner;
    mapping(address => uint256) private balances;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Transfer(address indexed from, address indexed to, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor(address initialOwner) {
        require(initialOwner != address(0), "OWNER_ZERO");
        owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "MINT_TO_ZERO");
        require(amount > 0, "AMOUNT_ZERO");
        balances[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function transfer(address, uint256) external pure returns (bool) {
        revert("SOULBOUND");
    }

    function approve(address, uint256) external pure returns (bool) {
        revert("SOULBOUND");
    }

    function transferFrom(address, address, uint256) external pure returns (bool) {
        revert("SOULBOUND");
    }

    function allowance(address, address) external pure returns (uint256) {
        return 0;
    }

    function renounceOwnership() external onlyOwner {
        emit OwnershipTransferred(owner, address(0));
        owner = address(0);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "OWNER_ZERO");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
