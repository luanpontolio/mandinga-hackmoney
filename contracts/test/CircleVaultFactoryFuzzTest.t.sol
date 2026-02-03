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

    function testFuzz_PredictAddressesMatchDeployment() public {
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

        address creator = address(0x1);

        vm.prank(creator);

        /*──────────────────*
         *  COMPUTE ID      *
         *──────────────────*/
        bytes32 circleId = factory.computeCircleId(
            creator,
            name,
            startTime,
            targetValue,
            totalInstallments,
            timePerRound,
            numRounds,
            numUsers,
            exitFeeBps
        );

        /*──────────────────*
         *  PREDICT TOKENS  *
         *──────────────────*/
        bytes memory shareArgs = abi.encode(
            string.concat("Mandinga Share ", name),
            string.concat("MS", name),
            address(factory)
        );

        bytes memory positionArgs = abi.encode(
            string.concat("Mandinga Position ", name),
            string.concat("MP", name),
            address(factory)
        );

        address predictedShare =
            factory.predictERC20ClaimAddress(circleId, shareArgs);

        address predictedPosition =
            factory.predictPositionNFTAddress(circleId, positionArgs);

        /*──────────────────*
         *  PREDICT VAULT   *
         *──────────────────*/
        bytes memory vaultArgs = abi.encode(
            name,
            targetValue,
            totalInstallments,
            startTime,
            timePerRound,
            numRounds,
            numUsers,
            exitFeeBps,
            predictedShare,
            predictedPosition,
            creator
        );

        address predictedVault =
            factory.predictVaultAddress(circleId, vaultArgs);

        /*──────────────────*
         *  DEPLOY          *
         *──────────────────*/
        address deployedVault = factory.createCircle(
            name,
            targetValue,
            totalInstallments,
            startTime,
            timePerRound,
            numRounds,
            numUsers,
            exitFeeBps
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
