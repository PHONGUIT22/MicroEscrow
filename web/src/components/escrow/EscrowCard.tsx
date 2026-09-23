import Link from "next/link";
import { ArrowUpRight, Clock, User, ShieldCheck } from "lucide-react";
import { EscrowItem } from "@/types/escrow";
import { shortenAddress } from "@/lib/utils";
import { EscrowStatusBadge } from "./EscrowStatusBadge";

interface EscrowCardProps {
  escrow: EscrowItem;
  userAddress?: string;
}

export function EscrowCard({ escrow, userAddress }: EscrowCardProps) {
  const isClient = userAddress && escrow.client.toLowerCase() === userAddress.toLowerCase();
  const isFreelancer = userAddress && escrow.freelancer.toLowerCase() === userAddress.toLowerCase();

  const title = escrow.metadata?.title || `Escrow Milestone #${escrow.id}`;
  const description = escrow.metadata?.description || "Work terms and deliverables secured on-chain.";

  return (
    <div className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#836EF9]/10 hover:border-[#836EF9]/50 flex flex-col justify-between">
      <div>
        {/* Top Header: Badge & Role Tag */}
        <div className="flex items-center justify-between mb-4">
          <EscrowStatusBadge status={escrow.status} />

          {isClient && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
              Employer
            </span>
          )}
          {isFreelancer && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#836EF9]/10 text-[#836EF9] border border-[#836EF9]/20">
              Freelancer
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white line-clamp-1 mb-1.5 group-hover:text-[#836EF9] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-6">
          {description}
        </p>

        {/* Monad-style Mini Stats Grid */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/60 dark:border-neutral-800/80 mb-6">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 block mb-0.5">
              Escrow Amount
            </span>
            <span className="font-extrabold text-base text-neutral-900 dark:text-white">
              {escrow.amountEth} <span className="text-xs text-[#836EF9] font-bold">ETH</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 block mb-0.5">
              Deadline
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>{escrow.deadlineDateFormatted}</span>
            </div>
          </div>
        </div>

        {/* Counterparty Address */}
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-6">
          <span>{isClient ? "Contractor:" : "Client:"}</span>
          <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">
            {shortenAddress(isClient ? escrow.freelancer : escrow.client)}
          </span>
        </div>
      </div>

      {/* Action link */}
      <Link
        href={`/escrow/${escrow.id}`}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-900 dark:bg-white hover:bg-[#836EF9] dark:hover:bg-[#836EF9] text-white dark:text-neutral-900 dark:hover:text-white font-bold text-sm transition-all group-hover:scale-[1.01]"
      >
        <span>Open Escrow Room</span>
        <ArrowUpRight className="w-4 h-4" />
      </Link>
    </div>
  );
}