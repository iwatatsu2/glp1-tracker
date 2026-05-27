"use client";

import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-lg mx-auto min-h-screen pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
