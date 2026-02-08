// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "../lib/forge-std/src/Script.sol";
import {VRFCoordinatorV2_5Mock} from "../src/mocks/VRFCoordinatorV2_5Mock.sol";

/// @title FulfillRandomWordsMockScript
/// @author mandinga
/// @notice Simulates VRF fulfillment on VRFCoordinatorV2_5Mock.
contract FulfillRandomWordsMockScript is Script {
    /// @notice Calls fulfillRandomWords with REQUEST_ID and RANDOM_WORD.
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address coordinator = vm.envAddress("VRF_COORDINATOR");
        uint256 requestId = vm.envUint("REQUEST_ID");
        // uint256 word = vm.envOr("RANDOM_WORD", uint256(123));

        uint256[] memory words = new uint256[](3);
        words[0] = 1;
        words[1] = 2;
        words[2] = 3;

        vm.startBroadcast(pk);
        VRFCoordinatorV2_5Mock(coordinator).fulfillRandomWords(requestId, words);
        vm.stopBroadcast();
    }
}
