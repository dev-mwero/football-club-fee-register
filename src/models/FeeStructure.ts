import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IFeeStructure extends Document {
  name: string;
  amount: number;
  frequency: "ONE_TIME" | "MONTHLY" | "TERMLY" | "YEARLY";
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeeStructureSchema = new Schema<IFeeStructure>(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    frequency: {
      type: String,
      enum: ["ONE_TIME", "MONTHLY", "TERMLY", "YEARLY"],
      required: true,
    },
    description: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const FeeStructure: Model<IFeeStructure> =
  mongoose.models.FeeStructure ??
  mongoose.model<IFeeStructure>("FeeStructure", FeeStructureSchema);
