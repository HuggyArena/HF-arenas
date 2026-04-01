// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {ArenaRegistry} from "../src/ArenaRegistry.sol";
import {ArenaFactory} from "../src/ArenaFactory.sol";
import {ArenaMarket} from "../src/ArenaMarket.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";

contract Deploy is Script {
    /// @dev Polygon Mainnet USDC (PoS bridged) — never deploy MockUSDC here.
    address private constant POLYGON_MAINNET_USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    uint256 private constant POLYGON_MAINNET_CHAIN_ID = 137;

    function run() external {
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");
        address admin = vm.envAddress("ADMIN_ADDRESS");

        vm.startBroadcast(deployerPk);

        // ── Collateral selection ─────────────────────────────────────────────
        // On Polygon Mainnet use the real bridged USDC so no mock token is ever
        // deployed in production.  On every other network (Amoy testnet, local
        // Anvil, CI fork, etc.) deploy MockUSDC so the faucet can mint freely.
        address usdc;
        if (block.chainid == POLYGON_MAINNET_CHAIN_ID) {
            usdc = POLYGON_MAINNET_USDC;
            console2.log("Mainnet detected — using real USDC:", usdc);
        } else {
            MockUSDC mockUsdc = new MockUSDC(admin);
            usdc = address(mockUsdc);
            console2.log("Testnet/local detected — deployed MockUSDC:", usdc);
        }

        // ── Core protocol contracts ──────────────────────────────────────────
        ArenaRegistry registry = new ArenaRegistry(usdc, admin);
        ArenaMarket implementation = new ArenaMarket();
        ArenaFactory factory = new ArenaFactory(address(registry), address(implementation));

        registry.setBeacon(address(factory.beacon()));
        registry.grantRole(registry.OPERATOR_ROLE(), address(factory));
        registry.grantRole(registry.OPERATOR_ROLE(), admin);

        vm.stopBroadcast();

        console2.log("Registry:      ", address(registry));
        console2.log("Factory:       ", address(factory));
        console2.log("Beacon:        ", address(factory.beacon()));
        console2.log("Implementation:", address(implementation));
        console2.log("Collateral:    ", usdc);
    }
}
