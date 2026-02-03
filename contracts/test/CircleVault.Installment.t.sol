// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/CircleVaultFactory.sol";
import "../src/CircleVault.sol";
import "../src/PositionNFT.sol";
import "../src/ERC20Claim.sol";
import "../src/libraries/CircleError.sol";

contract CircleVaultInstallmentTest is Test {
    event InstallmentPaid(address indexed participant, uint256 indexed tokenId, uint256 amount, uint256 totalPaid);

    CircleVaultFactory factory;
    address vault;
    address shareToken;
    address positionNft;
    address creator = address(0x1);

    uint256 constant TARGET = 1_000e18;
    uint256 constant INSTALLMENTS = 10;
    uint256 constant NUM_USERS = 4;
    uint16 constant EXIT_FEE_BPS = 200;
    uint256 constant QUOTA_EARLY = 2;
    uint256 constant QUOTA_MIDDLE = 1;
    uint256 constant QUOTA_LATE = 1;

    address participant;

    function setUp() public {
        factory = new CircleVaultFactory();
        vm.deal(address(this), 100_000e18);

        vm.startPrank(creator);
        vault = factory.createCircle(
            "InstallmentCircle",
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

        participant = address(0x20);
        vm.deal(participant, TARGET + INSTALLMENTS * (TARGET / INSTALLMENTS) + 1e18);
        vm.prank(participant);
        CircleVault(payable(vault)).deposit{value: TARGET}(0);
    }

    function test_PayInstallment_MintsClaimsAndUpdatesPosition() public {
        uint256 installmentAmt = CircleVault(payable(vault)).installmentAmount();
        uint256 claimsBefore = ERC20Claim(shareToken).balanceOf(participant);

        vm.prank(participant);
        CircleVault(payable(vault)).payInstallment{value: installmentAmt}();

        assertEq(ERC20Claim(shareToken).balanceOf(participant), claimsBefore + installmentAmt);

        uint256 tokenId = CircleVault(payable(vault)).participantToTokenId(participant);
        PositionNFT.PositionData memory pos = PositionNFT(positionNft).getPosition(tokenId);
        assertEq(pos.paidInstallments, 1);
        assertEq(pos.totalPaid, installmentAmt);
    }

    function test_PayInstallment_RevertsWrongAmount() public {
        uint256 installmentAmt = CircleVault(payable(vault)).installmentAmount();

        vm.prank(participant);
        vm.expectRevert(CircleErrors.IncorrectInstallmentAmount.selector);
        CircleVault(payable(vault)).payInstallment{value: installmentAmt - 1}();
    }

    function test_PayInstallment_RevertsNotEnrolled() public {
        address stranger = address(0x99);
        uint256 installmentAmt = CircleVault(payable(vault)).installmentAmount();

        vm.deal(stranger, installmentAmt);
        vm.prank(stranger);

        vm.expectRevert(CircleErrors.NotEnrolled.selector);
        CircleVault(payable(vault)).payInstallment{value: installmentAmt}();
    }

    function test_PayInstallment_EmitsInstallmentPaid() public {
        uint256 installmentAmt = CircleVault(payable(vault)).installmentAmount();
        uint256 tokenId = CircleVault(payable(vault)).participantToTokenId(participant);

        vm.expectEmit(true, true, true, true);
        emit InstallmentPaid(participant, tokenId, installmentAmt, installmentAmt);

        vm.prank(participant);
        CircleVault(payable(vault)).payInstallment{value: installmentAmt}();
    }

    function test_PayInstallment_UntilFullyPaid() public {
        uint256 installmentAmt = CircleVault(payable(vault)).installmentAmount();

        for (uint256 i = 1; i < INSTALLMENTS; i++) {
            vm.prank(participant);
            CircleVault(payable(vault)).payInstallment{value: installmentAmt}();
        }

        uint256 tokenId = CircleVault(payable(vault)).participantToTokenId(participant);
        PositionNFT.PositionData memory pos = PositionNFT(positionNft).getPosition(tokenId);
        assertEq(pos.paidInstallments, INSTALLMENTS - 1);
        assertEq(pos.totalPaid, (INSTALLMENTS - 1) * installmentAmt);

        vm.prank(participant);
        CircleVault(payable(vault)).payInstallment{value: installmentAmt}();

        pos = PositionNFT(positionNft).getPosition(tokenId);
        assertEq(pos.paidInstallments, INSTALLMENTS);
        assertEq(pos.totalPaid, TARGET);

        vm.deal(participant, installmentAmt); // fund so the call runs and contract reverts PositionFullyPaid
        vm.prank(participant);
        vm.expectRevert(CircleErrors.PositionFullyPaid.selector);
        CircleVault(payable(vault)).payInstallment{value: installmentAmt}();
    }
}
