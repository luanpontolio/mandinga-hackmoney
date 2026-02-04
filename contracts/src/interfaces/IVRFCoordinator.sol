// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal interface for VRF coordinator (Chainlink VRF or mock).
/// Consumer requests randomness and implements rawFulfillRandomWords(requestId, randomWords).
interface IVRFCoordinator {
    /// @param consumer Contract implementing rawFulfillRandomWords (e.g. CircleVault).
    /// @param quotaId Window/quota id for draw (0=early, 1=middle, 2=late).
    /// @return requestId Id to match in fulfillment.
    function requestRandomWords(address consumer, uint256 quotaId) external returns (uint256 requestId);
}
