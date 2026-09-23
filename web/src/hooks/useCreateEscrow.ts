import { useState, useCallback } from "react";
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { isAddress, parseEther, Address } from "viem";
import { getEscrowContractAddress, MICRO_ESCROW_ABI } from "@/config/contracts";
import { CreateEscrowFormData } from "@/types/escrow";

export function useCreateEscrow() {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const contractAddress = getEscrowContractAddress(chainId);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Wagmi contract write & confirmation hooks
  const {
    writeContractAsync,
    data: txHash,
    isPending: isAwaitingWallet,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  /**
   * @notice Validates form parameters and submits the createEscrow transaction.
   */
  const handleCreateEscrow = useCallback(
    async (formData: CreateEscrowFormData): Promise<`0x${string}` | null> => {
      setValidationError(null);

      // 1. Validation checks
      if (!userAddress) {
        setValidationError("Please connect your wallet first.");
        return null;
      }

      if (!isAddress(formData.freelancerAddress)) {
        setValidationError("Invalid freelancer Ethereum address format.");
        return null;
      }

      if (formData.freelancerAddress.toLowerCase() === userAddress.toLowerCase()) {
        setValidationError("You cannot create an escrow milestone with yourself.");
        return null;
      }

      const ethAmountNum = parseFloat(formData.amountEth);
      if (isNaN(ethAmountNum) || ethAmountNum <= 0) {
        setValidationError("Deposit amount must be greater than 0 ETH.");
        return null;
      }

      if (!formData.durationInDays || formData.durationInDays <= 0) {
        setValidationError("Duration must be at least 1 day.");
        return null;
      }

      if (!formData.title.trim()) {
        setValidationError("Milestone title is required.");
        return null;
      }

      try {
        // 2. Compute parameters
        const depositValueWei = parseEther(formData.amountEth);
        const durationSeconds = Math.floor(formData.durationInDays * 86400);
        const deadlineTimestamp = BigInt(Math.floor(Date.now() / 1000) + durationSeconds);

        // Package metadata scope into JSON payload
        const metadataPayload = JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          createdAt: Date.now(),
        });

        // 3. Dispatch transaction
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: MICRO_ESCROW_ABI,
          functionName: "createEscrow",
          args: [formData.freelancerAddress as Address, deadlineTimestamp, metadataPayload],
          value: depositValueWei,
        });

        return hash;
      } catch (err: any) {
        console.error("Create Escrow Error:", err);
        setValidationError(err?.shortMessage || err?.message || "Transaction rejected or failed.");
        return null;
      }
    },
    [userAddress, contractAddress, writeContractAsync]
  );

  const reset = () => {
    setValidationError(null);
    resetWrite();
  };

  return {
    createEscrow: handleCreateEscrow,
    txHash,
    receipt,
    isAwaitingWallet,
    isConfirming,
    isSuccess,
    error: validationError || (writeError ? writeError.message : null),
    reset,
  };
}