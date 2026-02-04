// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import "../src/CircleVault.sol";

contract CircleVaultScript is Script {
    function runDeposit() external {
        uint256 pk = vm.envUint("ACCOUNT_PRIVATE_KEY");
        address vaultAddress = vm.envAddress("CIRCLE_VAULT_ADDRESS");
        uint256 quotaId = vm.envOr("QUOTA_ID", uint256(0)); // 0=early, 1=middle, 2=late

        CircleVault vault = CircleVault(payable(vaultAddress));
        uint256 amount = vault.installmentAmount();

        vm.startBroadcast(pk);
        vault.deposit{value: amount}(quotaId);
        vm.stopBroadcast();
    }

    function runPayInstallment() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address vaultAddress = vm.envAddress("CIRCLE_VAULT_ADDRESS");

        CircleVault vault = CircleVault(payable(vaultAddress));
        uint256 amount = vault.installmentAmount();

        vm.startBroadcast(pk);
        vault.payInstallment{value: amount}();
        vm.stopBroadcast();
    }
}
