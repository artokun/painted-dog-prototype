import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

// Called by client on mount to rehydrate valtio authStore from the httpOnly cookie.
// The cookie itself is never readable by JS — this route acts as the secure bridge.
export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: session.email,
      firstName: session.firstName,
      lastName: session.lastName,
      picture: session.picture,
      customerId: session.shopifyCustomerId,
      provider: session.provider,
    },
    accessToken: session.shopifyAccessToken,
  });
}
