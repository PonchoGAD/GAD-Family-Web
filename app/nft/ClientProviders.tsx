"use client";

import React from "react";
import Web3Providers from "./web3-provider"; // сам компонент уже помечен "use client"

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <Web3Providers>{children}</Web3Providers>;
}
