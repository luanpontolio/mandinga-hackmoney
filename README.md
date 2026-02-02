# 🤞 Mandinga Protocol  
**Protocol for Group-Based, Interest-Free Credit**

Mandinga is a protocol for organizing installment-based financing around concrete goals such as housing, education, devices, businesses, and life events.

It allows groups to coordinate access to large payouts through predictable schedules, transparent rules, and onchain execution.

Participants receive capital first and repay over time.

No banks.  
No interest.  
No opaque intermediaries.

---

## 🚀 TL;DR

Mandinga implements group-based credit coordination onchain.

It enables:

- Fixed monthly installments  
- Scheduled payouts  
- Verifiable selection  
- Deterministic settlement  
- Public accounting  

Each participant joins a circle, selects a payout month, and follows a predefined contribution plan.

---

## 🔗 Proof of Implementation

- Smart Contracts: `/contracts`
- VRF Consumer: `/contracts/RandomnessConsumer.sol`
- ENS Registry: `/contracts/ENSRegistry.sol`
- Tests: `/test`
- Frontend: `/frontend`
- Demo: [link]
- Deployment: [address]

---

## 🌍 Why Mandinga?

Millions of people rely on installment-based financing to access housing, education, and essential assets.

These systems work because:

- Contributions are predictable  
- Payouts are coordinated  
- Risk is shared  
- Commitment is collective  

Mandinga encodes this logic in public, open, and verifiable software.

It transforms social coordination into programmable rules.

---

## 🔍 How Mandinga Encodes Coordination

Instead of relying on informal agreements or institutional operators, the protocol encodes:

- Contribution schedules  
- Payout timing  
- Quota positions  
- Default handling  
- Exit and buyback rules  
- Settlement logic  

All rules are executed by smart contracts.

Social coordination becomes programmable coordination.

Participants interact with a system that enforces these rules transparently. 

---

## 🧭 User Flow

Mandinga standardizes participation into a simple flow.

### 1. Select Payout Amount

“How much do you want to receive?”

Example:
- $20,000
- $50,000
- $500,000

---

### 2. Choose Duration

“How long do you want to pay?”

Examples:
- 2 years  
- 4 years  
- 7 years  

---

### 3. Select Payout Month

“When do you want to receive?”

Choose a quota:

- Early  
- Middle  
- Late  

Each quota has different cost and incentives.

---

### 4. Join Circle

- Deposit first installment  
- Mint position NFT  
- Activate quota  

---

### 5. Operate

- Pay monthly  
- Track status  
- Sell to Vault (buyback) 

---

### 6. Settle

- Burn claims  
- Redeem USDC  
- Close position  

---

## 🧱 System Architecture

Mandinga is composed of three layers.

### Circle (Vault Contract)

- Holds USDC  
- Enforces rules  
- Executes payouts  
- Freezes state  
- Handles settlement  

### Position NFT

- Represents a quota  
- Stores history  
- Encodes status  
- Persists identity  

### ERC20 Claims

- Minted from installments  
- Represent exposure  
- Transferable pre-snapshot  
- Burned on redemption  

NFT = participation  
ERC20 = financial exposure

---

## 🌐 ENS Registry

Each circle has an ENS identity.

Examples:

- devcon.mandinga.eth  
- housing-100k.mandinga.eth  
- education-fund.mandinga.eth  

Records:

- Goal  
- Parameters  
- Vault  
- Status  
- Proof  

---

## 🔁 Lifecycle

### 1. Creation
- Deploy vault  
- Register ENS  
- Set parameters  

### 2. Enrollment
- Deposit  
- Mint NFT  
- Issue claims  

### 3. Contribution
- Monthly payments  
- Mint exposure  
- Update records  

### 4. Operation
- Enforce defaults  
- Enable buyback  

### 5. Trigger
- Freeze  
- Snapshot  

### 6. Settlement
- Burn claims  
- Redeem  

### 7. Execution
- Release funds  
- Record proof  

### 8. Closure
- Archive  

---

## 🔐 Settlement Model

Mandinga uses burn-on-redeem settlement.

Flow:
redeem → burn → transfer

Rules:

- 1 token = 1 unit  
- No double redemption  
- Burn removes liability  

This ensures solvency.

---

## 💰 Economic Model

- Installments purchase access  
- Claims represent exposure  
- Holding enables redemption  
- Selling transfers position  

No inflation.  
No farming.  
No hidden yield.

---

## 🎁 Incentives & Seeding

To ensure fast circle activation:

### Protocol Seeding

Unfilled quotas may be temporarily backed by protocol liquidity.

### Order Incentives

Late quotas may receive:

- Discounts  
- Cashback  
- Reduced installments  

### Cashback

Rewards may be applied to:

- Early payments  
- Large amounts  
- High reliability  

These mechanisms accelerate coordination.

---

## 📊 Transparency Layer

All circles expose:

- Active quotas  
- Filled positions  
- Remaining seats  
- Payout history  
- Default rates  

Anyone can audit.

---

## 📖 Example Circles

---

### Devcon Travel Circle

- Participants: 400  
- Monthly installment: $50  
- Payout: $20,000  
- Duration: 24 months  

400 × $50 = $20,000

Supports travel and accommodation.

---

### Housing Circle

- Participants: 2,000  
- Monthly installment: $250  
- Payout: $500,000  
- Duration: 84 months  

2,000 × $250 = $500,000

Supports housing acquisition.

---

### Education Fund

- Participants: 300  
- Monthly installment: $80  
- Payout: $24,000  
- Duration: 48 months  

300 × $80 = $24,000

Supports training and certification.

---

## 🎲 Verifiable Randomness

Where randomization is required, Mandinga uses Chainlink VRF.

Each draw is:

- Public  
- Verifiable  
- Tamper-resistant  

---

## ⚙️ Tech Stack

- Solidity  
- Hardhat / Foundry  
- Arc + USDC  
- Chainlink VRF  
- ENS  
- IPFS  

---

## 🏆 HackMoney Alignment

- Programmable credit pools  
- USDC-native settlement  
- Public registries  
- Automated enforcement  

---

## 🚧 Roadmap

- Advanced quota markets  
- Credit scoring  
- Cross-chain circles  
- Privacy layers  
- Agent automation  
- Institutional rails  

---

## 🌐 Deployments

See repository links.

---

## 📜 License

MIT

---

## 🌱 Vision

Mandinga is a protocol for predictable, collective access to credit.
It bridges group coordination and programmable finance.
