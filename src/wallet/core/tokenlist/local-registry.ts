// src/wallet/core/tokenlist/local-registry.ts

export type LocalTokenMeta = {
  address: `0x${string}`;
  symbol: string;
  name?: string;
  decimals: number;
  logoURI?: string;
};

const KEY = 'gad_local_tokens_v1';

function safeParse(json: string | null): LocalTokenMeta[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: LocalTokenMeta[] = [];
    for (const it of parsed) {
      const t = it as Partial<LocalTokenMeta>;
      if (
        typeof t?.address === 'string' &&
        t.address.startsWith('0x') &&
        typeof t?.symbol === 'string' &&
        typeof t?.decimals === 'number'
      ) {
        out.push({
          address: t.address as `0x${string}`,
          symbol: t.symbol,
          name: t.name ?? '',
          decimals: t.decimals,
          logoURI: t.logoURI ?? '',
        });
      }
    }
    return out;
  } catch {
    return [];
  }
}

function save(list: LocalTokenMeta[]) {
  if (typeof window === 'undefined') return;
  const uniq = new Map<string, LocalTokenMeta>();
  for (const t of list) {
    uniq.set(t.address.toLowerCase(), t);
  }
  localStorage.setItem(KEY, JSON.stringify(Array.from(uniq.values())));
}

export function getLocalTokens(): LocalTokenMeta[] {
  if (typeof window === 'undefined') return [];
  return safeParse(localStorage.getItem(KEY));
}

export function addLocalToken(t: LocalTokenMeta) {
  const curr = getLocalTokens();
  const key = t.address.toLowerCase();
  const exists = curr.find((x) => x.address.toLowerCase() === key);
  if (exists) {
    // обновим метаданные
    const next = curr.map((x) => (x.address.toLowerCase() === key ? t : x));
    save(next);
  } else {
    save([...curr, t]);
  }
}

export function removeLocalToken(address: `0x${string}`) {
  const curr = getLocalTokens();
  const next = curr.filter((x) => x.address.toLowerCase() !== address.toLowerCase());
  save(next);
}
