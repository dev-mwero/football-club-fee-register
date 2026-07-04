import { connectDB } from "@/lib/db";
import { FeeRecord } from "@/models/FeeRecord";
import { Payment } from "@/models/Payment";
import { Player } from "@/models/Player";

export async function getPlayers() {
  await connectDB();
  return Player.find()
    .populate("parent", "name email phone")
    .sort({ createdAt: -1 })
    .lean();
}

export async function getPlayerById(id: string) {
  await connectDB();
  return Player.findById(id).populate("parent", "name email phone").lean();
}

export async function createPlayer(data: {
  fullName: string;
  dateOfBirth: string;
  position: string;
  teamCategory: string;
  parent: string;
}) {
  await connectDB();
  return Player.create(data);
}

export async function updatePlayer(
  id: string,
  data: Partial<{
    fullName: string;
    dateOfBirth: string;
    position: string;
    teamCategory: string;
    parent: string;
    status: "ACTIVE" | "INACTIVE" | "GRADUATED";
  }>,
) {
  await connectDB();
  return Player.findByIdAndUpdate(id, data, { new: true });
}

export async function deletePlayer(id: string) {
  await connectDB();
  await FeeRecord.deleteMany({ player: id });
  await Payment.deleteMany({ player: id });
  return Player.findByIdAndDelete(id);
}

export async function getPlayerPaymentHistory(playerId: string) {
  await connectDB();
  return Payment.find({ player: playerId })
    .populate("player", "fullName")
    .sort({ paymentDate: -1 })
    .lean();
}

export async function getPlayerFeeRecords(playerId: string) {
  await connectDB();
  return FeeRecord.find({ player: playerId })
    .populate("feeStructure", "name amount")
    .sort({ createdAt: -1 })
    .lean();
}
