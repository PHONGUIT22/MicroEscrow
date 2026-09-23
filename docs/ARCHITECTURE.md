# System Architecture & Technical Specification

## 1. Protocol Overview

**MicroEscrow** is a non-custodial, milestone-based escrow protocol engineered to eliminate counterparty risk in freelance and gig-economy relationships. By combining Ethereum Layer-2 networks with gasless meta-transaction execution, MicroEscrow removes the economic friction that prevents crypto-native onboarding for student freelancers.

---

## 2. High-Level Component Architecture

```mermaid
graph TB
    subgraph ClientLayer["Frontend & Client Layer (Next.js 14)"]
        UI["User Interface (Tailwind + Lucide)"]
        WagmiHook["Web3 Hooks (Wagmi v2 + Viem)"]
        RelayClient["Gasless Relayer Client (EIP-712)"]
    end

    subgraph NetworkLayer["Layer-2 Testnet Infrastructure"]
        RPC["L2 JSON-RPC (Base / Arbitrum Sepolia)"]
        Bundler["Paymaster / Gas Sponsor Relayer"]
    end

    subgraph ContractLayer["On-Chain Smart Contracts (Solidity 0.8.24)"]
        MicroEscrow["MicroEscrow.sol (Core State Machine)"]
        IMicroEscrow["IMicroEscrow.sol (Custom Errors & ABI)"]
        Arbiter["Governance / Arbiter Multi-Sig"]
    end

    UI --> WagmiHook
    UI --> RelayClient
    WagmiHook --> RPC
    RelayClient --> Bundler
    Bundler --> MicroEscrow
    RPC --> MicroEscrow
    MicroEscrow -. implements .-> IMicroEscrow
    Arbiter -. resolves disputes in .-> MicroEscrow
```

---

## 3. Finite State Machine (FSM)

The lifecycle of each escrow transaction adheres to a deterministic, non-reentrant state machine:

```mermaid
stateDiagram-v2
    [*] --> CREATED: createEscrow()
    CREATED --> FUNDED: Client deposits ETH (atomic with creation)
    
    FUNDED --> SUBMITTED: submitWork(proofURI)
    FUNDED --> REFUNDED: claimTimeoutRefund() [if deadline passed without submission]
    
    SUBMITTED --> COMPLETED: releaseFunds() [Client approval]
    SUBMITTED --> COMPLETED: releaseFunds() [Freelancer auto-release after deadline]
    
    FUNDED --> DISPUTED: raiseDispute()
    SUBMITTED --> DISPUTED: raiseDispute()
    
    DISPUTED --> COMPLETED: resolveDispute(splitPercentage) [Arbiter]
    
    COMPLETED --> [*]
    REFUNDED --> [*]
```

### State Transitions:
1. **`Created` / `Funded`**: Escrow is created and instantly funded with native ETH via `msg.value`.
2. **`Submitted`**: Freelancer submits deliverable proof (IPFS CID, GitHub PR URL, or documentation hash).
3. **`Completed` (Released)**: Funds are transferred to the freelancer. This occurs either via direct client release OR automated freelancer claim after deadline timeout.
4. **`Disputed`**: Triggerable by either party if deliverables fail requirements or communication breaks down.
5. **`Refunded`**: If deadline passes and the freelancer fails to submit deliverables, the client can reclaim 100% of their deposit.

---

## 4. Sequence Diagrams

### 4.1. Gasless Work Submission (EIP-712 Sponsored Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Freelancer as Freelancer (0 ETH Balance)
    participant ClientApp as MicroEscrow WebApp
    participant Relayer as Sponsorship Paymaster
    participant Escrow as MicroEscrow.sol

    Freelancer->>ClientApp: 1. Input deliverable URI (e.g. "ipfs://QmXYZ...")
    ClientApp->>Freelancer: 2. Request EIP-712 Signature (SubmitWorkRequest)
    Freelancer-->>ClientApp: 3. Return signature (v, r, s)
    ClientApp->>Relayer: 4. Relay signature & payload (HTTP POST)
    Relayer->>Relayer: 5. Verify signature & nonce
    Relayer->>Escrow: 6. Execute submitWork() [Relayer pays L2 gas]
    Escrow->>Escrow: 7. Validate caller / recover signer
    Escrow-->>ClientApp: 8. Emit WorkSubmitted(escrowId, proofURI)
    ClientApp-->>Freelancer: 9. UI updates to SUBMITTED state
```

### 4.2. Dispute Resolution Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Client
    actor Freelancer
    participant Escrow as MicroEscrow.sol
    actor Arbiter as Protocol Arbiter (Owner)

    alt Client raises dispute
        Client->>Escrow: raiseDispute(escrowId)
    else Freelancer raises dispute
        Freelancer->>Escrow: raiseDispute(escrowId)
    end
    Note over Escrow: Status = DISPUTED

    Arbiter->>Escrow: resolveDispute(escrowId, splitPercentage)
    Note over Escrow: e.g. splitPercentage = 70 (70% Freelancer, 30% Client)
    Escrow->>Freelancer: Transfer freelancerShare (70%)
    Escrow->>Client: Transfer clientShare (30%)
    Note over Escrow: Status = COMPLETED
```

---

## 5. Security & Threat Model

| Threat Vector | Mitigation Strategy in MicroEscrow |
| :--- | :--- |
| **Reentrancy Attacks** | Contract inherits OpenZeppelin's `ReentrancyGuard` with `nonReentrant` modifiers applied to `releaseFunds`, `claimTimeoutRefund`, and `resolveDispute`. Follows strict Checks-Effects-Interactions (CEI). |
| **Client Ghosting / Lockup** | Freelancers have guaranteed recourse: if a deliverable has been submitted and the deadline passes without client dispute, the freelancer can directly call `releaseFunds()`. |
| **Freelancer Inaction** | If the deadline passes and `status == Funded` (no work submitted), the client can call `claimTimeoutRefund()` to recover 100% of deposit funds. |
| **Front-running & Griefing** | Only the designated client or freelancer can trigger status mutations on their respective escrows (`UnauthorizedCaller` custom error). |
| **Arithmetic & Splitting Errors** | `splitPercentage` is bounded by `require(splitPercentage <= 100)`. Fractional dust is safely accounted for via standard integer division. |

---

## 6. Gas Optimization Benchmarks (Foundry)

| Function | Execution Gas (avg) | Notes |
| :--- | :---: | :--- |
| `createEscrow` | ~75,000 gas | Initializes storage struct and logs indexed event |
| `submitWork` | ~38,000 gas | Storage update for status & string metadata URI |
| `releaseFunds` | ~45,000 gas | CEI pattern with native ETH transfer |
| `raiseDispute` | ~31,000 gas | Minimal state mutation |
| `resolveDispute` | ~58,000 gas | Performs percentage math and dual ETH disbursements |
