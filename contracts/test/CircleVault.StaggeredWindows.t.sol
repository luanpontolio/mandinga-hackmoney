// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CircleVaultFactory.sol";
import "../src/CircleVaultFactoryDeployer.sol";
import "../src/CircleVault.sol";
import "../src/PositionNFT.sol";
import "../src/ERC20Claim.sol";
import "../src/mocks/VRFCoordinatorV2_5Mock.sol";
import "../src/libraries/CircleError.sol";
import "../src/libraries/CircleIdLib.sol";

/// @title Tests for close-window-per-quota and snapshot per window (staggered payouts).
contract CircleVaultStaggeredWindowsTest is Test {
    CircleVaultFactory factory;
    CircleVaultFactoryDeployer deployer;
    VRFCoordinatorV2_5Mock vrfMock;
    address vault;
    address shareToken;
    address positionNft;
    address creator = address(0x1);
    uint64 vrfSubId;

    uint256 constant TARGET = 1_000e18;
    uint256 constant INSTALLMENTS = 10;
    uint256 constant INSTALLMENT_AMOUNT = TARGET / INSTALLMENTS;
    uint256 constant NUM_USERS = 6;
    uint16 constant EXIT_FEE_BPS = 0;
    uint256 constant QUOTA_EARLY = 2;
    uint256 constant QUOTA_MIDDLE = 2;
    uint256 constant QUOTA_LATE = 2;

    function setUp() public {
        deployer = new CircleVaultFactoryDeployer();
        factory = new CircleVaultFactory(address(deployer));
        vrfMock = new VRFCoordinatorV2_5Mock();
        vrfSubId = vrfMock.createSubscription();
        vrfMock.fundSubscription(vrfSubId, 100e18);
        vm.deal(address(this), 100_000e18);

        uint256 startTime = block.timestamp + 1;
        CircleVaultFactory.CreateCircleParams memory p = CircleVaultFactory.CreateCircleParams({
            name: "StaggeredCircle",
            targetValue: TARGET,
            totalInstallments: INSTALLMENTS,
            startTime: startTime,
            timePerRound: 7 days,
            numRounds: NUM_USERS,
            numUsers: NUM_USERS,
            exitFeeBps: EXIT_FEE_BPS,
            quotaCapEarly: QUOTA_EARLY,
            quotaCapMiddle: QUOTA_MIDDLE,
            quotaCapLate: QUOTA_LATE,
            vrfCoordinator: address(vrfMock),
            vrfSubscriptionId: vrfSubId
        });
        vm.startPrank(creator);
        vault = factory.createCircle(p);
        vm.stopPrank();

        bytes32 circleId = CircleIdLib.compute(creator, p.name, p.startTime, p.targetValue, p.totalInstallments, p.timePerRound, p.numRounds, p.numUsers, p.exitFeeBps, p.quotaCapEarly, p.quotaCapMiddle, p.quotaCapLate, p.vrfCoordinator, p.vrfSubscriptionId);
        CircleVaultFactory.CircleInfo memory info = factory.getCircle(circleId);
        shareToken = info.shareToken;
        positionNft = info.positionNft;
        vrfMock.addConsumer(vrfSubId, info.drawConsumer);

        for (uint256 i = 0; i < 6; i++) {
            address u = address(uint160(0x10 + i));
            vm.deal(u, TARGET + 1e18);
            vm.prank(u);
            CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(i % 3);
        }
    }

    function test_CloseWindowEarly_OnlyEarlyParticipantsSnapshotted() public {
        vm.warp(block.timestamp + 1 + 7 days);
        CircleVault(payable(vault)).requestCloseWindow(0);

        assertEq(CircleVault(payable(vault)).getWindowParticipants(0).length, 2);
        assertFalse(CircleVault(payable(vault)).windowSnapshotted(1));
        assertFalse(CircleVault(payable(vault)).windowSnapshotted(2));
    }

    function test_CloseWindowMiddle_AfterEarly_OnlyMiddleSnapshotted() public {
        vm.warp(block.timestamp + 1 + 7 days);
        CircleVault(payable(vault)).requestCloseWindow(0);
        vm.warp(block.timestamp + 1 + 14 days);
        CircleVault(payable(vault)).requestCloseWindow(1);

        assertEq(CircleVault(payable(vault)).getWindowParticipants(1).length, 2);
        assertFalse(CircleVault(payable(vault)).windowSnapshotted(2));
    }

    function test_SnapshotBalance_RecordedPerParticipant() public {
        vm.warp(block.timestamp + 1 + 7 days);
        CircleVault(payable(vault)).requestCloseWindow(0);

        address[] memory participants = CircleVault(payable(vault)).getWindowParticipants(0);
        for (uint256 i = 0; i < participants.length; i++) {
            uint256 bal = CircleVault(payable(vault)).windowSnapshotBalance(0, participants[i]);
            assertEq(bal, INSTALLMENT_AMOUNT, "snapshot balance should equal first installment");
        }
    }
}
