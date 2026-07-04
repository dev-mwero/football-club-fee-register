import { NextResponse } from "next/server";
import { createPlayerSchema } from "@/lib/validations";
import { createPlayer, getPlayers } from "@/services/player-service";

export async function GET() {
  try {
    const players = await getPlayers();
    return NextResponse.json({ success: true, data: players });
  } catch (error) {
    console.error("Get players error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch players" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createPlayerSchema.safeParse(body);

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

    const player = await createPlayer(parsed.data);
    return NextResponse.json({ success: true, data: player }, { status: 201 });
  } catch (error) {
    console.error("Create player error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create player" },
      { status: 500 },
    );
  }
}
