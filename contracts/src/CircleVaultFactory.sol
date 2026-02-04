// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CircleVault.sol";
import "./CircleDeployer.sol";
import "./libraries/CircleIdLib.sol";

contract CircleVaultFactory {
    using CircleIdLib for *;

    struct CircleInfo {
        bytes32 circleId;
        address vault;
        address shareToken;
        address positionNft;
        address drawConsumer;
    }

    CircleInfo[] public circles;
    mapping(bytes32 => address) public circleById;

    CircleDeployer public immutable deployer;

    event CircleCreated(
        address indexed vault,
        address indexed creator,
        bytes32 indexed circleId,
        string name
    );

    error CircleAlreadyExists();

    constructor() {
        deployer = new CircleDeployer(address(this));
    }

    function createCircle(
        string calldata name,
        string calldata shareName,
        string calldata shareSymbol,
        string calldata positionName,
        string calldata positionSymbol,
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
        uint64 vrfSubscriptionId
    ) external returns (address vault) {
        require(exitFeeBps <= 500, "exit fee too high");
        require(totalInstallments > 0, "installments=0");
        require(numUsers == numRounds, "users != rounds");
        require(
            quotaCapEarly + quotaCapMiddle + quotaCapLate == numUsers,
            "quota caps mismatch"
        );

        bytes32 circleId = CircleIdLib.compute(
            msg.sender,
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
            vrfSubscriptionId
        );

        if (circleById[circleId] != address(0)) {
            revert CircleAlreadyExists();
        }

        address shareToken = deployer.deployShareToken(
            keccak256(abi.encode(circleId, "SHARE")),
            shareName,
            shareSymbol
        );

        address positionNft = deployer.deployPositionNFT(
            keccak256(abi.encode(circleId, "POSITION")),
            positionName,
            positionSymbol
        );

        address drawConsumer = deployer.deployDrawConsumer(
            keccak256(abi.encode(circleId, "DRAW_CONSUMER")),
            vrfCoordinator,
            vrfSubscriptionId
        );

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

        vault = deployer.deployVault(circleId, params, msg.sender);

        DrawConsumer(drawConsumer).setVault(vault);
        ERC20Claim(shareToken).transferOwnership(vault);
        PositionNFT(positionNft).transferOwnership(vault);

        circleById[circleId] = vault;

        circles.push(
            CircleInfo({
                circleId: circleId,
                vault: vault,
                shareToken: shareToken,
                positionNft: positionNft,
                drawConsumer: drawConsumer
            })
        );

        emit CircleCreated(vault, msg.sender, circleId, name);
    }

    function getCircle(uint256 index) external view returns (CircleInfo memory) {
        return circles[index];
    }

    function getCirclesCount() external view returns (uint256) {
        return circles.length;
    }
}
