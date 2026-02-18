import { NextRequest, NextResponse } from "next/server";
import { customerReset } from "@/lib/shopify";

export async function POST(request: NextRequest) {
    try {
        const { resetUrl, password } = await request.json();

        if (!resetUrl || !password) {
            return NextResponse.json(
                { success: false, error: "Reset URL and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 5) {
            return NextResponse.json(
                { success: false, error: "Password must be at least 5 characters" },
                { status: 400 }
            );
        }

        const result = await customerReset(resetUrl, password);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.errors?.[0]?.message || "Password reset failed",
                    errors: result.errors,
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            accessToken: result.accessToken,
            message: "Password reset successfully",
        });

    } catch (error) {
        console.error("Error in reset route:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}