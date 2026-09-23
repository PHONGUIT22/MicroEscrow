import Link from "next/link";
import { Shield, Zap, ArrowRight, CheckCircle2, Lock, Sparkles, Scale, RefreshCcw } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-24 py-6 md:py-12">
      {/* HERO SECTION */}
      <section className="text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#836EF9]/10 border border-[#836EF9]/25 text-[#836EF9] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Zero-Gas Protection for Student Freelancers</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.08]">
          Enabling trustless pay for student <span className="text-[#836EF9]">freelancers.</span>
        </h1>

        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Say goodbye to ghosting clients and high L1 gas fees. Lock milestone funds into trustless smart contracts with ERC-4337 gas sponsorship for $0 wallet balances.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/create"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#836EF9] hover:bg-[#725aeb] text-white font-extrabold text-base shadow-xl shadow-[#836EF9]/30 hover:shadow-[#836EF9]/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <span>Create Milestone Escrow</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-bold text-base border border-neutral-300 dark:border-neutral-700 transition-all flex items-center justify-center gap-2"
          >
            <span>Open Dashboard</span>
          </Link>
        </div>
      </section>

      {/* STATS BAR (Monad Inspired) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 backdrop-blur-md">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">Gas Cost for Freelancer</span>
          <p className="text-4xl font-extrabold text-[#836EF9]">$0.00</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">Payment Security</span>
          <p className="text-4xl font-extrabold text-neutral-900 dark:text-white">100%</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">Confirmation Speed</span>
          <p className="text-4xl font-extrabold text-neutral-900 dark:text-white">&lt; 1.5s</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">Target Networks</span>
          <p className="text-4xl font-extrabold text-neutral-900 dark:text-white">Arbitrum & Base</p>
        </div>
      </section>

      {/* 3-STEP ARCHITECTURE FLOW */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white">
            How MicroEscrow Works
          </h2>
          <p className="text-neutral-500 max-w-xl mx-auto text-sm sm:text-base">
            A frictionless three-stage protocol designed specifically to eliminate client payment evasion and onboarding friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 hover:border-[#836EF9]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#836EF9]/10 text-[#836EF9] flex items-center justify-center font-black text-xl">
              01
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Deposit & Lock</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Client specifies the scope and deposits milestone ETH into the smart contract. Funds are verifiably frozen until work is completed.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 hover:border-[#836EF9]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#836EF9]/10 text-[#836EF9] flex items-center justify-center font-black text-xl">
              02
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Gasless Delivery</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              The student submits code or project links. Pimlico Paymaster sponsors the transaction, allowing freelancers with $0 ETH to participate seamlessly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 hover:border-[#836EF9]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#836EF9]/10 text-[#836EF9] flex items-center justify-center font-black text-xl">
              03
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Instant Release</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Client approves with one click. If the client becomes unresponsive, the smart contract automatically releases payment to the freelancer once the review deadline elapses.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}