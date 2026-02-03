# 🤞 Mandinga Protocol  
**Protocol for Group-Based, Interest-Free Credit**

Mandinga is a protocol for organizing installment-based financing around concrete goals such as:

- Housing  
- Education  
- Devices  
- Businesses  
- Life events  

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

Each participant joins a circle, selects a payout window, and follows a predefined contribution plan.

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

### 3. Select Payout Window

“When do you want to receive?”

Choose a quota window:

- Early  
- Middle  
- Late  

Each window represents a phase of the circle lifecycle.

Payouts are distributed using verifiable randomness among eligible participants within each phase.

Earlier windows prioritize early access.  
Later windows prioritize lower cost and stability.

---

### 4. Join Circle

- Deposit first installment  
- Mint position NFT  
- Activate quota window  

---

### 5. Operate

- Pay monthly before deadline  
- Track payment status  
- Remain eligible for payouts  
- Sell to Vault (buyback)  

---

### 6. Settle

- Burn claims  
- Redeem USDC  
- Close position  

---

## 📅 Monthly Rounds

Each circle operates in deterministic monthly rounds.

At every round:

- Installments are collected  
- Late payments are flagged  
- Eligible positions are computed  
- Chainlink VRF selects recipients  
- Payouts are executed  
- States are updated  

Only participants who are up to date remain eligible.

This replaces manual meetings with onchain execution.

---

## 🔄 Payout Window Mechanism

Mandinga implements payout predictability using time-based windows.

Each circle duration is divided into three phases:

- Phase 1: Early  
- Phase 2: Middle  
- Phase 3: Late  

At each phase:

- Only participants assigned to that window are eligible  
- Chainlink VRF selects a recipient  
- The winner receives the payout  
- The position is marked as settled  

This creates predictability without fixing exact payout months.

Participants know when they will receive within a range, while preserving fairness and verifiability.

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
- Mint ERC20 Claims  

### 3. Contribution
- Monthly payments  
- Mint more ERC20 Claims  
- Update records  

### 4. Operation
- Enforce defaults  
- Enable buyback  

### 5. Trigger
- Freeze  
- Snapshot  

### 6. Settlement
- Burn ERC20 Claims  
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

## ⚠️ Default & Exit Handling

If a participant misses multiple installments:

- The position becomes delinquent  
- Payout eligibility is suspended  
- Buyback is enforced with penalty  

Funds already contributed remain in the system.

This protects the collective pool.

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
- Dynamic payout window weighting  
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
