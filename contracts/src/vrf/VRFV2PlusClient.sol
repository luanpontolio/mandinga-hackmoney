// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Request struct for Chainlink VRF v2.5 (subscription method).
/// @dev Aligns with https://docs.chain.link/vrf/v2-5/subscription/test-locally
library VRFV2PlusClient {
    struct RandomWordsRequest {
        bytes32 keyHash;
        uint64 subId;
        uint16 requestConfirmations;
        uint32 callbackGasLimit;
        uint32 numWords;
        bytes extraArgs;
    }
}
