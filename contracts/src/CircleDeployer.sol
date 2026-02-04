// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CircleVault.sol";
import "./ERC20Claim.sol";
import "./PositionNFT.sol";
import "./DrawConsumer.sol";

contract CircleDeployer {
    error NotFactory();

    address public immutable factory;

    constructor(address factory_) {
        factory = factory_;
    }

    modifier onlyFactory() {
        if (msg.sender != factory) revert NotFactory();
        _;
    }

    function deployShareToken(
        bytes32 salt,
        string calldata name,
        string calldata symbol
    ) external onlyFactory returns (address) {
        return address(
            new ERC20Claim{salt: salt}(name, symbol, factory)
        );
    }

    function deployPositionNFT(
        bytes32 salt,
        string calldata name,
        string calldata symbol
    ) external onlyFactory returns (address) {
        return address(
            new PositionNFT{salt: salt}(name, symbol, factory)
        );
    }

    function deployDrawConsumer(
        bytes32 salt,
        address vrfCoordinator,
        uint64 vrfSubscriptionId
    ) external onlyFactory returns (address) {
        address consumer = address(
            new DrawConsumer{salt: salt}(
                vrfCoordinator,
                vrfSubscriptionId,
                address(0)
            )
        );
        DrawConsumer(consumer).transferOwnership(factory);
        return consumer;
    }

    function deployVault(
        bytes32 salt,
        CircleVault.CircleParams calldata params,
        address creator
    ) external onlyFactory returns (address) {
        return address(
            new CircleVault{salt: salt}(params, creator)
        );
    }
}
