# ENS Offchain Gateway (CCIP Read)

This gateway implements a minimal EIP-3668 CCIP Read responder compatible with
`contracts/src/OffchainResolver.sol`. It serves `addr` and `text` lookups from a
JSON records file in the format used by the ENS offchain gateway example:
https://github.com/ensdomains/offchain-resolver/tree/main/packages/gateway

## Environment

```
PORT=8080
GATEWAY_SIGNER_PRIVATE_KEY=0x...
GATEWAY_TTL_SECONDS=300
GATEWAY_RECORDS_PATH=apps/gateway/records.json
```

## Records format

`records.json` follows the ENS gateway JSON layout:

```
{
  "example.eth": {
    "addresses": { "60": "0x1234..." },
    "text": { "description": "Example name" }
  },
  "*.example.eth": {
    "addresses": { "60": "0x1234..." },
    "text": { "description": "Wildcard record" }
  }
}
```

## Local run

```
bun --filter "./apps/gateway" run dev
```

The server accepts `GET` or `POST` requests with `sender` and `data` parameters
(as specified by EIP-3668). It returns `{ "data": "0x..." }` with the signed
response bytes.

## Vercel deployment

1. Create a new Vercel project with root set to `apps/gateway`.
2. Set environment variables:
   - `GATEWAY_SIGNER_PRIVATE_KEY`
   - `GATEWAY_TTL_SECONDS`
   - `GATEWAY_RECORDS_PATH=apps/gateway/records.json`
3. Deploy. The gateway URL for your resolver should be:
   - `https://<your-project>.vercel.app/api/ccip-read`
