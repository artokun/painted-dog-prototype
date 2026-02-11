import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function GET() {
  const response = NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_BASE_URL!)
  );
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
