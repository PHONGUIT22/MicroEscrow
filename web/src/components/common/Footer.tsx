import Link from "next/link";
import {
  Shield,
  Github,
  CheckCircle2,
  Terminal,
  ExternalLink,
  BookOpen,
  Layers,
  Heart,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#07070a]/90 backdrop-blur-xl py-12 mt-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#836EF9] to-[#593bee] flex items-center justify-center text-white shadow-[0_0_15px_rgba(131,110,249,0.4)]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm flex items-center gap-1.5">
                MicroEscrow Protocol
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5" />
                  Base Sepolia
                </span>
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Trustless gasless milestone escrow engineered for student freelancers.
              </p>
            </div>
          </div>

          {/* Hackathon Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#836EF9]/10 border border-[#836EF9]/30 text-[#836EF9] text-xs font-bold shadow-[0_0_12px_rgba(131,110,249,0.15)]">
            <Terminal className="w-3.5 h-3.5" />
            <span>Built for 3rd-Web-Hack Sprint</span>
          </div>

          {/* External Links with Icons */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-neutral-400">
            <a
              href="https://sepolia.basescan.org/address/0x57099f3125faF6591f23000E8985E18c0c2202Ac"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors font-semibold"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>BaseScan Contract</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <Link
              href="https://github.com/PHONGUIT22/MicroEscrow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#836EF9] transition-colors font-semibold"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>

            <Link
              href="https://github.com/PHONGUIT22/MicroEscrow#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#836EF9] transition-colors font-semibold"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Docs</span>
            </Link>

            <span className="text-neutral-500 font-mono">© 2026 MicroEscrow</span>
          </div>
        </div>
      </div>
    </footer>
  );
}