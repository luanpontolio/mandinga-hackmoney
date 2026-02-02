# 🟣 Mandinga Protocol  
**Onchain Coordination for Collective Savings Groups**

Mandinga is a protocol for running consórcio-style savings groups onchain around concrete objectives such as:

- Housing
- Education
- Devices
- Businesses
- Leisure

It enables groups of participants to coordinate recurring payments and collective payouts using smart contracts, verifiable randomness, and public accounting.

The protocol encodes the rules of participation, payout, and settlement.

---

![Mandinga Banner](./images/banner.png)

---


## 🚀 TL;DR (For Judges)

Mandinga is an onchain [consortium(https://en.wikipedia.org/wiki/Consortium)] protocol.

It allows groups to create collective savings pools where:

- Participants contribute fixed installments
- Funds are aggregated automatically
- Payouts are selected by Chainlink VRF
- Obligations are enforced by contracts
- Settlement is deterministic

All operations are observable and reproducible.


---


## 🔗 Proof of Implementation

- Smart Contracts: `/contracts`
- VRF Consumer: `/contracts/RandomnessConsumer.sol`
- ENS Integration: `/contracts/ENSRegistry.sol`
- Tests: `/test`
- Frontend: `/frontend`
- Demo: [link]
- Deployment: [address]

---

## 🌍 Why Mandinga?

Consórcios work because participants follow shared rules over time.

These systems rely on:

- Regular contributions
- Predictable payouts
- Collective risk
- Long-term commitment

Mandinga formalizes these dynamics in software.

It removes the need for manual coordination by encoding:

- Contribution schedules
- Payout selection
- Default handling
- Exit conditions
- Settlement logic

Participants interact with a system that executes these rules.

---

## 🔍 What the Protocol Provides

For each circle, Mandinga provides:

- A treasury contract for fund custody
- A position record for each participant
- A claim system for settlement
- A randomness module for payout selection
- A public registry

The protocol manages:

- Payment tracking
- Balance accounting
- Missed payments
- Buyback and exit
- Final settlement

---

## 🧱 System Architecture

Mandinga is composed of three main components.

### Circle (Vault)

- Holds USDC
- Enforces parameters
- Executes payouts
- Freezes state at trigger
- Handles settlement

### Position NFT

- Represents a participant’s position
- Stores contribution history
- Encodes participation status
- Persists across lifecycle

### ERC20 Claims

- Minted from installments
- Represent settlement rights
- Transferable before snapshot
- Burned on redemption

NFTs track participation.  
ERC20 tracks economic claims.

---

## 🌐 ENS Registry

Each circle is registered under ENS.

Examples:

- devcon.mandinga.eth  
- housing-100k.mandinga.eth  
- education-fund.mandinga.eth  

ENS records include:

- Circle goal
- Vault address
- Parameters
- Status
- Execution proof

This enables public discovery and verification.

---

## 🔁 Lifecycle

### 1. Creation
- Vault deployed
- ENS registered
- Parameters defined

### 2. Joining
- Participant deposits USDC
- Position NFT minted
- Initial claims issued

### 3. Contribution
- Monthly payments
- Claims minted
- Records updated

### 4. Operation
- Transfers allowed (pre-snapshot)
- Default rules enforced
- Buyback enabled

### 5. Trigger
- Goal reached or deadline
- Transfers frozen
- Snapshot taken

### 6. Settlement
- Claims burned
- USDC redeemed

### 7. Execution
- Funds released
- Proof recorded

### 8. Closure
- Supply exhausted
- Circle archived

---

## 🔐 Burn-on-redeem Settlement

Only ERC20 holders at snapshot can redeem.

Flow:
redeem(amount)
→ burn(amount)
→ transfer USDC


Rules:

- One token = one claim unit
- No double redemption
- Burn removes liability

This guarantees solvency at settlement.

---

## 💰 Economic Model

Installments = purchasing ownership  
ERC20 = ownership  
Holding ERC20 = settlement right  
Selling ERC20 = transferring exposure  

No inflation.  
No yield farming.  
No artificial incentives.

Random payouts are the coordination mechanism.

They redistribute liquidity over time in a verifiable way.

---

## 📖 Feature Examples

Mandinga is designed for coordination between participants who do not necessarily know each other.

Trust is replaced by verifiable execution.

---

### Devcon Scholarship

- Participants: 400  
- Monthly installment: $50  
- Monthly payout: $20,000  
- Duration: ~2 years (24 rounds)

Calculation:

400 × $50 = $20,000

Each month, one participant receives the payout via VRF selection.
Supporting collective travel, accommodation, and all things needed at DEVCON.

---

### Housing Consortium

- Participants: 2,000  
- Monthly installment: $250  
- Monthly payout: $500,000  
- Duration: ~7 years (84 rounds)

Calculation:

2,000 × $250 = $500,000

Each month, one participant receives the payout via VRF selection.

Supports large real estate developments and infrastructure projects.

---

### Education Fund

- Participants: 300  
- Monthly installment: $80  
- Monthly payout: $24,000  
- Duration: ~4 years (48 rounds)

Calculation:

300 × $80 = $24,000

Each month, one participant receives the payout via VRF selection.

Supports tuition, certifications, and professional training.

---

## 🎲 Verifiable Randomness

All payouts are selected using Chainlink VRF.

Each draw is:

- Cryptographically verifiable  
- Publicly auditable  
- Tamper-resistant  
- Independent from organizers  

This enables coordination between strangers at scale.

---

## ⚙️ Tech Stack

- Solidity  
- Hardhat / Foundry  
- Arc + USDC (Circle Gateway / Wallets)  
- Chainlink VRF  
- ENS  
- IPFS (optional)  

---

## 🏆 HackMoney Tracks & Partner Alignment

### Arc / Circle

- USDC-native vaults  
- Automated treasury settlement  
- Multi-circle liquidity routing  
- Gateway + Wallet integration  

### ENS

- ENS-based circle registry  
- Text records for parameters  
- Human-readable contract identities  

### Agent / Automation (Planned)

- Automated monitoring
- Policy-based payouts
- Future agent integration

---

## 🚧 Roadmap

- DAO-based governance
- Cross-chain settlement via Arc
- Credit primitives
- Privacy-preserving balances
- Automated agents
- Institutional integrations

---

## 🌐 Deployments

- Testnet: [address]
- Demo: [link]
- Docs: [link]

---

## 🧠 Team


---

## 📜 License

MIT

---

## 🌱 Vision

Mandinga is infrastructure for collective capital formation.

It provides programmable coordination for groups that need access to large capital without centralized intermediaries.
