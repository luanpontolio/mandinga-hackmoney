// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CircleVaultFactory.sol";
import "../src/CircleVaultFactoryDeployer.sol";
import "../src/mocks/VRFCoordinatorV2_5Mock.sol";

contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        CircleVaultFactoryDeployer deployer = new CircleVaultFactoryDeployer();
        new CircleVaultFactory(address(deployer));
        VRFCoordinatorV2_5Mock vrfCoordinatorMock = new VRFCoordinatorV2_5Mock();
        vrfCoordinatorMock.createSubscription();

        vm.stopBroadcast();
    }
}
