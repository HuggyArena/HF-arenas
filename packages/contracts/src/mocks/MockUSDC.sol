// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @notice Mintable ERC-20 token that mimics USDC (6 decimals) for testnet / demo use.
 *         The owner (typically the deployer or a Faucet contract) can call `mint` to
 *         issue play-money balances to users.  Never deploy on mainnet.
 */
contract MockUSDC is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Mock USDC", "USDC") Ownable(initialOwner) {}

    /// @notice USDC uses 6 decimal places.
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /**
     * @notice Mint `amount` tokens to `to`.  Only callable by the owner.
     * @param to     Recipient address.
     * @param amount Amount in the smallest unit (1 USDC = 1_000_000).
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
