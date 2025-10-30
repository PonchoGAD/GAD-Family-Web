'use client';

import { useEffect } from "react";

type Props = {
  open: boolean;
  /** ✅ соответствует правилу Next: имя заканчивается на Action */
  onCloseAction?: () => void;
  status: "idle" | "signing" | "pending" | "success" | "error";
  txHash?: string;
  message?: string;
  errorText?: string;
  explorerBase?: string; // напр. "https://bscscan.com/tx/"
};

export default function TransactionModal(props: Props) {
  const {
    open,
    onCloseAction,
    status,
    txHash,
    message,
    errorText,
    explorerBase = "https://bscscan.com/tx/",
  } = props;

  // 🔧 Legacy-шим: поддержка старого пропса onClose без объявления в типе
  // (так не будет триггериться 71007, но старые вызовы продолжат работать)
  const legacyOnClose =
    (props as unknown as { onClose?: () => void })?.onClose ?? undefined;

  const handleClose =
    onCloseAction ?? legacyOnClose ?? (() => { /* no-op */ });

  useEffect(() => {
    // выключаем скролл под модалкой
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const pill = (t: string) => (
    <span className="px-2 py-0.5 text-xs rounded bg-black text-white">{t}</span>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
      <div className="w-[92vw] max-w-md rounded-2xl bg-white shadow-xl p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Transaction</h3>
          <button onClick={handleClose} className="text-sm opacity-60 hover:opacity-100">Close</button>
        </div>

        <div className="mt-3 space-y-2">
          {message && <div className="text-sm">{message}</div>}

          {status === "signing" && (
            <div className="text-sm flex items-center gap-2">
              {pill("Sign in wallet")}
              <span>Confirm this action in your wallet…</span>
            </div>
          )}
          {status === "pending" && (
            <div className="text-sm flex items-center gap-2">
              {pill("Pending")}
              <span>Broadcasted. Waiting for confirmations…</span>
            </div>
          )}
          {status === "success" && (
            <div className="text-sm flex items-center gap-2">
              {pill("Success")}
              <span>Transaction confirmed ✅</span>
            </div>
          )}
          {status === "error" && (
            <div className="text-sm flex items-center gap-2">
              {pill("Error")}
              <span className="text-red-600">{errorText || "Transaction failed"}</span>
            </div>
          )}

          {txHash && (
            <a
              className="inline-flex items-center gap-2 text-sm underline underline-offset-4"
              href={`${explorerBase}${txHash}`}
              target="_blank" rel="noreferrer"
            >
              View on Explorer
            </a>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={handleClose} className="border px-3 py-2 rounded hover:bg-black hover:text-white">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
