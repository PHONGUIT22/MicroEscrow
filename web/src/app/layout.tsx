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
      <body className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 antialiased selection:bg-[#836EF9]/30 selection:text-[#836EF9]">
        {/* Subtle Background Grid Pattern */}
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] opacity-60 z-0" />

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