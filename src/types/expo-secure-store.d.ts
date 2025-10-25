// Ambient-типизация для TS (чтобы не ругался при import 'expo-secure-store')
declare module 'expo-secure-store' {
  export function setItemAsync(
    key: string,
    value: string,
    options?: { keychainService?: string; accessible?: string }
  ): Promise<void>;

  export function getItemAsync(
    key: string,
    options?: { keychainService?: string; requireAuthentication?: boolean }
  ): Promise<string | null>;

  export function deleteItemAsync(
    key: string,
    options?: { keychainService?: string }
  ): Promise<void>;
}
