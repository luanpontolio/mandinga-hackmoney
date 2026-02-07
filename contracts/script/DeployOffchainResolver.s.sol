// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {OffchainResolver} from "../src/OffchainResolver.sol";

contract DeployOffchainResolver is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        string memory gatewayUrl = vm.envString("GATEWAY_URL");
        address signer = vm.envAddress("GATEWAY_SIGNER_ADDRESS");

        vm.startBroadcast(pk);
        new OffchainResolver(gatewayUrl, signer);
        vm.stopBroadcast();
    }
}
