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

    function runRequestCloseWindow() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address vaultAddress = vm.envAddress("CIRCLE_VAULT_ADDRESS");
        uint256 quotaIdOverride = vm.envOr("QUOTA_ID", type(uint256).max);

        CircleVault vault = CircleVault(payable(vaultAddress));

        uint256 quotaId = quotaIdOverride;
        if (quotaIdOverride == type(uint256).max) {
            uint256 nowTs = block.timestamp;
            uint256 closeEarly = vault.getCloseWindowTimestamp(0);
            uint256 closeMiddle = vault.getCloseWindowTimestamp(1);
            uint256 closeLate = vault.getCloseWindowTimestamp(2);

            if (nowTs < closeEarly + 1) {
                quotaId = 0;
            } else if (nowTs < closeMiddle + 1) {
                quotaId = 1;
            } else if (nowTs < closeLate + 1) {
                quotaId = 2;
            } else {
                quotaId = 2;
            }
        }

        vm.startBroadcast(pk);
        vault.requestCloseWindow(0);
        vm.stopBroadcast();
    }
}
