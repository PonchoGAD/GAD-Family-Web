"use client";
import React from "react";
import ClientProviders from "./ClientProviders.tsx.bak";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <div className="min-h-screen bg-[#0E0E12] text-white">
        {children}
      </div>
    </ClientProviders>
  );
}
