// app/nft/safe-web3.ts
"use client";

let inited = false;

export async function initWeb3ModalOnce() {
  if (inited) return;
  if (typeof window === "undefined") return;

  const [{ createWeb3Modal }, { wagmiConfig }] = await Promise.all([
    import("@web3modal/wagmi/react"),
    import("./wagmi"),
  ]);

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "";
  if (!projectId) {
    console.warn("Web3Modal: NEXT_PUBLIC_WALLETCONNECT_ID is empty");
  }

  createWeb3Modal({
    wagmiConfig,
    projectId,
    enableAnalytics: false,
  });

  inited = true;
}
