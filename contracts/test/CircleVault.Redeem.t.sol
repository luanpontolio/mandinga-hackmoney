// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CircleVaultFactory.sol";
import "../src/CircleVault.sol";
import "../src/PositionNFT.sol";
import "../src/ERC20Claim.sol";
import "../src/mocks/VRFCoordinatorV2_5Mock.sol";
import "../src/libraries/CircleError.sol";

contract CircleVaultRedeemTest is Test {
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
    uint256 constant NUM_USERS = 3;
    uint16 constant EXIT_FEE_BPS = 0;
    uint256 constant QUOTA_EARLY = 3;
    uint256 constant QUOTA_MIDDLE = 0;
    uint256 constant QUOTA_LATE = 0;

    address u1 = address(0x10);
    address u2 = address(0x11);
    address u3 = address(0x12);

    function setUp() public {
        factory = new CircleVaultFactory();
        vrfMock = new VRFCoordinatorV2_5Mock();
        vm.deal(address(this), 100_000e18);
        vm.deal(u1, TARGET + 1e18);
        vm.deal(u2, TARGET + 1e18);
        vm.deal(u3, TARGET + 1e18);

        vrfSubId = vrfMock.createSubscription();
        vrfMock.fundSubscription(vrfSubId, 100e18);
        vm.startPrank(creator);
        vault = factory.createCircle(
            "RedeemCircle",
            "RedeemShare",
            "RS",
            "RedeemPosition",
            "RP",
            TARGET,
            INSTALLMENTS,
            block.timestamp + 1,
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

        vm.prank(u1);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(0);
        vm.prank(u2);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(0);
        vm.prank(u3);
        CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(0);
    }

    function test_Redeem_AfterDraw_SingleContempladoReceivesFullPot() public {
        vm.warp(block.timestamp + 1 + 7 days);
        CircleVault(payable(vault)).requestCloseWindow(0);
        uint256 requestId = 1;
        uint256[] memory words = new uint256[](1);
        words[0] = 12345;
        vrfMock.fulfillRandomWords(requestId, words);

        assertTrue(CircleVault(payable(vault)).drawCompleted(0));
        address[] memory order = CircleVault(payable(vault)).getDrawOrder(0);
        assertEq(order.length, 3);

        address first = order[0];
        uint256 balBefore = first.balance;
        uint256 claimAmount = CircleVault(payable(vault)).windowSnapshotBalance(0, first);
        uint256 fullPot = CircleVault(payable(vault)).windowTotalPot(0);
        assertEq(CircleVault(payable(vault)).getWindowPotShare(0), fullPot);

        vm.prank(first);
        ERC20Claim(shareToken).approve(vault, claimAmount);
        vm.prank(first);
        CircleVault(payable(vault)).redeem(0);

        assertEq(first.balance, balBefore + fullPot);
        assertTrue(CircleVault(payable(vault)).windowSettled(0));
        assertEq(CircleVault(payable(vault)).getWindowPotShare(0), 0);
        // Post-payout obligation: position stays ACTIVE until all installments paid
        assertEq(uint256(PositionNFT(positionNft).getPosition(CircleVault(payable(vault)).participantToTokenId(first)).status), uint256(PositionNFT.Status.ACTIVE));
    }

    /// @notice Spec Invariant 5: entire snapshot liability extinguished; all window participants' claims burned.
    function test_Redeem_SecondCallRevertsAlreadySettled() public {
        vm.warp(block.timestamp + 1 + 7 days);
        CircleVault(payable(vault)).requestCloseWindow(0);
        vrfMock.fulfillRandomWords(1, _singleWord(12345));
        address first = CircleVault(payable(vault)).getDrawOrder(0)[0];
        uint256 claimAmount = CircleVault(payable(vault)).windowSnapshotBalance(0, first);
        vm.prank(first);
        ERC20Claim(shareToken).approve(vault, claimAmount);
        vm.prank(first);
        CircleVault(payable(vault)).redeem(0);
        vm.prank(first);
        vm.expectRevert(CircleErrors.AlreadySettled.selector);
        CircleVault(payable(vault)).redeem(0);
    }

    function test_Redeem_RevertsIfNotDrawOrder() public {
        vm.warp(block.timestamp + 1 + 7 days);
        CircleVault(payable(vault)).requestCloseWindow(0);
        vrfMock.fulfillRandomWords(1, _singleWord(999));

        address[] memory order = CircleVault(payable(vault)).getDrawOrder(0);
        address notFirst = (order[0] == u1) ? u2 : u1;
        vm.prank(notFirst);
        vm.expectRevert(CircleErrors.NotSelected.selector);
        CircleVault(payable(vault)).redeem(0);
    }

    function test_Redeem_RevertsIfDrawNotCompleted() public {
        vm.warp(block.timestamp + 1 + 7 days);
        CircleVault(payable(vault)).requestCloseWindow(0);
        vm.prank(u1);
        vm.expectRevert(CircleErrors.NotSnapshotted.selector);
        CircleVault(payable(vault)).redeem(0);
    }

    /// @notice After redeem, position stays ACTIVE; paying all remaining installments sets status to CLOSED (post-payout obligation).
    function test_PostPayoutObligation_RedeemThenPayInstallments_ThenClosed() public {
        vm.warp(block.timestamp + 1 + 7 days);
        CircleVault(payable(vault)).requestCloseWindow(0);
        vrfMock.fulfillRandomWords(1, _singleWord(12345));

        address first = CircleVault(payable(vault)).getDrawOrder(0)[0];
        uint256 tokenId = CircleVault(payable(vault)).participantToTokenId(first);
        uint256 claimAmount = CircleVault(payable(vault)).windowSnapshotBalance(0, first);

        vm.startPrank(first);
        ERC20Claim(shareToken).approve(vault, claimAmount);
        CircleVault(payable(vault)).redeem(0);
        assertTrue(CircleVault(payable(vault)).windowSettled(0));
        assertEq(uint256(PositionNFT(positionNft).getPosition(tokenId).status), uint256(PositionNFT.Status.ACTIVE));

        // Pay remaining installments (deposit was 1st; need INSTALLMENTS - 1 more)
        for (uint256 i = 1; i < INSTALLMENTS; i++) {
            vm.deal(first, first.balance + INSTALLMENT_AMOUNT);
            CircleVault(payable(vault)).payInstallment{value: INSTALLMENT_AMOUNT}();
        }
        assertEq(uint256(PositionNFT(positionNft).getPosition(tokenId).status), uint256(PositionNFT.Status.CLOSED));
        vm.stopPrank();
    }

    function _singleWord(uint256 w) internal pure returns (uint256[] memory) {
        uint256[] memory arr = new uint256[](1);
        arr[0] = w;
        return arr;
    }
}
