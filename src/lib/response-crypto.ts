type EncryptedApiEnvelope = {
  encrypted: true;
  payload: string;
  iv: string;
  tag: string;
  alg?: string;
};

function isEncryptedEnvelope(value: unknown): value is EncryptedApiEnvelope {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<EncryptedApiEnvelope>;
  return (
    v.encrypted === true &&
    typeof v.payload === "string" &&
    typeof v.iv === "string" &&
    typeof v.tag === "string"
  );
}

function b64ToBytes(base64: string): Uint8Array {
  const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLen);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

export async function maybeDecryptResponse<T>(
  input: T,
  secret: string,
): Promise<T> {
  if (!isEncryptedEnvelope(input)) return input;
  if (!secret) throw new Error("Missing response encryption key");
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("WebCrypto is required for encrypted responses");
  }

  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const keyHash = await window.crypto.subtle.digest("SHA-256", enc.encode(secret));
  const key = await window.crypto.subtle.importKey(
    "raw",
    keyHash,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  const iv = b64ToBytes(input.iv);
  const cipher = b64ToBytes(input.payload);
  const tag = b64ToBytes(input.tag);
  const combined = new Uint8Array(cipher.length + tag.length);
  combined.set(cipher, 0);
  combined.set(tag, cipher.length);

  const plain = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource, tagLength: 128 },
    key,
    combined as unknown as BufferSource,
  );

  return JSON.parse(dec.decode(plain)) as T;
}
