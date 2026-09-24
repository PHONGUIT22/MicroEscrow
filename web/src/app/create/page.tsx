"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import {
  Shield,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Zap,
  Lock,
  Clock,
  Coins,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import Link from "next/link";
import { useCreateEscrow } from "@/hooks/useCreateEscrow";

export default function CreateEscrowPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { createEscrow, isAwaitingWallet, isConfirming, isSuccess, txHash, error } = useCreateEscrow();

  const [formData, setFormData] = useState({
    freelancerAddress: "",
    amountEth: "",
    durationInDays: 7,
    title: "",
    description: "",
  });

  const [isAutoFilled, setIsAutoFilled] = useState(false);

  /**
   * @notice Auto-fills pre-configured hackathon demo data for rapid testing
   */
  const handleAutoFill = () => {
    setFormData({
      title: "Next.js DApp Frontend & Viem Integration",
      freelancerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      amountEth: "0.0001",
      durationInDays: 7,
      description:
        "Develop a responsive dark-themed Next.js 14 landing page with Wagmi v2 wallet integration. Code must pass all ESLint checks. Please submit the GitHub PR link for final review.",
    });
    setIsAutoFilled(true);
    setTimeout(() => setIsAutoFilled(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hash = await createEscrow(formData);
    if (hash) {
      setTimeout(() => {
        router.push("/dashboard");
      }, 3500);
    }
  };

  const isLoading = isAwaitingWallet || isConfirming;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 relative z-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#836EF9]/10 border border-[#836EF9]/30 text-[#836EF9] text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(131,110,249,0.2)]">
          <Lock className="w-3.5 h-3.5" />
          <span>Non-Custodial Milestone Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Create Milestone Escrow
        </h1>
        <p className="text-sm text-neutral-400 max-w-xl">
          Deposit and lock milestone funds into the smart contract. The freelancer receives payment once deliverables are reviewed or automatically if the review deadline elapses.
        </p>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-2 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
          <div className="flex items-center gap-2 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Escrow successfully created and funded on-chain!</span>
          </div>
          <p className="text-xs text-neutral-300">
            Tx Hash: <span className="font-mono text-emerald-300">{txHash}</span>. Redirecting to your dashboard...
          </p>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error || "Failed to initialize escrow transaction."}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6 glass-card p-6 sm:p-8 rounded-3xl border border-white/10 relative">
          {/* Form Header with Quick Fill Demo Button */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#836EF9]" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-300">
                Milestone Specifications
              </span>
            </div>

            <button
              type="button"
              onClick={handleAutoFill}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 border ${
                isAutoFilled
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  : "bg-[#836EF9]/10 hover:bg-[#836EF9]/25 text-[#836EF9] hover:text-white border-[#836EF9]/30 hover:border-[#836EF9] shadow-[0_0_12px_rgba(131,110,249,0.2)] hover:shadow-[0_0_20px_rgba(131,110,249,0.45)]"
              }`}
              title="Populate form with pre-configured hackathon demo data"
            >
              <Zap className={`w-3.5 h-3.5 fill-current ${isAutoFilled ? "text-emerald-400" : "text-cyan-400"}`} />
              <span>{isAutoFilled ? "✓ Demo Data Loaded" : "⚡ Quick Fill Demo"}</span>
            </button>
          </div>

          {/* Project Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-300">
              Milestone Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Next.js DApp Frontend & Viem Integration"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-neutral-950/80 text-white text-sm focus:outline-none focus:border-[#836EF9] focus:shadow-[0_0_15px_rgba(131,110,249,0.3)] transition-all"
            />
          </div>

          {/* Freelancer Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-300">
              Freelancer Wallet Address (Receiver)
            </label>
            <input
              type="text"
              required
              placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
              value={formData.freelancerAddress}
              onChange={(e) => setFormData({ ...formData, freelancerAddress: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-neutral-950/80 text-white font-mono text-sm focus:outline-none focus:border-[#836EF9] focus:shadow-[0_0_15px_rgba(131,110,249,0.3)] transition-all"
            />
          </div>

          {/* Amount & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                <span>Milestone Amount</span>
                <span className="text-[#836EF9] font-bold">ETH</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.000001"
                required
                placeholder="0.0001"
                value={formData.amountEth}
                onChange={(e) => setFormData({ ...formData, amountEth: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-neutral-950/80 text-white text-sm font-mono focus:outline-none focus:border-[#836EF9] focus:shadow-[0_0_15px_rgba(131,110,249,0.3)] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                <span>Review Deadline</span>
                <span className="text-cyan-400 font-bold">{formData.durationInDays} Days</span>
              </label>
              <select
                value={formData.durationInDays}
                onChange={(e) => setFormData({ ...formData, durationInDays: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-neutral-950/80 text-white text-sm focus:outline-none focus:border-[#836EF9] focus:shadow-[0_0_15px_rgba(131,110,249,0.3)] transition-all"
              >
                <option value={3}>3 Days (Urgent Sprint)</option>
                <option value={7}>7 Days (Standard Milestone)</option>
                <option value={14}>14 Days (Large Feature)</option>
                <option value={30}>30 Days (Full Project)</option>
              </select>
            </div>
          </div>

          {/* Work Scope / Terms */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-300">
              Work Scope & Acceptance Criteria
            </label>
            <textarea
              rows={4}
              placeholder="Specify deliverable links, PR expectations, or Figma specs..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-neutral-950/80 text-white text-sm focus:outline-none focus:border-[#836EF9] focus:shadow-[0_0_15px_rgba(131,110,249,0.3)] transition-all"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={!isConnected || isLoading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#836EF9] to-[#5e3fee] hover:from-[#725aeb] hover:to-[#5030e2] text-white font-black text-sm shadow-[0_0_25px_rgba(131,110,249,0.5)] hover:shadow-[0_0_35px_rgba(131,110,249,0.8)] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2 border border-white/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isAwaitingWallet ? "Confirm in Wallet..." : "Broadcasting Transaction..."}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                <span>Deposit & Lock Milestone Funds</span>
              </>
            )}
          </button>
        </form>

        {/* Live Summary Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#836EF9]" />
              Milestone Summary
            </h3>

            <div className="space-y-3 text-xs divide-y divide-white/5">
              <div className="flex justify-between pt-1">
                <span className="text-neutral-400">Locked Deposit:</span>
                <span className="font-bold text-white font-mono">
                  {formData.amountEth || "0.00"} ETH
                </span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-neutral-400">Platform Commission:</span>
                <span className="font-bold text-emerald-400 font-mono">0.00 ETH (0%)</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-neutral-400">Freelancer Gas Cost:</span>
                <span className="font-bold text-cyan-400 font-mono">$0.00 (Gasless)</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-neutral-400">Review Window:</span>
                <span className="font-bold text-white">{formData.durationInDays} Days</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Automated Protection</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                If deliverables are submitted and you do not respond before the deadline, the contract automatically releases funds to the contractor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}