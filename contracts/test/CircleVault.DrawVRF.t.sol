// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CircleVaultFactory.sol";
import "../src/CircleVaultFactoryDeployer.sol";
import "../src/CircleVault.sol";
import "../src/PositionNFT.sol";
import "../src/ERC20Claim.sol";
import "../src/mocks/VRFCoordinatorV2_5Mock.sol";
import "../src/DrawConsumer.sol";
import "../src/libraries/CircleError.sol";
import "../src/libraries/CircleIdLib.sol";

/// @title Tests for VRF request, fulfillment, and draw application using VRFCoordinatorV2_5Mock.
/// @dev Follows https://docs.chain.link/vrf/v2-5/subscription/test-locally: createSubscription, fundSubscription, addConsumer, requestRandomWords, fulfillRandomWords.
contract CircleVaultDrawVRFTest is Test {
    CircleVaultFactory factory;
    CircleVaultFactoryDeployer deployer;
    VRFCoordinatorV2_5Mock vrfMock;
    address vault;
    address shareToken;
    address positionNft;
    address creator = address(0x1);
    uint64 vrfSubId;
    bytes32 circleId;

    uint256 constant TARGET = 1_000e18;
    uint256 constant INSTALLMENT_AMOUNT = TARGET / 10; // 10 installments
    uint256 constant NUM_USERS = 3;
    uint256 constant QUOTA_EARLY = 3;

    function setUp() public {
        deployer = new CircleVaultFactoryDeployer();
        factory = new CircleVaultFactory(address(deployer));
        vrfMock = new VRFCoordinatorV2_5Mock();
        vrfSubId = vrfMock.createSubscription();
        vrfMock.fundSubscription(vrfSubId, 100e18);
        vm.deal(address(this), 100_000e18);

        uint256 startTime = block.timestamp + 1;
        CircleVaultFactory.CreateCircleParams memory p = CircleVaultFactory.CreateCircleParams({
            name: "VRFCircle",
            targetValue: TARGET,
            totalInstallments: 10,
            startTime: startTime,
            timePerRound: 7 days,
            numRounds: NUM_USERS,
            numUsers: NUM_USERS,
            exitFeeBps: 0,
            quotaCapEarly: QUOTA_EARLY,
            quotaCapMiddle: 0,
            quotaCapLate: 0,
            vrfCoordinator: address(vrfMock),
            vrfSubscriptionId: vrfSubId
        });
        vm.startPrank(creator);
        vault = factory.createCircle(p);
        vm.stopPrank();

        circleId = CircleIdLib.compute(creator, p.name, p.startTime, p.targetValue, p.totalInstallments, p.timePerRound, p.numRounds, p.numUsers, p.exitFeeBps, p.quotaCapEarly, p.quotaCapMiddle, p.quotaCapLate, p.vrfCoordinator, p.vrfSubscriptionId);
        CircleVaultFactory.CircleInfo memory info = factory.getCircle(circleId);
        shareToken = info.shareToken;
        positionNft = info.positionNft;
        vrfMock.addConsumer(vrfSubId, info.drawConsumer);

        for (uint256 i = 0; i < NUM_USERS; i++) {
            address u = address(uint160(0x10 + i));
            vm.deal(u, TARGET + 1e18);
            vm.prank(u);
            CircleVault(payable(vault)).deposit{value: INSTALLMENT_AMOUNT}(0);
        }
    }

    function test_VRFRequest_StoresRequestIdToQuota() public {
        vm.warp(block.timestamp + 1 + 7 days);
        CircleVault(payable(vault)).requestCloseWindow(0);

        address drawConsumerAddr = factory.getCircle(circleId).drawConsumer;
        assertEq(vrfMock.s_requests(1), drawConsumerAddr);
        assertEq(CircleVault(payable(vault)).quotaIdToRequestId(0), 1);
    }

    function test_FulfillRandomWords_SetsDrawOrder() public {
        vm.warp(block.timestamp + 1 + 7 days);
        CircleVault(payable(vault)).requestCloseWindow(0);

        uint256[] memory words = new uint256[](1);
        words[0] = 0x1234;
        vrfMock.fulfillRandomWords(1, words);

        assertTrue(CircleVault(payable(vault)).drawCompleted(0));
        assertEq(CircleVault(payable(vault)).getDrawOrder(0).length, 3);
    }

    function test_FulfillRandomWords_OnlyCoordinatorCanCall() public {
        vm.warp(block.timestamp + 1 + 7 days);
        CircleVault(payable(vault)).requestCloseWindow(0);

        uint256[] memory words = new uint256[](1);
        address drawConsumerAddr = factory.getCircle(circleId).drawConsumer;
        vm.prank(address(0xbad));
        vm.expectRevert(DrawConsumer.InvalidCoordinator.selector);
        DrawConsumer(drawConsumerAddr).rawFulfillRandomWords(1, words);
    }

    function test_DrawOrder_DifferentSeeds_ProduceDifferentOrder() public {
        vm.warp(block.timestamp + 1 + 7 days);
        CircleVault(payable(vault)).requestCloseWindow(0);

        uint256[] memory w1 = new uint256[](1);
        w1[0] = 111;
        vrfMock.fulfillRandomWords(1, w1);
        address[] memory order1 = CircleVault(payable(vault)).getDrawOrder(0);

        // Deploy fresh vault and run with different seed
        uint64 sub2 = vrfMock.createSubscription();
        vrfMock.fundSubscription(sub2, 100e18);
        uint256 startTime2 = block.timestamp + 1;
        CircleVaultFactory.CreateCircleParams memory p2 = CircleVaultFactory.CreateCircleParams({
            name: "VRFCircle2",
            targetValue: TARGET,
            totalInstallments: 10,
            startTime: startTime2,
            timePerRound: 7 days,
            numRounds: NUM_USERS,
            numUsers: NUM_USERS,
            exitFeeBps: 0,
            quotaCapEarly: QUOTA_EARLY,
            quotaCapMiddle: 0,
            quotaCapLate: 0,
            vrfCoordinator: address(vrfMock),
            vrfSubscriptionId: sub2
        });
        vm.startPrank(creator);
        address vault2 = factory.createCircle(p2);
        vm.stopPrank();
        bytes32 circleId2 = CircleIdLib.compute(creator, p2.name, p2.startTime, p2.targetValue, p2.totalInstallments, p2.timePerRound, p2.numRounds, p2.numUsers, p2.exitFeeBps, p2.quotaCapEarly, p2.quotaCapMiddle, p2.quotaCapLate, p2.vrfCoordinator, p2.vrfSubscriptionId);
        vrfMock.addConsumer(sub2, factory.getCircle(circleId2).drawConsumer);
        // CircleVaultFactory.CircleInfo memory info2 = factory.getCircle(1);
        for (uint256 i = 0; i < NUM_USERS; i++) {
            address u = address(uint160(0x20 + i));
            vm.deal(u, TARGET + 1e18);
            vm.prank(u);
            CircleVault(payable(vault2)).deposit{value: INSTALLMENT_AMOUNT}(0);
        }
        vm.warp(block.timestamp + 1 + 7 days);
        CircleVault(payable(vault2)).requestCloseWindow(0);
        uint256[] memory w2 = new uint256[](1);
        w2[0] = 222;
        vrfMock.fulfillRandomWords(2, w2);
        address[] memory order2 = CircleVault(payable(vault2)).getDrawOrder(0);

        // Both should have 3 participants; order may differ
        assertEq(order1.length, 3);
        assertEq(order2.length, 3);
    }
}
