/**
 * Minimal WebAuthn verification helpers for the admin passkey flow.
 * Pure Web Crypto, no native modules, safe on the Worker runtime.
 */

/* ---------- base64url ---------- */
export function b64uToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToB64u(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/* ---------- tiny CBOR decoder (subset used by WebAuthn) ---------- */
type Cbor = number | string | Uint8Array | Cbor[] | { [k: string]: Cbor } | boolean | null;

function decodeCbor(buf: Uint8Array, start = 0): { value: Cbor; next: number } {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const first = buf[start]!;
  const major = first >> 5;
  const minor = first & 0x1f;
  let pos = start + 1;

  const readLen = (): number => {
    if (minor < 24) return minor;
    if (minor === 24) return buf[pos++]!;
    if (minor === 25) {
      const v = view.getUint16(pos);
      pos += 2;
      return v;
    }
    if (minor === 26) {
      const v = view.getUint32(pos);
      pos += 4;
      return v;
    }
    throw new Error("Unsupported CBOR length");
  };

  switch (major) {
    case 0:
      return { value: readLen(), next: pos };
    case 1:
      return { value: -1 - readLen(), next: pos };
    case 2: {
      const len = readLen();
      return { value: buf.slice(pos, pos + len), next: pos + len };
    }
    case 3: {
      const len = readLen();
      return { value: new TextDecoder().decode(buf.slice(pos, pos + len)), next: pos + len };
    }
    case 4: {
      const len = readLen();
      const arr: Cbor[] = [];
      for (let i = 0; i < len; i++) {
        const r = decodeCbor(buf, pos);
        arr.push(r.value);
        pos = r.next;
      }
      return { value: arr, next: pos };
    }
    case 5: {
      const len = readLen();
      const obj: { [k: string]: Cbor } = {};
      for (let i = 0; i < len; i++) {
        const k = decodeCbor(buf, pos);
        const v = decodeCbor(buf, k.next);
        obj[String(k.value)] = v.value;
        pos = v.next;
      }
      return { value: obj, next: pos };
    }
    case 7: {
      if (minor === 20) return { value: false, next: pos };
      if (minor === 21) return { value: true, next: pos };
      if (minor === 22) return { value: null, next: pos };
      throw new Error("Unsupported CBOR simple value");
    }
    default:
      throw new Error("Unsupported CBOR major type");
  }
}

/* ---------- attestation parsing ---------- */
export interface ParsedCredential {
  credentialId: string;
  publicKey: string; // base64url COSE key
  algorithm: number;
  signCount: number;
}

export function parseAttestationObject(attestationObjectB64u: string): ParsedCredential {
  const decoded = decodeCbor(b64uToBytes(attestationObjectB64u)).value as { [k: string]: Cbor };
  const authData = decoded["authData"] as Uint8Array;
  if (!(authData instanceof Uint8Array)) throw new Error("Missing authenticator data.");

  const view = new DataView(authData.buffer, authData.byteOffset, authData.byteLength);
  const flags = authData[32]!;
  if (!(flags & 0x40)) throw new Error("Passkey did not include a credential.");
  const signCount = view.getUint32(33);

  let pos = 37 + 16; // aaguid
  const idLen = view.getUint16(pos);
  pos += 2;
  const credentialId = authData.slice(pos, pos + idLen);
  pos += idLen;

  const coseBytes = authData.slice(pos);
  const cose = decodeCbor(coseBytes).value as { [k: string]: Cbor };
  const algorithm = Number(cose["3"] ?? -7);

  return {
    credentialId: bytesToB64u(credentialId),
    publicKey: bytesToB64u(coseBytes),
    algorithm,
    signCount,
  };
}

/* ---------- assertion verification ---------- */
async function importCoseKey(coseB64u: string, algorithm: number): Promise<CryptoKey> {
  const cose = decodeCbor(b64uToBytes(coseB64u)).value as { [k: string]: Cbor };
  if (algorithm === -7) {
    const x = cose["-2"] as Uint8Array;
    const y = cose["-3"] as Uint8Array;
    return crypto.subtle.importKey(
      "jwk",
      { kty: "EC", crv: "P-256", x: bytesToB64u(x), y: bytesToB64u(y), ext: true },
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );
  }
  if (algorithm === -257) {
    const n = cose["-1"] as Uint8Array;
    const e = cose["-2"] as Uint8Array;
    return crypto.subtle.importKey(
      "jwk",
      { kty: "RSA", n: bytesToB64u(n), e: bytesToB64u(e), alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
  }
  throw new Error("Unsupported passkey algorithm.");
}

/** DER ECDSA signature -> raw r||s (64 bytes) for Web Crypto. */
function derToRaw(sig: Uint8Array): Uint8Array {
  if (sig[0] !== 0x30) return sig;
  let pos = 2;
  const read = () => {
    pos++; // 0x02
    const len = sig[pos++]!;
    let v = sig.slice(pos, pos + len);
    pos += len;
    while (v.length > 32 && v[0] === 0) v = v.slice(1);
    const out = new Uint8Array(32);
    out.set(v, 32 - v.length);
    return out;
  };
  const r = read();
  const s = read();
  const raw = new Uint8Array(64);
  raw.set(r, 0);
  raw.set(s, 32);
  return raw;
}

export interface AssertionInput {
  publicKey: string;
  algorithm: number;
  clientDataJSON: string;
  authenticatorData: string;
  signature: string;
  expectedChallenge: string;
  expectedOrigin: string;
}

export async function verifyAssertion(input: AssertionInput): Promise<{ signCount: number }> {
  const clientDataBytes = b64uToBytes(input.clientDataJSON);
  const clientData = JSON.parse(new TextDecoder().decode(clientDataBytes)) as {
    type?: string;
    challenge?: string;
    origin?: string;
  };
  if (clientData.type !== "webauthn.get") throw new Error("Unexpected passkey ceremony.");
  if (clientData.challenge !== input.expectedChallenge) throw new Error("Passkey challenge mismatch.");
  if (clientData.origin !== input.expectedOrigin) throw new Error("Passkey origin mismatch.");

  const authData = b64uToBytes(input.authenticatorData);
  const flags = authData[32]!;
  if (!(flags & 0x01)) throw new Error("Passkey was not verified by the authenticator.");
  const signCount = new DataView(authData.buffer, authData.byteOffset, authData.byteLength).getUint32(33);

  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", clientDataBytes as unknown as ArrayBuffer));
  const signed = new Uint8Array(authData.length + hash.length);
  signed.set(authData, 0);
  signed.set(hash, authData.length);

  const key = await importCoseKey(input.publicKey, input.algorithm);
  const rawSig = b64uToBytes(input.signature);
  const ok =
    input.algorithm === -7
      ? await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, derToRaw(rawSig) as unknown as ArrayBuffer, signed as unknown as ArrayBuffer)
      : await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, rawSig as unknown as ArrayBuffer, signed as unknown as ArrayBuffer);
  if (!ok) throw new Error("Passkey signature did not verify.");
  return { signCount };
}

/* ---------- TOTP (RFC 6238, SHA-1, 6 digits, 30s) ---------- */
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function randomBase32Secret(length = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (const b of bytes) out += B32[b % 32];
  return out;
}

function base32ToBytes(secret: string): Uint8Array {
  const clean = secret.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    value = (value << 5) | B32.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((value >>> bits) & 0xff);
    }
  }
  return new Uint8Array(out);
}

async function totpAt(secret: string, counter: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    base32ToBytes(secret) as unknown as ArrayBuffer,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const msg = new Uint8Array(8);
  new DataView(msg.buffer).setUint32(4, counter);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, msg as unknown as ArrayBuffer));
  const offset = mac[19]! & 0x0f;
  const bin =
    ((mac[offset]! & 0x7f) << 24) |
    (mac[offset + 1]! << 16) |
    (mac[offset + 2]! << 8) |
    mac[offset + 3]!;
  return String(bin % 1_000_000).padStart(6, "0");
}

/** Accepts the current code plus one step of drift either side. */
export async function verifyTotp(secret: string, code: string): Promise<boolean> {
  const clean = code.replace(/\D/g, "");
  if (clean.length !== 6 || !secret) return false;
  const step = Math.floor(Date.now() / 30000);
  for (const c of [step - 1, step, step + 1]) {
    if ((await totpAt(secret, c)) === clean) return true;
  }
  return false;
}

export function otpAuthUri(secret: string, account: string, issuer = "Portfolio OS Admin"): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
