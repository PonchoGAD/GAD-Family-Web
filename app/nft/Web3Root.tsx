"use client";
import { useEffect } from "react";
import { WagmiProvider } from "./wagmi";
import { initWeb3ModalOnce } from "./safe-web3";

export default function Web3Root({ children }: { children: React.ReactNode }) {
  useEffect(() => { initWeb3ModalOnce(); }, []);
  return <WagmiProvider>{children}</WagmiProvider>;
}
 