// app/nft/providers/NftProvider.tsx
"use client";

import React from "react";
import { Web3Providers } from "../wagmi";

export default function NftProvider({ children }: { children: React.ReactNode }) {
  return <Web3Providers>{children}</Web3Providers>;
}
