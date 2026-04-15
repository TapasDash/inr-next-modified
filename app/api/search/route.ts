import { NextRequest, NextResponse } from "next/server";
import { SearchParamsSchema } from "@/modules/trains/train.schema";
import { searchTrains } from "@/modules/trains/train.service";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("date");

    // Validate inputs
    const validation = SearchParamsSchema.safeParse({ from, to, date });
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid parameters",
          timestamp: Date.now(),
        },
        { status: 400 },
      );
    }

    const result = await searchTrains(
      validation.data.from,
      validation.data.to,
      validation.data.date,
    );

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
