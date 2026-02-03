// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {CircleErrors} from "./CircleError.sol";

library CircleMath {
    using Math for uint256;

    function computeInstallmentAmount(
        uint256 targetValue,
        uint256 duration
    ) public pure returns (uint256) {
        if (duration == 0 || targetValue == 0) {
            revert CircleErrors.ZeroAmount();
        }

        return targetValue / duration;
    }

    function computeDuration(
        uint256 targetValue,
        uint256 installmentAmount
    ) public pure returns (uint256) {
        if (installmentAmount == 0 || targetValue == 0) {
            revert CircleErrors.ZeroAmount();
        }

        return targetValue / installmentAmount;
    }

    function computeTargetValue(
        uint256 installmentAmount,
        uint256 duration
    ) public pure returns (uint256) {
        if (installmentAmount == 0 || duration == 0) {
            revert CircleErrors.ZeroAmount();
        }

        return installmentAmount * duration;
    }

    function computeClaimSupply(
        uint256 targetValue,
        uint256 unit
    ) public pure returns (uint256) {
        // Invariant: claimSupply * unit == targetValue
        if (unit == 0 || targetValue == 0) {
            revert CircleErrors.ZeroAmount();
        }

        return targetValue / unit;
    }

    function validateConfig(
        uint256 targetValue,
        uint256 installment,
        uint256 duration
    ) public pure returns (bool) {
        if (installment == 0 || duration == 0 || targetValue == 0) {
            revert CircleErrors.ZeroAmount();
        }

        return computeTargetValue(installment, duration) == targetValue;
    }
}