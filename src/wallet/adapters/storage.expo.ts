import * as SecureStore from 'expo-secure-store';

const ENC_KEY = 'encryptedMnemonic';

export async function setEncryptedMnemonic(mnemonic: string, _password?: string) {
  // пароль не используется в Expo — но «пометим» как использованный:
  void _password;
  await SecureStore.setItemAsync(ENC_KEY, mnemonic);
}

export async function getEncryptedMnemonic(_password: string): Promise<string | null> {
  void _password;
  return SecureStore.getItemAsync(ENC_KEY);
}

export async function clearAll() {
  await SecureStore.deleteItemAsync(ENC_KEY);
}
