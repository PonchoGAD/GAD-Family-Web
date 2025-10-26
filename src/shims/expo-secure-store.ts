// Web shim for "expo-secure-store" (использует localStorage)
type Stored = string | null;

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(key, value);
  }
}

export async function getItemAsync(key: string): Promise<Stored> {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(key);
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(key);
  }
}
