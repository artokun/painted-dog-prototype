import { NextResponse } from "next/server";
import { getAboutContent } from "@/lib/about";

export async function GET() {
  try {
    const aboutContent = await getAboutContent();

    return NextResponse.json({
      success: true,
      data: aboutContent,
    });
  } catch (error) {
    console.error("Error fetching about content:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch about content",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
