"use client";

import { Zap, ShieldCheck } from "lucide-react";

interface GaslessToggleProps {
  enabled: boolean;
  onToggle: (state: boolean) => void;
  className?: string;
}

export function GaslessToggle({ enabled, onToggle, className = "" }: GaslessToggleProps) {
  return (
    <div
      className={`p-4 rounded-2xl glass-panel border transition-all duration-300 ${
        enabled
          ? "border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-cyan-950/20"
          : "border-white/10 bg-neutral-950/70"
      } flex items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            enabled
              ? "bg-gradient-to-br from-cyan-400 to-[#836EF9] text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              : "bg-neutral-800 text-neutral-400"
          }`}
        >
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs text-white">
              Gasless Sponsorship Mode
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
              enabled
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                : "bg-neutral-800 text-neutral-400 border-white/5"
            }`}>
              ERC-4337
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            {enabled
              ? "Sponsored via Pimlico Paymaster ($0.00 gas for student freelancers)."
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
        className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          enabled ? "bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]" : "bg-neutral-800"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}