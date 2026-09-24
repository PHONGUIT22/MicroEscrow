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
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
          dot: "bg-amber-400 shadow-[0_0_6px_#f59e0b]",
        };
      case EscrowStatus.Submitted:
        return {
          label: "Under Review",
          bg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]",
          dot: "bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-pulse",
        };
      case EscrowStatus.Completed:
        return {
          label: "Completed",
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
          dot: "bg-emerald-400 shadow-[0_0_8px_#10b981]",
        };
      case EscrowStatus.Disputed:
        return {
          label: "Disputed",
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)]",
          dot: "bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-ping",
        };
      case EscrowStatus.Refunded:
        return {
          label: "Refunded",
          bg: "bg-slate-500/10 border-slate-500/30 text-slate-300 shadow-[0_0_10px_rgba(148,163,184,0.15)]",
          dot: "bg-slate-400 shadow-[0_0_6px_#94a3b8]",
        };
      default:
        return {
          label: "Created",
          bg: "bg-neutral-800/80 border-neutral-700 text-neutral-300",
          dot: "bg-neutral-400",
        };
    }
  };

  const badge = getBadgeStyle();

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border backdrop-blur-md ${badge.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
      <span>{badge.label}</span>
    </div>
  );
}