"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, ShieldCheck, ExternalLink, User, CheckCircle2 } from "lucide-react";
import { useEscrow } from "@/hooks/useEscrow";
import { shortenAddress } from "@/lib/utils";
import { EscrowStatus } from "@/types/escrow";
import { EscrowStatusBadge } from "@/components/escrow/EscrowStatusBadge";
import { ActionButtons } from "@/components/escrow/ActionButtons";
import { GaslessToggle } from "@/components/escrow/GaslessToggle";

export default function EscrowRoomPage() {
  const params = useParams();
  const escrowId = Number(params?.id);
  const { escrow, isLoading, refetch } = useEscrow(escrowId);
  const [isGasless, setIsGasless] = useState(true);

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#836EF9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-neutral-500">Synchronizing contract state from testnet...</p>
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Escrow #{escrowId} Not Found</h2>
        <Link href="/dashboard" className="text-sm font-semibold text-[#836EF9] hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Stepper timeline calculation
  const steps = [
    { title: "Funded", active: escrow.status >= EscrowStatus.Funded },
    { title: "Submitted", active: escrow.status >= EscrowStatus.Submitted },
    { title: "Settled", active: escrow.status === EscrowStatus.Completed || escrow.status === EscrowStatus.Refunded },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <EscrowStatusBadge status={escrow.status} />
      </div>

      {/* Main Title & Deposit Stat */}
      <div className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-neutral-950/5">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[#836EF9] block mb-1">
            Escrow Room #{escrow.id}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            {escrow.metadata?.title || `Milestone #${escrow.id}`}
          </h1>
          <div className="flex items-center gap-4 text-xs text-neutral-500 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Review Cut-off: {escrow.deadlineDateFormatted}</span>
            </span>
          </div>
        </div>

        <div className="md:text-right">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block mb-0.5">
            Locked Amount
          </span>
          <div className="text-3xl font-black text-neutral-900 dark:text-white">
            {escrow.amountEth} <span className="text-base text-[#836EF9] font-bold">ETH</span>
          </div>
        </div>
      </div>

      {/* STEPPER PROGRESS BAR */}
      <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-200 dark:bg-neutral-800 -translate-y-1/2 z-0" />
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step.active
                    ? "bg-[#836EF9] text-white ring-4 ring-[#836EF9]/20"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                }`}
              >
                {step.active ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span className="text-[11px] font-semibold text-neutral-500 mt-2">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parties Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Contract Parties</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950">
              <span className="text-neutral-500">Employer (Client):</span>
              <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{shortenAddress(escrow.client, 6)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950">
              <span className="text-neutral-500">Contractor (Freelancer):</span>
              <span className="font-mono font-bold text-[#836EF9]">{shortenAddress(escrow.freelancer, 6)}</span>
            </div>
          </div>
        </div>

        {/* Deliverables Proof Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Deliverables Submission</h3>
          {escrow.proofURI ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <span className="text-xs font-semibold text-emerald-600 block">Deliverables Submitted:</span>
              <a
                href={escrow.proofURI}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#836EF9] hover:underline break-all"
              >
                <span>{escrow.proofURI}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950">
              Deliverables have not yet been submitted by the freelancer.
            </p>
          )}
        </div>
      </div>

      {/* Scope Terms */}
      {escrow.metadata?.description && (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Milestone Requirements</h3>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 whitespace-pre-wrap leading-relaxed">
            {escrow.metadata.description}
          </p>
        </div>
      )}

      {/* GASLESS SPONSORSHIP TOGGLE */}
      <GaslessToggle enabled={isGasless} onToggle={setIsGasless} />

      {/* ROLE-AWARE ACTION CONTROLLER */}
      <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
        <ActionButtons escrow={escrow} isGaslessEnabled={isGasless} onActionSuccess={refetch} />
      </div>
    </div>
  );
}