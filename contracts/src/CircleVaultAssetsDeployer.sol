// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20Claim} from "./ERC20Claim.sol";
import {PositionNFT} from "./PositionNFT.sol";
import {DrawConsumer} from "./DrawConsumer.sol";

contract CircleVaultAssetsDeployer {
    function _salt(bytes32 circleId, string memory suffix) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(circleId, suffix));
    }

    function deployAssets(
        bytes32 circleId,
        string calldata name,
        address vrfCoordinator,
        uint64 vrfSubscriptionId
    ) external returns (address shareToken, address positionNft, address drawConsumer) {
        ERC20Claim share = new ERC20Claim{salt: _salt(circleId, "ERC20_CLAIM")}(name, name, address(this));
        PositionNFT nft = new PositionNFT{salt: _salt(circleId, "POSITION_NFT")}(name, name, address(this));
        DrawConsumer consumer =
            new DrawConsumer{salt: _salt(circleId, "DRAW_CONSUMER")}(vrfCoordinator, vrfSubscriptionId);

        shareToken = address(share);
        positionNft = address(nft);
        drawConsumer = address(consumer);
    }

    function transferOwnerships(
        address shareToken,
        address positionNft,
        address drawConsumer,
        address newOwner
    ) external {
        ERC20Claim(shareToken).transferOwnership(newOwner);
        PositionNFT(positionNft).transferOwnership(newOwner);
        DrawConsumer(drawConsumer).transferOwnership(newOwner);
    }
}
