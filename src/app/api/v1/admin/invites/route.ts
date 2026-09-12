import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { inviteEmail, sendEmail } from "@/lib/email";
import { ApiError, badRequest, conflict, toErrorResponse } from "@/lib/errors";
import { createInviteSchema } from "@/lib/validations";
import { Invite } from "@/models/Invite";
import { User } from "@/models/User";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getUserId(request: Request): string {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    throw new ApiError(
      401,
      "You must be signed in to send invitations",
      "UNAUTHENTICATED",
    );
  }
  return userId;
}

function getInviteUrl(request: Request, token: string): string {
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}/register?token=${token}`;
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw badRequest(
        "The request body contains invalid JSON",
        "INVALID_JSON",
      );
    }

    const parsed = createInviteSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        422,
        "Please provide a valid email and role",
        "VALIDATION_ERROR",
        parsed.error.flatten().fieldErrors,
      );
    }

    const { email, role } = parsed.data;

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw conflict(
        "This email is already registered. Use the users list to manage this person instead.",
        "EMAIL_ALREADY_REGISTERED",
      );
    }

    const pendingInvite = await Invite.findOne({
      email,
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    });
    if (pendingInvite) {
      throw conflict(
        "A pending invitation already exists for this email. Revoke the existing invitation first if you need to re-invite them.",
        "PENDING_INVITE_EXISTS",
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
    const invitedBy = getUserId(request);

    const invite = await Invite.create({
      email,
      role,
      token,
      invitedBy,
      expiresAt,
    });

    const inviteUrl = getInviteUrl(request, token);
    const { subject, html } = inviteEmail({ inviteUrl, role });

    try {
      await sendEmail({ to: email, subject, html });
    } catch (error) {
      await Invite.findByIdAndDelete(invite._id).catch(() => {});
      throw new ApiError(
        502,
        "The invitation email could not be sent because the email service is unreachable. No invitation was recorded — please try again.",
        "EMAIL_DELIVERY_FAILED",
        error instanceof Error ? error.message : undefined,
      );
    }

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
    return toErrorResponse(error, "POST /api/v1/admin/invites");
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
    return toErrorResponse(error, "GET /api/v1/admin/invites");
  }
}
