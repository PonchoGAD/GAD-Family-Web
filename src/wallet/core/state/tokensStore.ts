'use client';
import { create } from 'zustand';

interface TokensState {
  /** простая карта: символ -> адрес (строка; может быть 0xeeee... для нативного) */
  tokens: Record<string, string>;
  addToken: (symbol: string, address: string) => void;
  removeToken: (symbol: string) => void;
  reset: () => void;
}

export const useTokensStore = create<TokensState>((set) => ({
  tokens: {},
  addToken: (symbol, address) =>
    set((state) => ({ tokens: { ...state.tokens, [symbol]: address } })),
  removeToken: (symbol) =>
    set((state) => {
      const next = { ...state.tokens };
      delete next[symbol];
      return { tokens: next };
    }),
  reset: () => set({ tokens: {} }),
}));
