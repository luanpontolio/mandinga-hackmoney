// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal EIP-3668 Offchain Resolver for MVP flows.
contract OffchainResolver {
    error OffchainLookup(
        address sender,
        string[] urls,
        bytes callData,
        bytes4 callbackFunction,
        bytes extraData
    );

    string public gatewayUrl;
    address public signer;

    constructor(string memory gatewayUrl_, address signer_) {
        gatewayUrl = gatewayUrl_;
        signer = signer_;
    }

    function setGatewayUrl(string memory gatewayUrl_) external {
        gatewayUrl = gatewayUrl_;
    }

    function setSigner(address signer_) external {
        signer = signer_;
    }

    function resolve(bytes calldata name, bytes calldata data) external view returns (bytes memory) {
        string[] memory urls = new string[](1);
        urls[0] = gatewayUrl;
        bytes memory callData = abi.encode(name, data);
        revert OffchainLookup(
            address(this),
            urls,
            callData,
            this.resolveWithProof.selector,
            callData
        );
    }

    function resolveWithProof(bytes calldata response, bytes calldata extraData)
        external
        view
        returns (bytes memory)
    {
        (bytes memory result, uint64 expires, bytes memory sig) = abi.decode(
            response,
            (bytes, uint64, bytes)
        );
        require(expires >= block.timestamp, "response expired");

        bytes32 digest = _toEthSignedMessageHash(keccak256(abi.encode(result, expires, extraData)));
        require(_recoverSigner(digest, sig) == signer, "bad signature");
        return result;
    }

    function _toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function _recoverSigner(bytes32 digest, bytes memory sig) internal pure returns (address) {
        require(sig.length == 65, "bad sig length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(sig, 0x20))
            s := mload(add(sig, 0x40))
            v := byte(0, mload(add(sig, 0x60)))
        }
        if (v < 27) v += 27;
        return ecrecover(digest, v, r, s);
    }
}
