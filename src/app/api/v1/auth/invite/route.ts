import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { badRequest, notFound, toErrorResponse } from "@/lib/errors";
import { Invite } from "@/models/Invite";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      throw badRequest("Token is required", "MISSING_TOKEN");
    }

    await connectDB();

    const invite = await Invite.findOne({ token });

    if (!invite) {
      throw notFound(
        "Invalid or expired invitation. Please ask the academy to send you a new one.",
        "INVITE_NOT_FOUND",
      );
    }

    if (invite.status === "ACCEPTED") {
      throw badRequest(
        "This invitation has already been used",
        "INVITE_ALREADY_ACCEPTED",
      );
    }

    if (invite.status === "REVOKED") {
      throw badRequest(
        "This invitation has been revoked. Please ask the academy to send a new one.",
        "INVITE_REVOKED",
      );
    }

    if (invite.status === "EXPIRED" || invite.expiresAt < new Date()) {
      throw badRequest(
        "This invitation has expired. Please ask the academy to send a new one.",
        "INVITE_EXPIRED",
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
    return toErrorResponse(error, "GET /api/v1/auth/invite");
  }
}
