// import { cookies } from "next/headers";
// import { verifyJWT, SessionPayload } from "./jwt";

// export const SESSION_COOKIE = "pd_session";

// export async function getSession(): Promise<SessionPayload | null> {
//   const cookieStore = await cookies();
//   const token = cookieStore.get(SESSION_COOKIE)?.value;
//   if (!token) return null;
//   return verifyJWT(token);
// }

import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "pd_session";
const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET!);
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  provider: "google" | "shopify";
  shopifyCustomerId?: string;
  shopifyAccessToken?: string;
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload } as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
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
