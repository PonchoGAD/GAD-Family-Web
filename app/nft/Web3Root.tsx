"use client";

import "./web3modal-init";   // один раз инициализирует Web3Modal на клиенте
import { Providers } from "./wagmi";

export default function Web3Root({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
