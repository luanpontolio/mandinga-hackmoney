// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        // TODO: deploy CircleVaultFactory and dependent contracts.
        // This script will be completed when contracts are implemented.

        vm.stopBroadcast();
    }
}
