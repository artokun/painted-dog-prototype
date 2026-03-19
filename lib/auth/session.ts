
import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "pd_session";
const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET!);
const COOKIE_MAX_AGE_LONG = 60 * 60 * 24 * 30; // 30 days
const COOKIE_MAX_AGE_SHORT = 60 * 60 * 24; // 24 hours


export interface SessionPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  provider: "google" | "shopify";
  shopifyCustomerId?: string;
  shopifyAccessToken?: string;
}

export async function createSession(payload: SessionPayload, rememberMe: boolean = false) {

  // Choose expiration based on rememberMe
  const expiresIn = rememberMe ? "30d" : "24h";
  const maxAge = rememberMe ? COOKIE_MAX_AGE_LONG : COOKIE_MAX_AGE_SHORT;

  const token = await new SignJWT({ ...payload } as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: maxAge,
    path: "/",
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
