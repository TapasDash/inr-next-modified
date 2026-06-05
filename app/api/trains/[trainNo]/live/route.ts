import { NextRequest, NextResponse } from "next/server";
import { TrainNoParamsSchema } from "@/modules/trains/train.schema";
import { getLiveTrainStatus } from "@/modules/trains/train.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { trainNo: string } },
): Promise<NextResponse> {
  try {
    const validation = TrainNoParamsSchema.safeParse({
      trainNo: params.trainNo,
    });
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid train number",
          timestamp: Date.now(),
        },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || "";

    // If date is provided, validate it matches DD-MM-YYYY format
    if (date && !/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      return NextResponse.json(
        {
          success: false,
          message: "Date must be in DD-MM-YYYY format",
          timestamp: Date.now(),
        },
        { status: 400 },
      );
    }

    const result = await getLiveTrainStatus(validation.data.trainNo, date);

    return NextResponse.json(result, {
      status: result.success ? 200 : result.statusCode || 500,
    });
  } catch (error) {
    console.error("Live status route handler error:", error);
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
