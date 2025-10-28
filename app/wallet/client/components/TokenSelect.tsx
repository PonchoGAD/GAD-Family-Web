'use client';

import React, { useMemo, useState } from 'react';

export type TokenMeta = {
  address: `0x${string}` | 'BNB';
  symbol: string;
  name?: string;
  decimals: number;
  logoURI?: string;
};

export default function TokenSelect({
  value,
  tokens,
  onChange,
  className = '',
  placeholder = 'Select token',
}: {
  value: TokenMeta | null;
  tokens: TokenMeta[];
  onChange: (t: TokenMeta) => void;
  className?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return tokens.slice(0, 200);
    return tokens.filter((t) =>
      t.symbol.toLowerCase().includes(query) ||
      t.name?.toLowerCase().includes(query) ||
      t.address.toLowerCase().includes(query)
    ).slice(0, 200);
  }, [q, tokens]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full bg-[#1F2430] border border-[#2c3344] rounded-xl px-3 py-3 text-left hover:bg-[#242a39]"
      >
        {value ? (
          <span className="flex items-center gap-2">
            {value.logoURI ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.logoURI} alt="" className="w-5 h-5 rounded-full" />
            ) : (
              <span className="w-5 h-5 rounded-full bg-[#2c3344] inline-block" />
            )}
            <span className="font-semibold">{value.symbol}</span>
            <span className="opacity-60 text-sm">{value.name ?? ''}</span>
          </span>
        ) : (
          <span className="opacity-60">{placeholder}</span>
        )}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-[#2c3344] bg-[#0B0C10] shadow-xl p-2">
          <input
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            placeholder="Search name / symbol / address"
            className="w-full bg-[#10141E] border border-[#2c3344] rounded-lg px-3 py-2 outline-none"
          />
          <div className="max-h-64 overflow-auto mt-2 space-y-1">
            {shown.map((t) => (
              <button
                key={`${t.address}:${t.symbol}`}
                type="button"
                onClick={() => {
                  onChange(t);
                  setOpen(false);
                  setQ('');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#10141E] flex items-center gap-2"
              >
                {t.logoURI ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.logoURI} alt="" className="w-5 h-5 rounded-full" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-[#2c3344] inline-block" />
                )}
                <span className="font-semibold">{t.symbol}</span>
                <span className="opacity-60 text-sm">{t.name ?? ''}</span>
                <span className="ml-auto opacity-40 text-xs">{shortAddr(t.address)}</span>
              </button>
            ))}
            {shown.length === 0 && (
              <div className="opacity-60 text-sm px-2 py-3 text-center">No tokens</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function shortAddr(addr: string) {
  if (addr === 'BNB') return 'BNB';
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}
