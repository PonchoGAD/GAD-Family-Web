"use client";

import React from "react";

type Props = {
  hash: string | null;
  explorerBase: string; // например "https://bscscan.com/tx" (без /tx/ в конце — мы нормализуем)
  /** Имя оканчивается на Action — соответствует правилу Next TS71007 */
  onCloseAction?: () => void;
};

export default function TxToast({ hash, explorerBase, onCloseAction }: Props) {
  const handleClose = React.useCallback(() => {
    onCloseAction?.();
  }, [onCloseAction]);

  // Хук всегда вызывается. Слушаем Escape только когда hash есть.
  React.useEffect(() => {
    if (!hash) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hash, handleClose]);

  if (!hash) return null;

  const base = explorerBase.replace(/\/+$/, ""); // убрать хвостовые /
  return (
    <div className="fixed bottom-4 right-4 z-[1100] max-w-sm w-[92vw] sm:w-[420px]">
      <div className="rounded-xl border border-white/10 bg-white/10 backdrop-blur p-4 text-white shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-sm font-semibold">Transaction submitted</div>
            <a
              className="text-xs underline underline-offset-4 opacity-90 hover:opacity-100"
              href={`${base}/${hash}`}
              target="_blank"
              rel="noreferrer"
            >
              View on explorer
            </a>
          </div>
          <button
            onClick={handleClose}
            className="text-xs px-2 py-1 rounded border border-white/20 hover:border-white/40"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
