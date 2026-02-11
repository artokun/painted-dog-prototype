import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

  // Handle OAuth errors
  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
  }

  try {
    // Step 1: Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(`${baseUrl}/login?error=token_exchange`);
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Step 2: Get user info from Google
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    if (!userResponse.ok) {
      console.error("Failed to get user info");
      return NextResponse.redirect(`${baseUrl}/login?error=user_info`);
    }

    const googleUser: GoogleUserInfo = await userResponse.json();

    // Step 3: Create session (no Shopify customer - that happens at checkout)
    await createSession({
      email: googleUser.email,
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
      picture: googleUser.picture,
      provider: "google",
      // No shopifyCustomerId or shopifyAccessToken for Google users
    });

    // Step 4: Redirect to home (or wherever you want)
    return NextResponse.redirect(baseUrl);
  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=callback_failed`);
  }
}
