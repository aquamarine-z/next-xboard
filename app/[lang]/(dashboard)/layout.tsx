import * as React from "react";
import { AppleHeader } from "@/components/layout/apple-header";
import { AppleBottomNav } from "@/components/layout/apple-bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-[#0066cc]/20 selection:text-[#0066cc] transition-colors">
      <AppleHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-10 pb-32 md:pb-20">
        {children}
      </main>
      <AppleBottomNav />
    </div>
  );
}