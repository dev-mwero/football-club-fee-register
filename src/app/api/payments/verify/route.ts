import { NextResponse } from "next/server";
import { verifyPayment } from "@/services/payment-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Reference is required" },
        { status: 400 },
      );
    }

    const payment = await verifyPayment(reference);
    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    console.error("Verify payment error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to verify payment";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
