import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { promotionEmail, sendEmail } from "@/lib/email";
import { mongoIdParamSchema } from "@/lib/validations";
import { User } from "@/models/User";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const parsed = mongoIdParamSchema.safeParse({ id });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { success: false, error: "User is already an admin" },
        { status: 400 },
      );
    }

    user.role = "ADMIN";
    await user.save();

    const { subject, html } = promotionEmail({ name: user.name });
    await sendEmail({ to: user.email, subject, html });

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Promote user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
