"use client";

import { Zap, Sparkles } from "lucide-react";

interface GaslessToggleProps {
  enabled: boolean;
  onToggle: (state: boolean) => void;
  className?: string;
}

export function GaslessToggle({ enabled, onToggle, className = "" }: GaslessToggleProps) {
  return (
    <div
      className={`p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            enabled
              ? "bg-[#836EF9] text-white shadow-md shadow-[#836EF9]/30"
              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-neutral-900 dark:text-white">
              Gasless Sponsorship
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#836EF9]/10 text-[#836EF9]">
              ERC-4337
            </span>
          </div>
          <p className="text-[11px] text-neutral-500">
            {enabled
              ? "Transactions sponsored via Pimlico Paymaster ($0 gas for students)."
              : "Standard wallet gas fee applies."}
          </p>
        </div>
      </div>

      {/* Switch button */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          enabled ? "bg-[#836EF9]" : "bg-neutral-300 dark:bg-neutral-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}