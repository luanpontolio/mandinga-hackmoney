// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import {IDrawConsumer} from "./interfaces/IDrawConsumer.sol";
import {IVRFCoordinatorV2_5} from "./interfaces/IVRFCoordinatorV2_5.sol";
import {VRFV2PlusClient} from "./vrf/VRFV2PlusClient.sol";

/// @title DrawConsumer
/// @notice VRF consumer for draw ordering. There is one DrawConsumer per CircleVault; only the linked vault may request draws.
/// @dev Follows https://docs.chain.link/vrf/v2-5/subscription/test-locally. Deployed by CircleVaultFactory per circle.
contract DrawConsumer is IDrawConsumer, Ownable {
    uint32 private constant VRF_CALLBACK_GAS_LIMIT = 100_000;
    uint16 private constant VRF_REQUEST_CONFIRMATIONS = 3;
    bytes32 private constant VRF_KEYHASH = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;

    address public immutable vrfCoordinator;
    uint64 public immutable vrfSubscriptionId;

    /// @notice Pending participants for each request until VRF is fulfilled.
    mapping(uint256 => address[]) private _pendingParticipants;

    /// @notice Fulfilled draw order per request id.
    mapping(uint256 => address[]) private _drawOrder;

    /// @notice Whether the request has been fulfilled.
    mapping(uint256 => bool) private _drawCompleted;

    event DrawRequested(uint256 indexed requestId, uint256 indexed quotaId, uint256 participantCount);
    event DrawFulfilled(uint256 indexed requestId);

    error OnlyVault();
    error VaultZero();
    error NotFulfilled();
    error EmptyParticipants();
    error InvalidCoordinator();

    constructor(
        address vrfCoordinator_,
        uint64 vrfSubscriptionId_
    ) Ownable(msg.sender) {
        if (vrfCoordinator_ == address(0)) revert InvalidCoordinator();
        vrfCoordinator = vrfCoordinator_;
        vrfSubscriptionId = vrfSubscriptionId_;
    }

    /// @inheritdoc IDrawConsumer
    function requestDraw(uint256 quotaId, address[] calldata participants) external override returns (uint256 requestId) {
        if (msg.sender != owner()) revert OnlyVault();
        if (participants.length == 0) revert EmptyParticipants();

        VRFV2PlusClient.RandomWordsRequest memory req = VRFV2PlusClient.RandomWordsRequest({
            keyHash: VRF_KEYHASH,
            subId: vrfSubscriptionId,
            requestConfirmations: VRF_REQUEST_CONFIRMATIONS,
            callbackGasLimit: VRF_CALLBACK_GAS_LIMIT,
            numWords: 1,
            extraArgs: ""
        });
        requestId = IVRFCoordinatorV2_5(vrfCoordinator).requestRandomWords(req);

        _pendingParticipants[requestId] = participants;
        emit DrawRequested(requestId, quotaId, participants.length);
        return requestId;
    }

    /// @inheritdoc IDrawConsumer
    function rawFulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) external override {
        if (msg.sender != vrfCoordinator) revert InvalidCoordinator();
        address[] memory list = _pendingParticipants[requestId];
        if (list.length == 0) revert NotFulfilled();
        if (randomWords.length == 0) revert InvalidCoordinator();

        uint256 n = list.length;
        for (uint256 i = n; i > 1; i--) {
            uint256 j = uint256(keccak256(abi.encode(randomWords[0], i))) % i;
            (list[i - 1], list[j]) = (list[j], list[i - 1]);
        }
        for (uint256 k = 0; k < n; k++) {
            _drawOrder[requestId].push(list[k]);
        }
        _drawCompleted[requestId] = true;
        delete _pendingParticipants[requestId];

        emit DrawFulfilled(requestId);
    }

    /// @inheritdoc IDrawConsumer
    function drawCompleted(uint256 requestId) external view override returns (bool) {
        return _drawCompleted[requestId];
    }

    /// @inheritdoc IDrawConsumer
    function getDrawOrder(uint256 requestId) external view override returns (address[] memory) {
        return _drawOrder[requestId];
    }
}
