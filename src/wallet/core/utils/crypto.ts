// src/wallet/core/utils/crypto.ts
// Универсальные утилиты криптографии для Web и Node.js
// Работают одинаково в Next.js и Expo (WebCrypto / Node crypto)

// Получение случайных байт
export async function getRandomBytes(length: number): Promise<Uint8Array> {
  // В браузере
  if (typeof window !== 'undefined' && typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const out = new Uint8Array(length);
    crypto.getRandomValues(out);
    return out;
  }

  // В Node.js (например, при server-side build)
  const nodeCrypto = await import('crypto');
  const buf: Buffer = nodeCrypto.randomBytes(length);
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

// Простое преобразование ArrayBuffer → Base64
export function toBase64(buf: ArrayBuffer): string {
  if (typeof Buffer !== 'undefined') {
    // Node.js / SSR
    return Buffer.from(new Uint8Array(buf)).toString('base64');
  }
  // Браузер
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// Обратное преобразование Base64 → ArrayBuffer
export function fromBase64(b64: string): ArrayBuffer {
  if (typeof Buffer !== 'undefined') {
    // Node.js / SSR
    const buf = Buffer.from(b64, 'base64');
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }
  // Браузер
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// Создание SHA-256 хэша строки
export async function sha256(message: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } else {
    const { createHash } = await import('crypto');
    return createHash('sha256').update(message).digest('hex');
  }
}

// Генерация UUID v4
export function uuidv4(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
