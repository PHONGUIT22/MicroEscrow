import { Address } from "viem";

/**
 * @notice Numeric enumeration matching the EscrowStatus enum in MicroEscrow.sol
 */
export enum EscrowStatus {
  Created = 0,
  Funded = 1,
  Submitted = 2,
  Completed = 3,
  Disputed = 4,
  Refunded = 5,
}

/**
 * @notice On-chain Escrow structure directly reflecting contract storage
 */
export interface EscrowContractData {
  id: bigint;
  client: Address;
  freelancer: Address;
  amount: bigint;
  status: EscrowStatus;
  deadline: bigint;
  metadataURI: string;
  proofURI: string;
}

/**
 * @notice Decoded metadata payload typically stored on decentralized storage (IPFS/Arweave)
 */
export interface EscrowMetadata {
  title: string;
  description: string;
  deliverables?: string[];
  category?: string;
  createdAt?: number;
}

/**
 * @notice Formatted UI-friendly Escrow Item combining raw on-chain state and decoded metadata
 */
export interface EscrowItem {
  id: number;
  rawId: bigint;
  client: Address;
  freelancer: Address;
  amountWei: bigint;
  amountEth: string;
  status: EscrowStatus;
  statusLabel: string;
  deadlineTimestamp: number;
  deadlineDateFormatted: string;
  isExpired: boolean;
  metadataURI: string;
  proofURI: string;
  metadata?: EscrowMetadata;
}

/**
 * @notice Form input data for creating a new milestone escrow
 */
export interface CreateEscrowFormData {
  freelancerAddress: string;
  amountEth: string;
  durationInDays: number;
  title: string;
  description: string;
}

/**
 * @notice Form data for freelancer deliverable submission
 */
export interface SubmitWorkFormData {
  escrowId: number;
  proofURI: string;
  submissionNotes?: string;
}

/**
 * @notice Form data for arbiter dispute resolution
 */
export interface ResolveDisputeFormData {
  escrowId: number;
  splitPercentageToFreelancer: number; // 0 to 100
}

/**
 * @notice Filter tab options for Dashboard view
 */
export type EscrowFilterTab = "all" | "as-client" | "as-freelancer" | "active" | "disputed";