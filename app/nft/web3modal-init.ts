"use client";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { wagmiConfig, projectId } from "./wagmi";

declare global {
  interface Window {
    __WEB3MODAL_INIT__?: boolean;
  }
}

if (typeof window !== "undefined" && !window.__WEB3MODAL_INIT__) {
  if (!projectId) {
    console.warn("Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID");
  } else {
    createWeb3Modal({
      wagmiConfig,
      projectId,
      enableAnalytics: false
    });
  }
  window.__WEB3MODAL_INIT__ = true;
}
