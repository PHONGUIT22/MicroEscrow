"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Plus, Briefcase, FileCode2, Wallet, Inbox, ShieldCheck, Zap } from "lucide-react";
import { useEscrowCount, useEscrow } from "@/hooks/useEscrow";
import { EscrowCard } from "@/components/escrow/EscrowCard";

// Helper component that fetches and renders an individual escrow by ID
function EscrowFetcherCard({
  id,
  userAddress,
  activeTab,
}: {
  id: number;
  userAddress?: string;
  activeTab: "client" | "freelancer";
}) {
  const { escrow, isLoading } = useEscrow(id);

  if (isLoading || !escrow || !userAddress) return null;

  const isClient = escrow.client.toLowerCase() === userAddress.toLowerCase();
  const isFreelancer = escrow.freelancer.toLowerCase() === userAddress.toLowerCase();

  if (activeTab === "client" && !isClient) return null;
  if (activeTab === "freelancer" && !isFreelancer) return null;

  return <EscrowCard escrow={escrow} userAddress={userAddress} />;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: totalCountData } = useEscrowCount();
  const [activeTab, setActiveTab] = useState<"client" | "freelancer">("client");

  const totalEscrows = totalCountData ? Number(totalCountData) : 0;
  // Generate escrow ID array in reverse chronological order
  const escrowIds = Array.from({ length: totalEscrows }, (_, i) => totalEscrows - i);

  if (!isConnected) {
    return (
      <div className="text-center py-24 space-y-6 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-neutral-900/80 border border-purple-500/30 flex items-center justify-center mx-auto text-[#836EF9] shadow-[0_0_30px_rgba(131,110,249,0.3)]">
          <Wallet className="w-10 h-10 stroke-[2.2]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white">Connect Your Wallet</h2>
          <p className="text-sm text-neutral-400">
            Connect your Web3 wallet to manage your milestone escrows, inspect submissions, and release payments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 relative z-10">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>On-Chain Portfolio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Escrow Dashboard
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Tracking active milestone contracts deployed on Layer-2 testnet.
          </p>
        </div>

        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#836EF9] to-[#5e3fee] hover:from-[#725aeb] hover:to-[#5030e2] text-white text-xs font-extrabold shadow-[0_0_20px_rgba(131,110,249,0.4)] hover:shadow-[0_0_30px_rgba(131,110,249,0.7)] transition-all duration-200 border border-white/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Escrow</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-neutral-900/80 p-1.5 rounded-2xl border border-white/10 w-fit backdrop-blur-md">
        <button
          onClick={() => setActiveTab("client")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === "client"
              ? "bg-[#836EF9] text-white shadow-[0_0_15px_rgba(131,110,249,0.4)]"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>I am the Client</span>
        </button>

        <button
          onClick={() => setActiveTab("freelancer")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === "freelancer"
              ? "bg-[#836EF9] text-white shadow-[0_0_15px_rgba(131,110,249,0.4)]"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>I am the Freelancer</span>
        </button>
      </div>

      {/* Escrow Cards Grid */}
      {totalEscrows === 0 ? (
        <div className="text-center py-20 rounded-3xl glass-panel border border-white/10 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900/80 border border-white/10 flex items-center justify-center mx-auto text-neutral-500">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-white">No Escrows Found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              You do not have any active escrows on this network. Click &quot;New Escrow&quot; to deposit and lock your first milestone.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {escrowIds.map((id) => (
            <EscrowFetcherCard
              key={id}
              id={id}
              userAddress={address}
              activeTab={activeTab}
            />
          ))}
        </div>
      )}
    </div>
  );
}