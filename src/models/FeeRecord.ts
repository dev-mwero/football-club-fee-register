import mongoose, { type Document, type Model, Schema } from "mongoose";

export type FeeRecordStatus = "PAID" | "PARTIAL" | "UNPAID";

export interface IFeeRecord extends Document {
  player: mongoose.Types.ObjectId;
  feeStructure: mongoose.Types.ObjectId;
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: FeeRecordStatus;
  createdAt: Date;
  updatedAt: Date;
}

const FeeRecordSchema = new Schema<IFeeRecord>(
  {
    player: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    feeStructure: {
      type: Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: true,
    },
    amountDue: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    balance: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PAID", "PARTIAL", "UNPAID"],
      default: "UNPAID",
    },
  },
  { timestamps: true },
);

export const FeeRecord: Model<IFeeRecord> =
  mongoose.models.FeeRecord ??
  mongoose.model<IFeeRecord>("FeeRecord", FeeRecordSchema);
