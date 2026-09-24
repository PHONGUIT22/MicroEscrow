# Deployment Information - MicroEscrow

## 1. Verified Live Deployment (Base Sepolia Testnet)

The core `MicroEscrow` protocol is deployed and active on Ethereum Layer-2 (Base Sepolia):

- **Network:** Base Sepolia (Chain ID: `84532`)
- **Contract Address:** [`0x57099f3125faF6591f23000E8985E18c0c2202Ac`](https://sepolia.basescan.org/address/0x57099f3125faF6591f23000E8985E18c0c2202Ac)
- **Deployer / Initial Arbiter:** `0xa1bab221F6bFB93AFa3367D8aAA2c7DD5049EC9a`
- **Deployment Transaction Hash:** [`0xb3976987fe4eee2eb5e2d3565cddc78826b16de9abab7855dd8b64d4ae020012`](https://sepolia.basescan.org/tx/0xb3976987fe4eee2eb5e2d3565cddc78826b16de9abab7855dd8b64d4ae020012)
- **Block Explorer Link:** [View Contract on BaseScan](https://sepolia.basescan.org/address/0x57099f3125faF6591f23000E8985E18c0c2202Ac)

---

## 2. Multi-Chain Address Registry

| Network | Chain ID | Contract Address | Explorer Link |
| :--- | :---: | :--- | :--- |
| **Base Sepolia** | `84532` | `0x57099f3125faF6591f23000E8985E18c0c2202Ac` | [BaseScan Explorer](https://sepolia.basescan.org/address/0x57099f3125faF6591f23000E8985E18c0c2202Ac) |
| **Arbitrum Sepolia** | `421614` | `0x57099f3125faF6591f23000E8985E18c0c2202Ac` | [Arbiscan Explorer](https://sepolia.arbiscan.io/) |
| **Localhost (Anvil)** | `31337` | `0x57099f3125faF6591f23000E8985E18c0c2202Ac` | Local RPC `http://127.0.0.1:8545` |

---

## 3. Testnet Faucets (Free Testnet ETH)

- **Base Sepolia Faucets:**
  - [Superchain Faucet (Recommended)](https://console.optimism.io/faucet)
  - [Coinbase Developer Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
  - [QuickNode Base Sepolia Faucet](https://faucet.quicknode.com/base/sepolia)
- **Arbitrum Sepolia Faucets:**
  - [Arbitrum Official Faucet](https://faucet.arbitrum.io/)
  - [QuickNode Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)

---

## 4. How to Deploy (Foundry)

```powershell
cd contracts
$env:PRIVATE_KEY="your_deployer_private_key"
forge script script/Deploy.s.sol --broadcast --rpc-url https://sepolia.base.org
```

---

## 5. Frontend Environment Configuration

In `web/.env.local`:
```env
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x57099f3125faF6591f23000E8985E18c0c2202Ac
NEXT_PUBLIC_BASE_ESCROW_ADDRESS=0x57099f3125faF6591f23000E8985E18c0c2202Ac
```
