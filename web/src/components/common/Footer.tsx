import Link from "next/link";
import { Shield, Github, Sparkles, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#836EF9] flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-neutral-900 dark:text-white text-sm">
                MicroEscrow Protocol
              </p>
              <p className="text-xs text-neutral-500">
                Institutional-grade gasless protection for student gig economy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#836EF9]/10 border border-[#836EF9]/20 text-[#836EF9] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for 3rd-Web-Hack Sprint</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400">
            <Link
              href="https://github.com"
              target="_blank"
              className="flex items-center gap-1.5 hover:text-[#836EF9] transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </Link>
            <span className="text-xs text-neutral-400">© 2025 MicroEscrow Team</span>
          </div>
        </div>
      </div>
    </footer>
  );
}