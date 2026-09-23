"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { injected } from "wagmi/connectors";
import { Shield, Wallet, ArrowRight, Zap, ExternalLink } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 dark:bg-neutral-950/90 border-b border-neutral-200 dark:border-neutral-800">
      {/* Monad-style Top Hackathon Announcement Ticker */}
      <div className="bg-[#836EF9] text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
          3RD-WEB-HACK
        </span>
        <span>MicroEscrow — Gasless Escrow for Student Freelancers</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#836EF9] flex items-center justify-center text-white shadow-md shadow-[#836EF9]/30 transition-transform group-hover:scale-105">
            <Shield className="w-5 h-5 fill-white/20" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5">
              MICRO<span className="text-[#836EF9]">ESCROW</span>
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-full border border-neutral-200/80 dark:border-neutral-800">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{chain.name}</span>
              {balanceData && (
                <span className="font-bold text-neutral-900 dark:text-white border-l border-neutral-300 dark:border-neutral-700 pl-2">
                  {formatEth(balanceData.value, 3)} ETH
                </span>
              )}
            </div>
          )}

          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white text-sm font-semibold border border-neutral-300 dark:border-neutral-700 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-[#836EF9]" />
              {shortenAddress(address)}
            </button>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#836EF9] hover:bg-[#725aeb] text-white text-sm font-bold shadow-lg shadow-[#836EF9]/25 hover:shadow-[#836EF9]/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}