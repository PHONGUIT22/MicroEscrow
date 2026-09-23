import { useMemo } from "react";
import { useAccount, useChainId, useReadContract, useWatchContractEvent } from "wagmi";
import { getEscrowContractAddress, MICRO_ESCROW_ABI } from "@/config/contracts";
import { EscrowContractData, EscrowItem, EscrowMetadata, EscrowStatus } from "@/types/escrow";
import { formatDeadline, formatEth, getStatusConfig } from "@/lib/utils";

/**
 * @notice Custom hook to read and synchronize a single Escrow milestone in real time.
 * @param escrowId The numeric or BigInt identifier of the escrow.
 */
export function useEscrow(escrowId?: number | bigint) {
  const chainId = useChainId();
  const contractAddress = getEscrowContractAddress(chainId);

  const validEscrowId = escrowId !== undefined && escrowId !== null ? BigInt(escrowId) : undefined;

  // 1. Read escrow data from smart contract
  const {
    data: rawEscrow,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    address: contractAddress,
    abi: MICRO_ESCROW_ABI,
    functionName: "getEscrow",
    args: validEscrowId ? [validEscrowId] : undefined,
    query: {
      enabled: validEscrowId !== undefined && validEscrowId > BigInt(0),
    },
  });

  // 2. Real-time event watchers: Automatically refetch on any status-changing event
  useWatchContractEvent({
    address: contractAddress,
    abi: MICRO_ESCROW_ABI,
    eventName: "WorkSubmitted",
    onLogs() {
      refetch();
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: MICRO_ESCROW_ABI,
    eventName: "FundsReleased",
    onLogs() {
      refetch();
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: MICRO_ESCROW_ABI,
    eventName: "DisputeRaised",
    onLogs() {
      refetch();
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: MICRO_ESCROW_ABI,
    eventName: "DisputeResolved",
    onLogs() {
      refetch();
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: MICRO_ESCROW_ABI,
    eventName: "EscrowRefunded",
    onLogs() {
      refetch();
    },
  });

  // 3. Format raw contract struct into a UI-friendly EscrowItem
  const escrow: EscrowItem | null = useMemo(() => {
    if (!rawEscrow) return null;

    // Type casting raw output tuple
    const data = rawEscrow as unknown as EscrowContractData;
    const deadlineNum = Number(data.deadline);
    const { formattedDate, isExpired } = formatDeadline(deadlineNum);
    const statusCfg = getStatusConfig(data.status);

    let parsedMetadata: EscrowMetadata | undefined;
    if (data.metadataURI && data.metadataURI.startsWith("{")) {
      try {
        parsedMetadata = JSON.parse(data.metadataURI);
      } catch {
        // Fallback if not JSON string
      }
    }

    return {
      id: Number(data.id),
      rawId: data.id,
      client: data.client,
      freelancer: data.freelancer,
      amountWei: data.amount,
      amountEth: formatEth(data.amount),
      status: data.status,
      statusLabel: statusCfg.label,
      deadlineTimestamp: deadlineNum,
      deadlineDateFormatted: formattedDate,
      isExpired,
      metadataURI: data.metadataURI,
      proofURI: data.proofURI,
      metadata: parsedMetadata,
    };
  }, [rawEscrow]);

  return {
    escrow,
    rawEscrow,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * @notice Custom hook to read the global total escrow count.
 */
export function useEscrowCount() {
  const chainId = useChainId();
  const contractAddress = getEscrowContractAddress(chainId);

  return useReadContract({
    address: contractAddress,
    abi: MICRO_ESCROW_ABI,
    functionName: "getEscrowCount",
  });
}