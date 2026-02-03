// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library CircleErrors {
    // Factory errors
    error CircleAlreadyExists();
    error InvalidParameters();

    // Vault errors
    error NotEnrolled();
    error AlreadyEnrolled();
    error IncorrectDepositAmount();
    error IncorrectInstallmentAmount();
    error CircleFull();
    error CircleFrozen();
    error CircleNotFrozen();
    error CircleNotActive();
    error PositionNotActive();
    error PositionFullyPaid();
    error InsufficientClaims();
    error InsufficientBalance();
    error AlreadySnapshotted();
    error NotSnapshotted();
    error DrawAlreadyRequested();
    error NotSelected();
    error NoActiveParticipants();
    error TransfersFrozen();
    error ZeroAddress();
    error ZeroAmount();
}
