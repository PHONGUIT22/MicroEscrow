"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  ExternalLink,
  User,
  CheckCircle2,
  Lock,
  Coins,
  FileCheck2,
} from "lucide-react";
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
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#836EF9] border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_20px_rgba(131,110,249,0.5)]" />
        <p className="text-xs text-neutral-400 font-mono">Synchronizing state from Layer-2 testnet...</p>
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-2xl font-black text-white">Escrow #{escrowId} Not Found</h2>
        <Link href="/dashboard" className="text-xs font-bold uppercase tracking-wider text-[#836EF9] hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Stepper timeline calculation
  const steps = [
    { title: "Funded & Locked", active: escrow.status >= EscrowStatus.Funded },
    { title: "Deliverables Submitted", active: escrow.status >= EscrowStatus.Submitted },
    { title: "Settled / Released", active: escrow.status === EscrowStatus.Completed || escrow.status === EscrowStatus.Refunded },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 relative z-10">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <EscrowStatusBadge status={escrow.status} />
      </div>

      {/* Main Title & Deposit Stat Card */}
      <div className="p-8 rounded-3xl glass-card border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_0_30px_rgba(131,110,249,0.15)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#836EF9] to-transparent opacity-80" />

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#836EF9]/10 border border-[#836EF9]/30 text-[#836EF9] text-[10px] font-extrabold uppercase tracking-wider mb-1">
            <Lock className="w-3 h-3" />
            <span>Escrow Room #{escrow.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {escrow.metadata?.title || `Milestone #${escrow.id}`}
          </h1>
          <div className="flex items-center gap-4 text-xs text-neutral-400 pt-1 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Review Cut-off: {escrow.deadlineDateFormatted}</span>
            </span>
          </div>
        </div>

        <div className="md:text-right p-4 rounded-2xl bg-neutral-950/70 border border-white/5">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 block mb-0.5">
            Locked Deposit
          </span>
          <div className="text-3xl font-black text-white font-mono">
            {escrow.amountEth} <span className="text-base text-[#836EF9] font-bold">ETH</span>
          </div>
        </div>
      </div>

      {/* STEPPER PROGRESS BAR (NEON GLOW) */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10">
        <div className="flex items-center justify-between relative max-w-xl mx-auto">
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-neutral-800 -translate-y-1/2 z-0" />
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  step.active
                    ? "bg-[#836EF9] text-white shadow-[0_0_15px_rgba(131,110,249,0.7)] ring-4 ring-[#836EF9]/20"
                    : "bg-neutral-900 border border-white/10 text-neutral-500"
                }`}
              >
                {step.active ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : idx + 1}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-2 text-center">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parties Card */}
        <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <User className="w-4 h-4 text-[#836EF9]" />
            <span>Contract Parties</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950/70 border border-white/5">
              <span className="text-neutral-400">Employer (Client):</span>
              <span className="font-mono font-bold text-white">{shortenAddress(escrow.client, 6)}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950/70 border border-white/5">
              <span className="text-neutral-400">Contractor (Freelancer):</span>
              <span className="font-mono font-bold text-cyan-400">{shortenAddress(escrow.freelancer, 6)}</span>
            </div>
          </div>
        </div>

        {/* Deliverables Proof Card */}
        <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>Deliverables Inspection</span>
          </h3>
          {escrow.proofURI ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <span className="text-xs font-bold text-emerald-400 block">Deliverables Submitted on-chain:</span>
              <a
                href={escrow.proofURI}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 underline break-all"
              >
                <span>{escrow.proofURI}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic p-4 rounded-2xl bg-neutral-950/70 border border-white/5">
              No deliverables submitted yet by the contractor.
            </p>
          )}
        </div>
      </div>

      {/* Scope Terms */}
      {escrow.metadata?.description && (
        <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-2">
          <h3 className="font-extrabold text-sm text-white">Work Scope & Acceptance Criteria</h3>
          <p className="text-xs sm:text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
            {escrow.metadata.description}
          </p>
        </div>
      )}

      {/* GASLESS SPONSORSHIP TOGGLE */}
      <GaslessToggle enabled={isGasless} onToggle={setIsGasless} />

      {/* ROLE-AWARE ACTION CONTROLLER */}
      <div className="p-6 rounded-3xl glass-card border border-purple-500/30 shadow-[0_0_30px_rgba(131,110,249,0.1)]">
        <ActionButtons escrow={escrow} isGaslessEnabled={isGasless} onActionSuccess={refetch} />
      </div>
    </div>
  );
}