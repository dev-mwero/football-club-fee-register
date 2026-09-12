import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { badRequest, notFound, toErrorResponse } from "@/lib/errors";
import { mongoIdParamSchema } from "@/lib/validations";
import { Invite } from "@/models/Invite";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const parsed = mongoIdParamSchema.safeParse({ id });
    if (!parsed.success) {
      throw badRequest("Invalid invite ID", "INVALID_ID");
    }

    await connectDB();

    const invite = await Invite.findById(id);
    if (!invite) {
      throw notFound("Invite not found", "INVITE_NOT_FOUND");
    }

    if (invite.status !== "PENDING") {
      throw badRequest(
        "Only pending invitations can be revoked",
        "INVITE_NOT_PENDING",
      );
    }

    invite.status = "REVOKED";
    await invite.save();

    return NextResponse.json({ success: true, data: { id: invite._id } });
  } catch (error) {
    return toErrorResponse(error, "DELETE /api/v1/admin/invites/[id]");
  }
}
