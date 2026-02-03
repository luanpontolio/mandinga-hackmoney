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
            uint16 exitFeeBps,
            uint256 quotaCapEarly,
            uint256 quotaCapMiddle,
            uint256 quotaCapLate
        )
    {
        name = "testcircle";
        targetValue = 5_000e18; // 5,000 (18 decimals)
        totalInstallments = 12;
        startTime = block.timestamp + 1 days;
        timePerRound = 7 days;
        numRounds = 10;
        numUsers = 10;
        exitFeeBps = 200; // 2%
        quotaCapEarly = 4;
        quotaCapMiddle = 3;
        quotaCapLate = 3;
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
            uint16 exitFeeBps,
            uint256 quotaCapEarly,
            uint256 quotaCapMiddle,
            uint256 quotaCapLate
        ) = createArgs();

        address vault = factory.createCircle(name, targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps, quotaCapEarly, quotaCapMiddle, quotaCapLate);

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
            uint16 exitFeeBps,
            uint256 quotaCapEarly,
            uint256 quotaCapMiddle,
            uint256 quotaCapLate
        ) = createArgs();

        vm.startBroadcast(address(0x1));
        address vault = factory.createCircle(name, targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps, quotaCapEarly, quotaCapMiddle, quotaCapLate);
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
            uint16 exitFeeBps,
            uint256 quotaCapEarly,
            uint256 quotaCapMiddle,
            uint256 quotaCapLate
        ) = createArgs();

        string memory name = "test-circle-already-exists";

        factory.createCircle(name, targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps, quotaCapEarly, quotaCapMiddle, quotaCapLate);

        vm.expectRevert(CircleVaultFactory.CircleAlreadyExists.selector);
        factory.createCircle(name, targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps, quotaCapEarly, quotaCapMiddle, quotaCapLate);
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
            uint16 exitFeeBps,
            uint256 quotaCapEarly,
            uint256 quotaCapMiddle,
            uint256 quotaCapLate
        ) = createArgs();

        exitFeeBps = 600; // 6%

        vm.expectRevert("exit fee too high");
        factory.createCircle("test-fee", targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps, quotaCapEarly, quotaCapMiddle, quotaCapLate);
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
            uint16 exitFeeBps,
            uint256 quotaCapEarly,
            uint256 quotaCapMiddle,
            uint256 quotaCapLate
        ) = createArgs();

        totalInstallments = 0;

        vm.expectRevert("installments=0");
        factory.createCircle(name, targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps, quotaCapEarly, quotaCapMiddle, quotaCapLate);
    }

    function testCreateCircleRevertsIfQuotaCapsDontSumToNumUsers() public {
        (
            string memory name,
            uint256 targetValue,
            uint256 totalInstallments,
            uint256 startTime,
            uint256 timePerRound,
            uint256 numRounds,
            uint256 numUsers,
            uint16 exitFeeBps,
            uint256 _qE,
            uint256 _qM,
            uint256 _qL
        ) = createArgs();
        assert(_qE + _qM + _qL == numUsers); // createArgs returns valid caps

        // Use caps that don't sum to numUsers (10)
        uint256 quotaCapEarly = 3;
        uint256 quotaCapMiddle = 3;
        uint256 quotaCapLate = 3;

        vm.expectRevert("quota caps must sum to numUsers");
        factory.createCircle(name, targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps, quotaCapEarly, quotaCapMiddle, quotaCapLate);
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
            uint16 exitFeeBps,
            uint256 quotaCapEarly,
            uint256 quotaCapMiddle,
            uint256 quotaCapLate
        ) = createArgs();

        numUsers = numRounds + 1;

        vm.expectRevert("users != rounds");
        factory.createCircle("test-user-not-equal-round", targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps, quotaCapEarly, quotaCapMiddle, quotaCapLate);
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
            uint16 exitFeeBps,
            uint256 quotaCapEarly,
            uint256 quotaCapMiddle,
            uint256 quotaCapLate
        ) = createArgs();

        address vault = factory.createCircle("test-get-circle", targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps, quotaCapEarly, quotaCapMiddle, quotaCapLate);
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
            uint16 exitFeeBps,
            uint256 quotaCapEarly,
            uint256 quotaCapMiddle,
            uint256 quotaCapLate
        ) = createArgs();

        address vault = factory.createCircle(name, targetValue, totalInstallments, startTime, timePerRound, numRounds, numUsers, exitFeeBps, quotaCapEarly, quotaCapMiddle, quotaCapLate);
        assertTrue(vault != address(0));
        assertEq(factory.getCirclesCount(), 1);

        CircleVaultFactory.CircleInfo memory info = factory.getCircle(0);
        assertEq(info.vault, vault);
        assertTrue(info.shareToken != address(0));
        assertTrue(info.positionNft != address(0));
    }
}
