Markdown
# MicroEscrow — Gasless Escrow for Student Freelancers
> Project scaffold & implementation guide for 3rd-Web-Hack (4-Day Sprint)

---

## 1. Tech Stack Overview
- **Smart Contracts:** Foundry (Solidity `^0.8.24`), OpenZeppelin Contracts, ERC-2771 Context (Meta-transactions) / ERC-4337 Paymaster compatibility.
- **Network Target:** Arbitrum Sepolia / Base Sepolia (L2 low fees, fast confirmation).
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Web3 Integration:** Viem, Wagmi v2, TanStack Query, Biconomy / Pimlico SDK (Gasless Paymaster).
- **Pitch & Docs:** Marp / Markdown Pitch Deck, Mermaid.js Architecture Diagram.

---

## 2. Directory Structure

```text
micro-escrow/
├── README.md
├── STRUCTURE.md
├── docs/
│   ├── ARCHITECTURE.md           # System architecture, state machine & sequence diagram
│   ├── PITCH_DECK.md             # Slide deck content (Problem, Solution, Tech, Demo, Impact)
│   └── DEPLOYMENT.md             # Verified contract addresses & testnet links
│
├── contracts/                    # Foundry root
│   ├── foundry.toml
│   ├── src/
│   │   ├── MicroEscrow.sol       # Core escrow logic (state machine, deposits, approvals)
│   │   └── interfaces/
│   │       └── IMicroEscrow.sol  # Interface & custom errors
│   ├── test/
│   │   ├── MicroEscrow.t.sol     # Unit tests (deposit, complete, dispute, refund)
│   │   └── GaslessTest.t.sol     # Meta-transaction signature verification tests
│   └── script/
│       └── Deploy.s.sol          # Foundry deployment script for testnet
│
└── web/                          # Next.js App Router root
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── .env.example
    ├── public/
    │   └── logo.svg
    └── src/
        ├── app/
        │   ├── layout.tsx        # Root layout with Web3 providers
        │   ├── page.tsx          # Landing & Quick Stats
        │   ├── create/
        │   │   └── page.tsx      # Create escrow milestone form
        │   ├── dashboard/
        │   │   └── page.tsx      # Active escrows list (Client & Freelancer views)
        │   └── escrow/
        │       └── [id]/
        │           └── page.tsx  # Detailed escrow action room (Approve, Submit, Dispute)
        │
        ├── components/
        │   ├── ui/               # shadcn/ui base primitives (button, card, dialog, badge)
        │   ├── common/
        │   │   ├── Header.tsx    # Wallet connection & network badge
        │   │   └── Footer.tsx
        │   └── escrow/
        │       ├── EscrowCard.tsx
        │       ├── EscrowStatusBadge.tsx
        │       ├── ActionButtons.tsx
        │       └── GaslessToggle.tsx
        │
        ├── config/
        │   ├── wagmi.ts          # Wagmi client & chain configuration
        │   └── contracts.ts      # ABI & deployed contract addresses
        │
        ├── hooks/
        │   ├── useEscrow.ts      # Read contract states
        │   ├── useCreateEscrow.ts
        │   └── useGaslessAction.ts # ERC-4337 / Meta-tx transaction dispatcher
        │
        ├── lib/
        │   ├── utils.ts          # Formatters (currency, address shorten)
        │   └── paymaster.ts      # Pimlico / Biconomy sponsorship client
        │
        └── types/
            └── escrow.ts         # TypeScript interfaces matching contract structs
3. Core Contract Specification (MicroEscrow.sol)
State Machine
[CREATED] ──(client deposits)──> [FUNDED] ──(freelancer submits work)──> [SUBMITTED]
                                      │                                       │
                                      │                                       ├──(client approves)──> [RELEASED]
                                      │                                       │
                                      └──(dispute triggered by either)───────┴──> [DISPUTED]
                                                                                     │
                                                                       (arbiter resolves)
                                                                                     │
                                                                   ┌─────────────────┴─────────────────┐
                                                                   ▼                                   ▼
                                                          [RESOLVED_CLIENT]                  [RESOLVED_FREELANCER]
Key Structs & Events
Escrow Struct:

uint256 id

address client

address freelancer

uint256 amount

EscrowStatus status (Created, Funded, Submitted, Completed, Disputed, Refunded)

uint256 deadline

string metadataURI (IPFS or hash of work scope/terms)

Functions:

createEscrow(address freelancer, string calldata metadataURI) payable returns (uint256)

submitWork(uint256 escrowId, string calldata proofURI)

releaseFunds(uint256 escrowId)

raiseDispute(uint256 escrowId)

resolveDispute(uint256 escrowId, uint8 splitPercentage) (Owner / Arbiter only)