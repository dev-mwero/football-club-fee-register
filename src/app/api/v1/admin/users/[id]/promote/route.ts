import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { promotionEmail, sendEmail } from "@/lib/email";
import { badRequest, notFound, toErrorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { mongoIdParamSchema } from "@/lib/validations";
import { User } from "@/models/User";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const parsed = mongoIdParamSchema.safeParse({ id });
    if (!parsed.success) {
      throw badRequest("Invalid user ID", "INVALID_ID");
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      throw notFound("User not found", "USER_NOT_FOUND");
    }

    if (user.role === "ADMIN") {
      throw badRequest("This user is already an admin", "ALREADY_ADMIN");
    }

    user.role = "ADMIN";
    await user.save();

    const { subject, html } = promotionEmail({ name: user.name });
    await sendEmail({ to: user.email, subject, html }).catch((error) => {
      logger.warn("Promotion email not delivered", { error });
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return toErrorResponse(error, "POST /api/v1/admin/users/[id]/promote");
  }
}
