// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import "../src/CircleVaultFactory.sol";

contract CreateCircleScript is Script {
    CircleVaultFactory private factory;

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");

        // 🔧 Circle params (native token = USDC 18 decimals on Arc testnet)
        string memory name = "devcon";
        uint256 targetValue = 10 ether;
        uint256 totalInstallments = 10;
        uint256 startTime = block.timestamp + 1 hours;
        uint256 timePerRound = 60 minutes;
        uint256 numRounds = 10;
        uint256 numUsers = 10;
        uint16 exitFeeBps = 300; // 3%
        uint256 quotaCapEarly = 4;
        uint256 quotaCapMiddle = 3;
        uint256 quotaCapLate = 3;

        // For testnet set VRF_COORDINATOR and VRF_SUBSCRIPTION_ID; for local use placeholder (deploy VRFCoordinatorV2_5Mock and pass if needed).
        address vrfCoordinator = address(0xBeef);
        uint64 vrfSubscriptionId = 1;

        vm.startBroadcast(pk);

        factory = new CircleVaultFactory();
        factory.createCircle(
            name,
            "DevconShare",
            "DCS",
            "DevconPosition",
            "DCP",
            targetValue,
            totalInstallments,
            startTime,
            timePerRound,
            numRounds,
            numUsers,
            exitFeeBps,
            quotaCapEarly,
            quotaCapMiddle,
            quotaCapLate,
            vrfCoordinator,
            vrfSubscriptionId
        );

        vm.stopBroadcast();
    }
}
