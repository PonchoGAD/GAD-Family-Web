"use client";

import { useEffect } from "react";

export default function TxToast({
  hash,
  explorerBase,
  onClose,
}: {
  hash: string | null;
  explorerBase: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [hash, onClose]);

  if (!hash) return null;
  return (
    <div className="fixed z-50 bottom-4 right-4 bg-black text-white rounded-lg shadow-lg p-3 text-sm">
      Tx sent:
      <a
        className="underline ml-1"
        href={`${explorerBase}/tx/${hash}`}
        target="_blank"
        rel="noreferrer"
      >
        view on explorer
      </a>
    </div>
  );
}
