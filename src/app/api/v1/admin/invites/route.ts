import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { inviteEmail, sendEmail } from "@/lib/email";
import { createInviteSchema } from "@/lib/validations";
import { Invite } from "@/models/Invite";
import { User } from "@/models/User";

function getUserId(request: Request): string {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    throw new Error("Missing user ID in request");
  }
  return userId;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createInviteSchema.safeParse(body);

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

    const { email, role } = parsed.data;

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "This email is already registered" },
        { status: 409 },
      );
    }

    const pendingInvite = await Invite.findOne({
      email,
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    });
    if (pendingInvite) {
      return NextResponse.json(
        {
          success: false,
          error: "A pending invitation already exists for this email",
        },
        { status: 409 },
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invitedBy = getUserId(request);

    const invite = await Invite.create({
      email,
      role,
      token,
      invitedBy,
      expiresAt,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const inviteUrl = `${baseUrl}/register?token=${token}`;

    const { subject, html } = inviteEmail({ inviteUrl, role });
    await sendEmail({ to: email, subject, html });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: invite._id,
          email: invite.email,
          role: invite.role,
          status: invite.status,
          expiresAt: invite.expiresAt,
          createdAt: invite.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create invite error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const invites = await Invite.find()
      .populate("invitedBy", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: invites.map((invite) => ({
        id: invite._id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
        invitedBy: invite.invitedBy,
      })),
    });
  } catch (error) {
    console.error("List invites error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
