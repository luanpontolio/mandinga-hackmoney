// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PositionNFT is ERC721, Ownable {
    enum Status {
        ACTIVE,
        EXITED,
        FROZEN,
        CLOSED
    }

    struct PositionData {
        uint256 quotaId;
        uint256 targetValue;
        uint256 totalInstallments;
        uint256 paidInstallments;
        uint256 totalPaid;
        Status status;
    }

    uint256 public totalSupply;
    mapping(uint256 => PositionData) public positions;

    constructor(
        string memory name_,
        string memory symbol_,
        address owner_
    ) ERC721(name_, symbol_) Ownable(owner_) {}

    function mint(address to, PositionData memory data)
        external
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = ++totalSupply;
        _safeMint(to, tokenId);
        positions[tokenId] = data;
        return tokenId;
    }

    function getPosition(uint256 tokenId) external view returns (PositionData memory) {
        return positions[tokenId];
    }

    function updatePaid(
        uint256 tokenId,
        uint256 paidInstallments,
        uint256 totalPaid
    ) external onlyOwner {
        PositionData storage data = positions[tokenId];
        data.paidInstallments = paidInstallments;
        data.totalPaid = totalPaid;
    }

    function setStatus(uint256 tokenId, Status status)
        external
        onlyOwner
    {
        positions[tokenId].status = status;
    }
}
