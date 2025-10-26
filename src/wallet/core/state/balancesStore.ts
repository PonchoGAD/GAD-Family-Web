'use client';
import { create } from 'zustand';

interface BalancesState {
  /** карта: адрес токена (или символ) -> баланс в человекочитаемом числе */
  balances: Record<string, number>;
  setBalance: (tokenKey: string, amount: number) => void;
  setMany: (entries: Array<[string, number]>) => void;
  reset: () => void;
}

export const useBalancesStore = create<BalancesState>((set) => ({
  balances: {},
  setBalance: (tokenKey, amount) =>
    set((state) => ({ balances: { ...state.balances, [tokenKey]: amount } })),
  setMany: (entries) =>
    set((state) => {
      const next = { ...state.balances };
      for (const [k, v] of entries) next[k] = v;
      return { balances: next };
    }),
  reset: () => set({ balances: {} }),
}));
