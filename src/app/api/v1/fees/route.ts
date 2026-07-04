import { NextResponse } from "next/server";
import { createFeeSchema } from "@/lib/validations";
import { createFeeStructure, getFeeStructures } from "@/services/fee-service";

export async function GET() {
  try {
    const fees = await getFeeStructures();
    return NextResponse.json({ success: true, data: fees });
  } catch (error) {
    console.error("Get fees error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch fee structures" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createFeeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const fee = await createFeeStructure(parsed.data);
    return NextResponse.json({ success: true, data: fee }, { status: 201 });
  } catch (error) {
    console.error("Create fee error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create fee structure" },
      { status: 500 },
    );
  }
}
