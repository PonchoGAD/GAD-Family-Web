// app/wallet/client/components/UI.tsx
'use client';
import React from 'react';

export function Card({
  title,
  subtitle,
  className,
  children,
}: {
  title?: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-[#2c3344] bg-[#1F2430]/60 p-4 ${className ?? ''}`}>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <div className="text-lg font-extrabold">{title}</div>}
          {subtitle && <div className="opacity-70 text-sm">{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// ✅ onClickAction — чтобы избежать предупреждений про Client Components
export function GButton({
  title,
  onClickAction,
  className,
  disabled,
}: {
  title: string;
  onClickAction?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClickAction}
      disabled={disabled}
      className={`px-4 py-3 rounded-xl font-semibold transition-colors ${
        disabled ? 'bg-[#2b3344] opacity-60 cursor-not-allowed' : 'bg-[#0A84FF] hover:bg-[#1a8cff]'
      } ${className ?? ''}`}
    >
      {title}
    </button>
  );
}
