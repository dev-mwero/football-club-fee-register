import { NextResponse } from "next/server";
import { createToken, setSession, verifyPassword } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  ApiError,
  toErrorResponse,
  tooManyRequests,
  unauthorized,
} from "@/lib/errors";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`login:${ip}`, { windowMs: 60_000, max: 10 });
    if (!limit.allowed) {
      throw tooManyRequests("Too many login attempts. Please try again later.");
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(
        422,
        "Please enter a valid email and password",
        "VALIDATION_ERROR",
        parsed.error.flatten().fieldErrors,
      );
    }

    const { email, password } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await verifyPassword(password, user.password))) {
      throw unauthorized("Invalid email or password");
    }

    const token = await createToken({
      userId: user._id.toString(),
      role: user.role,
    });

    await setSession(token);

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    return toErrorResponse(error, "POST /api/v1/auth/login");
  }
}
