"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { CheckCircle2, AlertTriangle, Send, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { EscrowItem, EscrowStatus } from "@/types/escrow";
import { useGaslessAction } from "@/hooks/useGaslessAction";

interface ActionButtonsProps {
  escrow: EscrowItem;
  isGaslessEnabled: boolean;
  onActionSuccess?: () => void;
}

export function ActionButtons({ escrow, isGaslessEnabled, onActionSuccess }: ActionButtonsProps) {
  const { address } = useAccount();
  const { executeAction, isSponsoring, isWalletPending, isConfirming, error } = useGaslessAction();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [proofURI, setProofURI] = useState("");

  const isClient = address && escrow.client.toLowerCase() === address.toLowerCase();
  const isFreelancer = address && escrow.freelancer.toLowerCase() === address.toLowerCase();
  const isActionLoading = isSponsoring || isWalletPending || isConfirming;

  // Freelancer submits deliverables
  const handleSubmitWork = async () => {
    if (!proofURI.trim()) return;
    const success = await executeAction({
      action: "submitWork",
      escrowId: escrow.id,
      proofURI,
      useGasless: isGaslessEnabled,
    });
    if (success) {
      setIsSubmitModalOpen(false);
      setProofURI("");
      onActionSuccess?.();
    }
  };

  // Client approves and releases payout
  const handleReleaseFunds = async () => {
    const success = await executeAction({
      action: "releaseFunds",
      escrowId: escrow.id,
      useGasless: isGaslessEnabled,
    });
    if (success) onActionSuccess?.();
  };

  // Either party raises dispute
  const handleRaiseDispute = async () => {
    if (!confirm("Are you sure you want to freeze this escrow and escalate to an Arbiter?")) return;
    const success = await executeAction({
      action: "raiseDispute",
      escrowId: escrow.id,
      useGasless: isGaslessEnabled,
    });
    if (success) onActionSuccess?.();
  };

  // Freelancer claims funds if deadline expired and client didn't respond
  const handleAutoClaim = async () => {
    const success = await executeAction({
      action: "releaseFunds",
      escrowId: escrow.id,
      useGasless: isGaslessEnabled,
    });
    if (success) onActionSuccess?.();
  };

  // Client claims timeout refund if freelancer ghosted
  const handleTimeoutRefund = async () => {
    const success = await executeAction({
      action: "claimTimeoutRefund",
      escrowId: escrow.id,
      useGasless: isGaslessEnabled,
    });
    if (success) onActionSuccess?.();
  };

  return (
    <div className="w-full space-y-4">
      {/* Error alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* DISPUTED STATE */}
      {escrow.status === EscrowStatus.Disputed && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
          <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
          <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Escrow Under Arbiter Review</h4>
          <p className="text-xs text-neutral-500 mt-1">
            Contract funds are safely frozen. An assigned protocol arbiter will review the terms and split funds accordingly.
          </p>
        </div>
      )}

      {/* FREELANCER ACTIONS */}
      {isFreelancer && escrow.status === EscrowStatus.Funded && (
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          disabled={isActionLoading}
          className="w-full py-3.5 px-6 rounded-full bg-[#836EF9] hover:bg-[#725aeb] text-white font-bold text-sm shadow-lg shadow-[#836EF9]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Submit Work Deliverables</span>
        </button>
      )}

      {/* CLIENT ACTIONS WHEN SUBMITTED */}
      {isClient && escrow.status === EscrowStatus.Submitted && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReleaseFunds}
            disabled={isActionLoading}
            className="flex-1 py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Approve & Release Funds</span>
          </button>

          <button
            onClick={handleRaiseDispute}
            disabled={isActionLoading}
            className="py-3.5 px-6 rounded-full bg-transparent hover:bg-rose-500/10 border border-rose-500/30 text-rose-600 font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Raise Dispute</span>
          </button>
        </div>
      )}

      {/* TIMEOUT AUTO CLAIM FOR FREELANCER */}
      {isFreelancer && escrow.status === EscrowStatus.Submitted && escrow.isExpired && (
        <button
          onClick={handleAutoClaim}
          disabled={isActionLoading}
          className="w-full py-3.5 px-6 rounded-full bg-[#836EF9] hover:bg-[#725aeb] text-white font-bold text-sm flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Deadline Elapsed: Auto-Claim Payout</span>
        </button>
      )}

      {/* CLIENT TIMEOUT REFUND IF GHOSTED */}
      {isClient && escrow.status === EscrowStatus.Funded && escrow.isExpired && (
        <button
          onClick={handleTimeoutRefund}
          disabled={isActionLoading}
          className="w-full py-3.5 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm flex items-center justify-center gap-2"
        >
          <span>Claim Timeout Refund (No submission)</span>
        </button>
      )}

      {/* MODAL: SUBMIT DELIVERABLES */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white mb-2">
              Submit Work Deliverables
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Paste the public link to your project (GitHub PR, Figma file, Google Drive, or IPFS hash).
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Deliverables URL / Proof URI *
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/user/project/pull/1"
                  value={proofURI}
                  onChange={(e) => setProofURI(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-sm focus:outline-none focus:border-[#836EF9]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitWork}
                disabled={!proofURI.trim() || isActionLoading}
                className="px-6 py-2.5 rounded-full bg-[#836EF9] hover:bg-[#725aeb] text-white text-sm font-bold shadow-md shadow-[#836EF9]/30 disabled:opacity-50 flex items-center gap-2"
              >
                {isActionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm & Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}