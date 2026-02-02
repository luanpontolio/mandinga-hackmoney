// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import "../src/CircleVaultFactory.sol";

contract CreateCircleScript is Script {
    CircleVaultFactory private factory;

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");

        // 🔧 Circle params
        string memory name = "devcon";
        uint256 targetValue = 10 ether;
        uint256 totalInstallments = 10;
        uint256 startTime = block.timestamp + 1 hours;
        uint256 timePerRound = 60 minutes;
        uint256 numRounds = 10;
        uint256 numUsers = 10;
        uint16 exitFeeBps = 300; // 3%

        vm.startBroadcast(pk);

        factory = new CircleVaultFactory();
        factory.createCircle(
            name,
            targetValue,
            totalInstallments,
            startTime,
            timePerRound,
            numRounds,
            numUsers,
            exitFeeBps
        );

        vm.stopBroadcast();
    }
}
