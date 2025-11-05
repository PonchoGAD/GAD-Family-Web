'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Address } from 'viem';
import { deriveAddressFromMnemonic } from '@/src/wallet/core/services/seed';
import { getEncryptedMnemonic } from '@wallet/adapters/storage.web';

type UnlockCtx = {
  isUnlocked: boolean;
  address?: Address;
  /** Если залочено — спросит пароль, расшифрует и запустит 20-минутную сессию */
  requireUnlock: () => Promise<void>;
  /** Вариант без prompt: расшифровать по паролю и запустить сессию */
  unlockWithPassword: (password: string) => Promise<void>;
  /** Возвращает актуальную мнемонику из памяти. Если залочено — кидает ошибку. */
  getMnemonic: () => string;
  /** Прямо установить сессию (используем сразу после Create/Open), без ввода пароля повторно */
  setSession: (mnemonic: string) => void;
  /** Немедленно залочить кошелёк */
  lockNow: () => void;
};

const UnlockContext = createContext<UnlockCtx | null>(null);

const SESSION_TTL_MS = 20 * 60 * 1000; // 20 минут
const SESSION_KEY = 'gad_wallet_session_expires_at'; // только отметка времени, без данных

export function UnlockProvider({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setUnlocked] = useState(false);
  const [address, setAddress] = useState<Address | undefined>(undefined);

  // 🔐 реальная мнемоника только в оперативке
  const mnemonicRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const lockNow = useCallback(() => {
    mnemonicRef.current = null;
    setUnlocked(false);
    setAddress(undefined);
    clearTimer();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const startTtl = useCallback(() => {
    clearTimer();
    const expires = Date.now() + SESSION_TTL_MS;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, String(expires));
    }
    timerRef.current = setTimeout(() => {
      lockNow();
    }, SESSION_TTL_MS);
  }, [lockNow]);

  const setSession = useCallback((mnemonic: string) => {
    mnemonicRef.current = mnemonic;
    setUnlocked(true);
    try {
      const addr = deriveAddressFromMnemonic(mnemonic, 0) as Address;
      setAddress(addr);
    } catch {
      // ignore
    }
    startTtl();
  }, [startTtl]);

  const getMnemonic = useCallback(() => {
    if (!isUnlocked || !mnemonicRef.current) {
      throw new Error('Wallet is locked');
    }
    return mnemonicRef.current;
  }, [isUnlocked]);

  const unlockWithPassword = useCallback(async (password: string) => {
    const pwd = password.trim();
    if (!pwd) throw new Error('Password is required');
    const m = await getEncryptedMnemonic(pwd);
    if (!m) throw new Error('Wrong password or no wallet found');
    setSession(m);
  }, [setSession]);

  const requireUnlock = useCallback(async () => {
    // уже есть валидная сессия?
    if (isUnlocked && mnemonicRef.current) {
      // продлим TTL на каждое обращение
      startTtl();
      return;
    }

    const pwd = window.prompt('Enter your wallet password to unlock');
    if (!pwd) throw new Error('Password is required');

    const m = await getEncryptedMnemonic(pwd);
    if (!m) throw new Error('Wrong password or no wallet found');

    setSession(m);
  }, [isUnlocked, setSession, startTtl]);

  // при маунте — проверим неактуальную метку и автолок
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const expires = Number(raw);
    if (!Number.isFinite(expires) || Date.now() > expires) {
      sessionStorage.removeItem(SESSION_KEY);
      lockNow();
    } else {
      // у нас нет мнемоники в ОЗУ после перезагрузки страницы — так и должно быть.
      // метку стираем и считаем, что залокано.
      sessionStorage.removeItem(SESSION_KEY);
      lockNow();
    }
  }, [lockNow]);

  const value = useMemo<UnlockCtx>(() => ({
    isUnlocked,
    address,
    requireUnlock,
    unlockWithPassword,
    getMnemonic,
    setSession,
    lockNow,
  }), [address, getMnemonic, isUnlocked, lockNow, requireUnlock, setSession, unlockWithPassword]);

  return <UnlockContext.Provider value={value}>{children}</UnlockContext.Provider>;
}

export function useUnlock(): UnlockCtx {
  const ctx = useContext(UnlockContext);
  if (!ctx) throw new Error('useUnlock must be used within UnlockProvider');
  return ctx;
}
