import { Address } from "viem";
import { arbitrumSepolia, baseSepolia, localhost } from "viem/chains";

/**
 * @notice Multi-chain contract address registry
 */
export const ESCROW_CONTRACT_ADDRESSES: Record<number, Address> = {
  [localhost.id]: (process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS ||
    "0x5FbDB2315678afecb367f032d93F642f64180aa3") as Address,
  [arbitrumSepolia.id]: (process.env.NEXT_PUBLIC_ARBITRUM_ESCROW_ADDRESS ||
    process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as Address,
  [baseSepolia.id]: (process.env.NEXT_PUBLIC_BASE_ESCROW_ADDRESS ||
    process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as Address,
};

/**
 * @notice Helper to get the target contract address for a given chain ID
 */
export function getEscrowContractAddress(chainId?: number): Address {
  if (chainId && ESCROW_CONTRACT_ADDRESSES[chainId]) {
    return ESCROW_CONTRACT_ADDRESSES[chainId];
  }
  // Default to localhost or Arbitrum Sepolia
  return ESCROW_CONTRACT_ADDRESSES[localhost.id] || ESCROW_CONTRACT_ADDRESSES[arbitrumSepolia.id];
}

/**
 * @notice MicroEscrow ABI with `as const` for strict TypeScript Viem/Wagmi inference
 */
export const MICRO_ESCROW_ABI = [
  // Constructor
  {
    type: "constructor",
    inputs: [{ name: "initialArbiter", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  // Custom Errors
  { type: "error", name: "DeadlineNotPassed", inputs: [{ name: "deadline", type: "uint256" }, { name: "currentTimestamp", type: "uint256" }] },
  { type: "error", name: "EmptyProofURI", inputs: [] },
  { type: "error", name: "EscrowNotFound", inputs: [{ name: "escrowId", type: "uint256" }] },
  { type: "error", name: "EtherTransferFailed", inputs: [{ name: "recipient", type: "address" }, { name: "amount", type: "uint256" }] },
  { type: "error", name: "InvalidDeadline", inputs: [{ name: "deadline", type: "uint256" }, { name: "currentTimestamp", type: "uint256" }] },
  { type: "error", name: "InvalidEscrowStatus", inputs: [{ name: "escrowId", type: "uint256" }, { name: "current", type: "uint8" }, { name: "expected", type: "uint8" }] },
  { type: "error", name: "InvalidSplitPercentage", inputs: [{ name: "percentage", type: "uint8" }] },
  { type: "error", name: "SelfEscrowNotAllowed", inputs: [] },
  { type: "error", name: "UnauthorizedCaller", inputs: [{ name: "caller", type: "address" }] },
  { type: "error", name: "ZeroAddress", inputs: [] },
  { type: "error", name: "ZeroDeposit", inputs: [] },
  // Events
  {
    type: "event",
    name: "EscrowCreated",
    inputs: [
      { name: "escrowId", type: "uint256", indexed: true },
      { name: "client", type: "address", indexed: true },
      { name: "freelancer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "deadline", type: "uint256", indexed: false },
      { name: "metadataURI", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "WorkSubmitted",
    inputs: [
      { name: "escrowId", type: "uint256", indexed: true },
      { name: "freelancer", type: "address", indexed: true },
      { name: "proofURI", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "FundsReleased",
    inputs: [
      { name: "escrowId", type: "uint256", indexed: true },
      { name: "freelancer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DisputeRaised",
    inputs: [
      { name: "escrowId", type: "uint256", indexed: true },
      { name: "raisedBy", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "DisputeResolved",
    inputs: [
      { name: "escrowId", type: "uint256", indexed: true },
      { name: "clientAmount", type: "uint256", indexed: false },
      { name: "freelancerAmount", type: "uint256", indexed: false },
      { name: "splitPercentage", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "EscrowRefunded",
    inputs: [
      { name: "escrowId", type: "uint256", indexed: true },
      { name: "client", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  // Read Functions
  {
    type: "function",
    name: "getEscrow",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IMicroEscrow.Escrow",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "client", type: "address", internalType: "address" },
          { name: "freelancer", type: "address", internalType: "address" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "status", type: "uint8", internalType: "enum IMicroEscrow.EscrowStatus" },
          { name: "deadline", type: "uint256", internalType: "uint256" },
          { name: "metadataURI", type: "string", internalType: "string" },
          { name: "proofURI", type: "string", internalType: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEscrowCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  // Write Functions
  {
    type: "function",
    name: "createEscrow",
    inputs: [
      { name: "freelancer", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
      { name: "metadataURI", type: "string", internalType: "string" },
    ],
    outputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "submitWork",
    inputs: [
      { name: "escrowId", type: "uint256", internalType: "uint256" },
      { name: "proofURI", type: "string", internalType: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "releaseFunds",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "raiseDispute",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resolveDispute",
    inputs: [
      { name: "escrowId", type: "uint256", internalType: "uint256" },
      { name: "splitPercentage", type: "uint8", internalType: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimTimeoutRefund",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;