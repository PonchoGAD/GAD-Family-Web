"use client";

import "./web3modal-init"; // <-- важно: прогреет Web3Modal до хуков
import React from "react";
import Web3Providers from "./web3-provider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <Web3Providers>{children}</Web3Providers>;
}
