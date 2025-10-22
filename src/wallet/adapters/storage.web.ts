// src/wallet/adapters/storage.web.ts
// Secure local storage for WEB using AES-GCM + PBKDF2
// API: setEncryptedMnemonic / getEncryptedMnemonic / clearAll

const ENC_KEY = 'encryptedMnemonic';

// base64 helpers
const b64 = {
  enc: (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))),
  dec: (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0)).buffer,
};

// copy Uint8Array -> "real" ArrayBuffer (чтобы не было SharedArrayBuffer-типа)
function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const out = new ArrayBuffer(u8.byteLength);
  new Uint8Array(out).set(u8);
  return out;
}

// Derive AES key from password + salt (PBKDF2-SHA256, 100k)
async function deriveKey(password: string, saltU8: Uint8Array) {
  const enc = new TextEncoder();
  const saltBuf = toArrayBuffer(saltU8); // <- ключевой фикс
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuf,           // BufferSource = ArrayBuffer ✅
      iterations: 100_000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function setEncryptedMnemonic(mnemonic: string, password: string) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(mnemonic)
  );

  const stored = {
    iv: b64.enc(iv.buffer),
    salt: b64.enc(salt.buffer),
    data: b64.enc(ciphertext),
  };
  localStorage.setItem(ENC_KEY, JSON.stringify(stored));
}

export async function getEncryptedMnemonic(password: string): Promise<string | null> {
  const raw = localStorage.getItem(ENC_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { iv: string; salt: string; data: string };
    const iv = new Uint8Array(b64.dec(parsed.iv));
    const salt = new Uint8Array(b64.dec(parsed.salt));
    const data = b64.dec(parsed.data);

    const key = await deriveKey(password, salt);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return new TextDecoder().decode(plain);
  } catch (e) {
    console.error('Decryption failed', e);
    return null;
  }
}

export function clearAll() {
  localStorage.removeItem(ENC_KEY);
}
