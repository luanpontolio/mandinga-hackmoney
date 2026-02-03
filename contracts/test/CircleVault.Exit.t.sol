// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CircleVaultFactory.sol";
import "../src/CircleVault.sol";
import "../src/PositionNFT.sol";
import "../src/ERC20Claim.sol";
import "../src/libraries/CircleError.sol";

contract CircleVaultExitTest is Test {
    event EarlyExit(address indexed participant, uint256 indexed tokenId, uint256 claimAmount, uint256 feeAmount, uint256 netAmount);

    CircleVaultFactory factory;
    address vault;
    address shareToken;
    address positionNft;
    address creator = address(0x1);

    uint256 constant TARGET = 1_000e18;
    uint256 constant INSTALLMENTS = 10;
    uint256 constant NUM_USERS = 4;
    uint16 constant EXIT_FEE_BPS = 200; // 2%
    uint256 constant QUOTA_EARLY = 2;
    uint256 constant QUOTA_MIDDLE = 1;
    uint256 constant QUOTA_LATE = 1;

    address participant;

    function setUp() public {
        factory = new CircleVaultFactory();
        vm.deal(address(this), 100_000e18);

        vm.startPrank(creator);
        vault = factory.createCircle(
            "ExitCircle",
            TARGET,
            INSTALLMENTS,
            block.timestamp + 1 days,
            7 days,
            NUM_USERS,
            NUM_USERS,
            EXIT_FEE_BPS,
            QUOTA_EARLY,
            QUOTA_MIDDLE,
            QUOTA_LATE
        );
        vm.stopPrank();

        CircleVaultFactory.CircleInfo memory info = factory.getCircle(0);
        shareToken = info.shareToken;
        positionNft = info.positionNft;

        participant = address(0x30);
        vm.deal(participant, TARGET + 1e18);
        vm.prank(participant);
        CircleVault(payable(vault)).deposit{value: TARGET}(0);
    }

    function test_ExitEarly_BurnsClaimsPaysNetSetsExited() public {
        uint256 claimsBalance = ERC20Claim(shareToken).balanceOf(participant);
        uint256 balanceBefore = participant.balance;

        vm.prank(participant);
        ERC20Claim(shareToken).approve(vault, claimsBalance);

        vm.prank(participant);
        CircleVault(payable(vault)).exitEarly(claimsBalance);

        uint256 expectedFee = (claimsBalance * EXIT_FEE_BPS) / 10_000;
        uint256 expectedNet = claimsBalance - expectedFee;

        assertEq(ERC20Claim(shareToken).balanceOf(participant), 0);
        assertEq(participant.balance, balanceBefore + expectedNet);

        uint256 tokenId = CircleVault(payable(vault)).participantToTokenId(participant);
        PositionNFT.PositionData memory pos = PositionNFT(positionNft).getPosition(tokenId);
        assertEq(uint256(pos.status), uint256(PositionNFT.Status.EXITED));
    }

    function test_ExitEarly_PartialAmount() public {
        uint256 half = TARGET / 2;
        vm.prank(participant);
        ERC20Claim(shareToken).approve(vault, half);

        uint256 balanceBefore = participant.balance;

        vm.prank(participant);
        CircleVault(payable(vault)).exitEarly(half);

        uint256 expectedFee = (half * EXIT_FEE_BPS) / 10_000;
        uint256 expectedNet = half - expectedFee;

        assertEq(ERC20Claim(shareToken).balanceOf(participant), TARGET - half);
        assertEq(participant.balance, balanceBefore + expectedNet);

        uint256 tokenId = CircleVault(payable(vault)).participantToTokenId(participant);
        PositionNFT.PositionData memory pos = PositionNFT(positionNft).getPosition(tokenId);
        assertEq(uint256(pos.status), uint256(PositionNFT.Status.EXITED));
    }

    function test_ExitEarly_RevertsNotEnrolled() public {
        address stranger = address(0x99);
        vm.prank(stranger);
        vm.expectRevert(CircleErrors.NotEnrolled.selector);
        CircleVault(payable(vault)).exitEarly(100e18);
    }

    function test_ExitEarly_RevertsInsufficientClaims() public {
        vm.prank(participant);
        vm.expectRevert(CircleErrors.InsufficientClaims.selector);
        CircleVault(payable(vault)).exitEarly(TARGET + 1);
    }

    function test_ExitEarly_RevertsZeroAmount() public {
        vm.prank(participant);
        vm.expectRevert(CircleErrors.ZeroAmount.selector);
        CircleVault(payable(vault)).exitEarly(0);
    }

    function test_ExitEarly_EmitsEarlyExit() public {
        uint256 amount = TARGET;
        uint256 tokenId = CircleVault(payable(vault)).participantToTokenId(participant);
        uint256 feeAmount = (amount * EXIT_FEE_BPS) / 10_000;
        uint256 netAmount = amount - feeAmount;

        vm.prank(participant);
        ERC20Claim(shareToken).approve(vault, amount);

        vm.expectEmit(true, true, true, true);
        emit EarlyExit(participant, tokenId, amount, feeAmount, netAmount);

        vm.prank(participant);
        CircleVault(payable(vault)).exitEarly(amount);
    }

    function test_ExitEarly_AfterInstallment() public {
        uint256 installmentAmt = CircleVault(payable(vault)).installmentAmount();
        vm.deal(participant, participant.balance + installmentAmt); // fund so payInstallment can send value
        vm.prank(participant);
        CircleVault(payable(vault)).payInstallment{value: installmentAmt}();

        uint256 totalClaims = TARGET + installmentAmt;
        vm.prank(participant);
        ERC20Claim(shareToken).approve(vault, totalClaims);

        uint256 balanceBefore = participant.balance;
        vm.prank(participant);
        CircleVault(payable(vault)).exitEarly(totalClaims);

        uint256 expectedFee = (totalClaims * EXIT_FEE_BPS) / 10_000;
        assertEq(participant.balance, balanceBefore + totalClaims - expectedFee);
    }
}
