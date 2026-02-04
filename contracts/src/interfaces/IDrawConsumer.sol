// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice VRF consumer that requests randomness and exposes draw order for a list of participants.
interface IDrawConsumer {
    /// @notice Request a random draw for the given participants. Only callable by the linked vault.
    /// @param quotaId Quota/window id (for logging; consumer does not use it for logic).
    /// @param participants List of addresses to shuffle into draw order.
    /// @return requestId VRF request id; use getDrawOrder(requestId) after fulfillment.
    function requestDraw(uint256 quotaId, address[] calldata participants) external returns (uint256 requestId);

    /// @notice Whether the VRF request has been fulfilled and draw order is available.
    function drawCompleted(uint256 requestId) external view returns (bool);

    /// @notice Get the draw order after the request has been fulfilled.
    function getDrawOrder(uint256 requestId) external view returns (address[] memory);

    /// @notice Called by the VRF coordinator (or mock) to fulfill randomness. Do not call directly.
    function rawFulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) external;
}
