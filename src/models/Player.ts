import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IPlayer extends Document {
  fullName: string;
  dateOfBirth: Date;
  position: string;
  teamCategory: string;
  parent: mongoose.Types.ObjectId;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED";
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    fullName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    position: { type: String, required: true, trim: true },
    teamCategory: { type: String, required: true, trim: true },
    parent: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "GRADUATED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

export const Player: Model<IPlayer> =
  mongoose.models.Player ?? mongoose.model<IPlayer>("Player", PlayerSchema);
