// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract PositionNFT is ERC721Upgradeable, OwnableUpgradeable {
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

    event PositionUpdated(uint256 indexed tokenId, uint256 paidInstallments, uint256 totalPaid);
    event StatusUpdated(uint256 indexed tokenId, Status status);

    constructor(string memory name_, string memory symbol_, address owner_) {
        __ERC721_init(name_, symbol_);
        __Ownable_init(owner_);
        _transferOwnership(owner_);
    }

    function mint(address to, PositionData memory data) external onlyOwner returns (uint256) {
        require(data.status == Status.ACTIVE, "PositionNFT: Circle is not active");
        require(data.targetValue > 0, "PositionNFT: Target value must be greater than 0");
        require(data.totalInstallments > 0, "PositionNFT: Total installments must be greater than 0");
        require(data.totalInstallments >= data.paidInstallments, "PositionNFT: Paid installments must be less than or equal to total installments");
        require(data.totalPaid <= data.targetValue, "PositionNFT: Total paid must be less than or equal to target value");
        require(data.totalPaid >= data.paidInstallments, "PositionNFT: Total paid must be greater than or equal to paid installments");
        require(data.totalPaid <= data.targetValue, "PositionNFT: Total paid must be less than or equal to target value");

        uint256 tokenId = ++totalSupply;
        _safeMint(to, tokenId);
        positions[tokenId] = data;
        return tokenId;
    }

    function updatePaid(uint256 tokenId, uint256 paidInstallments, uint256 totalPaid) external onlyOwner {
        PositionData storage data = positions[tokenId];
        data.paidInstallments = paidInstallments;
        data.totalPaid = totalPaid;
        emit PositionUpdated(tokenId, paidInstallments, totalPaid);
    }

    function setStatus(uint256 tokenId, Status status) external onlyOwner {
        require(status != Status.CLOSED, "PositionNFT: Circle cannot be closed");

        positions[tokenId].status = status;
        emit StatusUpdated(tokenId, status);
    }
}
