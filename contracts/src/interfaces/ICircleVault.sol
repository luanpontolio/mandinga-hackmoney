// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICircleVault {
    enum CircleStatus {
        ACTIVE,
        FROZEN,
        CLOSED
    }

    function initialize(
        string memory name_,
        uint256 targetValue_,
        uint256 totalInstallments_,
        uint256 deadline_,
        uint16 exitFeeBps_,
        address shareToken_,
        address positionNft_,
        address creator_
    ) external;

    function circleName() external view returns (string memory);

    function creator() external view returns (address);

    function shareToken() external view returns (address);

    function positionNft() external view returns (address);

    function targetValue() external view returns (uint256);

    function totalInstallments() external view returns (uint256);

    function deadline() external view returns (uint256);

    function exitFeeBps() external view returns (uint16);

    function status() external view returns (CircleStatus);
}
