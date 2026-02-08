// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {CircleVaultFactory} from "../src/CircleVaultFactory.sol";

contract CreateCircleScript is Script {
    CircleVaultFactory private factory;

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");

        // 🔧 Circle params (native token = USDC 18 decimals on Arc testnet)
<<<<<<< HEAD
        string memory name = "Trip to Barcelona 2026";
        uint256 targetValue = 10 ether;
        uint256 totalInstallments = 10;
        uint256 startTime = block.timestamp + 5 minutes;
        uint256 timePerRound = 3 minutes;
        uint256 numRounds = 10;
        uint256 numUsers = 10;
        uint16 exitFeeBps = 400; // 5%
        uint256 quotaCapEarly = 3;
        uint256 quotaCapMiddle = 4;
        uint256 quotaCapLate = 3;
=======
        string memory name = "1 BTC";
        uint256 targetValue = 100 ether;
        uint256 totalInstallments = 50;
        uint256 startTime = block.timestamp + 10 minutes;
        uint256 timePerRound = 1 hours;
        uint256 numRounds = 20;
        uint256 numUsers = 20;
        uint16 exitFeeBps = 300; // 5%
        uint256 quotaCapEarly = 4;
        uint256 quotaCapMiddle = 10;
        uint256 quotaCapLate = 6;
>>>>>>> origin/main

        // For testnet set VRF_COORDINATOR and VRF_SUBSCRIPTION_ID; for local use placeholder (deploy VRFCoordinatorV2_5Mock and pass if needed).
        address vrfCoordinator = 0xfD24AFc2822d937b40FBdF37D210Ea6E16EE3e1A;
        uint64 vrfSubscriptionId = 1;

        vm.startBroadcast(pk);

        factory = CircleVaultFactory(0x2FE0D25f1D30056af5AFf8E7983f728D879420E0);
        factory.createCircle(
            CircleVaultFactory.CreateCircleParams({
                name: name,
                targetValue: targetValue,
                totalInstallments: totalInstallments,
                startTime: startTime,
                timePerRound: timePerRound,
                numRounds: numRounds,
                numUsers: numUsers,
                exitFeeBps: exitFeeBps,
                quotaCapEarly: quotaCapEarly,
                quotaCapMiddle: quotaCapMiddle,
                quotaCapLate: quotaCapLate,
                vrfCoordinator: vrfCoordinator,
                vrfSubscriptionId: vrfSubscriptionId
            })
        );

        vm.stopBroadcast();
    }
}
