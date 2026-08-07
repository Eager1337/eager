/**
 * Stateless WebAuthn challenges. The challenge carries its own timestamp and an
 * HMAC, so it can be verified on a later request without server-side storage.
 */
import { bytesToB64u, b64uToBytes } from "./webauthn.server";

const TTL_MS = 5 * 60 * 1000;

async function key() {
  const secret = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? process.env["SUPABASE_URL"] ?? "fallback";
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret) as unknown as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export async function createChallenge(): Promise<string> {
  const nonce = crypto.getRandomValues(new Uint8Array(16));
  const ts = Date.now();
  const body = new Uint8Array(24);
  body.set(nonce, 0);
  new DataView(body.buffer).setFloat64(16, ts);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", await key(), body as unknown as ArrayBuffer));
  const out = new Uint8Array(24 + 16);
  out.set(body, 0);
  out.set(mac.slice(0, 16), 24);
  return bytesToB64u(out);
}

export async function verifyChallenge(challenge: string): Promise<boolean> {
  try {
    const bytes = b64uToBytes(challenge);
    if (bytes.length !== 40) return false;
    const body = bytes.slice(0, 24);
    const mac = bytes.slice(24);
    const expected = new Uint8Array(
      await crypto.subtle.sign("HMAC", await key(), body as unknown as ArrayBuffer),
    ).slice(0, 16);
    let diff = 0;
    for (let i = 0; i < 16; i++) diff |= mac[i]! ^ expected[i]!;
    if (diff !== 0) return false;
    const ts = new DataView(body.buffer, body.byteOffset, body.byteLength).getFloat64(16);
    return Date.now() - ts < TTL_MS && Date.now() - ts > -30_000;
  } catch {
    return false;
  }
}
