// Pure Web Crypto JWT — no external libraries
// Works in Next.js Edge Runtime and Node.js

const SECRET = process.env.JWT_SECRET!;

function base64url(str: string): string {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64urlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}

async function getKey(usage: "sign" | "verify"): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage]
  );
}

export interface SessionPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  shopifyCustomerId?: string;
  shopifyAccessToken?: string;
  exp?: number;
}

export async function signJWT(
  payload: Omit<SessionPayload, "exp">,
  expiresInSeconds = 60 * 60 * 24 * 7 // 7 days
): Promise<string> {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    })
  );

  const key = await getKey("sign");
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${header}.${body}`)
  );

  const sigB64 = base64url(
    String.fromCharCode(...new Uint8Array(signature))
  );
  return `${header}.${body}.${sigB64}`;
}

export async function verifyJWT(
  token: string
): Promise<SessionPayload | null> {
  try {
    const [header, body, sig] = token.split(".");
    if (!header || !body || !sig) return null;

    const key = await getKey("verify");
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      Uint8Array.from(base64urlDecode(sig), (c) => c.charCodeAt(0)),
      new TextEncoder().encode(`${header}.${body}`)
    );

    if (!valid) return null;

    const payload: SessionPayload = JSON.parse(base64urlDecode(body));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // expired
    }

    return payload;
  } catch {
    return null;
  }
}
