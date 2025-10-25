// Веб-заглушка для expo-secure-store (Next.js среда)
// Используем localStorage. На сервере эти функции просто no-op.

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (!isBrowser) return;
  localStorage.setItem(key, value);
}

export async function getItemAsync(key: string): Promise<string | null> {
  if (!isBrowser) return null;
  return localStorage.getItem(key);
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (!isBrowser) return;
  localStorage.removeItem(key);
}
