import { EscrowStatus } from "@/types/escrow";

interface EscrowStatusBadgeProps {
  status: EscrowStatus;
  className?: string;
}

export function EscrowStatusBadge({ status, className = "" }: EscrowStatusBadgeProps) {
  const getBadgeStyle = () => {
    switch (status) {
      case EscrowStatus.Funded:
        return {
          label: "In Progress",
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
          dot: "bg-amber-500",
        };
      case EscrowStatus.Submitted:
        return {
          label: "Under Review",
          bg: "bg-[#836EF9]/10 border-[#836EF9]/30 text-[#836EF9] dark:text-[#a08fff]",
          dot: "bg-[#836EF9] animate-pulse",
        };
      case EscrowStatus.Completed:
        return {
          label: "Completed",
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
          dot: "bg-emerald-500",
        };
      case EscrowStatus.Disputed:
        return {
          label: "Disputed",
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400",
          dot: "bg-rose-500 animate-ping",
        };
      case EscrowStatus.Refunded:
        return {
          label: "Refunded",
          bg: "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400",
          dot: "bg-slate-500",
        };
      default:
        return {
          label: "Created",
          bg: "bg-neutral-100 border-neutral-300 text-neutral-600",
          dot: "bg-neutral-400",
        };
    }
  };

  const badge = getBadgeStyle();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${badge.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
      <span>{badge.label}</span>
    </div>
  );
}