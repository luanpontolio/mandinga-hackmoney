// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20Claim is ERC20, Ownable {
    bool public transfersFrozen;

    constructor(
        string memory name_,
        string memory symbol_,
        address owner_
    ) ERC20(name_, symbol_) Ownable(owner_) {
    }

    function setTransfersFrozen(bool frozen) external onlyOwner {
        transfersFrozen = frozen;
    }

    function _update(address from, address to, uint256 value) internal override {
        if (transfersFrozen && from != address(0) && to != address(0)) {
            // When frozen, only allow transfers to the owner (vault) for redemption flow
            require(to == owner(), "ERC20Claim: transfers frozen");
        }
        super._update(from, to, value);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(amount > 0, "amount=0");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}
