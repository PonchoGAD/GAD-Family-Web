'use client';

import React from 'react';

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // no-op
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800"
      aria-label="Copy address"
      type="button"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
