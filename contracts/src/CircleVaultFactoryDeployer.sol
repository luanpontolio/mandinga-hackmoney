// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CircleVault} from "./CircleVault.sol";
import {CircleVaultAssetsDeployer} from "./CircleVaultAssetsDeployer.sol";
import {CircleVaultDeployer} from "./CircleVaultDeployer.sol";

contract CircleVaultFactoryDeployer {
    CircleVaultAssetsDeployer private immutable assetsDeployer;
    CircleVaultDeployer private immutable vaultDeployer;

    constructor() {
        assetsDeployer = new CircleVaultAssetsDeployer();
        vaultDeployer = new CircleVaultDeployer();
    }

    function deployCircle(
        bytes32 circleId,
        string calldata name,
        uint256 targetValue,
        uint256 totalInstallments,
        uint256 startTime,
        uint256 timePerRound,
        uint256 numRounds,
        uint256 numUsers,
        uint16 exitFeeBps,
        uint256 quotaCapEarly,
        uint256 quotaCapMiddle,
        uint256 quotaCapLate,
        address vrfCoordinator,
        uint64 vrfSubscriptionId,
        address owner
    )
        external
        returns (address vault, address shareToken, address positionNft, address drawConsumer)
    {
        (shareToken, positionNft, drawConsumer) =
            assetsDeployer.deployAssets(circleId, name, vrfCoordinator, vrfSubscriptionId);

        CircleVault.CircleParams memory params = CircleVault.CircleParams({
            name: name,
            targetValue: targetValue,
            totalInstallments: totalInstallments,
            startTime: startTime,
            timePerRound: timePerRound,
            numRounds: numRounds,
            numUsers: numUsers,
            exitFeeBps: exitFeeBps,
            shareToken: shareToken,
            positionNft: positionNft,
            quotaCapEarly: quotaCapEarly,
            quotaCapMiddle: quotaCapMiddle,
            quotaCapLate: quotaCapLate,
            drawConsumer: drawConsumer
        });

        vault = vaultDeployer.deployVault(circleId, params, owner);
        assetsDeployer.transferOwnerships(shareToken, positionNft, drawConsumer, vault);
    }
}
