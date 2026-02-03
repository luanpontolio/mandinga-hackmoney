// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CircleVaultFactory.sol";

contract CircleVaultFactoryFuzzTest is Test {
    CircleVaultFactory factory;

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
        targetValue = 5_000e18;
        totalInstallments = 12;
        startTime = block.timestamp + 1 days;
        timePerRound = 7 days;
        numRounds = 10;
        numUsers = 10;
        exitFeeBps = 200;
        quotaCapEarly = 4;
        quotaCapMiddle = 3;
        quotaCapLate = 3;
    }

    function testFuzz_PredictAddressesMatchDeployment() public {
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

        address creator = address(0x1);

        /*──────────────────*
         *  PREDICT (same encoding as createCircle) *
         *──────────────────*/
        (
            address predictedVault,
            address predictedShare,
            address predictedPosition
        ) = factory.predictAddresses(
            creator,
            name,
            targetValue,
            totalInstallments,
            startTime,
            timePerRound,
            numRounds,
            numUsers,
            exitFeeBps,
            quotaCapEarly,
            quotaCapMiddle,
            quotaCapLate
        );

        /*──────────────────*
         *  DEPLOY          *
         *──────────────────*/
        vm.prank(creator);
        address deployedVault = factory.createCircle(
            name,
            targetValue,
            totalInstallments,
            startTime,
            timePerRound,
            numRounds,
            numUsers,
            exitFeeBps,
            quotaCapEarly,
            quotaCapMiddle,
            quotaCapLate
        );

        /*──────────────────*
         *  ASSERTIONS      *
         *──────────────────*/
        CircleVaultFactory.CircleInfo memory info = factory.getCircle(0);

        assertEq(deployedVault, predictedVault, "Vault address mismatch");
        assertEq(info.shareToken, predictedShare, "ShareToken mismatch");
        assertEq(info.positionNft, predictedPosition, "PositionNFT mismatch");
    }
}
