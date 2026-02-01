// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./CircleVault.sol";
import "./PositionNFT.sol";
import "./ShareToken.sol";

contract CircleVaultFactory {
    struct CircleInfo {
        address vault;
        address shareToken;
        address positionNft;
        string name;
    }

    CircleInfo[] private circles;

    event CircleCreated(
        address indexed vault,
        address indexed shareToken,
        address indexed positionNft,
        string name
    );

    function createCircle(
        string memory name_,
        uint256 targetValue,
        uint256 totalInstallments,
        uint256 deadline,
        uint16 exitFeeBps
    ) external returns (address) {
        require(exitFeeBps <= 500, "exit fee too high");

        string memory shareName = string.concat("Mandinga ", "Share ", name_);
        string memory shareSymbol = string.concat("MS", name_);
        string memory nftName = string.concat("Mandinga ", "Position ", name_);
        string memory nftSymbol = string.concat("MP", name_);

        ShareToken shareToken = new ShareToken(shareName, shareSymbol, address(this));
        PositionNFT positionNft = new PositionNFT(nftName, nftSymbol, address(this));

        CircleVault implementation = new CircleVault();
        bytes memory initData = abi.encodeWithSelector(
            CircleVault.initialize.selector,
            name_,
            targetValue,
            totalInstallments,
            deadline,
            exitFeeBps,
            address(shareToken),
            address(positionNft),
            msg.sender
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);

        shareToken.transferOwnership(address(proxy));
        positionNft.transferOwnership(address(proxy));

        circles.push(
            CircleInfo({
                vault: address(proxy),
                shareToken: address(shareToken),
                positionNft: address(positionNft),
                name: name_
            })
        );

        emit CircleCreated(address(proxy), address(shareToken), address(positionNft), name_);
        return address(proxy);
    }

    function circlesCount() external view returns (uint256) {
        return circles.length;
    }

    function getCircle(uint256 index) external view returns (CircleInfo memory) {
        return circles[index];
    }
}
