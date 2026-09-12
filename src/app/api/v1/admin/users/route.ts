import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { toErrorResponse } from "@/lib/errors";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    return toErrorResponse(error, "GET /api/v1/admin/users");
  }
}
