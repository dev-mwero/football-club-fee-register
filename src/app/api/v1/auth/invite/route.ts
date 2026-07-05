import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Invite } from "@/models/Invite";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const invite = await Invite.findOne({ token });

    if (!invite) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired invitation" },
        { status: 404 },
      );
    }

    if (invite.status === "ACCEPTED") {
      return NextResponse.json(
        { success: false, error: "This invitation has already been used" },
        { status: 400 },
      );
    }

    if (invite.status === "REVOKED") {
      return NextResponse.json(
        { success: false, error: "This invitation has been revoked" },
        { status: 400 },
      );
    }

    if (invite.status === "EXPIRED" || invite.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "This invitation has expired" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        email: invite.email,
        role: invite.role,
      },
    });
  } catch (error) {
    console.error("Invite lookup error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
