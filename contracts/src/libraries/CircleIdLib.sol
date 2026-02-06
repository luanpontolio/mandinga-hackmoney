// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library CircleIdLib {
    function compute(
        address creator,
        string memory name,
        uint256 startTime,
        uint256 targetValue,
        uint256 totalInstallments,
        uint256 timePerRound,
        uint256 numRounds,
        uint256 numUsers,
        uint16 exitFeeBps,
        uint256 quotaCapEarly,
        uint256 quotaCapMiddle,
        uint256 quotaCapLate,
        address vrfCoordinator,
        uint64 vrfSubscriptionId
    ) internal view returns (bytes32) {
        return keccak256(
            abi.encode(
                creator,
                name,
                startTime,
                targetValue,
                totalInstallments,
                timePerRound,
                numRounds,
                numUsers,
                exitFeeBps,
                quotaCapEarly,
                quotaCapMiddle,
                quotaCapLate,
                vrfCoordinator,
                vrfSubscriptionId,
                block.chainid
            )
        );
    }
}
