"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type Toast = {
  id: number;
  kind: "info" | "success" | "error";
  text: string;
  link?: string;
};

const TxToastCtx = createContext<{
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: number) => void;
} | null>(null);

export function useTxToast() {
  const ctx = useContext(TxToastCtx);
  if (!ctx) throw new Error("TxToastProvider missing");
  return ctx;
}

export function TxToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs, { id, ...t }]);
    setTimeout(() => {
      setItems((xs) => xs.filter((x) => x.id !== id));
    }, 6000);
  }, []);

  const remove = useCallback((id: number) => {
    setItems((xs) => xs.filter((x) => x.id !== id));
  }, []);

  const value = useMemo(() => ({ push, remove }), [push, remove]);

  return (
    <TxToastCtx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {items.map((t) => (
          <div
            key={t.id}
            className={`min-w-[240px] max-w-[360px] border rounded p-3 text-sm shadow bg-white ${
              t.kind === "success"
                ? "border-green-500"
                : t.kind === "error"
                ? "border-red-500"
                : "border-gray-300"
            }`}
          >
            <div className="flex justify-between gap-3">
              <div>{t.text}</div>
              <button className="opacity-60" onClick={() => remove(t.id)}>
                ×
              </button>
            </div>
            {t.link && (
              <a
                className="text-xs underline opacity-70"
                href={t.link}
                target="_blank"
                rel="noreferrer"
              >
                View tx
              </a>
            )}
          </div>
        ))}
      </div>
    </TxToastCtx.Provider>
  );
}
