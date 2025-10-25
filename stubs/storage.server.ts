// stubs/storage.server.ts
// Заглушка для IndexedDB-хранилища, используемая на сервере.
// Позволяет избежать ReferenceError: indexedDB is not defined.

export async function getEncryptedMnemonic(_password: string): Promise<null> {
  return null;
}

export async function setEncryptedMnemonic(_password: string, _mnemonic: string): Promise<void> {
  // no-op
}

export async function clearAll(): Promise<void> {
  // no-op
}
