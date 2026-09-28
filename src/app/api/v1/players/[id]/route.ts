import { NextResponse } from "next/server";
import { ApiError, badRequest, notFound, toErrorResponse } from "@/lib/errors";
import { mongoIdParamSchema, updatePlayerSchema } from "@/lib/validations";
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
    const parsed = mongoIdParamSchema.safeParse({ id });
    if (!parsed.success) {
      throw badRequest("Invalid player ID", "INVALID_ID");
    }

    const player = await getPlayerById(id);
    if (!player) {
      throw notFound("Player not found", "PLAYER_NOT_FOUND");
    }
    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    return toErrorResponse(error, "GET /api/v1/players/[id]");
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const idParsed = mongoIdParamSchema.safeParse({ id });
    if (!idParsed.success) {
      throw badRequest("Invalid player ID", "INVALID_ID");
    }

    const body = await req.json();
    const bodyParsed = updatePlayerSchema.safeParse(body);
    if (!bodyParsed.success) {
      throw new ApiError(
        422,
        "Please check the player details",
        "VALIDATION_ERROR",
        bodyParsed.error.flatten().fieldErrors,
      );
    }

    const player = await updatePlayer(id, bodyParsed.data);
    if (!player) {
      throw notFound("Player not found", "PLAYER_NOT_FOUND");
    }
    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    return toErrorResponse(error, "PUT /api/v1/players/[id]");
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const parsed = mongoIdParamSchema.safeParse({ id });
    if (!parsed.success) {
      throw badRequest("Invalid player ID", "INVALID_ID");
    }

    const player = await deletePlayer(id);
    if (!player) {
      throw notFound("Player not found", "PLAYER_NOT_FOUND");
    }
    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    return toErrorResponse(error, "DELETE /api/v1/players/[id]");
  }
}
