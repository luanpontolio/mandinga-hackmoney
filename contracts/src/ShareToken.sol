// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ShareToken is ERC20Upgradeable, OwnableUpgradeable {
    constructor(string memory name_, string memory symbol_, address owner_) {
        __ERC20_init(name_, symbol_);
        __Ownable_init(owner_);

        _transferOwnership(owner_);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(amount > 0, "ShareToken: Amount must be greater than 0");
        require(to != address(0), "ShareToken: To address cannot be 0");
        require(totalSupply() + amount <= type(uint256).max, "ShareToken: Total supply would exceed max");

        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}
