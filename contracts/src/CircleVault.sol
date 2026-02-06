// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {CircleErrors} from "./libraries/CircleError.sol";
import {PositionNFT} from "./PositionNFT.sol";
import {ERC20Claim} from "./ERC20Claim.sol";
import {IDrawConsumer} from "./interfaces/IDrawConsumer.sol";

contract CircleVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct CircleParams {
        string name;
        uint256 targetValue;
        uint256 totalInstallments;
        uint256 startTime;
        uint256 timePerRound;
        uint256 numRounds;
        uint256 numUsers;
        uint16 exitFeeBps;
        address shareToken;
        address positionNft;
        uint256 quotaCapEarly;
        uint256 quotaCapMiddle;
        uint256 quotaCapLate;
        address drawConsumer;
    }

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

    /// Close window (deadline) per quota: when this timestamp is reached, that window can be snapshotted and drawn.
    /// Early = startTime + timePerRound, Middle = startTime + 2*timePerRound, Late = startTime + 3*timePerRound.
    uint256 public immutable closeWindowEarly;
    uint256 public immutable closeWindowMiddle;
    uint256 public immutable closeWindowLate;

    /// @notice Dedicated VRF draw consumer for this vault (one consumer per vault).
    address public immutable drawConsumer;

    uint256 private constant MAX_QUOTA_ID = 2;

    /// Per-window snapshot: participants and balances at close time.
    mapping(uint256 => address[]) public windowParticipants;
    mapping(uint256 => mapping(address => uint256)) public windowSnapshotBalance;
    mapping(uint256 => bool) public windowSnapshotted;
    mapping(uint256 => uint256) public windowSnapshotTimestamp;
    /// Total pot per window (sum of all snapshot balances). Single contemplado receives full windowTotalPot.
    mapping(uint256 => uint256) public windowTotalPot;

    /// Draw consumer request id per quota (used to read order and completion from DrawConsumer).
    mapping(uint256 => uint256) public quotaIdToRequestId;

    /// True after the single redeem for that window (spec: at most one payout per window).
    mapping(uint256 => bool) public windowSettled;

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
    event WindowSnapshotted(uint256 indexed quotaId, uint256 timestamp, uint256 participantCount);
    event Redeemed(
        address indexed participant,
        uint256 indexed tokenId,
        uint256 indexed quotaId,
        uint256 amount,
        bytes32 proof
    );

    constructor(CircleParams memory p, address owner_) Ownable(owner_) {
        require(p.targetValue > 0, "Invalid target");
        require(p.totalInstallments > 0, "Invalid installments");
        require(p.shareToken != address(0), "ShareToken zero");
        require(p.positionNft != address(0), "NFT zero");
        require(p.exitFeeBps <= 1000, "Fee too high");
        require(p.drawConsumer != address(0), "DrawConsumer zero");

        circleName = p.name;
        targetValue = p.targetValue;
        totalInstallments = p.totalInstallments;
        startTime = p.startTime;
        timePerRound = p.timePerRound;
        numberOfRounds = p.numRounds;
        numUsers = p.numUsers;
        exitFeeBps = p.exitFeeBps;
        shareToken = p.shareToken;
        positionNft = p.positionNft;
        creator = owner_;
        status = CircleStatus.ACTIVE;
        installmentAmount = p.targetValue / p.totalInstallments;
        quotaCapEarly = p.quotaCapEarly;
        quotaCapMiddle = p.quotaCapMiddle;
        quotaCapLate = p.quotaCapLate;
        closeWindowEarly = p.startTime + p.timePerRound;
        closeWindowMiddle = p.startTime + 2 * p.timePerRound;
        closeWindowLate = p.startTime + 3 * p.timePerRound;
        drawConsumer = p.drawConsumer;
    }

    /// @param quotaId 0 = early, 1 = middle, 2 = late
    function getCloseWindowTimestamp(uint256 quotaId) public view returns (uint256) {
        _requireValidQuota(quotaId);
        if (quotaId == 0) return closeWindowEarly;
        if (quotaId == 1) return closeWindowMiddle;
        return closeWindowLate;
    }

    /// @return Full draw order for the window (for redeem order and off-chain use).
    function getDrawOrder(uint256 quotaId) external view returns (address[] memory) {
        uint256 requestId = quotaIdToRequestId[quotaId];
        return IDrawConsumer(drawConsumer).getDrawOrder(requestId);
    }

    /// @return Whether the draw for this window has been fulfilled by the VRF consumer.
    function drawCompleted(uint256 quotaId) public view returns (bool) {
        uint256 requestId = quotaIdToRequestId[quotaId];
        return IDrawConsumer(drawConsumer).drawCompleted(requestId);
    }

    /// @return Participants snapshotted for that window.
    function getWindowParticipants(uint256 quotaId) external view returns (address[] memory) {
        return windowParticipants[quotaId];
    }

    /// @param quotaId 0 = early, 1 = middle, 2 = late
    function deposit(uint256 quotaId) external payable nonReentrant() {
        _requireActive();
        _requireNotEnrolled(msg.sender);
        if (participants.length >= numUsers) revert CircleErrors.CircleFull();
        _requireValidQuota(quotaId);
        _requireBeforeCloseWindow(quotaId);
        _requireQuotaAvailable(quotaId);
        if (msg.value != installmentAmount) revert CircleErrors.IncorrectDepositAmount();

        _incrementQuotaFilled(quotaId);

        uint256 tokenId = PositionNFT(positionNft).mint(msg.sender, PositionNFT.PositionData({
            quotaId: quotaId,
            targetValue: targetValue,
            totalInstallments: totalInstallments,
            paidInstallments: 1,
            totalPaid: installmentAmount,
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

    /// @notice Pay next installment within the same quota window.
    /// Participant remains in their original window and continues participating in future draws.
    function payInstallment() external payable nonReentrant {
        _requireActive();
        uint256 tokenId = _requireEnrolled(msg.sender);

        if (msg.value != installmentAmount) revert CircleErrors.IncorrectInstallmentAmount();

        PositionNFT.PositionData memory positionData = PositionNFT(positionNft).getPosition(tokenId);
        if (positionData.paidInstallments >= positionData.totalInstallments) revert CircleErrors.PositionFullyPaid();

        if (positionData.status != PositionNFT.Status.ACTIVE) revert CircleErrors.PositionNotActive();

        // Participant stays in the same quotaId - no window changes
        positionData.paidInstallments++;
        positionData.totalPaid += msg.value;

        snapshotBalance += msg.value;
        snapshotClaimsSupply += msg.value;

        PositionNFT(positionNft).updatePaid(tokenId, positionData.paidInstallments, positionData.totalPaid);
        ERC20Claim(shareToken).mint(msg.sender, msg.value);

        if (positionData.paidInstallments >= positionData.totalInstallments) {
            PositionNFT(positionNft).setStatus(tokenId, PositionNFT.Status.CLOSED);
        }

        emit InstallmentPaid(msg.sender, tokenId, msg.value, positionData.totalPaid);
    }

    function exitEarly(uint256 claimAmount) external nonReentrant() {
        _requireActive();
        uint256 tokenId = _requireEnrolled(msg.sender);

        PositionNFT.PositionData memory positionData = PositionNFT(positionNft).getPosition(tokenId);
        if (positionData.status != PositionNFT.Status.ACTIVE) revert CircleErrors.PositionNotActive();

        if (claimAmount == 0) revert CircleErrors.ZeroAmount();
        IERC20 claimToken = IERC20(shareToken);
        if (claimToken.balanceOf(msg.sender) < claimAmount) revert CircleErrors.InsufficientClaims();

        uint256 feeAmount = (claimAmount * exitFeeBps) / 10_000;
        uint256 netAmount = claimAmount - feeAmount;
        if (address(this).balance < netAmount) revert CircleErrors.InsufficientBalance();
        if (snapshotBalance < netAmount) revert CircleErrors.InsufficientBalance();
        if (snapshotClaimsSupply < claimAmount) revert CircleErrors.InsufficientSnapshot();

        snapshotBalance -= netAmount;
        snapshotClaimsSupply -= claimAmount;
        activeParticipantCount--;

        claimToken.safeTransferFrom(msg.sender, address(this), claimAmount);
        ERC20Claim(shareToken).burn(address(this), claimAmount);
        PositionNFT(positionNft).setStatus(tokenId, PositionNFT.Status.EXITED);

        _sendEth(msg.sender, netAmount);

        emit EarlyExit(msg.sender, tokenId, claimAmount, feeAmount, netAmount);
    }

    function isEnrolled(address participant) public view returns (bool) {
        return participantToTokenId[participant] != 0;
    }

    /// @notice Snapshot a payout window and request VRF draw via DrawConsumer. Callable when block.timestamp >= getCloseWindowTimestamp(quotaId).
    /// @param quotaId 0 = early, 1 = middle, 2 = late
    function requestCloseWindow(uint256 quotaId) external nonReentrant {
        _requireActive();
        _requireValidQuota(quotaId);
        _requireAfterCloseWindow(quotaId);
        if (windowSnapshotted[quotaId]) revert CircleErrors.AlreadySnapshotted();

        uint256 participantCount = _snapshotWindow(quotaId);
        ERC20Claim(shareToken).setTransfersFrozen(true);

        _requestDraw(quotaId);

        emit WindowSnapshotted(quotaId, block.timestamp, participantCount);
    }

    /// @notice Redeem after draw: single contemplado (first in draw order) receives full window pot.
    /// Non-selected participants keep their claims and can pay next installment to participate in future draws.
    /// Spec: at most one payout per window; payout_amount(q) <= snapshotBalance(q).
    function redeem(uint256 quotaId) external nonReentrant {
        _requireValidQuota(quotaId);
        if (windowSettled[quotaId]) revert CircleErrors.AlreadySettled();
        if (!drawCompleted(quotaId)) revert CircleErrors.NotSnapshotted();

        address[] memory order = IDrawConsumer(drawConsumer).getDrawOrder(quotaIdToRequestId[quotaId]);
        if (order.length == 0) revert CircleErrors.InvalidParameters();
        if (msg.sender != order[0]) revert CircleErrors.NotSelected();

        uint256 tokenId = _requireEnrolled(msg.sender);

        uint256 potAmount = windowTotalPot[quotaId];
        if (potAmount == 0) revert CircleErrors.ZeroAmount();
        if (address(this).balance < potAmount) revert CircleErrors.InsufficientBalance();
        if (snapshotBalance < potAmount) revert CircleErrors.InsufficientBalance();

        windowSettled[quotaId] = true;
        snapshotBalance -= potAmount;
        snapshotClaimsSupply -= potAmount;

        // Winner: pull and burn only their own claims
        uint256 winnerClaimAmount = windowSnapshotBalance[quotaId][msg.sender];
        if (winnerClaimAmount > 0) {
            IERC20(shareToken).safeTransferFrom(msg.sender, address(this), winnerClaimAmount);
            ERC20Claim(shareToken).burn(address(this), winnerClaimAmount);
        }

        // Non-selected participants keep their claims for next rounds
        // No additional claims are burned for other participants

        _sendEth(msg.sender, potAmount);

        bytes32 proof = keccak256(abi.encodePacked(quotaId, msg.sender, potAmount, block.timestamp));
        emit Redeemed(msg.sender, tokenId, quotaId, potAmount, proof);
    }

    /// @return Full pot (ETH) the single contemplado receives for this window; 0 if window already settled.
    function getWindowPotShare(uint256 quotaId) external view returns (uint256) {
        if (windowSettled[quotaId]) return 0;
        return windowTotalPot[quotaId];
    }

    function _requireActive() internal view {
        if (status != CircleStatus.ACTIVE) revert CircleErrors.CircleNotActive();
    }

    function _requireValidQuota(uint256 quotaId) internal pure {
        if (quotaId > MAX_QUOTA_ID) revert CircleErrors.InvalidQuota();
    }

    function _requireBeforeCloseWindow(uint256 quotaId) internal view {
        if (block.timestamp > getCloseWindowTimestamp(quotaId)) revert CircleErrors.JoinAfterDeadline();
    }

    function _requireAfterCloseWindow(uint256 quotaId) internal view {
        if (block.timestamp < getCloseWindowTimestamp(quotaId)) revert CircleErrors.InvalidParameters();
    }

    function _requireNotEnrolled(address participant) internal view {
        if (participantToTokenId[participant] != 0) revert CircleErrors.AlreadyEnrolled();
    }

    function _requireEnrolled(address participant) internal view returns (uint256 tokenId) {
        tokenId = participantToTokenId[participant];
        if (tokenId == 0) revert CircleErrors.NotEnrolled();
    }

    function _requireQuotaAvailable(uint256 quotaId) internal view {
        if (_quotaFilled(quotaId) >= _quotaCapacity(quotaId)) revert CircleErrors.QuotaFull();
    }

    function _snapshotWindow(uint256 quotaId) internal returns (uint256 participantCount) {
        address[] storage list = windowParticipants[quotaId];
        uint256 totalPot;
        for (uint256 i = 0; i < participants.length; i++) {
            address p = participants[i];
            uint256 tokenId = participantToTokenId[p];
            if (tokenId == 0) continue;
            PositionNFT.PositionData memory pos = PositionNFT(positionNft).getPosition(tokenId);
            if (pos.quotaId != quotaId || pos.status != PositionNFT.Status.ACTIVE) continue;
            uint256 bal = IERC20(shareToken).balanceOf(p);
            if (bal == 0) continue;
            list.push(p);
            windowSnapshotBalance[quotaId][p] = bal;
            totalPot += bal;
        }
        if (list.length == 0) revert CircleErrors.NoActiveParticipants();

        windowTotalPot[quotaId] = totalPot;
        windowSnapshotted[quotaId] = true;
        windowSnapshotTimestamp[quotaId] = block.timestamp;

        return list.length;
    }

    function _requestDraw(uint256 quotaId) internal {
        uint256 requestId = IDrawConsumer(drawConsumer).requestDraw(quotaId, windowParticipants[quotaId]);
        quotaIdToRequestId[quotaId] = requestId;
    }

    function _sendEth(address to, uint256 amount) internal {
        (bool sent,) = to.call{value: amount}("");
        if (!sent) revert CircleErrors.TransferFailed();
    }

    receive() external payable {
        revert CircleErrors.InvalidParameters();
    }
}
