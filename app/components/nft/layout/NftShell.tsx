"use client";

import ChainGuard from "../common/ChainGuard";
import NftHeader from "./NftHeader";
import NftFooter from "./NftFooter";

export default function NftShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0E0E12] to-[#1C2025] text-white">
      <div className="max-w-7xl mx-auto px-4">
        <NftHeader />
        <ChainGuard>
          <main className="py-6">{children}</main>
        </ChainGuard>
        <NftFooter />
      </div>
    </div>
  );
}
