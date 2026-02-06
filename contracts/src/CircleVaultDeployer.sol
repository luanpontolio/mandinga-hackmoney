// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CircleVault} from "./CircleVault.sol";

contract CircleVaultDeployer {
    function _vaultSalt(
        bytes32 circleId,
        address shareToken,
        address positionNft,
        address drawConsumer
    ) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(circleId, shareToken, positionNft, drawConsumer, "CIRCLE_VAULT"));
    }

    function deployVault(
        bytes32 circleId,
        CircleVault.CircleParams memory params,
        address owner
    ) external returns (address vault) {
        CircleVault circleVault = new CircleVault{
            salt: _vaultSalt(circleId, params.shareToken, params.positionNft, params.drawConsumer)
        }(params, owner);
        vault = address(circleVault);
    }
}
