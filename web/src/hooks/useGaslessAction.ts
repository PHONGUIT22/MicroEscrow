import { useState, useCallback } from "react";
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { encodeFunctionData } from "viem";
import { getEscrowContractAddress, MICRO_ESCROW_ABI } from "@/config/contracts";
import { isGaslessSupported, requestGaslessSponsorship } from "@/lib/paymaster";

export type EscrowActionType =
  | "submitWork"
  | "releaseFunds"
  | "raiseDispute"
  | "resolveDispute"
  | "claimTimeoutRefund";

export interface GaslessActionParams {
  action: EscrowActionType;
  escrowId: number;
  proofURI?: string;
  splitPercentage?: number;
  useGasless?: boolean;
}

export function useGaslessAction() {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const contractAddress = getEscrowContractAddress(chainId);

  const [isSponsoring, setIsSponsoring] = useState(false);
  const [wasSponsored, setWasSponsored] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fallback direct wallet execution
  const {
    writeContractAsync,
    data: directTxHash,
    isPending: isWalletPending,
    reset: resetWrite,
  } = useWriteContract();

  const [finalTxHash, setFinalTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: finalTxHash,
  });

  /**
   * @notice Coordinates an action on MicroEscrow with Gasless sponsorship or direct fallback
   */
  const executeAction = useCallback(
    async ({
      action,
      escrowId,
      proofURI = "",
      splitPercentage = 0,
      useGasless = true,
    }: GaslessActionParams): Promise<boolean> => {
      setActionError(null);
      setWasSponsored(false);

      if (!userAddress) {
        setActionError("Please connect your wallet first.");
        return false;
      }

      const idBigInt = BigInt(escrowId);

      // 1. Prepare function calldata
      let callData: `0x${string}`;
      try {
        switch (action) {
          case "submitWork":
            callData = encodeFunctionData({
              abi: MICRO_ESCROW_ABI,
              functionName: "submitWork",
              args: [idBigInt, proofURI],
            });
            break;
          case "releaseFunds":
            callData = encodeFunctionData({
              abi: MICRO_ESCROW_ABI,
              functionName: "releaseFunds",
              args: [idBigInt],
            });
            break;
          case "raiseDispute":
            callData = encodeFunctionData({
              abi: MICRO_ESCROW_ABI,
              functionName: "raiseDispute",
              args: [idBigInt],
            });
            break;
          case "resolveDispute":
            callData = encodeFunctionData({
              abi: MICRO_ESCROW_ABI,
              functionName: "resolveDispute",
              args: [idBigInt, splitPercentage],
            });
            break;
          case "claimTimeoutRefund":
            callData = encodeFunctionData({
              abi: MICRO_ESCROW_ABI,
              functionName: "claimTimeoutRefund",
              args: [idBigInt],
            });
            break;
          default:
            throw new Error(`Unsupported action type: ${action}`);
        }
      } catch (encodeErr: any) {
        setActionError(encodeErr?.message || "Failed to encode action calldata.");
        return false;
      }

      // 2. Attempt Gasless execution via Paymaster sponsorship
      const canAttemptGasless = useGasless && isGaslessSupported(chainId);

      if (canAttemptGasless) {
        try {
          setIsSponsoring(true);
          const sponsorshipResult = await requestGaslessSponsorship({
            sender: userAddress,
            targetContract: contractAddress,
            callData,
            chainId,
          });

          if (sponsorshipResult.sponsored) {
            setWasSponsored(true);
            setIsSponsoring(false);
            // If live hash returned from Paymaster/Bundler
            if (sponsorshipResult.sponsorTxHash) {
              setFinalTxHash(sponsorshipResult.sponsorTxHash as `0x${string}`);
            }
            return true;
          }

          console.warn(
            "[Gasless Engine] Sponsorship rejected, falling back to standard wallet execution:",
            sponsorshipResult.errorMessage
          );
        } catch (gaslessErr) {
          console.warn("[Gasless Engine] Relay failed, switching to standard transaction:", gaslessErr);
        } finally {
          setIsSponsoring(false);
        }
      }

      // 3. Fallback: Standard direct on-chain transaction through user's wallet
      try {
        let hash: `0x${string}`;
        if (action === "submitWork") {
          hash = await writeContractAsync({
            address: contractAddress,
            abi: MICRO_ESCROW_ABI,
            functionName: "submitWork",
            args: [idBigInt, proofURI],
          });
        } else if (action === "releaseFunds") {
          hash = await writeContractAsync({
            address: contractAddress,
            abi: MICRO_ESCROW_ABI,
            functionName: "releaseFunds",
            args: [idBigInt],
          });
        } else if (action === "raiseDispute") {
          hash = await writeContractAsync({
            address: contractAddress,
            abi: MICRO_ESCROW_ABI,
            functionName: "raiseDispute",
            args: [idBigInt],
          });
        } else if (action === "resolveDispute") {
          hash = await writeContractAsync({
            address: contractAddress,
            abi: MICRO_ESCROW_ABI,
            functionName: "resolveDispute",
            args: [idBigInt, splitPercentage],
          });
        } else {
          hash = await writeContractAsync({
            address: contractAddress,
            abi: MICRO_ESCROW_ABI,
            functionName: "claimTimeoutRefund",
            args: [idBigInt],
          });
        }

        setFinalTxHash(hash);
        return true;
      } catch (directErr: any) {
        console.error("Direct Action Execution Error:", directErr);
        setActionError(directErr?.shortMessage || directErr?.message || "Transaction cancelled or failed.");
        return false;
      }
    },
    [userAddress, chainId, contractAddress, writeContractAsync]
  );

  const reset = () => {
    setActionError(null);
    setWasSponsored(false);
    setFinalTxHash(undefined);
    resetWrite();
  };

  return {
    executeAction,
    isSponsoring,
    isWalletPending,
    isConfirming,
    isSuccess,
    wasSponsored,
    txHash: finalTxHash || directTxHash,
    error: actionError,
    reset,
  };
}