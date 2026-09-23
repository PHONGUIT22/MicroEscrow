"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Shield, Sparkles, Loader2, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useCreateEscrow } from "@/hooks/useCreateEscrow";

export default function CreateEscrowPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { createEscrow, isAwaitingWallet, isConfirming, isSuccess, txHash, error, reset } = useCreateEscrow();

  const [formData, setFormData] = useState({
    freelancerAddress: "",
    amountEth: "",
    durationInDays: 7,
    title: "",
    description: "",
  });

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
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Create Milestone Escrow
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Lock payment into a decentralized escrow contract. Funds are released only after deliverables are inspected.
        </p>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <span>Escrow successfully created on-chain!</span>
          </div>
          <p className="text-xs text-neutral-400">
            Tx Hash: <span className="font-mono">{txHash}</span>. Redirecting to your dashboard...
          </p>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6 shadow-xl shadow-neutral-950/5"
      >
        {/* Milestone Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            Milestone Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Responsive Landing Page Development"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-sm focus:outline-none focus:border-[#836EF9]"
          />
        </div>

        {/* Freelancer Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            Freelancer Wallet Address *
          </label>
          <input
            type="text"
            required
            placeholder="0x71C...3a9"
            value={formData.freelancerAddress}
            onChange={(e) => setFormData({ ...formData, freelancerAddress: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono text-sm focus:outline-none focus:border-[#836EF9]"
          />
        </div>

        {/* Amount & Duration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Escrow Deposit (ETH) *
            </label>
            <input
              type="number"
              step="0.0001"
              required
              placeholder="0.05"
              value={formData.amountEth}
              onChange={(e) => setFormData({ ...formData, amountEth: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-sm focus:outline-none focus:border-[#836EF9]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Review Duration (Days) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={formData.durationInDays}
              onChange={(e) => setFormData({ ...formData, durationInDays: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-sm focus:outline-none focus:border-[#836EF9]"
            />
          </div>
        </div>

        {/* Work Scope / Terms */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            Work Scope & Acceptance Criteria
          </label>
          <textarea
            rows={4}
            placeholder="Specify expectations, PR requirements, or links to Figma / GitHub issues..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-sm focus:outline-none focus:border-[#836EF9]"
          />
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={!isConnected || isLoading}
          className="w-full py-4 rounded-full bg-[#836EF9] hover:bg-[#725aeb] text-white font-extrabold text-base shadow-xl shadow-[#836EF9]/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{isAwaitingWallet ? "Confirm in Wallet..." : "Broadcasting Transaction..."}</span>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              <span>Fund & Initialize Escrow</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}