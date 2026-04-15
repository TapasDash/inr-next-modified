import { NextRequest, NextResponse } from "next/server";
import { TrainNoParamsSchema } from "@/modules/trains/train.schema";
import { getTrainDetails } from "@/modules/trains/train.service";

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

    const result = await getTrainDetails(validation.data.trainNo);

    return NextResponse.json(result, {
      status: result.success ? 200 : result.statusCode || 500,
    });
  } catch (error) {
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
