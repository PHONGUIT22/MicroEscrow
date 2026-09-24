"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { injected } from "wagmi/connectors";
import { Shield, Wallet, ArrowRight, Zap, ExternalLink, Cpu } from "lucide-react";
import { shortenAddress, formatEth } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Create Escrow", href: "/create" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#07070a]/85 border-b border-white/10 shadow-lg shadow-black/50">
      {/* Top Hackathon Announcement Ticker with Neon Gradient */}
      <div className="bg-gradient-to-r from-[#836EF9] via-[#6d54ea] to-[#4f35da] text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(131,110,249,0.3)]">
        <span className="bg-white/20 backdrop-blur-sm text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold border border-white/30">
          3RD-WEB-HACK
        </span>
        <span className="tracking-wide">MicroEscrow — Gasless Escrow Protocol for Student Builders</span>
        <ArrowRight className="w-3.5 h-3.5 opacity-80" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo with Neon Glow */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#836EF9] to-[#593bee] flex items-center justify-center text-white shadow-[0_0_20px_rgba(131,110,249,0.5)] ring-1 ring-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(131,110,249,0.8)]">
            <Shield className="w-5 h-5 fill-white/20 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
              MICRO<span className="text-[#836EF9] neon-text-purple">ESCROW</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold -mt-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping inline-block" />
              Gasless L2 Protocol
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-neutral-900/80 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-[#836EF9] text-white shadow-[0_0_15px_rgba(131,110,249,0.4)]"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Web3 Wallet Actions */}
        <div className="flex items-center gap-3">
          {isConnected && chain && (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-emerald-500/30 text-xs font-semibold text-neutral-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
              <span className="text-emerald-400 font-bold">{chain.name}</span>
              {balanceData && (
                <span className="text-white border-l border-neutral-700 pl-2 font-mono">
                  {formatEth(balanceData.value, 3)} ETH
                </span>
              )}
            </div>
          )}

          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-bold border border-white/10 hover:border-purple-500/50 shadow-md transition-all duration-200 hover:shadow-[0_0_15px_rgba(131,110,249,0.3)]"
            >
              <div className="w-2 h-2 rounded-full bg-[#836EF9] shadow-[0_0_6px_#836EF9]" />
              <span className="font-mono">{shortenAddress(address)}</span>
            </button>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#836EF9] to-[#5e3fee] hover:from-[#725aeb] hover:to-[#5030e2] text-white text-xs font-extrabold shadow-[0_0_20px_rgba(131,110,249,0.45)] hover:shadow-[0_0_30px_rgba(131,110,249,0.7)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] border border-white/20"
            >
              <Wallet className="w-4 h-4 stroke-[2.5]" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}