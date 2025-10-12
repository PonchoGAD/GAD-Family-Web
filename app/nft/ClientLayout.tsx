"use client";

import { useEffect } from "react";
import { WagmiProvider } from "./wagmi";
import { initWeb3ModalOnce } from "./safe-web3";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initWeb3ModalOnce(); // инициализация строго в браузере
  }, []);

  return <WagmiProvider>{children}</WagmiProvider>;
}
