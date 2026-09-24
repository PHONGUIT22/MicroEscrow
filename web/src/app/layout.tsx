"use client";

import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/config/wagmi";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 5000,
          },
        },
      })
  );

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#07070a] text-neutral-100 antialiased selection:bg-[#836EF9]/40 selection:text-white relative">
        {/* Neon Ambient Lighting Orbs */}
        <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#836EF9]/15 blur-[120px] pointer-events-none z-0" />
        <div className="fixed top-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] left-[20%] w-[600px] h-[500px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none z-0" />

        {/* Ambient Subtle Cyber Grid */}
        <div className="fixed inset-0 cyber-grid opacity-60 pointer-events-none z-0" />

        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <div className="relative z-10 flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {children}
              </main>
              <Footer />
            </div>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}