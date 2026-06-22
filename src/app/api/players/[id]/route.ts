import { NextResponse } from "next/server";
import {
  deletePlayer,
  getPlayerById,
  updatePlayer,
} from "@/services/player-service";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const player = await getPlayerById(id);
    if (!player) {
      return NextResponse.json(
        { success: false, error: "Player not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    console.error("Get player error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch player" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const player = await updatePlayer(id, body);
    if (!player) {
      return NextResponse.json(
        { success: false, error: "Player not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    console.error("Update player error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update player" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const player = await deletePlayer(id);
    if (!player) {
      return NextResponse.json(
        { success: false, error: "Player not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    console.error("Delete player error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete player" },
      { status: 500 },
    );
  }
}
