// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CircleVaultFactory.sol";
import "../src/CircleVault.sol";
import "../src/PositionNFT.sol";
import "../src/ERC20Claim.sol";
import "../src/mocks/VRFCoordinatorV2_5Mock.sol";
import "../src/libraries/CircleError.sol";

contract CircleVaultSnapshotTest is Test {
    CircleVaultFactory factory;
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
    uint16 constant EXIT_FEE_BPS = 200;
    uint256 constant QUOTA_EARLY = 2;
    uint256 constant QUOTA_MIDDLE = 2;
    uint256 constant QUOTA_LATE = 2;

    function setUp() public {
        factory = new CircleVaultFactory();
        vrfMock = new VRFCoordinatorV2_5Mock();
        vrfSubId = vrfMock.createSubscription();
        vrfMock.fundSubscription(vrfSubId, 100e18);
        vm.deal(address(this), 100_000e18);

        vm.startPrank(creator);
        vault = factory.createCircle(
            "SnapshotCircle",
            "SnapshotShare",
            "SS",
            "SnapshotPosition",
            "SP",
            TARGET,
            INSTALLMENTS,
            block.timestamp + 1, // start almost now
            7 days,
            NUM_USERS,
            NUM_USERS,
            EXIT_FEE_BPS,
            QUOTA_EARLY,
            QUOTA_MIDDLE,
            QUOTA_LATE,
            address(vrfMock),
            vrfSubId
        );
        vm.stopPrank();

        CircleVaultFactory.CircleInfo memory info = factory.getCircle(0);
        shareToken = info.shareToken;
        positionNft = info.positionNft;
        vrfMock.addConsumer(vrfSubId, info.drawConsumer);

        // Enroll 2 in early, 2 in middle, 2 in late
        for (uint256 i = 0; i < 6; i++) {
            address u = address(uint160(0x10 + i));
            vm.deal(u, TARGET + 1e18);
            vm.prank(u);
            CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(i % 3);
        }
    }

    function test_GetCloseWindowTimestamps() public view {
        assertEq(
            CircleVault(payable(vault)).getCloseWindowTimestamp(0),
            block.timestamp + 1 + 7 days
        );
        assertEq(
            CircleVault(payable(vault)).getCloseWindowTimestamp(1),
            block.timestamp + 1 + 14 days
        );
        assertEq(
            CircleVault(payable(vault)).getCloseWindowTimestamp(2),
            block.timestamp + 1 + 21 days
        );
    }

    function test_RequestCloseWindow_RevertsBeforeCloseTime() public {
        vm.warp(block.timestamp + 1 days);
        vm.expectRevert(CircleErrors.InvalidParameters.selector);
        CircleVault(payable(vault)).requestCloseWindow(0);
    }

    function test_RequestCloseWindow_SnapshotsEarlyWindow() public {
        vm.warp(block.timestamp + 1 + 7 days);
        CircleVault(payable(vault)).requestCloseWindow(0);

        assertTrue(CircleVault(payable(vault)).windowSnapshotted(0));
        assertEq(CircleVault(payable(vault)).getWindowParticipants(0).length, 2);
        assertTrue(ERC20Claim(shareToken).transfersFrozen());
    }

    function test_RequestCloseWindow_RevertsIfAlreadySnapshotted() public {
        vm.warp(block.timestamp + 1 + 7 days);
        CircleVault(payable(vault)).requestCloseWindow(0);
        vm.expectRevert(CircleErrors.AlreadySnapshotted.selector);
        CircleVault(payable(vault)).requestCloseWindow(0);
    }
}
