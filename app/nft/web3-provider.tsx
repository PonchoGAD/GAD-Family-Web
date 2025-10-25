"use client";
import { useEffect } from "react";

export default function Web3Provider() {
  useEffect(() => {
    const eth = (window as unknown as { ethereum?: unknown }).ethereum;
    if (!eth) {
      console.warn("MetaMask not found");
    }
  }, []);

  return null;
}
