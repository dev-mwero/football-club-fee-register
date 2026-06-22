import mongoose, { type Document, type Model, Schema } from "mongoose";

export type FeeRecordStatus = "PAID" | "PARTIAL" | "UNPAID";
export type FeeRecordBillingType = "MANUAL" | "AUTO";
export type FeeRecordChargeType = "FEE" | "EXPENSE";

export interface IFeeRecord extends Document {
  player: mongoose.Types.ObjectId;
  feeStructure: mongoose.Types.ObjectId;
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: FeeRecordStatus;
  billingType: FeeRecordBillingType;
  chargeType: FeeRecordChargeType;
  periodKey?: string;
  billingLabel?: string;
  billingReason?: string;
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
    billingType: {
      type: String,
      enum: ["MANUAL", "AUTO"],
      default: "MANUAL",
    },
    chargeType: {
      type: String,
      enum: ["FEE", "EXPENSE"],
      default: "FEE",
    },
    periodKey: { type: String, trim: true, default: null },
    billingLabel: { type: String, trim: true, default: null },
    billingReason: { type: String, trim: true, default: null },
  },
  { timestamps: true },
);

FeeRecordSchema.index(
  { player: 1, feeStructure: 1, periodKey: 1 },
  {
    unique: true,
    partialFilterExpression: { periodKey: { $type: "string" } },
  },
);

export const FeeRecord: Model<IFeeRecord> =
  mongoose.models.FeeRecord ??
  mongoose.model<IFeeRecord>("FeeRecord", FeeRecordSchema);
