// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract CircleVault is Initializable, OwnableUpgradeable, UUPSUpgradeable {
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
    uint256 public deadline;
    uint16 public exitFeeBps;
    CircleStatus public status;

    function initialize(
        string memory name_,
        uint256 targetValue_,
        uint256 totalInstallments_,
        uint256 deadline_,
        uint16 exitFeeBps_,
        address shareToken_,
        address positionNft_,
        address creator_
    ) external initializer {
        __Ownable_init(creator_);
        circleName = name_;
        targetValue = targetValue_;
        totalInstallments = totalInstallments_;
        deadline = deadline_;
        exitFeeBps = exitFeeBps_;
        shareToken = shareToken_;
        positionNft = positionNft_;
        creator = creator_;
        status = CircleStatus.ACTIVE;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
