import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { user, accessToken, rememberMe } = await request.json();

    // Create server-side session
    await createSession({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      provider: "shopify",
      shopifyCustomerId: user.customerId,
      shopifyAccessToken: accessToken,
    }, rememberMe);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
