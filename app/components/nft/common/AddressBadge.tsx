"use client";

import { useState } from "react";

// Локальный helper, чтобы не тянуть лишние импорты
function shorten(addr?: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "—";
}

export default function AddressBadge({
  address,
  title,
  className = "",
}: {
  address?: `0x${string}` | string;
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
    } catch {
      /* noop */
    }
  };

  return (
    <button
      className={`font-mono border rounded px-3 py-1 text-sm ${className}`}
      title={a}
      onClick={copy}
    >
      {title ? <span className="mr-2 opacity-70">{title}:</span> : null}
      <span>{shorten(a)}</span>
      <span className="ml-2 opacity-60">{copied ? "✓" : "⧉"}</span>
    </button>
  );
}
