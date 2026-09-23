# Deployment Guide & Verified Addresses

This document provides step-by-step instructions for deploying and verifying the **MicroEscrow** protocol across supported Ethereum Layer-2 testnets.

---

## 1. Supported Networks & RPC Endpoints

| Network | Chain ID | Public RPC Endpoint | Block Explorer |
| :--- | :---: | :--- | :--- |
| **Base Sepolia** | `84532` | `https://sepolia.base.org` | [sepolia.basescan.org](https://sepolia.basescan.org/) |
| **Arbitrum Sepolia** | `421614` | `https://sepolia-rollup.arbitrum.io/rpc` | [sepolia.arbiscan.io](https://sepolia.arbiscan.io/) |
| **Localhost (Anvil)** | `31337` | `http://127.0.0.1:8545` | N/A |

---

## 2. Testnet Faucets (Free Testnet ETH)

Before deploying, ensure your deployer wallet holds a small amount of testnet ETH (0.01 ETH is plenty):

- **Base Sepolia Faucets:**
  - [Superchain Faucet](https://console.optimism.io/faucet)
  - [Coinbase Developer Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
  - [QuickNode Base Sepolia Faucet](https://faucet.quicknode.com/base/sepolia)
- **Arbitrum Sepolia Faucets:**
  - [Arbitrum Official Faucet](https://faucet.arbitrum.io/)
  - [QuickNode Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)

---

## 3. Deployment Instructions (Foundry)

### Step 1: Set Environment Variables
In your terminal, set your deployer private key (and optionally an arbiter address):

**On Windows (PowerShell):**
```powershell
$env:PRIVATE_KEY="your_deployer_private_key_without_quotes"
```

**On Linux / macOS (Bash):**
```bash
export PRIVATE_KEY="your_deployer_private_key"
```

---

### Step 2: Deploy to Base Sepolia
```powershell
cd contracts
forge script script/Deploy.s.sol `
  --rpc-url https://sepolia.base.org `
  --broadcast `
  --verify `
  --etherscan-api-key YOUR_BASESCAN_API_KEY
```

*(Note: `--verify` and `--etherscan-api-key` are optional if you just want to deploy quickly).*

---

### Step 3: Deploy to Arbitrum Sepolia
```powershell
cd contracts
forge script script/Deploy.s.sol `
  --rpc-url https://sepolia-rollup.arbitrum.io/rpc `
  --broadcast
```

---

## 4. Verified Contract Addresses

| Contract | Network | Address | Explorer Link |
| :--- | :--- | :--- | :--- |
| `MicroEscrow` | **Base Sepolia** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | [View on Basescan](https://sepolia.basescan.org/) |
| `MicroEscrow` | **Arbitrum Sepolia** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | [View on Arbiscan](https://sepolia.arbiscan.io/) |
| `MicroEscrow` | **Localhost (Anvil)** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | Local RPC `http://127.0.0.1:8545` |

---

## 5. Connecting Frontend to Deployed Contracts

Once deployed, copy the output contract address and place it in `web/.env.local`:

```env
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

The Next.js application automatically detects the chain and injects the corresponding contract ABI and address.
