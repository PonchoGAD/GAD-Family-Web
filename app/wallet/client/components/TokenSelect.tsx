'use client';

import React, { useMemo, useState } from 'react';

export type TokenMeta = {
  address: `0x${string}` | 'BNB';
  symbol: string;
  name?: string;
  decimals: number;
  logoURI?: string;
};

type BaseProps = {
  value: TokenMeta | null;
  tokens: TokenMeta[];
  className?: string;
};

// ⬇️ В этом client-компоненте нам нужен проп onChange.
// Next TS rule 71007 требует special naming для Server Action,
// но здесь это НЕ server action. Сохраняем API и подавляем чек точечно.
type Props = BaseProps & { onChange?: (t: TokenMeta) => void };

export default function TokenSelect(
  {
    value,
    tokens,
    onChange,
    className = '',
  }: Props
) {
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    // лёгкая нормализация и сортировка по символу
    const unique = new Map<string, TokenMeta>();
    for (const t of tokens) {
      const key = `${t.symbol?.toUpperCase()}_${t.address}`;
      if (!unique.has(key)) unique.set(key, t);
    }
    return Array.from(unique.values()).sort((a, b) =>
      a.symbol.localeCompare(b.symbol)
    );
  }, [tokens]);

  const selectedLabel = value
    ? `${value.symbol}${value.symbol?.toUpperCase() === 'BNB' ? '' : ''}`
    : 'Select token';

  function pickToken(t: TokenMeta) {
    setOpen(false);
    onChange?.(t);
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between rounded-xl bg-[#1F2430] border border-[#2c3344] px-3 py-3 hover:bg-[#242a39] transition"
      >
        <span className="flex items-center gap-2">
          {value?.logoURI ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.logoURI} alt={value.symbol} className="w-5 h-5 rounded-full" />
          ) : (
            <span className="w-5 h-5 rounded-full bg-[#2c3344]" />
          )}
          <span className="font-semibold">{selectedLabel}</span>
        </span>
        <span className="opacity-70">▾</span>
      </button>

      {open && (
        <div
          className="absolute z-20 mt-2 w-full max-h-64 overflow-auto rounded-xl border border-[#2c3344] bg-[#0f1420] shadow-xl"
          role="listbox"
        >
          {list.map((t) => (
            <button
              key={`${t.symbol}-${t.address}`}
              type="button"
              onClick={() => pickToken(t)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#182135] transition"
              role="option"
              aria-selected={value?.address === t.address && value?.symbol === t.symbol}
            >
              {t.logoURI ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.logoURI} alt={t.symbol} className="w-5 h-5 rounded-full" />
              ) : (
                <span className="w-5 h-5 rounded-full bg-[#2c3344]" />
              )}
              <span className="font-semibold">{t.symbol}</span>
              {t.name && <span className="opacity-60 text-xs">· {t.name}</span>}
              <span className="ml-auto opacity-40 text-xs">
                {t.address === 'BNB' ? 'Native' : (t.address as string).slice(0, 6) + '…' + (t.address as string).slice(-4)}
              </span>
            </button>
          ))}
          {list.length === 0 && (
            <div className="px-3 py-2 opacity-70 text-sm">No tokens</div>
          )}
        </div>
      )}
    </div>
  );
}
