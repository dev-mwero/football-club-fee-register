import { NextResponse } from "next/server";
import { createToken, hashPassword, setSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations";
import { Invite } from "@/models/Invite";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`register:${ip}`, { windowMs: 3_600_000, max: 5 });
    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many registration attempts. Please try again later.",
        },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

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

    const { name, email, phone, password, inviteToken } = parsed.data;

    await connectDB();

    const invite = await Invite.findOne({ token: inviteToken });
    if (!invite) {
      return NextResponse.json(
        { success: false, error: "Invalid invitation token" },
        { status: 400 },
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
      invite.status = "EXPIRED";
      await invite.save();
      return NextResponse.json(
        { success: false, error: "This invitation has expired" },
        { status: 400 },
      );
    }

    if (invite.email !== email) {
      return NextResponse.json(
        { success: false, error: "Email does not match invitation" },
        { status: 400 },
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 },
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
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
