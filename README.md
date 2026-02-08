# Mandinga

**Interest-Free Community Credit Protocol with USDC-Native Settlement**

Mandinga is a protocol for organizing community-based credit.

It enables groups to coordinate access to large amounts of capital through
shared commitment, fixed installments, and transparent rules without
interest and without centralized operators.

Participants receive capital first and repay over time.

---

![Mandinga Wireframe](/wire.png)

---

## Proof of Implementation

- Smart Contracts: `/contracts`
- VRF Consumer: `/contracts/DrawConsumer.sol`
- ENS Resolver: `/contracts/MandingaResolver.sol`
- Tests: `/test`
- Frontend: `/frontend`

---


## Overview

Access to credit is essential for housing, education, work, travel, and life events.

In many communities, people already organize informal systems to:

- Pool money  
- Rotate payouts  
- Share risk  
- Enforce commitment socially  

These systems work, but they rely on trust, proximity, and manual coordination.

Mandinga encodes this coordination in software.

It provides a programmable credit machine that allows communities to
organize, operate, and settle shared financing in a transparent way.

---

## What Mandinga Enables

With Mandinga, communities can create credit circles around real goals:

- Housing  
- Education  
- Devices  
- Businesses  
- Travel  
- Events  

Each circle defines:

- Target payout amount  
- Duration  
- Monthly installment  
- Payout windows  
- Participation rules  

Participants commit to a plan and interact with a system that enforces it.

---

## How It Works

Mandinga standardizes community credit into a simple structure.

### 1. Define a Goal

A community creates a circle around a concrete objective.

Example:

> “We want to fund $25,000 for conference travel.”

---

### 2. Commit to Installments

Participants agree to pay a fixed amount every month.

Example:

> $100 per month for 24 months.

---

### 3. Choose a Payout Window

Each participant selects when they prefer to receive funds:

- Early  
- Middle  
- Late  

This balances urgency, risk, and incentives.

---

### 4. Join the Circle

To join, a participant:

- Deposits the first installment  
- Receives a position NFT  
- Activates their quota  

---

### 5. Operate

Over time, participants:

- Pay installments  
- Track progress  
- Accumulate claim tokens  
- Maintain eligibility  

The protocol enforces the rules.

---

### 6. Settle

At settlement:

- Claim tokens are burned  
- USDC is redeemed  
- Positions are closed  

All accounting is deterministic.

---

## Shared Commitment Model

Mandinga is based on shared responsibility.

Each participant:

- Commits to a schedule  
- Shares risk with the group  
- Benefits from collective reliability  

There is no interest.

Instead, risk is handled through:

- Structured quotas  
- Participation constraints  
- Buyback mechanisms  
- Protocol rules  

Commitment becomes infrastructure.

---

## System Architecture

Mandinga is composed of three core layers.

---

### Circle (Vault Contract)

Each circle is a vault contract that:

- Holds USDC  
- Tracks contributions  
- Executes payouts  
- Enforces rules  
- Handles settlement  

The vault is the financial core.

---

### Position NFT (ERC-721)

Each participant receives an NFT that:

- Represents their quota  
- Stores participation history  
- Encodes status  
- Persists identity  

The NFT is the social and historical layer.

---

### Claim Tokens (ERC-20)

Installments mint ERC20 claim tokens that:

- Represent proportional vault exposure  
- Enable deterministic redemption  
- Can be transferred before snapshots  
- Are burned on settlement  

The ERC20 layer is the financial exposure layer.

---

NFT = participation  
ERC20 = exposure  

This separation enables transparent accounting and predictable settlement,
and provides a foundation for future governance and risk coordination.

---

## ENS Integration

Each circle is assigned an ENS identity.

Examples:

- devcon.mandinga.eth  
- housing-100k.mandinga.eth  
- education-fund.mandinga.eth  

Metadata is resolved using an EIP-3668 (CCIP Read) offchain resolver.

This enables:

- Flexible naming  
- Signed metadata  
- Minimal onchain storage  
- Verifiable discovery  

---

## Randomized Selection

Where randomization is required, Mandinga uses Chainlink VRF.

All draws are:

- Public  
- Verifiable  
- Tamper-resistant  

This ensures fair and auditable selection.

---

## Settlement Model

Mandinga uses burn-on-redeem settlement.

Flow:
redeem → burn → transfer

Rules:

- 1 claim token = 1 unit of exposure  
- No double redemption  
- Burn removes liability  

This guarantees solvency.

---

## Economic Model

- Installments purchase participation  
- Claims represent exposure  
- Holding enables redemption  
- Selling transfers position  

There is:

- No inflation  
- No yield farming  
- No hidden fees  
- No speculative rewards  

Mandinga is designed for coordination, not extraction.

---

## Transparency Layer

All circles expose public data:

- Active quotas  
- Filled positions  
- Remaining seats  
- Contribution history  
- Payout records  
- Default rates  

Anyone can audit any circle.

---

## Example Circles

### Devcon Travel Circle

- Participants: 400  
- Monthly installment: $50  
- Payout: $20,000  
- Duration: 24 months  

Supports travel and accommodation.

---

### Housing Circle

- Participants: 2,000  
- Monthly installment: $250  
- Payout: $500,000  
- Duration: 84 months  

Supports housing acquisition.

---

### Education Fund

- Participants: 300  
- Monthly installment: $80  
- Payout: $24,000  
- Duration: 48 months  

Supports training and certification.

---

## Frontend Architecture

The frontend is contract-first.

It reflects the full lifecycle of each circle by reading directly from
onchain state:

- Contribution status  
- Payout schedules  
- Claim balances  
- Participation constraints  
- Settlement conditions  

There is no hidden logic.

The interface mirrors the protocol.

---

## Tech Stack

- Solidity  
- Hardhat / Foundry  
- Arc + USDC  
- Chainlink VRF  
- ENS (EIP-3668)  
- IPFS  

---

## Repository Structure

/contracts     Smart contracts
/test          Unit tests
/frontend      Web interface
/scripts       Deployment tools


---

## Roadmap

- Agentic credit
- Quota secondary markets  
- Credit reputation models  
- Cross-chain circles  
- Privacy layers
- Institutional rails  

---

## Vision

Mandinga is a protocol for predictable, collective access to credit.

It encodes how communities already organize financing
and provides them with durable infrastructure to do it openly,
reliably, and without interest.

Shared commitment becomes programmable coordination.

![Mandinga cover](/cover.png)
