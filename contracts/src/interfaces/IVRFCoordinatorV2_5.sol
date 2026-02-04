// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../vrf/VRFV2PlusClient.sol";

/// @notice Minimal interface for Chainlink VRF Coordinator V2.5 (or mock).
/// @dev See https://docs.chain.link/vrf/v2-5/subscription/test-locally
interface IVRFCoordinatorV2_5 {
    /// @notice Request random words. Callable by a consumer that was added via addConsumer.
    /// @return requestId Id to match in fulfillRandomWords.
    function requestRandomWords(VRFV2PlusClient.RandomWordsRequest calldata req) external returns (uint256 requestId);

    /// @notice Create a subscription (mock). Returns new subscription ID.
    function createSubscription() external returns (uint64 subId);

    /// @notice Fund a subscription (mock).
    function fundSubscription(uint64 subId, uint96 amount) external;

    /// @notice Add a consumer to a subscription. Required before the consumer can request.
    function addConsumer(uint64 subId, address consumer) external;

    /// @notice Fulfill a request (mock only). Coordinator looks up consumer from request and calls consumer.rawFulfillRandomWords(requestId, randomWords).
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) external;
}
