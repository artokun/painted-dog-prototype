import { NextResponse } from "next/server";
import { getLegalPageData } from "@/lib/legal";

export async function GET() {
  try {
    const data = await getLegalPageData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching legal page data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch legal page data",
      },
      { status: 500 }
    );
  }
}

export const revalidate = 300;
