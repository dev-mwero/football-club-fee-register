import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
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
      return NextResponse.json(
        { success: false, error: "Invalid invite ID" },
        { status: 400 },
      );
    }

    await connectDB();

    const invite = await Invite.findById(id);
    if (!invite) {
      return NextResponse.json(
        { success: false, error: "Invite not found" },
        { status: 404 },
      );
    }

    if (invite.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Can only revoke pending invitations" },
        { status: 400 },
      );
    }

    invite.status = "REVOKED";
    await invite.save();

    return NextResponse.json({ success: true, data: { id: invite._id } });
  } catch (error) {
    console.error("Revoke invite error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
