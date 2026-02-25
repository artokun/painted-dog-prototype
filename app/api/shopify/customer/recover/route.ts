import { NextRequest, NextResponse } from "next/server";
import { customerRecover } from "@/lib/shopify";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: "Email is required" },
                { status: 400 }
            );
        }

        const result = await customerRecover(email);

        // Always return success to prevent email enumeration attacks
        // (Don't tell attackers if an email exists or not)
        return NextResponse.json({
            success: true,
            message: "If an account exists with this email, you will receive a password reset link.",
        });

    } catch (error) {
        console.error("Error in recover route:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}