// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICircleVault {
    enum CircleStatus {
        ACTIVE,
        FROZEN,
        CLOSED
    }

    function createCircle(
        string memory name_,
        uint256 targetValue_,
        uint256 totalInstallments_,
        uint256 startTime_,
        uint256 timePerRound_,
        uint256 numRounds_,
        uint256 numUsers_,
        uint16 exitFeeBps_,
        address shareToken_,
        address positionNft_,
        address creator_
    ) external;

    function deposit() external payable;
    function payInstallment() external payable;
}
