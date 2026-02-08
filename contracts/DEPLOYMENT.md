# Contract Deployment Notes

## OffchainResolver (Arc testnet)

Required env vars:

```
RPC_URL=https://rpc.testnet.arc.network
CHAIN_ID=5042002
PRIVATE_KEY=0x...
GATEWAY_URL=https://your-gateway.vercel.app/api/ccip-read
GATEWAY_SIGNER_ADDRESS=0x...
```

Deploy:

```
cd contracts
forge script script/DeployOffchainResolver.s.sol:DeployOffchainResolver \
  --rpc-url "$RPC_URL" \
  --chain-id "$CHAIN_ID" \
  --broadcast
```
