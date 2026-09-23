import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther, parseEther } from "viem";
import { EscrowStatus } from "@/types/escrow";

/**
 * @notice Combines conditional CSS class names with tailwind-merge to avoid style collisions
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @notice Shortens a hex address into a user-friendly format (e.g., 0x1234...5678)
 * @param address The Ethereum address string
 * @param chars Number of start and end characters to preserve
 */
export function shortenAddress(address?: string | null, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * @notice Formats raw wei (bigint) into a human-readable ETH string with custom precision
 */
export function formatEth(wei?: bigint | string | number | null, decimals = 4): string {
  if (wei === undefined || wei === null) return "0.0000";
  try {
    const weiBigInt = typeof wei === "bigint" ? wei : BigInt(wei.toString());
    const etherStr = formatEther(weiBigInt);
    const [whole, fraction] = etherStr.split(".");
    if (!fraction) return whole;
    return `${whole}.${fraction.substring(0, decimals).padEnd(decimals, "0")}`;
  } catch {
    return "0.0000";
  }
}

/**
 * @notice Converts an ETH string input (e.g. "0.05") safely into BigInt Wei
 */
export function parseEth(ethStr: string): bigint {
  try {
    if (!ethStr || isNaN(Number(ethStr))) return BigInt(0);
    return parseEther(ethStr);
  } catch {
    return BigInt(0);
  }
}

/**
 * @notice Formats deadline Unix timestamp into human-readable date and time-remaining
 */
export function formatDeadline(deadlineTimestamp: bigint | number): {
  formattedDate: string;
  isExpired: boolean;
  timeLeft: string;
} {
  const timestampMs = Number(deadlineTimestamp) * 1000;
  const nowMs = Date.now();
  const isExpired = timestampMs <= nowMs;
  const diffMs = Math.abs(timestampMs - nowMs);

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let timeLeft = "";
  if (days > 0) {
    timeLeft = `${days}d ${hours}h ${isExpired ? "ago" : "left"}`;
  } else if (hours > 0) {
    timeLeft = `${hours}h ${minutes}m ${isExpired ? "ago" : "left"}`;
  } else {
    timeLeft = `${minutes}m ${isExpired ? "ago" : "left"}`;
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestampMs));

  return { formattedDate, isExpired, timeLeft };
}

/**
 * @notice Returns UI badge metadata, colors, and human-friendly labels according to EscrowStatus
 */
export function getStatusConfig(status: EscrowStatus): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
  description: string;
} {
  switch (status) {
    case EscrowStatus.Created:
      return {
        label: "Created",
        variant: "outline",
        className: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300",
        description: "Escrow created, awaiting initial deposit.",
      };
    case EscrowStatus.Funded:
      return {
        label: "In Progress",
        variant: "secondary",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border-blue-300",
        description: "Funded and locked in escrow. Work is underway.",
      };
    case EscrowStatus.Submitted:
      return {
        label: "Under Review",
        variant: "default",
        className: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-300",
        description: "Deliverables submitted. Awaiting client approval.",
      };
    case EscrowStatus.Completed:
      return {
        label: "Completed",
        variant: "default",
        className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300",
        description: "Funds released to freelancer. Milestone complete.",
      };
    case EscrowStatus.Disputed:
      return {
        label: "Disputed",
        variant: "destructive",
        className: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border-rose-300",
        description: "Dispute raised. Awaiting arbiter resolution.",
      };
    case EscrowStatus.Refunded:
      return {
        label: "Refunded",
        variant: "outline",
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border-purple-300",
        description: "Funds refunded back to the client.",
      };
    default:
      return {
        label: "Unknown",
        variant: "outline",
        className: "bg-gray-100 text-gray-800",
        description: "Unrecognized status.",
      };
  }
}