import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { notFound, toErrorResponse, unauthorized } from "@/lib/errors";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      throw unauthorized("Not authenticated");
    }

    await connectDB();

    const user = await User.findById(session.userId);
    if (!user) {
      throw notFound("User not found", "USER_NOT_FOUND");
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    return toErrorResponse(error, "GET /api/v1/auth/me");
  }
}
