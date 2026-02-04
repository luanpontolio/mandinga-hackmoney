// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IVRFCoordinatorV2_5.sol";

/// @notice Local mock for Chainlink VRF Coordinator V2.5 for testing.
/// @dev Use createSubscription, fundSubscription, addConsumer, then requestRandomWords; call fulfillRandomWords to complete.
contract VRFCoordinatorV2_5Mock is IVRFCoordinatorV2_5 {
    uint64 private s_nextSubId = 1;
    uint256 private s_nextRequestId = 1;
    mapping(uint64 => mapping(address => bool)) private s_consumers;
    mapping(uint256 => address) public s_requests;

    function createSubscription() external override returns (uint64 subId) {
        subId = s_nextSubId++;
        return subId;
    }

    function fundSubscription(uint64, uint96) external pure override {
        // No-op for mock
    }

    function addConsumer(uint64 subId, address consumer) external override {
        s_consumers[subId][consumer] = true;
    }

    function requestRandomWords(VRFV2PlusClient.RandomWordsRequest calldata req) external override returns (uint256 requestId) {
        require(s_consumers[req.subId][msg.sender], "VRFCoordinatorV2_5Mock: consumer not added");
        requestId = s_nextRequestId++;
        s_requests[requestId] = msg.sender;
        return requestId;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) external override {
        address consumer = s_requests[requestId];
        require(consumer != address(0), "VRFCoordinatorV2_5Mock: unknown request");
        (bool ok,) = consumer.call(abi.encodeWithSignature("rawFulfillRandomWords(uint256,uint256[])", requestId, randomWords));
        require(ok, "VRFCoordinatorV2_5Mock: fulfillment failed");
    }
}
