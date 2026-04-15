import { NextRequest, NextResponse } from "next/server";
import { fetchPnrStatus } from "@/modules/pnr/pnr.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { pnr: string } },
): Promise<NextResponse> {
  try {
    const { pnr } = params;

    // Validate PNR: must be exactly 10 digits
    if (!/^\d{10}$/.test(pnr)) {
      return NextResponse.json(
        {
          success: false,
          message: "PNR number must be exactly 10 digits",
          timestamp: Date.now(),
        },
        { status: 400 },
      );
    }

    // Fetch PNR status from upstream
    const result = await fetchPnrStatus(pnr);

    return NextResponse.json(result, {
      status: result.success ? 200 : result.statusCode || 500,
    });
  } catch (error) {
    console.error("PNR route handler error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        timestamp: Date.now(),
      },
      { status: 500 },
    );
  }
}
