import { connectDB } from "@/lib/db";
import { FeeRecord } from "@/models/FeeRecord";
import { FeeStructure } from "@/models/FeeStructure";
import { Player } from "@/models/Player";

export async function getFeeStructures() {
  await connectDB();
  return FeeStructure.find().sort({ createdAt: -1 }).lean();
}

export async function getFeeStructureById(id: string) {
  await connectDB();
  return FeeStructure.findById(id).lean();
}

export async function createFeeStructure(data: {
  name: string;
  amount: number;
  frequency: "ONE_TIME" | "MONTHLY" | "TERMLY" | "YEARLY";
  description?: string;
}) {
  await connectDB();
  return FeeStructure.create(data);
}

export async function updateFeeStructure(
  id: string,
  data: Partial<{
    name: string;
    amount: number;
    frequency: "ONE_TIME" | "MONTHLY" | "TERMLY" | "YEARLY";
    description: string;
    active: boolean;
  }>,
) {
  await connectDB();
  return FeeStructure.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteFeeStructure(id: string) {
  await connectDB();
  return FeeStructure.findByIdAndDelete(id);
}

export async function getFeeRecords() {
  await connectDB();
  return FeeRecord.find()
    .populate("player", "fullName teamCategory")
    .populate("feeStructure", "name amount frequency")
    .sort({ createdAt: -1 })
    .lean();
}

export async function getFeeRecordsByPlayer(playerId: string) {
  await connectDB();
  return FeeRecord.find({ player: playerId })
    .populate("feeStructure", "name amount frequency")
    .sort({ createdAt: -1 })
    .lean();
}

export async function assignFeeToPlayer(data: {
  player: string;
  feeStructure: string;
  amountDue: number;
}) {
  await connectDB();
  return FeeRecord.create({
    player: data.player,
    feeStructure: data.feeStructure,
    amountDue: data.amountDue,
    amountPaid: 0,
    balance: data.amountDue,
    status: "UNPAID",
    billingType: "MANUAL",
    chargeType: "FEE",
  });
}

export async function autoBillActivePlayers(data: {
  feeStructure: string;
  amountDue: number;
  periodKey: string;
  teamCategory?: string;
  playerIds?: string[];
  billingLabel?: string;
  billingReason?: string;
  chargeType?: "FEE" | "EXPENSE";
}) {
  await connectDB();

  const normalizedPlayerIds = Array.from(
    new Set((data.playerIds ?? []).filter(Boolean)),
  );

  const query: Record<string, unknown> = {
    status: "ACTIVE",
  };

  if (normalizedPlayerIds.length > 0) {
    query._id = { $in: normalizedPlayerIds };
  } else if (data.teamCategory) {
    query.teamCategory = data.teamCategory;
  }

  const players = await Player.find(query)
    .select("_id fullName teamCategory status")
    .lean();

  const existingRecords = await FeeRecord.find({
    feeStructure: data.feeStructure,
    periodKey: data.periodKey,
  })
    .select("player")
    .lean();

  const existingPlayerIds = new Set(
    existingRecords.map((r) => r.player.toString()),
  );

  const created = [];
  const skipped: string[] = [];

  for (const player of players) {
    if (existingPlayerIds.has(player._id.toString())) {
      skipped.push(player._id.toString());
      continue;
    }

    const record = await FeeRecord.create({
      player: player._id,
      feeStructure: data.feeStructure,
      amountDue: data.amountDue,
      amountPaid: 0,
      balance: data.amountDue,
      status: "UNPAID",
      billingType: "AUTO",
      chargeType: data.chargeType ?? "FEE",
      periodKey: data.periodKey,
      billingLabel: data.billingLabel,
      billingReason: data.billingReason,
    });

    created.push(record);
  }

  return {
    createdCount: created.length,
    skippedCount: skipped.length,
    created,
    skipped,
  };
}

export async function updateFeeRecord(
  id: string,
  data: { amountPaid: number },
) {
  await connectDB();
  const record = await FeeRecord.findById(id);
  if (!record) return null;

  record.amountPaid = data.amountPaid;
  record.balance = Math.max(0, record.amountDue - data.amountPaid);

  if (record.amountPaid >= record.amountDue) {
    record.status = "PAID";
    record.balance = 0;
  } else if (record.amountPaid > 0) {
    record.status = "PARTIAL";
  } else {
    record.status = "UNPAID";
  }

  return record.save();
}
