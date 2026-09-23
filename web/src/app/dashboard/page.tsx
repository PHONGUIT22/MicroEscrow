"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Plus, Briefcase, FileCode2, Wallet, Inbox } from "lucide-react";
import { useEscrowCount, useEscrow } from "@/hooks/useEscrow";
import { EscrowCard } from "@/components/escrow/EscrowCard";
import { EscrowItem } from "@/types/escrow";

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
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Connect Wallet</h2>
        <p className="text-sm text-neutral-500">
          Please connect your Web3 wallet to inspect your active contracts and milestone releases.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage your active milestones, review submissions, and track payouts.
          </p>
        </div>

        <Link
          href="/create"
          className="px-5 py-2.5 rounded-full bg-[#836EF9] hover:bg-[#725aeb] text-white font-bold text-sm shadow-lg shadow-[#836EF9]/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Escrow</span>
        </Link>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <button
          onClick={() => setActiveTab("client")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
            activeTab === "client"
              ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-md"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Hiring Milestones (Employer)</span>
        </button>

        <button
          onClick={() => setActiveTab("freelancer")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
            activeTab === "freelancer"
              ? "bg-[#836EF9] text-white shadow-md shadow-[#836EF9]/25"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>Contractor Milestones (Freelancer)</span>
        </button>
      </div>

      {/* Escrow Grid */}
      {totalEscrows === 0 ? (
        <div className="text-center py-20 space-y-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-3xl border border-neutral-200 dark:border-neutral-800">
          <Inbox className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="font-bold text-neutral-900 dark:text-white text-base">No Escrows Found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            You don't have any milestones created yet. Click "New Escrow" to secure your first agreement.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {escrowIds.map((id) => (
            <EscrowFetcherCard key={id} id={id} userAddress={address} activeTab={activeTab} />
          ))}
        </div>
      )}
    </div>
  );
}