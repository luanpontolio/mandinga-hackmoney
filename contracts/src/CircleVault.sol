// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CircleVault is Ownable {
    enum CircleStatus {
        ACTIVE,
        FROZEN,
        CLOSED
    }

    string public circleName;
    address public creator;
    address public shareToken;
    address public positionNft;

    uint256 public targetValue;
    uint256 public totalInstallments;
    uint256 public numberOfRounds;
    uint256 public startTime;
    uint256 public timePerRound;
    uint256 public numUsers;
    uint16 public exitFeeBps;
    CircleStatus public status;

    constructor(
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
        address owner_
    ) Ownable(owner_) {

        circleName = name_;
        targetValue = targetValue_;
        totalInstallments = totalInstallments_;
        startTime = startTime_;
        timePerRound = timePerRound_;
        numberOfRounds = numRounds_;
        numUsers = numUsers_;
        exitFeeBps = exitFeeBps_;
        shareToken = shareToken_;
        positionNft = positionNft_;
        creator = owner_;
        status = CircleStatus.ACTIVE;
    }
}
