// src/wallet/core/state/settings.ts

const KEY = 'gad_settings_v1';

export type Settings = {
  unlockTtlMin: number; // авто-лок, минуты
};

const DEFAULTS: Settings = {
  unlockTtlMin: 20,
};

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      unlockTtlMin: Number(parsed.unlockTtlMin ?? DEFAULTS.unlockTtlMin),
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(patch: Partial<Settings>) {
  if (typeof window === 'undefined') return;
  const prev = loadSettings();
  const next = { ...prev, ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
}
