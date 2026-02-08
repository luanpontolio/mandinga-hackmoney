// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
<<<<<<< HEAD
import {OffchainResolver} from "../src/OffchainResolver.sol";
=======
import {MandingaResolver} from "../src/MandingaResolver.sol";
>>>>>>> origin/main

contract DeployOffchainResolver is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
<<<<<<< HEAD
        string memory gatewayUrl = vm.envString("GATEWAY_URL");
        address signer = vm.envAddress("GATEWAY_SIGNER_ADDRESS");

        vm.startBroadcast(pk);
        new OffchainResolver(gatewayUrl, signer);
=======
        string memory gatewayUrl = "https://mandinga-hackmoney-gateaway-git-f-9c7189-luanpontolios-projects.vercel.app/api/ccip-read";
        address signer = 0x66cDc21b5db131E3f8E8af0CDB4E455a8393604a;

        vm.startBroadcast(pk);
        address[] memory signers = new address[](1);
        signers[0] = signer;
        new MandingaResolver(
            signer,
            signer,
            signer,
            gatewayUrl,
            signers
        );
>>>>>>> origin/main
        vm.stopBroadcast();
    }
}
