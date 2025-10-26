// src/wallet/adapters/storage.expo.ts

// Ленивая подмена expo-secure-store: на вебе (или без пакета) берём шим.
// ВАЖНО: здесь НЕТ статического `import 'expo-secure-store'`, чтобы TS не пытался его типизировать.
type SecureStoreLike = {
  setItemAsync(key: string, value: string): Promise<void>;
  getItemAsync(key: string): Promise<string | null>;
  deleteItemAsync(key: string): Promise<void>;
};

async function loadStore(): Promise<SecureStoreLike> {
  try {
    const mod = (await import('expo-secure-store')) as unknown as SecureStoreLike;
    return mod;
  } catch {
    const mod = (await import('../../shims/expo-secure-store')) as unknown as SecureStoreLike;
    return mod;
  }
}

const ENC_KEY = 'encryptedMnemonic';

export async function setEncryptedMnemonic(mnemonic: string, _password?: string) {
  // пароль на Expo не используем — метим как использованный
  void _password;
  const SecureStore = await loadStore();
  await SecureStore.setItemAsync(ENC_KEY, mnemonic);
}

export async function getEncryptedMnemonic(_password: string): Promise<string | null> {
  void _password;
  const SecureStore = await loadStore();
  return SecureStore.getItemAsync(ENC_KEY);
}

export async function clearAll() {
  const SecureStore = await loadStore();
  await SecureStore.deleteItemAsync(ENC_KEY);
}
