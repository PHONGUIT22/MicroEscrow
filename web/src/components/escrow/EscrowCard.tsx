import Link from "next/link";
import { ArrowUpRight, Clock, ShieldCheck, User } from "lucide-react";
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
    <div className="group relative glass-card rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between border border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(131,110,249,0.25)]">
      <div>
        {/* Top Header: Badge & Role Tag */}
        <div className="flex items-center justify-between mb-4">
          <EscrowStatusBadge status={escrow.status} />

          {isClient && (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
              Employer
            </span>
          )}
          {isFreelancer && (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#836EF9]/15 text-[#a392ff] border border-[#836EF9]/30 uppercase tracking-wider">
              Freelancer
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="font-extrabold text-lg text-white line-clamp-1 mb-1.5 group-hover:text-[#a392ff] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-neutral-400 line-clamp-2 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Mini Stats Grid */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-neutral-950/70 border border-white/5 mb-6">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 block mb-0.5">
              Escrow Amount
            </span>
            <span className="font-extrabold text-base text-white font-mono">
              {escrow.amountEth} <span className="text-xs text-[#836EF9] font-bold">ETH</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 block mb-0.5">
              Deadline
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>{escrow.deadlineDateFormatted}</span>
            </div>
          </div>
        </div>

        {/* Counterparty Address */}
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-6 font-mono">
          <span className="text-neutral-400 font-sans">{isClient ? "Contractor:" : "Client:"}</span>
          <span className="text-white font-semibold">
            {shortenAddress(isClient ? escrow.freelancer : escrow.client)}
          </span>
        </div>
      </div>

      {/* Action link */}
      <Link
        href={`/escrow/${escrow.id}`}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-gradient-to-r hover:from-[#836EF9] hover:to-[#5e3fee] text-white font-bold text-xs transition-all duration-200 border border-white/10 group-hover:border-transparent group-hover:shadow-[0_0_15px_rgba(131,110,249,0.4)]"
      >
        <span>Open Escrow Room</span>
        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
      </Link>
    </div>
  );
}