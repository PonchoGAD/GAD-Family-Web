'use client';

import React, { useEffect, useRef } from 'react';

type ModalProps = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onCloseAction: () => void;
  widthClassName?: string; // например 'max-w-md'
};

export default function Modal({
  open,
  title,
  children,
  onCloseAction,
  widthClassName = 'max-w-md',
}: ModalProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseAction();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCloseAction]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onCloseAction}
        aria-hidden="true"
      />
      <div
        ref={ref}
        className={`relative z-10 w-full ${widthClassName} rounded-2xl border border-[#2c3344] bg-[#121826] shadow-2xl`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2c3344]">
          <div className="text-lg font-bold">{title ?? 'Dialog'}</div>
          <button
            type="button"
            onClick={onCloseAction}
            className="px-2 py-1 rounded-lg bg-[#1F2430] hover:bg-[#242a39] border border-[#2c3344]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
