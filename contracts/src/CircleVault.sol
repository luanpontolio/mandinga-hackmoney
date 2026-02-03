// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {CircleErrors} from "./libraries/CircleError.sol";
import {PositionNFT} from "./PositionNFT.sol";
import {ERC20Claim} from "./ERC20Claim.sol";

contract CircleVault is Ownable, ReentrancyGuard {
    enum CircleStatus {
        ACTIVE,
        FROZEN,
        SETTLED,
        CLOSED
    }

    address public immutable shareToken;
    address public immutable positionNft;
    uint256 public immutable targetValue;
    uint256 public immutable totalInstallments;
    uint256 public immutable installmentAmount;
    uint256 public immutable numUsers;
    uint16 public immutable exitFeeBps;

    string public circleName;
    address public creator;
    uint256 public startTime;
    uint256 public timePerRound;
    uint256 public numberOfRounds;
    CircleStatus public status;

    mapping(address => uint256) public participantToTokenId;  // 0 = not enrolled
    address[] public participants;
    uint256 public activeParticipantCount;

    /// Quota capacities and filled counts: 0 = early, 1 = middle, 2 = late
    uint256 public immutable quotaCapEarly;
    uint256 public immutable quotaCapMiddle;
    uint256 public immutable quotaCapLate;
    uint256 public quotaFilledEarly;
    uint256 public quotaFilledMiddle;
    uint256 public quotaFilledLate;

    uint256 public snapshotTimestamp;
    uint256 public snapshotBalance;
    uint256 public snapshotClaimsSupply;

    event ParticipantEnrolled(
        address indexed participant,
        uint256 indexed tokenId,
        uint256 depositAmount
    );
    event InstallmentPaid(
        address indexed participant,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 totalPaid
    );
    event EarlyExit(
        address indexed participant,
        uint256 indexed tokenId,
        uint256 claimAmount,
        uint256 feeAmount,
        uint256 netAmount
    );

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
        address owner_,
        uint256 quotaCapEarly_,
        uint256 quotaCapMiddle_,
        uint256 quotaCapLate_
    ) Ownable(owner_) {
        require(targetValue_ > 0, "Invalid target");
        require(totalInstallments_ > 0, "Invalid installments");
        require(shareToken_ != address(0), "ShareToken zero");
        require(positionNft_ != address(0), "NFT zero");
        require(exitFeeBps_ <= 1000, "Fee too high");

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
        installmentAmount = targetValue_ / totalInstallments_;
        quotaCapEarly = quotaCapEarly_;
        quotaCapMiddle = quotaCapMiddle_;
        quotaCapLate = quotaCapLate_;
    }

    /// @param quotaId 0 = early, 1 = middle, 2 = late
    function deposit(uint256 quotaId) external payable nonReentrant() {
        if (status != CircleStatus.ACTIVE) revert CircleErrors.CircleNotActive();
        if (participantToTokenId[msg.sender] != 0) revert CircleErrors.AlreadyEnrolled();
        if (participants.length >= numUsers) revert CircleErrors.CircleFull();
        if (quotaId > 2) revert CircleErrors.InvalidQuota();

        uint256 cap = _quotaCapacity(quotaId);
        uint256 filled = _quotaFilled(quotaId);
        if (filled >= cap) revert CircleErrors.QuotaFull();

        if (msg.value != targetValue) revert CircleErrors.IncorrectDepositAmount();

        _incrementQuotaFilled(quotaId);

        uint256 tokenId = PositionNFT(positionNft).mint(msg.sender, PositionNFT.PositionData({
            quotaId: quotaId,
            targetValue: targetValue,
            totalInstallments: totalInstallments,
            paidInstallments: 0,
            totalPaid: 0,
            status: PositionNFT.Status.ACTIVE
        }));

        participantToTokenId[msg.sender] = tokenId;
        participants.push(msg.sender);
        activeParticipantCount++;
        snapshotTimestamp = block.timestamp;
        snapshotBalance += msg.value;
        snapshotClaimsSupply += msg.value;

        ERC20Claim(shareToken).mint(msg.sender, msg.value);

        emit ParticipantEnrolled(msg.sender, tokenId, msg.value);
    }

    function _quotaCapacity(uint256 quotaId) internal view returns (uint256) {
        if (quotaId == 0) return quotaCapEarly;
        if (quotaId == 1) return quotaCapMiddle;
        return quotaCapLate;
    }

    function _quotaFilled(uint256 quotaId) internal view returns (uint256) {
        if (quotaId == 0) return quotaFilledEarly;
        if (quotaId == 1) return quotaFilledMiddle;
        return quotaFilledLate;
    }

    function _incrementQuotaFilled(uint256 quotaId) internal {
        if (quotaId == 0) quotaFilledEarly++;
        else if (quotaId == 1) quotaFilledMiddle++;
        else quotaFilledLate++;
    }

    function payInstallment() external payable nonReentrant {
        if (status != CircleStatus.ACTIVE) revert CircleErrors.CircleNotActive();

        uint256 tokenId = participantToTokenId[msg.sender];
        if (tokenId == 0) revert CircleErrors.NotEnrolled();

        if (msg.value != installmentAmount) revert CircleErrors.IncorrectInstallmentAmount();

        PositionNFT.PositionData memory positionData = PositionNFT(positionNft).getPosition(tokenId);
        if (positionData.status != PositionNFT.Status.ACTIVE) revert CircleErrors.PositionNotActive();

        if (positionData.paidInstallments >= positionData.totalInstallments) revert CircleErrors.PositionFullyPaid();

        positionData.paidInstallments++;
        positionData.totalPaid += msg.value;
        PositionNFT(positionNft).updatePaid(tokenId, positionData.paidInstallments, positionData.totalPaid);

        snapshotBalance += msg.value;
        snapshotClaimsSupply += msg.value;

        ERC20Claim(shareToken).mint(msg.sender, msg.value);

        emit InstallmentPaid(msg.sender, tokenId, msg.value, positionData.totalPaid);
    }

    function exitEarly(uint256 claimAmount) external nonReentrant() {
        if (status != CircleStatus.ACTIVE) revert CircleErrors.CircleNotActive();

        uint256 tokenId = participantToTokenId[msg.sender];
        if (tokenId == 0) revert CircleErrors.NotEnrolled();

        PositionNFT.PositionData memory positionData = PositionNFT(positionNft).getPosition(tokenId);
        if (positionData.status != PositionNFT.Status.ACTIVE) revert CircleErrors.PositionNotActive();

        if (claimAmount == 0) revert CircleErrors.ZeroAmount();
        if (IERC20(shareToken).balanceOf(msg.sender) < claimAmount) revert CircleErrors.InsufficientClaims();

        uint256 feeAmount = (claimAmount * exitFeeBps) / 10_000;
        uint256 netAmount = claimAmount - feeAmount;
        if (address(this).balance < netAmount) revert CircleErrors.InsufficientBalance();
        if (snapshotBalance < netAmount) revert CircleErrors.InsufficientBalance();
        if (snapshotClaimsSupply < claimAmount) revert CircleErrors.InsufficientSnapshot();

        snapshotBalance -= netAmount;
        snapshotClaimsSupply -= claimAmount;
        activeParticipantCount--;

        require(
            IERC20(shareToken).transferFrom(msg.sender, address(this), claimAmount),
            "Transfer failed"
        );

        ERC20Claim(shareToken).burn(address(this), claimAmount);
        PositionNFT(positionNft).setStatus(tokenId, PositionNFT.Status.EXITED);

        (bool sent,) = msg.sender.call{value: netAmount}("");
        require(sent, "Transfer failed");

        emit EarlyExit(msg.sender, tokenId, claimAmount, feeAmount, netAmount);
    }

    function isEnrolled(address participant) public view returns (bool) {
        return participantToTokenId[participant] != 0;
    }

    receive() external payable {}
}
