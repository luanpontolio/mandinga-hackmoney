// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CircleVaultFactory.sol";
import "../src/CircleVault.sol";
import "../src/PositionNFT.sol";
import "../src/ERC20Claim.sol";
import "../src/libraries/CircleError.sol";

contract CircleVaultDepositTest is Test {
    event ParticipantEnrolled(address indexed participant, uint256 indexed tokenId, uint256 depositAmount);

    CircleVaultFactory factory;
    address vault;
    address shareToken;
    address positionNft;
    address creator = address(0x1);

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
        vm.deal(address(this), 100_000e18);

        vm.startPrank(creator);
        vault = factory.createCircle(
            "DepositCircle",
            "DepositShare",
            "DS",
            "DepositPosition",
            "DP",
            TARGET,
            INSTALLMENTS,
            block.timestamp + 1 days,
            7 days,
            NUM_USERS,
            NUM_USERS,
            EXIT_FEE_BPS,
            QUOTA_EARLY,
            QUOTA_MIDDLE,
            QUOTA_LATE,
            address(0xBeef),
            1
        );
        vm.stopPrank();

        CircleVaultFactory.CircleInfo memory info = factory.getCircle(0);
        shareToken = info.shareToken;
        positionNft = info.positionNft;
    }

    function test_Deposit_MintsPositionAndClaims() public {
        address user = address(0x10);
        vm.deal(user, TARGET + 1e18);

        vm.prank(user);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(0); // quota early

        assertEq(PositionNFT(positionNft).balanceOf(user), 1);
        assertEq(ERC20Claim(shareToken).balanceOf(user), INSTALLMENT_AMOUNT);
        assertEq(CircleVault(payable(vault)).participantToTokenId(user), 1);
        assertTrue(CircleVault(payable(vault)).isEnrolled(user));

        PositionNFT.PositionData memory pos = PositionNFT(positionNft).getPosition(1);
        assertEq(pos.quotaId, 0);
        assertEq(pos.targetValue, TARGET);
        assertEq(pos.totalInstallments, INSTALLMENTS);
        assertEq(pos.paidInstallments, 1);
        assertEq(pos.totalPaid, INSTALLMENT_AMOUNT);
        assertEq(uint256(pos.status), uint256(PositionNFT.Status.ACTIVE));
    }

    function test_Deposit_RespectsQuotaCapacity() public {
        address u1 = address(0x10);
        address u2 = address(0x11);
        address u3 = address(0x12);
        vm.deal(u1, TARGET + 1e18);
        vm.deal(u2, TARGET + 1e18);
        vm.deal(u3, TARGET + 1e18);

        vm.prank(u1);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(0);
        vm.prank(u2);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(0);
        // Quota 0 (early) is full (cap 2)
        vm.prank(u3);
        vm.expectRevert(CircleErrors.QuotaFull.selector);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(0);

        // Quota 1 has room
        vm.prank(u3);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(1);
    }

    function test_Deposit_RevertsWrongAmount() public {
        address user = address(0x10);
        vm.deal(user, TARGET + 1e18);

        vm.prank(user);
        vm.expectRevert(CircleErrors.IncorrectDepositAmount.selector);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT - 1}(0);
    }

    function test_Deposit_RevertsInvalidQuota() public {
        address user = address(0x10);
        vm.deal(user, TARGET + 1e18);

        vm.prank(user);
        vm.expectRevert(CircleErrors.InvalidQuota.selector);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(3);
    }

    function test_Deposit_RevertsAlreadyEnrolled() public {
        address user = address(0x10);
        vm.deal(user, TARGET * 2 + 1e18);

        vm.prank(user);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(0);

        vm.prank(user);
        vm.expectRevert(CircleErrors.AlreadyEnrolled.selector);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(1);
    }

    function test_Deposit_RevertsJoinAfterDeadline() public {
        address user = address(0x10);
        vm.deal(user, TARGET + 1e18);
        // Join deadline for quota 0 (early) is closeWindowEarly = startTime + 7 days; warp past it
        vm.warp(CircleVault(payable(vault)).getCloseWindowTimestamp(0) + 1);

        vm.prank(user);
        vm.expectRevert(CircleErrors.JoinAfterDeadline.selector);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(0);
    }

    function test_Deposit_EmitsParticipantEnrolled() public {
        address user = address(0x10);
        vm.deal(user, TARGET + 1e18);

        vm.expectEmit(true, true, true, true);
        emit ParticipantEnrolled(user, 1, INSTALLMENT_AMOUNT);

        vm.prank(user);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(0);
    }

    function test_Deposit_AllThreeQuotas() public {
        address u1 = address(0x10);
        address u2 = address(0x11);
        address u3 = address(0x12);
        vm.deal(u1, TARGET + 1e18);
        vm.deal(u2, TARGET + 1e18);
        vm.deal(u3, TARGET + 1e18);

        vm.prank(u1);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(0);
        vm.prank(u2);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(1);
        vm.prank(u3);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(2);

        assertEq(CircleVault(payable(vault)).quotaFilledEarly(), 1);
        assertEq(CircleVault(payable(vault)).quotaFilledMiddle(), 1);
        assertEq(CircleVault(payable(vault)).quotaFilledLate(), 1);
    }
}
