import { NextResponse } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/errors";
import { createPlayerSchema } from "@/lib/validations";
import { createPlayer, getPlayers } from "@/services/player-service";

export async function GET() {
  try {
    const players = await getPlayers();
    return NextResponse.json({ success: true, data: players });
  } catch (error) {
    return toErrorResponse(error, "GET /api/v1/players");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createPlayerSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(
        422,
        "Please check the player details",
        "VALIDATION_ERROR",
        parsed.error.flatten().fieldErrors,
      );
    }

    const player = await createPlayer(parsed.data);
    return NextResponse.json({ success: true, data: player }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "POST /api/v1/players");
  }
}
