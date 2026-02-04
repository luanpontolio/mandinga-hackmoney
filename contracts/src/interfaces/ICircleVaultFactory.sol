// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICircleVaultFactory {
    struct CircleInfo {
        address vault;
        address shareToken;
        address positionNft;
        bytes32 circleId;
        string name;
    }

    event CircleCreated(address indexed vault, address indexed shareToken, address indexed positionNft, string name);

    function createCircle(
        string memory name_,
        uint256 targetValue,
        uint256 totalInstallments,
        uint256 startTime,
        uint256 timePerRound,
        uint256 numRounds,
        uint256 numUsers,
        uint16 exitFeeBps
    ) external returns (address);


    function predictVaultAddress(
        bytes32 circleId,
        bytes memory vaultConstructorArgs
    ) external view returns (address predicted);

    function getCircle(uint256 index) external view returns (CircleInfo memory);

    function getCirclesCount() external view returns (uint256);
}
