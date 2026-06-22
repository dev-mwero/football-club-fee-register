import mongoose, { type Document, type Model, Schema } from "mongoose";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface IPayment extends Document {
  player: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: string;
  reference: string;
  status: PaymentStatus;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    player: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    parent: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: "PAYSTACK" },
    reference: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment ?? mongoose.model<IPayment>("Payment", PaymentSchema);
