/** Password hashing for the dashboard-editable admin credentials. */

const ENC = new TextEncoder();

function toHex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function derive(password: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", ENC.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: ENC.encode(salt), iterations: 120000 },
    key,
    256,
  );
  return toHex(bits);
}

export async function hashPassword(password: string) {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
  return { salt, hash: await derive(password, salt) };
}

export async function verifyPassword(password: string, salt: string, hash: string) {
  if (!salt || !hash) return false;
  const candidate = await derive(password, salt);
  if (candidate.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i += 1) diff |= candidate.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}
