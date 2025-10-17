"use client";

import { useState } from "react";
import { shorten } from "../../../lib/nft/utils";

export default function AddressBadge({
  address,
  title = "Address",
  className = "",
}: {
  address?: string;
  title?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const a = address || "";

  const copy = async () => {
    if (!a) return;
    try {
      await navigator.clipboard.writeText(a);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <button
      onClick={copy}
      className={`font-mono text-xs border rounded px-2 py-1 hover:bg-black hover:text-white transition ${className}`}
      title={title}
    >
      {a ? shorten(a) : "—"} {copied ? "✓" : ""}
    </button>
  );
}
