// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CircleVaultFactory.sol";

contract CreateCircle is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");

        vm.startBroadcast(deployerKey);

        CircleVaultFactory factory = CircleVaultFactory(factoryAddress);
        factory.createCircle(
            "devcon",
            1_000e6,
            10,
            block.timestamp + 30 days,
            100
        );

        vm.stopBroadcast();
    }
}
