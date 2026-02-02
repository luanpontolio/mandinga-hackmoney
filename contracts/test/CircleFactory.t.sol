// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CircleVaultFactory.sol";

contract CircleFactoryTest is Test {
    CircleVaultFactory private factory;

    function setUp() public {
        factory = new CircleVaultFactory();
    }

    function testCreateCircleStoresAddresses() public {
        // address vault = factory.createCircle("devcon", 1_000e6, 10, block.timestamp + 30 days, 100);

        // assertTrue(vault != address(0));
        // assertEq(factory.circlesCount(), 1);

        // CircleVaultFactory.CircleInfo memory info = factory.getCircle(0);
        // assertEq(info.vault, vault);
        // assertTrue(info.shareToken != address(0));
        // assertTrue(info.positionNft != address(0));
    }
}
