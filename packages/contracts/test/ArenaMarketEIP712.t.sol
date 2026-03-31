// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {ArenaRegistry} from "../src/ArenaRegistry.sol";
import {ArenaMarket} from "../src/ArenaMarket.sol";

contract ArenaMarketEIP712Test is Test {
    ArenaRegistry internal registry;
    ArenaMarket internal market;

    address internal admin = address(0xA11CE);
    address internal user = address(0xBEEF);
    uint256 internal oraclePk = 0xA0B0C0;
    address internal oracle;

    bytes32 internal constant OUTCOME_YES = keccak256("YES");
    bytes32 internal constant OUTCOME_NO = keccak256("NO");

    function setUp() public {
        oracle = vm.addr(oraclePk);
        vm.startPrank(admin);
        registry = new ArenaRegistry(address(new MockUSDC()), admin);
        registry.grantRole(registry.ORACLE_ROLE(), oracle);
        market = new ArenaMarket();

        bytes32[] memory outcomes = new bytes32[](2);
        outcomes[0] = OUTCOME_YES;
        outcomes[1] = OUTCOME_NO;

        ArenaMarket.MarketParams memory params = ArenaMarket.MarketParams({
            marketId: "hf-top-test",
            ipfsHash: "ipfs://test",
            sourcePrimary: bytes32("hf"),
            sourceFallback: bytes32("mirror"),
            tieRule: bytes32("void"),
            voidRule: bytes32("void"),
            openTime: block.timestamp,
            closeTime: block.timestamp + 1 days,
            resolveTime: block.timestamp + 2 days,
            challengeWindowSeconds: 1 days
        });

        market.initialize(address(registry), params, outcomes, admin, address(0));
        market.approveMarket();
        vm.stopPrank();
    }

    function testBetTypehashExists() public view {
        assertTrue(market.BET_TYPEHASH() != bytes32(0));
    }

    function testInitialMarketState() public view {
        assertTrue(market.getCurrentState() == ArenaMarket.MarketState.OPEN);
        assertEq(market.totalPool(), 0);
        assertTrue(market.isValidOutcome(OUTCOME_YES));
        assertTrue(market.isValidOutcome(OUTCOME_NO));
        assertFalse(market.isValidOutcome(bytes32(0)));
    }
}

contract ArenaRegistryTest is Test {
    ArenaRegistry internal registry;
    address internal admin = address(0xA11CE);
    MockUSDC internal usdc;

    function setUp() public {
        usdc = new MockUSDC();
        vm.prank(admin);
        registry = new ArenaRegistry(address(usdc), admin);
    }

    function testDefaultFees() public view {
        assertEq(registry.protocolFeeBps(), 275);
        assertEq(registry.creatorFeeBps(), 100);
        assertEq(registry.referralFeeBps(), 50);
        assertEq(registry.disputeReserveBps(), 75);
        assertEq(registry.totalFeeBps(), 500);
    }

    function testSetFeesRevertsAboveMax() public {
        vm.prank(admin);
        vm.expectRevert("Registry: max fee");
        registry.setFees(3000, 1000, 500, 600);
    }

    function testSetFeesSuccess() public {
        vm.prank(admin);
        registry.setFees(300, 100, 50, 50);
        assertEq(registry.totalFeeBps(), 500);
    }

    function testSetTreasuryRejectsZero() public {
        vm.prank(admin);
        vm.expectRevert("Registry: zero treasury");
        registry.setTreasury(address(0));
    }

    function testSetOracleModuleRejectsZero() public {
        vm.prank(admin);
        vm.expectRevert("Registry: zero oracle module");
        registry.setOracleModule(address(0));
    }

    function testSanctionStatus() public {
        address suspect = address(0xBAD);
        assertFalse(registry.checkSanction(suspect));
        vm.prank(admin);
        registry.setSanctionStatus(suspect, true);
        assertTrue(registry.checkSanction(suspect));
    }

    function testConstructorRejectsZeroCollateral() public {
        vm.expectRevert("Registry: zero collateral");
        new ArenaRegistry(address(0), admin);
    }
}

contract MockUSDC {
    string public name = "Mock USDC";
    string public symbol = "mUSDC";
    uint8 public decimals = 6;

    mapping(address => uint256) public balanceOf;

    function transferFrom(address, address, uint256) external pure returns (bool) {
        return true;
    }

    function transfer(address, uint256) external pure returns (bool) {
        return true;
    }
}
