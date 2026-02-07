// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import {CircleIdLib} from "./libraries/CircleIdLib.sol";
import {CircleVaultFactoryDeployer} from "./CircleVaultFactoryDeployer.sol";

contract CircleVaultFactory is Ownable {
    CircleVaultFactoryDeployer public immutable deployer;

    uint256 public circleCount;
    mapping(bytes32 => CircleInfo) public circleInfoById;
    mapping(bytes32 => address) public circleById;

    struct CircleInfo {
        bytes32 circleId;
        address vault;
        address shareToken;
        address positionNft;
        address drawConsumer;
    }

    struct CreateCircleParams {
        string name;
        uint256 targetValue;
        uint256 totalInstallments;
        uint256 startTime;
        uint256 timePerRound;
        uint256 numRounds;
        uint256 numUsers;
        uint16 exitFeeBps;
        uint256 quotaCapEarly;
        uint256 quotaCapMiddle;
        uint256 quotaCapLate;
        address vrfCoordinator;
        uint64 vrfSubscriptionId;
    }

    event CircleCreated(
        address indexed vault,
        address indexed creator,
        bytes32 indexed circleId,
        string name
    );

    error CircleAlreadyExists();
    error InvalidVrfCoordinator();
    error InvalidVrfSubscriptionId();
    error InvalidTimePerRound();
    error InvalidStartTime();
    error InvalidExitFee();
    error InvalidTotalInstallments();
    error InvalidRoundsUsers();
    error InvalidQuotaCaps();

    constructor(address _deployer) Ownable(msg.sender) {
        deployer = CircleVaultFactoryDeployer(_deployer);
    }

    function createCircle(CreateCircleParams calldata p) external returns (address vault) {
        _validateCreateParams(p);

        bytes32 circleId = _computeCircleId(p);
        _ensureCircleDoesNotExist(circleId);

        (
            address deployedVault,
            address shareToken,
            address positionNft,
            address drawConsumer
        ) = deployer.deployCircle(
            circleId,
            p.name,
            p.targetValue,
            p.totalInstallments,
            p.startTime,
            p.timePerRound,
            p.numRounds,
            p.numUsers,
            p.exitFeeBps,
            p.quotaCapEarly,
            p.quotaCapMiddle,
            p.quotaCapLate,
            p.vrfCoordinator,
            p.vrfSubscriptionId,
            msg.sender
        );

        vault = deployedVault;
        _recordCircle(circleId, vault, shareToken, positionNft, drawConsumer);

        emit CircleCreated(vault, msg.sender, circleId, p.name);
    }

    function getCircle(bytes32 circleId) external view returns (CircleInfo memory) {
        return circleInfoById[circleId];
    }

    function getCirclesCount() external view returns (uint256) {
        return circleCount;
    }

    function _validateCreateParams(CreateCircleParams calldata p) internal view {
        if (p.vrfCoordinator == address(0)) revert InvalidVrfCoordinator();
        if (p.vrfSubscriptionId == 0) revert InvalidVrfSubscriptionId();
        if (p.timePerRound == 0) revert InvalidTimePerRound();
        if (p.startTime <= block.timestamp) revert InvalidStartTime();
        if (p.exitFeeBps > 500) revert InvalidExitFee();
        if (p.totalInstallments == 0) revert InvalidTotalInstallments();
        if (p.numUsers != p.numRounds) revert InvalidRoundsUsers();
        if (p.quotaCapEarly + p.quotaCapMiddle + p.quotaCapLate != p.numUsers) {
            revert InvalidQuotaCaps();
        }
    }

    function _computeCircleId(CreateCircleParams calldata p) internal view returns (bytes32) {
        return CircleIdLib.compute(
            msg.sender,
            p.name,
            p.startTime,
            p.targetValue,
            p.totalInstallments,
            p.timePerRound,
            p.numRounds,
            p.numUsers,
            p.exitFeeBps,
            p.quotaCapEarly,
            p.quotaCapMiddle,
            p.quotaCapLate,
            p.vrfCoordinator,
            p.vrfSubscriptionId
        );
    }

    function _ensureCircleDoesNotExist(bytes32 circleId) internal view {
        if (circleById[circleId] != address(0)) revert CircleAlreadyExists();
    }

    function _recordCircle(
        bytes32 circleId,
        address vault,
        address shareToken,
        address positionNft,
        address drawConsumer
    ) internal {
        circleById[circleId] = vault;
        circleCount++;
        circleInfoById[circleId] = CircleInfo({
            circleId: circleId,
            vault: vault,
            shareToken: shareToken,
            positionNft: positionNft,
            drawConsumer: drawConsumer
        });
    }
}
