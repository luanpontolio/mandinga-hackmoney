// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "../lib/forge-std/src/Script.sol";
import {CircleVault} from "../src/CircleVault.sol";
import {VRFCoordinatorV2_5Mock} from "../src/mocks/VRFCoordinatorV2_5Mock.sol";

/// @title AddConsumerMockScript
/// @author mandinga
/// @notice Adds a VRF consumer on VRFCoordinatorV2_5Mock.
contract AddConsumerMockScript is Script {
    /// @notice Adds DrawConsumer (or one derived from VAULT_ADDRESS) to VRF_SUBSCRIPTION_ID.
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address coordinator = 0xfD24AFc2822d937b40FBdF37D210Ea6E16EE3e1A;
        uint64 subId = uint64(1);

        address drawConsumer = 0x5e008af79d3596b58c92bb1921BddBF63d27F93f;
        if (drawConsumer == address(0)) {
            address vaultAddress = vm.envAddress("VAULT_ADDRESS");
            drawConsumer = CircleVault(payable(vaultAddress)).drawConsumer();
        }

        vm.startBroadcast(pk);
        VRFCoordinatorV2_5Mock(coordinator).addConsumer(subId, drawConsumer);
        vm.stopBroadcast();
    }
}
