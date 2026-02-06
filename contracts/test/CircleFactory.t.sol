// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CircleVaultFactory.sol";
import "../src/CircleVaultFactoryDeployer.sol";
import "../src/libraries/CircleIdLib.sol";

contract CircleFactoryTest is Test {
    CircleVaultFactory private factory;
    CircleVaultFactoryDeployer private deployer;
    address constant VRF = address(0xBeef);

    function setUp() public {
        deployer = new CircleVaultFactoryDeployer();
        factory = new CircleVaultFactory(address(deployer));
    }

    function createParams() internal view returns (CircleVaultFactory.CreateCircleParams memory p) {
        p.name = "testcircle";
        p.targetValue = 5_000e18; // 5,000 (18 decimals)
        p.totalInstallments = 12;
        p.startTime = block.timestamp + 1 days;
        p.timePerRound = 7 days;
        p.numRounds = 10;
        p.numUsers = 10;
        p.exitFeeBps = 200; // 2%
        p.quotaCapEarly = 4;
        p.quotaCapMiddle = 3;
        p.quotaCapLate = 3;
        p.vrfCoordinator = VRF;
        p.vrfSubscriptionId = 1;
    }

    function createParams(string memory name) internal view returns (CircleVaultFactory.CreateCircleParams memory p) {
        p = createParams();
        p.name = name;
    }

    function testCreateCircleStoresAddresses() public {
        CircleVaultFactory.CreateCircleParams memory p = createParams();
        address vault = factory.createCircle(p);

        assertTrue(vault != address(0));
        assertEq(factory.getCirclesCount(), 1);

        bytes32 circleId = CircleIdLib.compute(address(this), p.name, p.startTime, p.targetValue, p.totalInstallments, p.timePerRound, p.numRounds, p.numUsers, p.exitFeeBps, p.quotaCapEarly, p.quotaCapMiddle, p.quotaCapLate, p.vrfCoordinator, p.vrfSubscriptionId);
        CircleVaultFactory.CircleInfo memory info = factory.getCircle(circleId);
        assertEq(info.vault, vault);
        assertTrue(info.shareToken != address(0));
        assertTrue(info.positionNft != address(0));
    }

    function testCreateCircleCheckTokensOwnership() public {
        vm.startBroadcast(address(0x1));
        CircleVaultFactory.CreateCircleParams memory p = createParams();
        address vault = factory.createCircle(p);
        vm.stopBroadcast();

        bytes32 circleId = CircleIdLib.compute(address(0x1), p.name, p.startTime, p.targetValue, p.totalInstallments, p.timePerRound, p.numRounds, p.numUsers, p.exitFeeBps, p.quotaCapEarly, p.quotaCapMiddle, p.quotaCapLate, p.vrfCoordinator, p.vrfSubscriptionId);
        CircleVaultFactory.CircleInfo memory info = factory.getCircle(circleId);
        assertEq(Ownable(info.shareToken).owner(), vault);
        assertEq(Ownable(info.positionNft).owner(), vault);
    }

    function testCreateCircleRevertsIfCircleAlreadyExists() public {
        CircleVaultFactory.CreateCircleParams memory p = createParams("test-circle-already-exists");

        factory.createCircle(p);

        vm.expectRevert(CircleVaultFactory.CircleAlreadyExists.selector);
        factory.createCircle(p);
    }

    function testCreateCircleRevertsIfExitFeeTooHigh() public {
        CircleVaultFactory.CreateCircleParams memory p = createParams("test-fee");
        p.exitFeeBps = 600; // 6%

        vm.expectRevert(CircleVaultFactory.InvalidExitFee.selector);
        factory.createCircle(p);
    }

    function testCreateCircleRevertsIfInstallmentsZero() public {
        CircleVaultFactory.CreateCircleParams memory p = createParams();
        p.totalInstallments = 0;

        vm.expectRevert(CircleVaultFactory.InvalidTotalInstallments.selector);
        factory.createCircle(p);
    }

    function testCreateCircleRevertsIfQuotaCapsDontSumToNumUsers() public {
        CircleVaultFactory.CreateCircleParams memory p = createParams();
        // Use caps that don't sum to numUsers (10)
        p.quotaCapEarly = 3;
        p.quotaCapMiddle = 3;
        p.quotaCapLate = 3;

        vm.expectRevert(CircleVaultFactory.InvalidQuotaCaps.selector);
        factory.createCircle(p);
    }

    function testCreateCircleRevertsIfUsersNotEqualRounds() public {
        CircleVaultFactory.CreateCircleParams memory p = createParams("test-user-not-equal-round");
        p.numUsers = p.numRounds + 1;

        vm.expectRevert(CircleVaultFactory.InvalidRoundsUsers.selector);
        factory.createCircle(p);
    }

    // function testPredictVaultAddress() public {
    //     (
    //         string memory name,
    //         uint256 targetValue,
    //         uint256 totalInstallments,
    //         uint256 startTime,
    //         uint256 timePerRound,
    //         uint256 numRounds,
    //         uint256 numUsers,
    //         uint16 exitFeeBps
    //     ) = createArgs();

    //     bytes32 circleId = keccak256(
    //         abi.encode(
    //             address(this),
    //             name,
    //             startTime,
    //             targetValue,
    //             totalInstallments,
    //             timePerRound,
    //             numRounds,
    //             numUsers,
    //             exitFeeBps
    //         )
    //     );

    //     address predicted = factory.predictVaultAddress(
    //         circleId,
    //         abi.encode(
    //             name,
    //             targetValue,
    //             totalInstallments,
    //             startTime,
    //             timePerRound,
    //             numRounds,
    //             numUsers,
    //             exitFeeBps
    //         )
    //     );

    //     address vault = factory.createCircle(name, targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps);

    //     assertEq(predicted, vault);
    // }

    function testGetCircle() public {
        CircleVaultFactory.CreateCircleParams memory p = createParams("test-get-circle");
        address vault = factory.createCircle(p);
        bytes32 circleId = CircleIdLib.compute(address(this), p.name, p.startTime, p.targetValue, p.totalInstallments, p.timePerRound, p.numRounds, p.numUsers, p.exitFeeBps, p.quotaCapEarly, p.quotaCapMiddle, p.quotaCapLate, p.vrfCoordinator, p.vrfSubscriptionId);
        CircleVaultFactory.CircleInfo memory info = factory.getCircle(circleId);

        assertEq(info.vault, vault);
        assertTrue(info.shareToken != address(0));
        assertTrue(info.positionNft != address(0));
    }

    function testCreateCircleFuzzy() public {
        CircleVaultFactory.CreateCircleParams memory p = createParams();
        address vault = factory.createCircle(p);
        assertTrue(vault != address(0));
        assertEq(factory.getCirclesCount(), 1);

        bytes32 circleId = CircleIdLib.compute(address(this), p.name, p.startTime, p.targetValue, p.totalInstallments, p.timePerRound, p.numRounds, p.numUsers, p.exitFeeBps, p.quotaCapEarly, p.quotaCapMiddle, p.quotaCapLate, p.vrfCoordinator, p.vrfSubscriptionId);
        CircleVaultFactory.CircleInfo memory info = factory.getCircle(circleId);
        assertEq(info.vault, vault);
        assertTrue(info.shareToken != address(0));
        assertTrue(info.positionNft != address(0));
    }
}
