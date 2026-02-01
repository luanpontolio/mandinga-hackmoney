// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICircleVaultFactory {
    event CircleCreated(
        address indexed vault,
        address indexed shareToken,
        address indexed positionNft,
        string name
    );

    function createCircle(
        string memory name_,
        uint256 targetValue,
        uint256 totalInstallments,
        uint256 deadline,
        uint16 exitFeeBps
    ) external returns (address);

    function circlesCount() external view returns (uint256);

    function getCircle(uint256 index)
        external
        view
        returns (address vault, address shareToken, address positionNft, string memory name);
}
