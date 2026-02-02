// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CircleVault.sol";
import "./ShareToken.sol";
import "./PositionNFT.sol";

contract CircleVaultFactory {
    struct CircleInfo {
        address vault;
        address shareToken;
        address positionNft;
        bytes32 circleId;
        string name;
    }

    CircleInfo[] public circles;

    /// circleId => vault
    mapping(bytes32 => address) public circleById;

    event CircleCreated(
        address indexed vault,
        address indexed creator,
        bytes32 indexed circleId,
        string name
    );

    error CircleAlreadyExists();

    /*───────────────────────────*
     *         CREATE CIRCLE      *
     *───────────────────────────*/

    function createCircle(
        string memory name_,
        uint256 targetValue,
        uint256 totalInstallments,
        uint256 startTime,
        uint256 timePerRound,
        uint256 numRounds,
        uint256 numUsers,
        uint16 exitFeeBps
    ) external returns (address vault) {
        require(exitFeeBps <= 500, "exit fee too high");
        require(totalInstallments > 0, "installments=0");
        require(numUsers == numRounds, "users != rounds");

        bytes32 circleId = _circleId(
            msg.sender,
            name_,
            startTime,
            targetValue,
            totalInstallments,
            timePerRound,
            numRounds,
            numUsers,
            exitFeeBps
        );

        address existing = circleById[circleId];
        if (existing != address(0)) {
            revert CircleAlreadyExists();
        }

        ShareToken shareToken = new ShareToken{salt: _shareSalt(circleId)}(
            string.concat("Mandinga Share ", name_),
            string.concat("MS", name_),
            address(this)
        );

        PositionNFT positionNft = new PositionNFT{salt: _positionSalt(circleId)}(
            string.concat("Mandinga Position ", name_),
            string.concat("MP", name_),
            address(this)
        );

        vault = address(
            new CircleVault{salt: _circleSalt(circleId)}(
                name_,
                targetValue,
                totalInstallments,
                startTime,
                timePerRound,
                numRounds,
                numUsers,
                exitFeeBps,
                address(shareToken),
                address(positionNft),
                msg.sender
            )
        );

        shareToken.transferOwnership(vault);
        positionNft.transferOwnership(vault);

        circleById[circleId] = vault;

        circles.push(
            CircleInfo({
                vault: vault,
                shareToken: address(shareToken),
                positionNft: address(positionNft),
                circleId: circleId,
                name: name_
            })
        );

        emit CircleCreated(vault, msg.sender, circleId, name_);
    }

    /*───────────────────────────*
     *        VIEW HELPERS        *
     *───────────────────────────*/

    function computeCircleId(
        address creator,
        string memory name_,
        uint256 startTime,
        uint256 targetValue,
        uint256 totalInstallments,
        uint256 timePerRound,
        uint256 numRounds,
        uint256 numUsers,
        uint16 exitFeeBps
    ) external view returns (bytes32) {
        return _circleId(
            creator,
            name_,
            startTime,
            targetValue,
            totalInstallments,
            timePerRound,
            numRounds,
            numUsers,
            exitFeeBps
        );
    }

    function getCirclesCount() external view returns (uint256) {
        return circles.length;
    }

    function getCircle(uint256 index) external view returns (CircleInfo memory) {
        return circles[index];
    }

    /*───────────────────────────*
     *     ADDRESS PREDICTION     *
     *───────────────────────────*/

    function predictVaultAddress(
        bytes32 circleId,
        bytes memory vaultConstructorArgs
    ) external view returns (address predicted) {
        bytes memory bytecode = abi.encodePacked(
            type(CircleVault).creationCode,
            vaultConstructorArgs
        );

        predicted = _predictCreate2Address(
            _circleSalt(circleId),
            bytecode
        );

        return predicted;
    }

    function predictShareTokenAddress(
        bytes32 circleId,
        bytes memory constructorArgs
    ) external view returns (address predicted) {
        bytes memory bytecode = abi.encodePacked(
            type(ShareToken).creationCode,
            constructorArgs
        );

        predicted = _predictCreate2Address(
            _shareSalt(circleId),
            bytecode
        );

        return predicted;
    }

    function predictPositionNFTAddress(
        bytes32 circleId,
        bytes memory constructorArgs
    ) external view returns (address predicted) {
        bytes memory bytecode = abi.encodePacked(
            type(PositionNFT).creationCode,
            constructorArgs
        );

        predicted = _predictCreate2Address(
            _positionSalt(circleId),
            bytecode
        );

        return predicted;
    }

    /*───────────────────────────*
     *      INTERNAL HELPERS      *
     *───────────────────────────*/

    function _circleId(
        address creator,
        string memory name_,
        uint256 startTime,
        uint256 targetValue,
        uint256 totalInstallments,
        uint256 timePerRound,
        uint256 numRounds,
        uint256 numUsers,
        uint16 exitFeeBps
    ) internal view returns (bytes32) {
        return keccak256(
            abi.encode(
                creator,
                name_,
                startTime,
                targetValue,
                totalInstallments,
                timePerRound,
                numRounds,
                numUsers,
                exitFeeBps,
                block.chainid
            )
        );
    }

    function _circleSalt(bytes32 circleId) internal pure returns (bytes32) {
        return circleId;
    }

    function _shareSalt(bytes32 circleId) internal pure returns (bytes32) {
        return keccak256(abi.encode(circleId, "SHARE"));
    }

    function _positionSalt(bytes32 circleId) internal pure returns (bytes32) {
        return keccak256(abi.encode(circleId, "POSITION"));
    }

    function _predictCreate2Address(
        bytes32 salt,
        bytes memory bytecode
    ) internal view returns (address predicted) {
        predicted = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            address(this),
                            salt,
                            keccak256(bytecode)
                        )
                    )
                )
            )
        );
    }
}
