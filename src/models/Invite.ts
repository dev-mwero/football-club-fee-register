import mongoose, { type Document, type Model, Schema } from "mongoose";

export type InviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export interface IInvite extends Document {
  email: string;
  role: "ADMIN" | "PARENT" | "COACH";
  token: string;
  invitedBy: mongoose.Types.ObjectId;
  status: InviteStatus;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InviteSchema = new Schema<IInvite>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    role: {
      type: String,
      enum: ["ADMIN", "PARENT", "COACH"],
      required: true,
    },
    token: { type: String, required: true, unique: true },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"],
      default: "PENDING",
    },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date },
  },
  { timestamps: true },
);

InviteSchema.index({ email: 1, status: 1 });
InviteSchema.index({ token: 1 });
InviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Invite: Model<IInvite> =
  mongoose.models.Invite ?? mongoose.model<IInvite>("Invite", InviteSchema);
