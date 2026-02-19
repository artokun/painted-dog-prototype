import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  //Get the origin from the request headers
  const origin = request.headers.get("origin") || request.nextUrl.origin;

  const response = NextResponse.redirect(new URL("/", origin));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
