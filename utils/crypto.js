const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const VERSION = 'v1';

function getKey() {
  const key = process.env.MESSAGE_SECRET;
  if (!key) return null;
  // Derive 32-byte key from provided secret using SHA-256
  return crypto.createHash('sha256').update(String(key)).digest();
}

function encryptString(plain) {
  const key = getKey();
  if (!key) return plain;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'),
    cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${VERSION}:${iv.toString('base64')}:
    ${enc.toString('base64')}:${tag.toString('base64')}`;
}

function decryptString(data) {
  if (!data || typeof data !== 'string') return '';
  if (!data.startsWith(`${VERSION}:`)) return data; // assume plaintext
  const key = getKey();
  if (!key) return data; // cannot decrypt, return as is
  try {
    const [, ivB64, ctB64, tagB64] = data.split(':');
    const iv = Buffer.from(ivB64, 'base64');
    const ct = Buffer.from(ctB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(ct), decipher.final()]);
    return dec.toString('utf8');
  } catch (e) {
    return data; // fallback
  }
}

module.exports = { encryptString, decryptString };
