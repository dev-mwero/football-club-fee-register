import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FeeRecord } from "@/models/FeeRecord";
import { Player } from "@/models/Player";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const players = await Player.find()
      .populate("parent", "name")
      .sort({ fullName: 1 });

    const data = await Promise.all(
      players.map(async (player) => {
        const feeRecords = await FeeRecord.find({
          player: player._id,
          status: { $in: ["UNPAID", "PARTIAL"] },
        }).sort({ createdAt: 1 });

        const parent = player.parent as unknown as {
          _id: string;
          name: string;
        } | null;

        return {
          _id: player._id.toString(),
          fullName: player.fullName,
          teamCategory: player.teamCategory,
          parent: parent ? { _id: parent._id, name: parent.name } : null,
          feeRecords: feeRecords.map((r) => ({
            _id: r._id.toString(),
            amountDue: r.amountDue,
            amountPaid: r.amountPaid,
            balance: r.balance,
            status: r.status,
          })),
        };
      }),
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
