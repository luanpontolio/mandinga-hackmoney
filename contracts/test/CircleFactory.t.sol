// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CircleVaultFactory.sol";

contract CircleFactoryTest is Test {
    CircleVaultFactory private factory;

    function setUp() public {
        factory = new CircleVaultFactory();
    }

    function createArgs()
        internal
        view
        returns (
            string memory name,
            uint256 targetValue,
            uint256 totalInstallments,
            uint256 startTime,
            uint256 timePerRound,
            uint256 numRounds,
            uint256 numUsers,
            uint16 exitFeeBps
        )
    {
        name = "testcircle";
        targetValue = 5_000e6; // 5,000 USDC
        totalInstallments = 12;
        startTime = block.timestamp + 1 days;
        timePerRound = 7 days;
        numRounds = 10;
        numUsers = 10;
        exitFeeBps = 200; // 2%
    }

    function testCreateCircleStoresAddresses() public {
        (
            string memory name,
            uint256 targetValue,
            uint256 totalInstallments,
            uint256 startTime,
            uint256 timePerRound,
            uint256 numRounds,
            uint256 numUsers,
            uint16 exitFeeBps
        ) = createArgs();

        address vault = factory.createCircle(name, targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps);

        assertTrue(vault != address(0));
        assertEq(factory.getCirclesCount(), 1);

        CircleVaultFactory.CircleInfo memory info = factory.getCircle(0);
        assertEq(info.vault, vault);
        assertTrue(info.shareToken != address(0));
        assertTrue(info.positionNft != address(0));
    }

    function testCreateCircleCheckTokensOwnership() public {
        (
            string memory name,
            uint256 targetValue,
            uint256 totalInstallments,
            uint256 startTime,
            uint256 timePerRound,
            uint256 numRounds,
            uint256 numUsers,
            uint16 exitFeeBps
        ) = createArgs();

        vm.startBroadcast(address(0x1));
        address vault = factory.createCircle(name, targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps);
        vm.stopBroadcast();

        CircleVaultFactory.CircleInfo memory info = factory.getCircle(0);
        assertEq(Ownable(info.shareToken).owner(), vault);
        assertEq(Ownable(info.positionNft).owner(), vault);
    }

    function testCreateCircleRevertsIfCircleAlreadyExists() public {
        (
            ,
            uint256 targetValue,
            uint256 totalInstallments,
            uint256 startTime,
            uint256 timePerRound,
            uint256 numRounds,
            uint256 numUsers,
            uint16  exitFeeBps
        ) = createArgs();

        string memory name = "test-circle-already-exists";

        factory.createCircle(name, targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps);

        vm.expectRevert(CircleVaultFactory.CircleAlreadyExists.selector);
        factory.createCircle(name, targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps);
    }

    function testCreateCircleRevertsIfExitFeeTooHigh() public {
        (
            ,
            uint256 targetValue,
            uint256 totalInstallments,
            uint256 startTime,
            uint256 timePerRound,
            uint256 numRounds,
            uint256 numUsers,
            uint16 exitFeeBps
        ) = createArgs();

        exitFeeBps = 600; // 6%

        vm.expectRevert("exit fee too high");
        factory.createCircle("test-fee", targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps);
    }

    function testCreateCircleRevertsIfInstallmentsZero() public {
        (
            string memory name,
            uint256 targetValue,
            uint256 totalInstallments,
            uint256 startTime,
            uint256 timePerRound,
            uint256 numRounds,
            uint256 numUsers,
            uint16 exitFeeBps
        ) = createArgs();

        totalInstallments = 0;

        vm.expectRevert("installments=0");
        factory.createCircle(name, targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps);
    }

    function testCreateCircleRevertsIfUsersNotEqualRounds() public {
        (
            ,
            uint256 targetValue,
            uint256 totalInstallments,
            uint256 startTime,
            uint256 timePerRound,
            uint256 numRounds,
            uint256 numUsers,
            uint16 exitFeeBps
        ) = createArgs();

        numUsers = numRounds + 1;

        vm.expectRevert("users != rounds");
        factory.createCircle("test-user-not-equal-round", targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps);
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
        (
            ,
            uint256 targetValue,
            uint256 totalInstallments,
            uint256 startTime,
            uint256 timePerRound,
            uint256 numRounds,
            uint256 numUsers,
            uint16 exitFeeBps
        ) = createArgs();

        address vault = factory.createCircle("test-get-circle", targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps);
        CircleVaultFactory.CircleInfo memory info = factory.getCircle(0);

        assertEq(info.vault, vault);
        assertTrue(info.shareToken != address(0));
        assertTrue(info.positionNft != address(0));
    }

    function testCreateCircleFuzzy() public {
        (
            string memory name,
            uint256 targetValue,
            uint256 totalInstallments,
            uint256 startTime,
            uint256 timePerRound,
            uint256 numRounds,
            uint256 numUsers,
            uint16 exitFeeBps
        ) = createArgs();

        address vault = factory.createCircle(name, targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps);
        assertTrue(vault != address(0));
        assertEq(factory.getCirclesCount(), 1);

        CircleVaultFactory.CircleInfo memory info = factory.getCircle(0);
        assertEq(info.vault, vault);
        assertTrue(info.shareToken != address(0));
        assertTrue(info.positionNft != address(0));
    }
}
