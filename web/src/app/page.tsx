"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  Scale,
  RefreshCcw,
  Coins,
  ShieldCheck,
  Terminal,
  ExternalLink,
  Flame,
  Clock,
  Layers,
  Check,
  X,
} from "lucide-react";

export default function HomePage() {
  const [simulatedStatus, setSimulatedStatus] = useState<"Funded" | "Submitted" | "Completed">("Submitted");
  const [isGaslessSim, setIsGaslessSim] = useState(true);

  return (
    <div className="space-y-28 py-6 md:py-12 relative z-10">
      {/* ============================================================= */}
      {/*                        HERO SECTION                           */}
      {/* ============================================================= */}
      <section className="text-center max-w-4xl mx-auto space-y-8">
        {/* Neon Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#836EF9]/10 border border-[#836EF9]/30 text-[#836EF9] text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(131,110,249,0.2)]">
          <ShieldCheck className="w-4 h-4 text-[#836EF9]" />
          <span>Zero-Gas Protection for Student Freelancers</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
          Trustless pay for student builders.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#836EF9] via-[#a392ff] to-cyan-400 neon-text-purple">
            Zero gas needed.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Say goodbye to client ghosting and 20% platform cuts. Lock milestone ETH into non-custodial smart contracts on Arbitrum & Base with ERC-4337 gas sponsorship for $0 wallet balances.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/create"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#836EF9] to-[#5e3fee] hover:from-[#725aeb] hover:to-[#5030e2] text-white font-extrabold text-base shadow-[0_0_25px_rgba(131,110,249,0.5)] hover:shadow-[0_0_35px_rgba(131,110,249,0.8)] transition-all duration-300 hover:scale-[1.03] flex items-center justify-center gap-2 border border-white/20"
          >
            <span>Create Milestone Escrow</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white font-bold text-base border border-white/10 hover:border-purple-500/50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(131,110,249,0.2)]"
          >
            <Terminal className="w-4 h-4 text-neutral-400" />
            <span>Open Dashboard</span>
          </Link>
        </div>
      </section>

      {/* ============================================================= */}
      {/*                      STATS BAR (NEON GLOW)                    */}
      {/* ============================================================= */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#836EF9] to-transparent opacity-75" />

        <div className="space-y-1 p-3 rounded-2xl bg-white/[0.02]">
          <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Freelancer Gas Fee
          </span>
          <p className="text-3xl sm:text-4xl font-black text-cyan-400 neon-text-cyan">$0.00</p>
          <p className="text-[11px] text-neutral-500">Sponsored via ERC-4337</p>
        </div>

        <div className="space-y-1 p-3 rounded-2xl bg-white/[0.02]">
          <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-[#836EF9]" />
            Platform Cut
          </span>
          <p className="text-3xl sm:text-4xl font-black text-[#836EF9] neon-text-purple">0.0%</p>
          <p className="text-[11px] text-neutral-500">vs Upwork 10-20% fee</p>
        </div>

        <div className="space-y-1 p-3 rounded-2xl bg-white/[0.02]">
          <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Finality Speed
          </span>
          <p className="text-3xl sm:text-4xl font-black text-white">&lt; 1.2s</p>
          <p className="text-[11px] text-neutral-500">Arbitrum & Base L2</p>
        </div>

        <div className="space-y-1 p-3 rounded-2xl bg-white/[0.02]">
          <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Security Model
          </span>
          <p className="text-3xl sm:text-4xl font-black text-emerald-400 neon-text-emerald">100%</p>
          <p className="text-[11px] text-neutral-500">Non-Custodial FSM</p>
        </div>
      </section>

      {/* ============================================================= */}
      {/*            INTERACTIVE LIVE SIMULATOR (JUDGES MAGNET)          */}
      {/* ============================================================= */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#836EF9] px-3 py-1 rounded-full bg-[#836EF9]/10 border border-[#836EF9]/25">
            Interactive Testbed
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Experience the Protocol Flow
          </h2>
          <p className="text-neutral-400 text-sm max-w-lg mx-auto">
            Interact with this real-time simulator to understand how funds, deliverables, and automated timeout protection work together.
          </p>
        </div>

        <div className="max-w-2xl mx-auto rounded-3xl glass-card border border-purple-500/30 p-6 sm:p-8 space-y-6 shadow-[0_0_40px_rgba(131,110,249,0.15)]">
          {/* Header of Simulated Card */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono text-[#836EF9]">Escrow Milestone #042</span>
              <h3 className="font-extrabold text-lg text-white">Smart Contract Escrow Interface</h3>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#836EF9]/15 border border-[#836EF9]/40 text-[#a392ff]">
              <span className="w-2 h-2 rounded-full bg-[#836EF9] animate-pulse" />
              <span>Status: {simulatedStatus.toUpperCase()}</span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/5">
              <span className="text-neutral-500 block mb-1">Locked Funds</span>
              <span className="font-extrabold text-white text-base font-mono">0.75 ETH</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/5">
              <span className="text-neutral-500 block mb-1">Freelancer Gas Cost</span>
              <span className="font-extrabold text-cyan-400 text-base font-mono">
                {isGaslessSim ? "$0.00 (Gasless)" : "0.002 ETH"}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/5 col-span-2 sm:col-span-1">
              <span className="text-neutral-500 block mb-1">Auto-Release Rule</span>
              <span className="font-bold text-emerald-400">Guaranteed at Deadline</span>
            </div>
          </div>

          {/* Interactive Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950/80 border border-white/10">
            <div className="flex items-center gap-2.5">
              <Zap className={`w-4 h-4 ${isGaslessSim ? "text-cyan-400" : "text-neutral-500"}`} />
              <span className="text-xs font-bold text-white">ERC-4337 Gas Sponsorship</span>
            </div>
            <button
              onClick={() => setIsGaslessSim(!isGaslessSim)}
              className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all ${
                isGaslessSim
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  : "bg-neutral-800 text-neutral-400 border border-white/10"
              }`}
            >
              {isGaslessSim ? "ON (Sponsored)" : "OFF (User Pays)"}
            </button>
          </div>

          {/* Simulated Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setSimulatedStatus("Completed")}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulate Client Approval (Payout 100%)</span>
            </button>
            <button
              onClick={() => setSimulatedStatus("Submitted")}
              className="py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/*                  3-STEP ARCHITECTURE FLOW                     */}
      {/* ============================================================= */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            How MicroEscrow Operates
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-sm sm:text-base">
            A frictionless three-stage protocol designed specifically to eliminate client payment evasion and onboarding friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-8 rounded-3xl glass-card space-y-4 relative group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-black text-xl shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              01
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              Deposit & Lock
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Client specifies deliverables and deposits milestone ETH into the smart contract. Funds are immutably locked on-chain before the freelancer writes a single line of code.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-3xl glass-card space-y-4 relative group">
            <div className="w-12 h-12 rounded-2xl bg-[#836EF9]/10 border border-[#836EF9]/30 text-[#836EF9] flex items-center justify-center font-mono font-black text-xl shadow-[0_0_15px_rgba(131,110,249,0.2)]">
              02
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#836EF9]" />
              Gasless Delivery
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Freelancer submits deliverable proofs via EIP-712 off-chain signatures. The relayer sponsors the gas fee, allowing student wallets with exactly $0.00 to submit work smoothly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-3xl glass-card space-y-4 relative group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-black text-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              03
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Guaranteed Release
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Client approves with one click. If the client goes MIA, the smart contract automatically enables a timeout release, ensuring the student is never ghosted without pay.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/*                COMPETITIVE COMPARISON MATRIX                  */}
      {/* ============================================================= */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Why MicroEscrow Beats Legacy Platforms
          </h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto">
            A head-to-head comparison demonstrating our value proposition for hackathon judges and student creators.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl glass-panel border border-white/10 shadow-2xl">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="text-xs uppercase bg-white/[0.03] text-neutral-400 border-b border-white/10 font-mono">
              <tr>
                <th className="py-4 px-6">Feature</th>
                <th className="py-4 px-6">Web2 (Upwork / Fiverr)</th>
                <th className="py-4 px-6">Standard Web3 Escrows</th>
                <th className="py-4 px-6 text-[#836EF9] font-black">MicroEscrow (Ours)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/[0.01]">
                <td className="py-4 px-6 font-bold text-white">Platform Commission</td>
                <td className="py-4 px-6 text-rose-400 flex items-center gap-1.5">
                  <X className="w-4 h-4 text-rose-500" /> 10% to 20% cut
                </td>
                <td className="py-4 px-6 text-neutral-400">1% to 3%</td>
                <td className="py-4 px-6 font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" /> 0.0% Peer-to-Peer
                </td>
              </tr>
              <tr className="hover:bg-white/[0.01]">
                <td className="py-4 px-6 font-bold text-white">Freelancer Gas Barrier</td>
                <td className="py-4 px-6 text-neutral-400">N/A (Fiat only)</td>
                <td className="py-4 px-6 text-rose-400 flex items-center gap-1.5">
                  <X className="w-4 h-4 text-rose-500" /> Requires ETH for Gas
                </td>
                <td className="py-4 px-6 font-bold text-cyan-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-cyan-400" /> $0.00 Sponsored (ERC-4337)
                </td>
              </tr>
              <tr className="hover:bg-white/[0.01]">
                <td className="py-4 px-6 font-bold text-white">Client Ghosting Protection</td>
                <td className="py-4 px-6 text-amber-400">14-Day Discretionary Hold</td>
                <td className="py-4 px-6 text-rose-400 flex items-center gap-1.5">
                  <X className="w-4 h-4 text-rose-500" /> Funds Stuck Forever
                </td>
                <td className="py-4 px-6 font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" /> Automated Deadline Timeout
                </td>
              </tr>
              <tr className="hover:bg-white/[0.01]">
                <td className="py-4 px-6 font-bold text-white">Dispute Fairness</td>
                <td className="py-4 px-6 text-neutral-400">All-or-Nothing Support Ticket</td>
                <td className="py-4 px-6 text-neutral-400">Centralized Multisig</td>
                <td className="py-4 px-6 font-bold text-purple-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-purple-400" /> Custom % Percentage Split
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}