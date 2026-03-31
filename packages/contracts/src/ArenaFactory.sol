// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import {ArenaMarket} from "./ArenaMarket.sol";

interface IFactoryRegistry {
    function isCreator(address) external view returns (bool);
    function creatorBondLocked(address) external view returns (uint256);
    function creatorBondAmount() external view returns (uint256);
    function lockCreatorBond(address, uint256) external;
    function registerMarket(address, string calldata) external;
    function collateral() external view returns (IERC20);
}

contract ArenaFactory is AccessControl {
    using SafeERC20 for IERC20;

    IFactoryRegistry public immutable registry;
    UpgradeableBeacon public immutable beacon;

    event MarketCreated(address indexed proxy, string indexed marketId, address indexed creator, address referrer);

    constructor(address _registry, address _implementation) {
        registry = IFactoryRegistry(_registry);
        beacon = new UpgradeableBeacon(_implementation, msg.sender);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createMarket(
        ArenaMarket.MarketParams calldata params,
        bytes32[] calldata outcomes,
        address referrer
    ) external returns (address proxy) {
        require(
            registry.isCreator(msg.sender) || registry.creatorBondLocked(msg.sender) >= registry.creatorBondAmount(),
            "Factory: bond"
        );

        if (registry.creatorBondLocked(msg.sender) == 0) {
            registry.lockCreatorBond(msg.sender, registry.creatorBondAmount());
        }

        BeaconProxy beaconProxy = new BeaconProxy(
            address(beacon),
            abi.encodeWithSelector(
                ArenaMarket.initialize.selector,
                address(registry),
                params,
                outcomes,
                msg.sender,
                referrer
            )
        );

        proxy = address(beaconProxy);
        registry.registerMarket(proxy, params.marketId);

        emit MarketCreated(proxy, params.marketId, msg.sender, referrer);
    }

    function upgradeBeacon(address newImpl) external onlyRole(DEFAULT_ADMIN_ROLE) {
        beacon.upgradeTo(newImpl);
    }
}
