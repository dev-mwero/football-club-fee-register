import { NextResponse } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/errors";
import { createFeeSchema } from "@/lib/validations";
import { createFeeStructure, getFeeStructures } from "@/services/fee-service";

export async function GET() {
  try {
    const fees = await getFeeStructures();
    return NextResponse.json({ success: true, data: fees });
  } catch (error) {
    return toErrorResponse(error, "GET /api/v1/fees");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createFeeSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(
        422,
        "Please check the fee structure details",
        "VALIDATION_ERROR",
        parsed.error.flatten().fieldErrors,
      );
    }

    const fee = await createFeeStructure(parsed.data);
    return NextResponse.json({ success: true, data: fee }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "POST /api/v1/fees");
  }
}
