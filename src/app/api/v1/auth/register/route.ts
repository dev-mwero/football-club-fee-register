import { NextResponse } from "next/server";
import { createToken, hashPassword, setSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  ApiError,
  badRequest,
  conflict,
  toErrorResponse,
  tooManyRequests,
} from "@/lib/errors";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations";
import { Invite } from "@/models/Invite";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`register:${ip}`, { windowMs: 3_600_000, max: 5 });
    if (!limit.allowed) {
      throw tooManyRequests(
        "Too many registration attempts. Please try again later.",
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(
        422,
        "Please check the form and try again",
        "VALIDATION_ERROR",
        parsed.error.flatten().fieldErrors,
      );
    }

    const { name, email, phone, password, inviteToken } = parsed.data;

    await connectDB();

    const invite = await Invite.findOne({ token: inviteToken });
    if (!invite) {
      throw badRequest(
        "Invalid invitation token. Please use the link from your invitation email.",
        "INVALID_INVITE_TOKEN",
      );
    }

    if (invite.status === "ACCEPTED") {
      throw badRequest(
        "This invitation has already been used. Please log in instead.",
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
      invite.status = "EXPIRED";
      await invite.save();
      throw badRequest(
        "This invitation has expired. Please ask the academy to send a new one.",
        "INVITE_EXPIRED",
      );
    }

    if (invite.email !== email) {
      throw badRequest(
        "This email does not match the invitation",
        "EMAIL_MISMATCH",
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      throw conflict(
        "An account with this email already exists. Please log in instead.",
        "EMAIL_ALREADY_REGISTERED",
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: invite.role,
    });

    invite.status = "ACCEPTED";
    invite.acceptedAt = new Date();
    await invite.save();

    const token = await createToken({
      userId: user._id.toString(),
      role: user.role,
    });

    await setSession(token);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return toErrorResponse(error, "POST /api/v1/auth/register");
  }
}
