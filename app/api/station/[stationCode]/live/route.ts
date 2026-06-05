import { NextRequest, NextResponse } from "next/server";
import { getLiveStationStatus } from "@/modules/trains/train.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { stationCode: string } },
): Promise<NextResponse> {
  try {
    const { stationCode } = params;
    if (!stationCode || !/^[A-Za-z]{2,6}$/.test(stationCode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Station code must be 2 to 6 alphabetic characters",
          timestamp: Date.now(),
        },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(req.url);
    const hoursStr = searchParams.get("hours") || "2";
    const hours = parseInt(hoursStr, 10);
    const to = searchParams.get("to") || "";

    if (![2, 4, 8].includes(hours)) {
      return NextResponse.json(
        {
          success: false,
          message: "Hours parameter must be 2, 4, or 8",
          timestamp: Date.now(),
        },
        { status: 400 },
      );
    }

    if (to && !/^[A-Za-z]{2,6}$/.test(to)) {
      return NextResponse.json(
        {
          success: false,
          message: "Destination station filter code must be 2 to 6 alphabetic characters",
          timestamp: Date.now(),
        },
        { status: 400 },
      );
    }

    const result = await getLiveStationStatus(stationCode.toUpperCase(), hours, to ? to.toUpperCase() : undefined);

    return NextResponse.json(result, {
      status: result.success ? 200 : result.statusCode || 500,
    });
  } catch (error) {
    console.error("Live station route handler error:", error);
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
