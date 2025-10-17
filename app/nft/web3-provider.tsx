"use client";
import { useEffect } from "react";

export default function Web3Provider() {
  useEffect(() => {
    if (!(window as any).ethereum) {
      console.warn("MetaMask not found");
    }
  }, []);

  return null;
}
