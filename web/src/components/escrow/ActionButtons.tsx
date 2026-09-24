"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import {
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  AlertCircle,
  Coins,
  ShieldCheck,
  RefreshCcw,
} from "lucide-react";
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

  // Timeout claim for freelancer if client disappeared after deadline
  const handleAutoClaim = async () => {
    const success = await executeAction({
      action: "releaseFunds",
      escrowId: escrow.id,
      useGasless: isGaslessEnabled,
    });
    if (success) onActionSuccess?.();
  };

  // Timeout refund for client if freelancer never submitted after deadline
  const handleTimeoutRefund = async () => {
    const success = await executeAction({
      action: "claimTimeoutRefund",
      escrowId: escrow.id,
      useGasless: isGaslessEnabled,
    });
    if (success) onActionSuccess?.();
  };

  return (
    <div className="space-y-4">
      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error || "Action failed to execute. Please verify state."}</span>
        </div>
      )}

      {/* DISPUTED STATE */}
      {escrow.status === EscrowStatus.Disputed && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-1 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
          <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto mb-1 animate-pulse" />
          <h4 className="font-extrabold text-white text-sm">Escrow Under Protocol Dispute Review</h4>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            Funds are securely frozen on-chain. An assigned protocol arbiter will review the deliverables against scope and disburse percentage allocations.
          </p>
        </div>
      )}

      {/* FREELANCER ACTIONS */}
      {isFreelancer && escrow.status === EscrowStatus.Funded && (
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          disabled={isActionLoading}
          className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#836EF9] to-[#5e3fee] hover:from-[#725aeb] hover:to-[#5030e2] text-white font-extrabold text-sm shadow-[0_0_20px_rgba(131,110,249,0.4)] hover:shadow-[0_0_30px_rgba(131,110,249,0.7)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-white/20"
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
            className="flex-1 py-4 px-6 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-white/10"
          >
            {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
            <span>Approve & Release Funds (100% Payout)</span>
          </button>

          <button
            onClick={handleRaiseDispute}
            disabled={isActionLoading}
            className="py-4 px-6 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
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
          className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 border border-white/20"
        >
          <Coins className="w-4 h-4" />
          <span>Deadline Elapsed: Trigger Auto-Claim Payout</span>
        </button>
      )}

      {/* CLIENT TIMEOUT REFUND IF GHOSTED */}
      {isClient && escrow.status === EscrowStatus.Funded && escrow.isExpired && (
        <button
          onClick={handleTimeoutRefund}
          disabled={isActionLoading}
          className="w-full py-4 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/10 shadow-lg"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Claim Timeout Refund (No Submission by Deadline)</span>
        </button>
      )}

      {/* MODAL: SUBMIT DELIVERABLES */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(131,110,249,0.3)] space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>On-Chain Submission</span>
              </div>
              <h3 className="font-black text-xl text-white">
                Submit Work Deliverables
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Paste the verifiable URL to your deliverables (GitHub PR, Figma link, Google Drive, or IPFS CID).
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-300 block">
                Deliverables URL / Proof URI *
              </label>
              <input
                type="url"
                required
                placeholder="https://github.com/org/repo/pull/12"
                value={proofURI}
                onChange={(e) => setProofURI(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-neutral-950/80 text-white text-sm focus:outline-none focus:border-[#836EF9] focus:shadow-[0_0_15px_rgba(131,110,249,0.3)] transition-all font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitWork}
                disabled={!proofURI.trim() || isActionLoading}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#836EF9] to-[#5e3fee] hover:from-[#725aeb] hover:to-[#5030e2] text-white text-xs font-extrabold shadow-[0_0_20px_rgba(131,110,249,0.4)] disabled:opacity-50 flex items-center gap-2 border border-white/20"
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